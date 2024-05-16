use serde::{Deserialize, Serialize};
use unicase::UniCase;
pub use zkpass_query_types::{ZkPassQueryEngineError, Entry, Val, OutputReader, escape_string, LookupTable, lookup};
use zkpass_query_types::{OutputTable, SymbolTable, LocalDate};
use crate::parser::ZkPassQueryParser;

//
// Internal variables are local variables which are preset by the
// query runtime. The identifiers always start with a "_";
//
mod internal_var {
    pub const TODAYS_DATE: &str = "_todays_date";
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ProofMethodInput {
    pub map: LookupTable,
    pub stmts: Vec<Stmt>,
    pub current_date: u32
}

#[derive(Debug, Deserialize, Serialize)]
pub enum RelationalOperator {
    Equal,
    NotEqual,
    LessThan,
    LessThanOrEqual,
    GreaterThan,
    GreaterThanOrEqual,
    CaseInsensitiveEqual,
    CaseInsensitiveNotEqual
}

#[derive(Debug, Deserialize, Serialize)]
pub enum BooleanOperator {
    And,
    Or,
}

#[derive(Debug, Deserialize, Serialize)]
pub enum Stmt {
    AssignStmt{
        var: String,
        expr: Box<Expr>
    },
    OutputStmt {
        field: String,
        expr: Box<Expr>
    },
    IfStmt {
        expr: Box<Expr>,
        then_block: Box<Vec<Stmt>>,
        else_block: Box<Vec<Stmt>>
    }
}

///
/// The StmtExecutor provides the environment for executing a vector of statements
/// It has the output_table and local_table data members which are used throughout the execution.
/// The data_table is passed in by the caller of 'execute' function.
///
struct StmtExecutor<'a> {
    data_table: &'a LookupTable,
    output_table: OutputTable,
    local_table: SymbolTable
}

impl StmtExecutor<'_> {
    //
    //  Executes a vector of statements and returns the json output in a serialized string
    //  This is the implementation for the Stmt::execute function.
    //
    pub fn execute(&mut self, stmts: &Vec<Stmt>) -> String {
        for stmt in stmts {
            match stmt {
                Stmt::AssignStmt{ var, expr } => {
                    let val = expr.eval(self.data_table, &self.local_table);
                    self.local_table.add(
                        Entry {
                            key: (*var).clone(),
                            val
                        }
                    );
                },

                Stmt::OutputStmt{ field, expr } => {
                    let val = expr.eval(self.data_table, &self.local_table);

                    self.output_table.add(
                        Entry {
                            key: (*field).clone(),
                            val
                        }
                    );
                },

                Stmt::IfStmt{expr, then_block, else_block} => {
                    let val = expr.eval(self.data_table, &self.local_table);
                    if let Val::Bool(b) = val {
                        if b {
                            self.execute(then_block);
                        } else {
                            self.execute(else_block);
                        }
                    }
                    else {
                        panic!("If stmt expecting a boolean condition");
                    }
                }
            }
        }
        self.serialize()
    }

    ///
    /// Custom serialization code for the output_table
    /// Previously we used serde_json's self.output_table.to_json()
    /// to serialize the output_table.
    /// The purpose is to generate a flat style json object.
    /// This serialization code generates smaller output size,
    /// and runs faster than output_table.to_json().
    ///
    fn serialize(&mut self) -> String {
        let mut output = String::with_capacity(100);
        let mut i: usize = 0;
        let last_index = self.output_table.table.len() - 1;

        output.push_str("{");
        for entry in &self.output_table.table {
            output.push_str("\"");
            output.push_str(&escape_string(&entry.key));
            output.push_str("\":");
            match &entry.val {
                Val::Str(s)=> {
                    output.push_str("\"");
                    output.push_str(&escape_string(s));
                    output.push_str("\"");
                },
                Val::Bool(b)=> {
                    output.push_str(&b.to_string());
                },
                Val::Int(i)=> {
                    output.push_str(&i.to_string());
                }
            }
            if i != last_index  {
                output.push_str(",");
            }
            i = i + 1;
        }
        output.push_str("}");

        output
    }
}


#[derive(Debug, Deserialize, Serialize)]
pub enum VariableKind {
    Data, Local
}

#[derive(Debug, Deserialize, Serialize)]
pub enum Expr {
    StringLiteral(String),
    NumberLiteral(i64),
    BooleanLiteral(bool),
    RelationalExpression {
        operator: RelationalOperator,
        left: Box<Expr>,
        right: Box<Expr>,
    },
    BooleanExpression {
        operator: BooleanOperator,
        childs: Vec<Box<Expr>>
    },
    VariableExpression {
        kind: VariableKind,
        name: String
    },
    GetAgeExpression {
        format: Box<Expr>,
        date: Box<Expr>,
    }
}

