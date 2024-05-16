#[cfg(test)]
mod tests {
    use serde_json::json;
    use zkpass_query_types::LocalDate;
    use crate::parser::ZkPassQueryParser;
    use crate::engine::{OutputReader, ProofMethodInput, ZkPassQuery};

    #[test]
    fn test() {
        let user_data = json!(
            {
                "first_name": "John",
                "_first_name_zkpass_public_": true,
                "last_name": "Doe",
                "married": true,
                "dob": "01/31/1980",

                "address": {
                    "street_addr": "2880 Zanker Road, Suite 108",
                    "city": "San Jose",
                    "state": "CA",
                    "_zip_zkpass_public_": true,
                    "zip": "95134",
                },
            }
        );

        let user_data2 = json!(
            {
                "first_name": "Andrew",
                "_first_name_zkpass_public_": true,
                "last_name": "Johnson",
                "age": 11,
                "married": false,
                "dob": "31/01/1990",

                "address": {
                    "street_addr": "2880 Zanker Road, Suite 108",
                    "city": "San Jose",
                    "state": "CA",
                    "_zip_zkpass_public_": true,
                    "zip": "95134",
                },
            }
        );

        let query = json!(
            [
                { "assign": {"age_status":
                    {">=": [
                        {"get_age": [{"dvar": "dob"}, "MM/DD/YYYY"]},
                        21
                    ]}}
                },

                { "assign": {"marital_status": { "==": [true, {"dvar": "married"}]} } },
                { "assign": {"loan2_status": { "and": [ {"lvar": "age_status"}, {"lvar": "marital_status", }]} } },
                { "assign": {"local_first_name": {"dvar": "first_name"}} },

                { "output": {"title": "Loan \"Approval\" Status"} },
                { "output": {"loan \"xyz\" status": {"lvar": "age_status"} } },

                {
                    "if": {
                        // if's bool expression
                        "condition": {
                            "lvar": "age_status"
                        },

                        // true clause
                        "then": [
                            { "output": {"user_name": {"dvar": "first_name"}} },
                            { "output": {"loan2_status": {"lvar": "loan2_status"} } },
                            { "output": {"residence_status": { "==": ["CA", {"dvar": "address.state"}]} } }
                        ],

                        "else": [
                            { "output": {"zip": {"dvar": "address.zip"}} }
                        ]
                    }
                },

            ]
        );

        let query2 = json!(
            [
                { "assign": {"age_status":
                    {"<=": [
                        21,
                        {"get_age": [{"dvar": "dob"}, "DD/MM/YYYY"]}
                    ]}}
                },

                { "assign": {"marital_status": { "==": [true, {"dvar": "married"}]} } },
                { "assign": {"loan2_status": { "and": [ {"lvar": "age_status"}, {"lvar": "marital_status", }]} } },
                { "assign": {"local_first_name": {"dvar": "first_name"}} },

                { "output": {"title": "Loan \"Approval\" Status"} },
                { "output": {"loan \"xyz\" status": {"lvar": "age_status"} } },

                {
                    "if": {
                        // if's bool expression
                        "condition": {
                            "lvar": "age_status"
                        },

                        // true clause
                        "then": [
                            { "output": {"user_name": {"dvar": "first_name"}} },
                            { "output": {"loan2_status": {"lvar": "loan2_status"} } },
                            { "output": {"residence_status": { "==": ["CA", {"dvar": "address.state"}]} } }
                        ]
                    }
                },

            ]
        );

        {
            println!("#### running query engine test #1");
            let mut zkpass_query = ZkPassQueryParser::new(&user_data.to_string(), &query.to_string());
            let (map, stmts) = zkpass_query.parse_query_stmts().unwrap();
            let current_date = LocalDate::now();
            let input = ProofMethodInput{ map: *map, stmts: *stmts, current_date: current_date};

            let output = ZkPassQuery::execute(&input);
            println!("#### output={}", OutputReader::pretty_print(&output));
            let output_reader = OutputReader::from_json(&output).unwrap();
            if output_reader.find_bool("loan \"xyz\" status").unwrap() {
                println!("#### true result");
                assert!(output_reader.find_bool("loan2_status").unwrap());
                assert!(output_reader.find_bool("residence_status").unwrap());
            }
            else {
                println!("#### false result");
            }

            println!(">>>> enumerating output:");
            for entry in output_reader.enumerate() {
                println!("key={}, value={:?}", entry.key, entry.val);
            }
            println!("<<<< end of enumeration");
        }

        {
            println!("#### running query engine test #2");
            let mut zkpass_query = ZkPassQueryParser::new(&user_data2.to_string(), &query2.to_string());
            let (map, stmts) = zkpass_query.parse_query_stmts().unwrap();
            let current_date = LocalDate::now();
            let input = ProofMethodInput{ map: *map, stmts: *stmts, current_date};

            let output = ZkPassQuery::execute(&input);
            println!("#### output={}", OutputReader::pretty_print(&output));
            let output_reader = OutputReader::from_json(&output).unwrap();
            if output_reader.find_bool("loan \"xyz\" status").unwrap() {
                println!("#### true result");
            }
            else {
                println!("#### false result");
                let x = output_reader.find_bool("loan2_status");
                match x {
                    None => {},
                    _ => { assert!(false); }
                }
                let x = output_reader.find_bool("residence_status");
                match x {
                    None => {},
                    _ => { assert!(false); }
                }
                let zip = output_reader.find_string("zip").unwrap();
                if zip != "95134" {
                    assert!(false);
                }
            }

            println!(">>>> enumerating output:");
            for entry in output_reader.enumerate() {
                println!("key={}, value={:?}", entry.key, entry.val);
            }
            println!("<<<< end of enumeration");
        }
    }
}
