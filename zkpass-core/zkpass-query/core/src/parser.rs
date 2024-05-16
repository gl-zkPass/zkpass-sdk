use tracing::error;
use serde_json::Value;
use jmespath::Variable;
use crate::engine::{LookupTable, Expr, Stmt, BooleanOperator, RelationalOperator, Val, Entry, VariableKind};
use zkpass_query_types::ZkPassQueryEngineError;

#[derive(Debug)]
pub(crate) struct ZkPassQueryParser {
    data: String,
    rules: String,
    parsed_data: Variable,
    data_table: LookupTable,
}

impl ZkPassQueryParser {
    pub fn new(user_data: &str, dvr: &str) -> Self {
        let data_table = LookupTable::new();
        let parsed_data = Variable::Null;
        Self { data: user_data.to_owned(), rules: dvr.to_owned(), parsed_data, data_table}
    }

    pub fn parse_query_stmts(&mut self) -> Result<(Box<Vec<Entry>>, Box<Vec<Stmt>>), ZkPassQueryEngineError> {
        self.parsed_data = serde_json::from_str::<Variable>(self.data.as_str())
            .map_err(|e| {
                error!("parse_query: failed to parse user data, error: {:?}", e);
                ZkPassQueryEngineError::UserDataParsingError
            })?;

        self.data_table.clear();

        // convert rules to expression
        let rules: Value = serde_json::from_str(self.rules.as_str())
            .map_err(|e| {
                error!("parse_query: failed to parse query, error: {:?}", e);
                ZkPassQueryEngineError::QueryParsingError
            })?;

        let stmts = self.parse_stmts(&rules)?;

        // the data table has been updated by now
        let data_table = Box::new(self.data_table.clone());

        Ok((data_table, stmts))
    }

    fn resolve_data_variable(&mut self, variable: String) -> Result<(), ZkPassQueryEngineError> {
        let mut found = false;
        for entry in &self.data_table {
            if entry.key == variable {
                found = true;
                break;
            }
        }

        if !found {
            let expr = jmespath::compile(&variable).map_err(|e| {
                error!("resolve_variable: parsing expr error: {:?}", e);
                ZkPassQueryEngineError::DataVariableResolutionError
            })?;
            let parsed_data = &self.parsed_data;
            let value = expr.search(parsed_data).map_err(|e| {
                error!("resolve_variable: parsing value error: {:?}", e);
                ZkPassQueryEngineError::DataVariableResolutionError
            })?;
            let entry;
            match &*value {
                Variable::Bool(_v) => {
                    entry = Entry { key: variable, val: Val::Bool(*_v) };
                }
                Variable::String(_v) => {
                    entry = Entry { key: variable, val: Val::Str(_v.clone()) };
                }
                Variable::Number(_v) => {
                    let y = value.as_number().ok_or_else(|| {
                        error!("resolve_variable: expecting boolean value");
                        ZkPassQueryEngineError::DataVariableResolutionError
                    })?;
                    let x = y as i64;
                    entry = Entry { key: variable, val: Val::Int(x) };
                }
                _ => {
                    error!("resolve_variable: found other ");
                    return Err(ZkPassQueryEngineError::DataVariableResolutionError);
                }
            }

            self.add_to_data_table(entry);
        }

        Ok(())
    }

    fn add_to_data_table(&mut self, e: Entry) {
        self.data_table.push(e);
    }

    fn parse_all_childs(&mut self, value: &Value) -> Result<Vec<Box<Expr>>, ZkPassQueryEngineError> {
        let mut childs: Vec<Box<Expr>> = Vec::new();

        if let Value::Array(arr) = value {
            for value in arr {
                childs.push(self.parse_exp(value)?);
            }
        }

        return Ok(childs);
    }

    fn parse_left_right_childs(&mut self, value: &Value) -> Result<(Box<Expr>, Box<Expr>), ZkPassQueryEngineError> {
        if let Value::Array(arr) = value {
            let left = arr.get(0).ok_or_else(|| {
                error!("parse_left_right_childs: parsing left");
                ZkPassQueryEngineError::ExpectingFirstOperandParsingError
            })?;
            let lexpr= self.parse_exp(left)?;

            let right = arr.get(1).ok_or_else(|| {
                error!("parse_left_right_childs: parsing right");
                ZkPassQueryEngineError::ExpectingSecondOperandParsingError
            })?;
            let rexpr = self.parse_exp(right)?;

            Ok((lexpr, rexpr))
        } else {
            Err(ZkPassQueryEngineError::ExpectingOperandsInArrayParsingError)
        }
    }

    fn split_at_last_dot(&self, input: &str) -> (String, String) {
        match input.rfind('.') {
            Some(pos) => {
                let (first_part, second_part) = input.split_at(pos);
                // Remove the '.' from the beginning of the second part
                let second_part = &second_part[1..];
                (first_part.to_string(), second_part.to_string())
            }
            None => ("".to_string(), input.to_string())
        }
    }