impl Expr {
    pub fn eval(&self, dict: &LookupTable, local_table: &SymbolTable) -> Val {
        match self {
            //
            //  RelationalExpression
            //
            Self::RelationalExpression { operator, left, right } => {
                let lvalue = left.eval(dict, local_table);
                let rvalue = right.eval(dict, local_table);

                if let (Val::Str(s1), Val::Str(s2)) = (&lvalue, &rvalue) {
                    match operator {
                        RelationalOperator::Equal => Val::Bool(s1 == s2),
                        RelationalOperator::NotEqual => Val::Bool(s1 != s2),
                        RelationalOperator::CaseInsensitiveEqual => Val::Bool(UniCase::new(s1) == UniCase::new(s2)),
                        RelationalOperator::CaseInsensitiveNotEqual => Val::Bool(UniCase::new(s1) != UniCase::new(s2)),
                        _ => {
                            panic!("Unexpected relational operator for string expression")
                        }
                    }
                }
                else if let (Val::Int(i1), Val::Int(i2)) = (&lvalue, &rvalue) {
                    match operator {
                        RelationalOperator::Equal => Val::Bool(i1== i2),
                        RelationalOperator::NotEqual => Val::Bool(i1 != i2),
                        RelationalOperator::LessThan => Val::Bool(i1 < i2),
                        RelationalOperator::LessThanOrEqual => Val::Bool(i1 <= i2),
                        RelationalOperator::GreaterThan => Val::Bool(i1> i2),
                        RelationalOperator::GreaterThanOrEqual => Val::Bool(i1>= i2),
                        _ => {
                            panic!("Unexpected relational operator for integer expression")
                        }
                    }

                }
                else if let (Val::Bool(b1), Val::Bool(b2)) = (&lvalue, &rvalue) {
                    match operator {
                        RelationalOperator::Equal => Val::Bool(b1 == b2),
                        RelationalOperator::NotEqual => Val::Bool(b1 != b2),
                        _ => {
                            panic!("Unexpected relational operator for boolean expression")
                        }
                    }
                }
                else {
                    panic!("Unexpected types for relational operands");
                }
            },

            //
            //  VariableExpression
            //
            Self::VariableExpression { kind, name, } => {
                match kind {
                    VariableKind::Data => {
                        let value  = lookup(&dict, name).unwrap();
                        value.clone()
                    },
                    VariableKind::Local => {
                        let value  = local_table.find(name).unwrap();
                        value.clone()
                    },
                }
            }

            //
            // Boolean Literal
            //
            Self::BooleanLiteral(value) => {
                Val::Bool(*value)
            },

            //
            // String Literal
            //
            Self::StringLiteral(value) => {
                Val::Str((*value).clone())
            },

            //
            // Number Literal
            //
            Self::NumberLiteral(value) => {
                Val::Int(*value)
            },

            //
            // BooleanExpression
            //
            Self::BooleanExpression { operator, childs } => {
                match operator {
                    BooleanOperator::And =>  {
                        for e in childs {
                            let val = e.eval(dict, local_table);
                            match val {
                                Val::Bool(b) => {
                                    if b == false {
                                        return Val::Bool(false);
                                    }
                                },
                                _ => {
                                    panic!("And operator expecting a bool expression");
                                }
                            }
                        };
                        return Val::Bool(true);
                    },

                    BooleanOperator::Or => {
                        for e in childs {
                            let val = e.eval(dict, local_table);
                            match val {
                                Val::Bool(b) => {
                                    if b == true {
                                        return Val::Bool(true);
                                    }
                                },
                                _ => {
                                    panic!("Or operator expecting a bool expression");
                                }
                            }
                        };
                        return Val::Bool(false);
                    }
                };
            }

            Self::GetAgeExpression{ format, date } => {
                let date_val = date.eval(dict, local_table);
                let format_val = format.eval(dict, local_table);

                if let (Val::Str(date_str), Val::Str(format_str)) = (&date_val, &format_val) {
                    let date = LocalDate::parse_date(date_str, format_str).unwrap();
                    let todays_date_val = local_table.find(internal_var::TODAYS_DATE).unwrap();
                    if let Val::Int(i) = todays_date_val {
                        let todays_date = LocalDate::from_u32(*i as u32);
                        let age = LocalDate::calculate_age_difference(&date, &todays_date);
                        return Val::Int(age as i64);
                    }
                    else {
                        panic!("get_age cannot find the _todays_date in the local table");
                    }
                }
                else {
                    panic!("get_age operands have incorrect types");
                }
            }
        }
    }
}

///
///  ZkPassQuery::execute is called directly from the zkvm's proof method
///
pub struct ZkPassQuery;
impl ZkPassQuery {
    /// The top-level execute function
    /// This function is called directly from the zkvm.
    /// The execute function will throw panic when encountering error.
    /// The zkvm will handle the panic properly.
    pub fn execute(input: &ProofMethodInput) -> String {
        let mut local_table =  SymbolTable::new();
        local_table.add(Entry{ key: String::from(internal_var::TODAYS_DATE), val: Val::Int(input.current_date as i64)});

        let mut executor = StmtExecutor{
            data_table: &input.map,
            output_table: OutputTable::new(),
            local_table
        };

        executor.execute(&input.stmts)
    }
}

pub trait ZkPassQueryEngine {
    fn execute_query_and_create_zkproof(&self, user_data: &str, query: &str) -> Result<String, ZkPassQueryEngineError> {
        let mut zkpass_query = ZkPassQueryParser::new(user_data, query);
        let (dictionary, stmts) = zkpass_query.parse_query_stmts()?;
        let current_time = LocalDate::now();

        // set the input
        let input = ProofMethodInput{ map: *dictionary, stmts: *stmts, current_date: current_time };
        let receipt = self.execute_query_and_create_zkproof_internal(&input)?;

        Ok(receipt)
    }

    fn execute_query_and_create_zkproof_internal(&self, input: &ProofMethodInput) -> Result<String, ZkPassQueryEngineError>;

    fn verify_zkproof(&self, receipt: &str) -> Result<String, ZkPassQueryEngineError>;

    fn get_query_method_version(&self) -> String;

    fn get_query_engine_version(&self) -> String;
}
