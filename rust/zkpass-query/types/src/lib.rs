use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

mod date_format {
    pub const DDMMYYYY: &str = "DD/MM/YYYY";
    pub const MMDDYYYY: &str = "MM/DD/YYYY";
}

#[derive(Debug, Deserialize, Serialize)]
pub enum ZkPassQueryEngineError {
    UnhandledPanicError,
    UnexpectedValueError,
    UnexpectedOperatorError,
    QueryParsingError,
    DataVariableResolutionError,
    ProofGenerationError,
    ProofSerializationError,
    UnknownStmtKeywordParsingError,
    UnexpectedStmtError,
    UserDataParsingError,
    LocalVarParsingError,
    DataVarParsingError,
    DataVarNameNotStartingWithAlphabetError,
    ExpectingOperandsInArrayParsingError,
    ExpectingFirstOperandParsingError,
    ExpectingSecondOperandParsingError,
    OutputStatementExpectingOperandInObjectParsingError,
    OutputStatementExpectingOneOperandParsingError,
    OutputStatementParsingError,
    AssignmentStatementExpectingOperandInObjectParsingError,
    AssignmentStatementExpectingOneOperandParsingError,
    AssignmentStatementParsingError,
    IfStatementExpectingOperandInObjectParsingError,
    IfStatementExpectingThreeOperandOrLessParsingError,
    IfStatementUnknownKeywordParsingError,
    IfStatementMissingConditionParsingError,
    IfStatementMissingThenBlockParsingError,
    UnexpectedOperatorParsingError,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct SymbolTable {
    pub table: Vec<Entry>,
}

impl SymbolTable {
    pub fn new() -> Self {
        SymbolTable { table: Vec::new() }
    }

    pub fn add(&mut self, entry: Entry) {
        self.table.push(entry);
    }

    pub fn find(&self, key: &str) -> Option<&Val> {
        self.table.iter().find_map(|entry| {
            if entry.key == key {
                Some(&entry.val)
            } else {
                None
            }
        })
    }
}

pub type OutputTable = SymbolTable;

#[derive(Debug, Deserialize, Serialize)]
pub enum OutputReaderError {
    UnsupportedTypeError,
    ExpectingObjectError,
}

#[derive(Clone, Debug, Deserialize, Serialize, Eq, PartialEq)]
pub enum Val {
    Str(String),
    Int(i64),
    Bool(bool),
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct Entry {
    pub key: String,
    pub val: Val,
}

///
/// The LookUpTable is used for storing data variables.
/// The simple Vec<Entry> type is chosen for faster performance
/// when running on the risc0 zkvm.
///
pub type LookupTable = Vec<Entry>;

pub fn lookup<'a>(table: &'a LookupTable, key: &String) -> Option<&'a Val> {
    for entry in table {
        if entry.key == *key {
            return Some(&entry.val);
        }
    }
    None
}

pub struct OutputReader {
    entries: Vec<Entry>,               // to keep the order of entries
    index_map: HashMap<String, usize>, // to search entry, maps keys to their index in the entries Vec
}

impl OutputReader {
    pub fn from_json(json: &str) -> Result<Self, OutputReaderError> {
        let mut table = OutputReader {
            entries: Vec::new(),
            index_map: HashMap::new(),
        };
        let node: Value = serde_json::from_str(json).unwrap();
        match node {
            Value::Object(map) => {
                for (key, valnode) in map {
                    match valnode {
                        Value::String(s) => {
                            table.add(Entry {
                                key,
                                val: Val::Str(s),
                            });
                        }
                        Value::Bool(b) => {
                            table.add(Entry {
                                key,
                                val: Val::Bool(b),
                            });
                        }
                        Value::Number(n) => {
                            let i = n.as_i64().unwrap();
                            table.add(Entry {
                                key,
                                val: Val::Int(i),
                            });
                        }
                        _ => {
                            return Err(OutputReaderError::UnsupportedTypeError);
                        }
                    }
                }
            }
            _ => {
                return Err(OutputReaderError::ExpectingObjectError);
            }
        }

        Ok(table)
    }

    // Add an entry to the collection.
    // If the key already exists, it replaces the old entry while maintaining the original order.
    pub fn add(&mut self, entry: Entry) {
        match self.index_map.get(&entry.key) {
            Some(&index) => {
                // Replace the existing entry's value in the Vec
                self.entries[index].val = entry.val;
            }
            None => {
                // Add new entry to the Vec and index it in the HashMap
                self.index_map.insert(entry.key.clone(), self.entries.len());
                self.entries.push(entry);
            }
        }
    }

    // Find an entry given a key.
    pub fn find(&self, key: &str) -> Option<&Val> {
        self.index_map
            .get(key)
            .and_then(|&index| self.entries.get(index))
            .map(|entry| &entry.val)
    }

    pub fn find_bool(&self, key: &str) -> Option<bool> {
        let val = self.find(key)?;
        if let Val::Bool(b) = val {
            Some(*b)
        } else {
            None
        }
    }

    pub fn find_string(&self, key: &str) -> Option<String> {
        let val = self.find(key)?;
        if let Val::Str(s) = val {
            Some((*s).clone())
        } else {
            None
        }
    }