    fn validate_accessibility(&self, expr: &Expr) -> Result<(), ZkPassQueryEngineError>{
        match expr {
            Expr::VariableExpression{kind,name,} => {
                if let VariableKind::Data = kind {
                    let accessibility_key: String;
                    let (base, key) = self.split_at_last_dot(name);
                    if base == "" {
                        accessibility_key = format!("_{}_zkpass_public_", key);
                    }
                    else {
                        accessibility_key = format!("{}._{}_zkpass_public_", base, key);
                    }

                    let expr = jmespath::compile(&accessibility_key).map_err(|e| {
                        error!("resolve_variable: parsing expr error: {:?}", e);
                        ZkPassQueryEngineError::DataVariableResolutionError
                    })?;

                    let parsed_data = &self.parsed_data;
                    let value = expr.search(parsed_data).map_err(|e| {
                        error!("resolve_variable: parsing value error: {:?}", e);
                        ZkPassQueryEngineError::DataVariableResolutionError
                    })?;

                    match &*value {
                        Variable::Bool(_v) => {
                            if !_v {
                                return Err(ZkPassQueryEngineError::ProofGenerationError);
                            }
                        },
                        _ => {
                            return Err(ZkPassQueryEngineError::ProofGenerationError);
                        }
                    }
                }
            },
            _ => {
                return Ok(());
            }
        }

        Ok(())
    }

    fn parse_output_stmt(&mut self, node: &Value) -> Result<Stmt, ZkPassQueryEngineError> {
        let stmt: Stmt;

        match node {
            Value::Object(map) => {
                if map.len() != 1 {
                    return Err(ZkPassQueryEngineError::OutputStatementExpectingOneOperandParsingError);
                }

                if let Some((var, value)) = map.iter().next() {
                    let expr = self.parse_exp(value)?;

                    // validate the accessibiity of the expression
                    self.validate_accessibility(&expr)?;
                    stmt = Stmt::OutputStmt{field: var.to_string(), expr};
                } else {
                    return Err(ZkPassQueryEngineError::OutputStatementParsingError);
                }
            }
            _ => {
                error!("parse: unexpected statement error");
                return Err(ZkPassQueryEngineError::OutputStatementExpectingOperandInObjectParsingError);
            }
        }

        Ok(stmt)
    }

    fn parse_assign_stmt(&mut self, node: &Value) -> Result<Stmt, ZkPassQueryEngineError> {
        let stmt: Stmt;

        match node {
            Value::Object(map) => {
                if map.len() != 1 {
                    return Err(ZkPassQueryEngineError::AssignmentStatementExpectingOneOperandParsingError);
                }

                if let Some((var, value)) = map.iter().next() {
                    let expr = self.parse_exp(value)?;

                    // validate the accessibiity of the expression
                    self.validate_accessibility(&expr)?;
                    stmt = Stmt::AssignStmt{var: var.to_string(), expr};
                } else {
                    return Err(ZkPassQueryEngineError::AssignmentStatementParsingError);
                }
            }
            _ => {
                error!("parse: unexpected statement error");
                return Err(ZkPassQueryEngineError::AssignmentStatementExpectingOperandInObjectParsingError);
            }
        }

        Ok(stmt)
    }

    fn parse_if_stmt(&mut self, node: &Value) -> Result<Stmt, ZkPassQueryEngineError> {
        let mut expr: Option<Box<Expr>> = None;
        let mut then_block: Option<Box<Vec<Stmt>>> = None;
        // if the if stmt has no 'else', the else_block will comtain an empty vector
        let mut else_block: Box<Vec<Stmt>> = Box::new(Vec::new());

        match node {
            Value::Object(map) => {
                if map.len() > 3 {
                    return Err(ZkPassQueryEngineError::IfStatementExpectingThreeOperandOrLessParsingError);
                }

                for (key, value) in map {
                    match key.as_str() {
                        "condition" => {
                            expr = Some(self.parse_exp(value)?);
                        },
                        "then" => {
                            then_block = Some(self.parse_stmts(value)?);
                        },
                        "else" => {
                            else_block = self.parse_stmts(value)?;
                        },
                        _ => {
                            return Err(ZkPassQueryEngineError::IfStatementUnknownKeywordParsingError);
                        }
                    }
                }
            },
            _ => {
                return Err(ZkPassQueryEngineError::IfStatementExpectingOperandInObjectParsingError);
            }
        }

        Ok(Stmt::IfStmt{
            expr: expr.ok_or(ZkPassQueryEngineError::IfStatementMissingConditionParsingError)?,
            then_block: then_block.ok_or(ZkPassQueryEngineError::IfStatementMissingThenBlockParsingError)?,
            else_block
        })

    }

