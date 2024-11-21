#[cfg(test)]
mod lib_test {
    use serde::Deserialize;
    use serde_json::json;

    use crate::{
        date_format,
        escape_string,
        lookup,
        Entry,
        LocalDate,
        LookupTable,
        OutputReader,
        OutputReaderError,
        Val,
        ZkPassQueryEngineError,
    };

    #[test]
    fn lib_zk_pass_query_engine_error_deserialize_test() {
        let errors = json!([
            "UnhandledPanicError",
            "UnexpectedValueError",
            "UnexpectedOperatorError",
            "QueryParsingError",
            "DataVariableResolutionError",
            "ProofGenerationError",
            "ProofSerializationError",
            "UnknownStmtKeywordParsingError",
            "UnexpectedStmtError",
            "UserDataParsingError",
            "LocalVarParsingError",
            "DataVarParsingError",
            "DvrNotAnArrayError",
            "DataVarNameNotStartingWithAlphabetError",
            "ExpectingOperandsInArrayParsingError",
            "ExpectingFirstOperandParsingError",
            "ExpectingSecondOperandParsingError",
            "OutputStatementExpectingOperandInObjectParsingError",
            "OutputStatementExpectingOneOperandParsingError",
            "OutputStatementParsingError",
            "AssignmentStatementExpectingOperandInObjectParsingError",
            "AssignmentStatementExpectingOneOperandParsingError",
            "AssignmentStatementParsingError",
            "IfStatementExpectingOperandInObjectParsingError",
            "IfStatementExpectingThreeOperandOrLessParsingError",
            "IfStatementUnknownKeywordParsingError",
            "IfStatementMissingConditionParsingError",
            "IfStatementMissingThenBlockParsingError",
            "UnexpectedOperatorParsingError",
        ]);

        let arr = errors.as_array().unwrap();

        for error in arr {
            let deserialized = ZkPassQueryEngineError::deserialize(error);
            assert!(deserialized.is_ok());
        }
    }

    #[test]
    fn lib_output_reader_error_deserialize_test() {
        let errors = json!(["UnsupportedTypeError", "ExpectingObjectError"]);

        let arr = errors.as_array().unwrap();

        for error in arr {
            let deserialized = OutputReaderError::deserialize(error);
            assert!(deserialized.is_ok());
        }
    }

    #[test]
    fn lib_lookup_none_test() {
        let lookup_table = LookupTable::deserialize(json!([])).unwrap();
        let key = String::from("some_key");
        let lookup_result = lookup(&lookup_table, &key);
        assert!(lookup_result.is_none());
    }

    #[test]
    fn lib_output_reader_from_json_test() {
        let data =
            json!({
                "some_string_key":"some_string_value",
                "some_boolean_key": true,
                "some_number_key": 123
        }).to_string();

        let output_reader = OutputReader::from_json(&data);
        assert!(output_reader.is_ok());
    }

    #[test]
    fn lib_output_reader_from_json_unsupported_type_error_test() {
        let data = json!({
            "some_array_key":{}
        }).to_string();

        let output_reader = OutputReader::from_json(&data);
        assert!(output_reader.is_err_and(|e| e == OutputReaderError::UnsupportedTypeError));
    }

    #[test]
    fn lib_output_reader_from_json_expecting_object_error_test() {
        let data = json!([]).to_string();

        let output_reader = OutputReader::from_json(&data);
        assert!(output_reader.is_err_and(|e| e == OutputReaderError::ExpectingObjectError));
    }

    #[test]
    fn lib_output_reader_add_test() {
        let data =
            json!({
                "some_string_key":"some_string_value",
                "some_boolean_key": true,
                "some_number_key": 123
        }).to_string();

        let new_data = Entry {
            key: String::from("some_new_data_key"),
            val: Val::Str(String::from("some_new_data")),
        };

        let existing_data = Entry {
            key: String::from("some_string_key"),
            val: Val::Str(String::from("some_existing_data")),
        };

        let mut output_reader = OutputReader::from_json(&data).unwrap();
        output_reader.add(new_data);
        output_reader.add(existing_data);
    }

    #[test]
    fn lib_output_reader_find_bool_test() {
        let data =
            json!({
                "some_string_key":"some_string_value",
                "some_boolean_key": true,
                "some_number_key": 123
        }).to_string();

        let bool_search_key = String::from("some_boolean_key");
        let non_bool_search_key = String::from("some_string_key");
        let missing_search_key = String::from("non_existing_key");

        let output_reader = OutputReader::from_json(&data).unwrap();

        let searched_value = output_reader.find_bool(&bool_search_key);
        assert!(searched_value.is_some_and(|v| v));

        let other_value = output_reader.find_bool(&non_bool_search_key);
        assert!(other_value.is_none());

        let missing_value = output_reader.find_bool(&missing_search_key);
        assert!(missing_value.is_none());
    }