    pub fn find_i64(&self, key: &str) -> Option<i64> {
        let val = self.find(key)?;
        if let Val::Int(i) = val {
            Some(*i)
        } else {
            None
        }
    }

    // Enumerate the entries in the order they were added.
    pub fn enumerate(&self) -> Vec<&Entry> {
        self.entries.iter().collect()
    }

    pub fn pretty_print(json_string: &str) -> String {
        // Parse the JSON string into a serde_json::Value
        let json: Value = serde_json::from_str(json_string).unwrap();
        // Pretty-print the JSON using serde_json::to_string_pretty
        serde_json::to_string_pretty(&json).unwrap()
    }
}

pub fn escape_string(input: &str) -> String {
    // Check if any character needs to be escaped.
    if !input.chars().any(|c| {
        matches!(
            c,
            '\"' | '\\' | '\n' | '\r' | '\t' | '\u{0008}' | '\u{000C}'
        )
    }) {
        return input.to_string();
    }

    let mut escaped_string = String::with_capacity(input.len());
    for c in input.chars() {
        match c {
            '\"' => escaped_string.push_str("\\\""), // Escape double quote
            '\\' => escaped_string.push_str("\\\\"), // Escape backslash
            '\n' => escaped_string.push_str("\\n"),  // Escape newline
            '\r' => escaped_string.push_str("\\r"),  // Escape carriage return
            '\t' => escaped_string.push_str("\\t"),  // Escape tab
            '\u{0008}' => escaped_string.push_str("\\b"), // Escape backspace
            '\u{000C}' => escaped_string.push_str("\\f"), // Escape form feed
            _ => escaped_string.push(c),
        }
    }

    escaped_string
}

//
// Struct to hold date information
//
#[derive(Debug, Deserialize, Serialize)]
pub struct LocalDate {
    pub day: u8,   // 1-31
    pub month: u8, // 1-12
    pub year: u16, // e.g. 2024
}

impl LocalDate {
    // Converts a date string into a LocalDate struct,
    // given a date format and allowing for different delimiters ('/', '-', '.')
    pub fn parse_date(date_str: &str, date_format: &str) -> Option<Self> {
        // Find positions of the delimiter to slice the string without collecting parts.
        let first_delim = date_str.find(|c: char| c == '/' || c == '-' || c == '.')?;
        let last_delim = date_str.rfind(|c: char| c == '/' || c == '-' || c == '.')?;

        if first_delim == last_delim {
            return None; // Only one delimiter found, invalid format.
        }

        // Directly slice the string to get day, month, and year parts based on the format.
        let (day, month, year): (u8, u8, u16);
        match date_format {
            date_format::DDMMYYYY => {
                day = date_str[..first_delim].parse().ok()?;
                month = date_str[first_delim + 1..last_delim].parse().ok()?;
                year = date_str[last_delim + 1..].parse().ok()?;
            }
            date_format::MMDDYYYY => {
                month = date_str[..first_delim].parse().ok()?;
                day = date_str[first_delim + 1..last_delim].parse().ok()?;
                year = date_str[last_delim + 1..].parse().ok()?;
            }
            _ => {
                return None; // Only one delimiter found, invalid format.
            }
        }
        Some(LocalDate { day, month, year })
    }

    // Gets the current date and converts into u32
    pub fn now() -> u32 {
        let local_date = Local::now().date_naive();
        let now = LocalDate {
            day: local_date.day() as u8,
            month: local_date.month() as u8,
            year: local_date.year() as u16,
        };
        now.to_u32()
    }

    // Converts a LocalDate to a u32.
    pub fn to_u32(&self) -> u32 {
        let year = self.year as u32; // Uses 16 bits
        let month = self.month as u32; // Uses 4 bits
        let day = self.day as u32; // Uses 5 bits

        (year << 9) | (month << 5) | day
    }

    // Converts a u32 to a LocalDate.
    pub fn from_u32(value: u32) -> Self {
        let day = (value & 0b11111) as u8; // Extracts 5 bits for the day
        let month = ((value >> 5) & 0b1111) as u8; // Extracts next 4 bits for the month
        let year = ((value >> 9) & 0xFFFF) as u16; // Extracts next 16 bits for the year

        LocalDate { day, month, year }
    }

    // Calculates the age difference between two LocalDate instances.
    pub fn calculate_age_difference(a: &LocalDate, b: &LocalDate) -> u16 {
        let (earlier, later) = if LocalDate::is_later(a, b) {
            (b, a)
        } else {
            (a, b)
        };

        let mut age = later.year - earlier.year;

        // If the later date's month is before the earlier date's month,
        // or if it's the same month but the later date's day is before the earlier date's day,
        // then subtract one year from the age.
        if later.month < earlier.month || (later.month == earlier.month && later.day < earlier.day)
        {
            if age > 0 {
                // Prevent underflow
                age -= 1;
            }
        }

        age
    }

    // Determines if date 'a' is later than date 'b'.
    fn is_later(a: &LocalDate, b: &LocalDate) -> bool {
        (a.year, a.month, a.day) > (b.year, b.month, b.day)
    }
}
