use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub enum ZkPassQueryEngineError {
    UnhandledPanicError,
    UnexpectedValueError,
    UnexpectedOperatorError,
    UserDataParsingError,
    QueryParsingError,
    VariableResolutionError,
    ProofGenerationError,
    ProofSerializationError,
}
