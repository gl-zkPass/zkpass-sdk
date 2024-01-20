pub trait LocalizableError {
    fn get_error_key(&self) -> &str;
    fn get_code(&self) -> &'static str;
}