    fn parse_stmts(&mut self, node: &Value) -> Result<Box<Vec<Stmt>>, ZkPassQueryEngineError> {
        let mut stmts = Vec::<Stmt>::new();

        if let Value::Array(arr) = node {
            for v in arr {
                match v {
                    Value::Object(map) => {
                        for (key, value) in map {
                            let stmt : Stmt;
                            match key.as_str() {
                                "assign" => {
                                    stmt = self.parse_assign_stmt(value)?;
                                },
                                "output" => {
                                    stmt = self.parse_output_stmt(value)?;
                                },
                                "if" => {
                                    stmt = self.parse_if_stmt(value)?;
                                },
                                _ => {
                                    return Err(ZkPassQueryEngineError::UnknownStmtKeywordParsingError);
                                }
                            }
                            stmts.push(stmt);
                        }
                    },
                    _ => {
                        error!("parse: unexpected statement error");
                        return Err(ZkPassQueryEngineError::UnexpectedStmtError);
                    },
                }
            }
        }

        Ok(Box::new(stmts))
    }

    fn parse_exp(&mut self, node: &Value) -> Result<Box<Expr>, ZkPassQueryEngineError> {
        match node {
            Value::Object(map) => {
                let mut expr = Expr::BooleanLiteral(false);

                for (key, value) in map {
                    match key.as_str() {
                        "lvar" => {
                            if let Value::String(s) = value {
                                expr = Expr::VariableExpression {kind: VariableKind::Local, name: s.clone()}
                            }
                            else {
                                return Err(ZkPassQueryEngineError::LocalVarParsingError);
                            }
                        }

                        "dvar" => {
                            if let Value::String(s) = value {
                                if s.chars().next().map_or(false, |c| c.is_alphabetic()) {
                                    self.resolve_data_variable(s.clone())?;
                                    expr = Expr::VariableExpression {kind: VariableKind::Data, name: s.clone()}
                                }
                                else {
                                    return Err(ZkPassQueryEngineError::DataVarNameNotStartingWithAlphabetError);
                                }
                            }
                            else {
                                return Err(ZkPassQueryEngineError::DataVarParsingError);
                            }
                        }

                        "and" => {
                            let childs = self.parse_all_childs(value)?;
                            expr = Expr::BooleanExpression {
                                operator: BooleanOperator::And,
                                childs: childs,
                            };
                        }

                        "or" => {
                            let childs = self.parse_all_childs(value)?;
                            expr = Expr::BooleanExpression {
                                operator: BooleanOperator::Or,
                                childs: childs,
                            };
                        }

                        "~==" => {
                            let (left, right) = self.parse_left_right_childs(value)?;
                            expr = Expr::RelationalExpression {
                                operator: RelationalOperator::CaseInsensitiveEqual,
                                left: left,
                                right: right,
                            };
                        }

                        "~!=" => {
                            let (left, right) = self.parse_left_right_childs(value)?;
                            expr = Expr::RelationalExpression {
                                operator: RelationalOperator::CaseInsensitiveNotEqual,
                                left: left,
                                right: right,
                            };
                        }

                        "==" => {
                            let (left, right) = self.parse_left_right_childs(value)?;
                            expr = Expr::RelationalExpression {
                                operator: RelationalOperator::Equal,
                                left: left,
                                right: right,
                            };
                        }

                        "!=" => {
                            let (left, right) = self.parse_left_right_childs(value)?;
                            expr = Expr::RelationalExpression {
                                operator: RelationalOperator::NotEqual,
                                left: left,
                                right: right,
                            };
                        }

                        ">" => {
                            let (left, right) = self.parse_left_right_childs(value)?;
                            expr = Expr::RelationalExpression {
                                operator: RelationalOperator::GreaterThan,
                                left: left,
                                right: right,
                            };
                        }

                        ">=" => {
                            let (left, right) = self.parse_left_right_childs(value)?;
                            expr = Expr::RelationalExpression {
                                operator: RelationalOperator::GreaterThanOrEqual,
                                left: left,
                                right: right,
                            };
                        }

                        "<" => {
                            let (left, right) = self.parse_left_right_childs(value)?;
                            expr = Expr::RelationalExpression {
                                operator: RelationalOperator::LessThan,
                                left: left,
                                right: right,
                            };
                        }

                        "<=" => {
                            let (left, right) = self.parse_left_right_childs(value)?;
                            expr = Expr::RelationalExpression {
                                operator: RelationalOperator::LessThanOrEqual,
                                left: left,
                                right: right,
                            };
                        }

                        "get_age" => {
                            let (left, right) = self.parse_left_right_childs(value)?;
                            expr = Expr::GetAgeExpression {
                                date: left,
                                format: right
                            };
                        }

                        _ => {
                            return Err(ZkPassQueryEngineError::UnexpectedOperatorParsingError);
                        }
                    }
                }
                Ok(Box::new(expr))
            }

            Value::String(s) => {
                Ok(Box::new(Expr::StringLiteral(s.to_string())))
            }

            Value::Number(n) => {
                let i = n.as_i64().ok_or_else(|| {
                    error!("Value::Number: expecting number value");
                    ZkPassQueryEngineError::UnexpectedValueError
                })?;

                Ok(Box::new(Expr::NumberLiteral(i)))
            }

            Value::Bool(b) => {
                Ok(Box::new(Expr::BooleanLiteral(*b)))
            }

            _ => {
                error!("parse: unexpected value");
                Err(ZkPassQueryEngineError::UnexpectedValueError)
            },
        }
    }
}