    #[test]
    fn lib_output_reader_find_string_test() {
        let data =
            json!({
                "some_string_key":"some_string_value",
                "some_boolean_key": true,
                "some_number_key": 123
        }).to_string();

        let string_search_key = String::from("some_string_key");
        let non_string_search_key = String::from("some_boolean_key");
        let missing_search_key = String::from("non_existing_key");

        let output_reader = OutputReader::from_json(&data).unwrap();

        let searched_value = output_reader.find_string(&string_search_key);
        assert!(searched_value.is_some_and(|v| v == "some_string_value"));

        let other_value = output_reader.find_string(&non_string_search_key);
        assert!(other_value.is_none());

        let missing_value = output_reader.find_string(&missing_search_key);
        assert!(missing_value.is_none());
    }

    #[test]
    fn lib_output_reader_find_i64_test() {
        let data =
            json!({
                "some_string_key":"some_string_value",
                "some_boolean_key": true,
                "some_number_key": 123
        }).to_string();

        let i64_search_key = String::from("some_number_key");
        let non_i64_search_key = String::from("some_boolean_key");
        let missing_search_key = String::from("non_existing_key");

        let output_reader = OutputReader::from_json(&data).unwrap();

        let searched_value = output_reader.find_i64(&i64_search_key);
        assert!(searched_value.is_some_and(|v| v == 123));

        let other_value = output_reader.find_i64(&non_i64_search_key);
        assert!(other_value.is_none());

        let missing_value = output_reader.find_i64(&missing_search_key);
        assert!(missing_value.is_none());
    }

    #[test]
    fn lib_output_reader_escape_string_test() {
        let normal_string =
            "`1234567890-=qwertyuiop[]asdfghjkl;'zxcvbnm,./~!@#$%^&*()_+QWERTYUIOP|ASDFGHJKL:ZXCVBNM<>?";
        let escaped_string = "\"\\\n\r\t\u{0008}\u{000C}abc";

        let unchanged_string = escape_string(&normal_string);
        assert!(unchanged_string == normal_string);

        let escape_string = escape_string(&escaped_string);
        assert!(escape_string == "\\\"\\\\\\n\\r\\t\\b\\fabc");
    }

    #[test]
    fn lib_local_date_deserialze_test() {
        let local_date = LocalDate::deserialize(
            json!({
                    "day": 1,
                    "month":2,
                    "year":3
            })
        );

        assert!(local_date.is_ok_and(|v| v.day == 1 && v.month == 2 && v.year == 3));
    }

    #[test]
    fn lib_local_date_parse_date_invalid_format_error_test() {
        let invalid_date_string = "01/01";
        let format = date_format::DDMMYYYY;
        let local_date = LocalDate::parse_date(&invalid_date_string, format);
        assert!(local_date.is_none());
    }

    #[test]
    fn lib_local_date_parse_date_invalid_first_delim_test() {
        let invalid_date_string = "01,02,2003";
        let format = date_format::DDMMYYYY;

        let local_date = LocalDate::parse_date(&invalid_date_string, &format);
        assert!(local_date.is_none());
    }

    #[test]
    fn lib_local_date_parse_date_day_parsing_error_test() {
        let invalid_date_string = "invalid_day/02/2003";
        let first_format = date_format::DDMMYYYY;
        let second_format = date_format::MMDDYYYY;

        let first_local_date = LocalDate::parse_date(&invalid_date_string, first_format);
        assert!(first_local_date.is_none());

        let second_local_date = LocalDate::parse_date(&invalid_date_string, second_format);
        assert!(second_local_date.is_none());
    }

    #[test]
    fn lib_local_date_parse_date_month_parsing_error_test() {
        let invalid_date_string = "01/invalid_month/2003";
        let first_format = date_format::DDMMYYYY;
        let second_format = date_format::MMDDYYYY;

        let first_local_date = LocalDate::parse_date(&invalid_date_string, first_format);
        assert!(first_local_date.is_none());

        let second_local_date = LocalDate::parse_date(&invalid_date_string, second_format);
        assert!(second_local_date.is_none());
    }

    #[test]
    fn lib_local_date_parse_date_year_parsing_error_test() {
        let invalid_date_string = "01/02/invalid_year";
        let first_format = date_format::DDMMYYYY;
        let second_format = date_format::MMDDYYYY;

        let first_local_date = LocalDate::parse_date(&invalid_date_string, first_format);
        assert!(first_local_date.is_none());

        let second_local_date = LocalDate::parse_date(&invalid_date_string, second_format);
        assert!(second_local_date.is_none());
    }

    #[test]
    fn lib_local_date_parse_date_format_invalid_format_error_test() {
        let date_string = "01/02/2003";
        let invalid_format = "DD/MM";
        let local_date = LocalDate::parse_date(&date_string, invalid_format);
        assert!(local_date.is_none());
    }

    #[test]
    fn lib_local_date_calculate_age_difference_test() {
        let earlier_date = LocalDate { day: 2, month: 2, year: 2003 };
        let later_date = LocalDate { day: 1, month: 2, year: 2004 };

        let age_difference = LocalDate::calculate_age_difference(&later_date, &earlier_date);

        assert!(age_difference == 0);
    }
}
