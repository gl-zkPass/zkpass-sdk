/*
 * cache.rs
 * this file contains common cache struct and its implementation
 * used by zkpass-ws
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created Date: November 30th 2023
 * -----
 * Last Modified: March 28th 2024
 * Modified By: William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * -----
 * Reviewers:
 *   Antony Halim (antony.halim@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
use std::{ collections::HashMap, time::{ Duration, Instant } };
use zkpass_core::interface::PublicKey;

use super::errors::ZkPassUtilError;

pub const DEFAULT_TIMEOUT_IN_SECONDS: u64 = 3600;

pub trait Cacheable<T> {
    fn to_string(&self) -> Result<String, ZkPassUtilError>;
    fn from_string(value: String) -> Result<T, ZkPassUtilError>;
}

impl Cacheable<PublicKey> for PublicKey {
    fn to_string(&self) -> Result<String, ZkPassUtilError> {
        let string = serde_json::to_string(self).map_err(|_| ZkPassUtilError::SerializeError)?;
        Ok(string)
    }
    fn from_string(value: String) -> Result<PublicKey, ZkPassUtilError> {
        let object: PublicKey = serde_json
            ::from_str(value.as_str())
            .map_err(|_| ZkPassUtilError::DeserializeError)?;
        Ok(object)
    }
}

pub struct TimedCache {
    pub cache: HashMap<String, (String, Instant)>,
    pub expire_duration: Duration,
}

impl TimedCache {
    pub fn new(expire_duration: u64) -> Self {
        let map = HashMap::<String, (String, Instant)>::new();
        let expire = Duration::from_secs(expire_duration);
        TimedCache {
            cache: map,
            expire_duration: expire,
        }
    }
    pub fn is_empty(&self) -> bool {
        self.cache.is_empty()
    }
    pub fn insert<T>(&mut self, key: &str, value: T) -> Result<(), ZkPassUtilError>
        where T: Cacheable<T>
    {
        let string_value = value.to_string()?;
        let created_at = Instant::now();
        self.cache.insert(key.to_string(), (string_value, created_at));
        Ok(())
    }
    pub fn get<T>(&self, key: &str) -> Result<Option<(T, bool)>, ZkPassUtilError>
        where T: Cacheable<T> + Clone
    {
        match self.cache.get(key) {
            Some((value, created_at)) => {
                let value = T::from_string(value.clone())?;
                let is_expired = created_at.elapsed() >= self.expire_duration;
                Ok(Some((value, is_expired)))
            }
            None => Ok(None),
        }
    }
    pub fn remove(&mut self, key: &String) {
        self.cache.remove(key);
    }
}

pub fn create_cache_key<T>(object: T) -> Result<String, ZkPassUtilError>
    where T: serde::ser::Serialize
{
    let cache_key = serde_json::to_string(&object).map_err(|_| ZkPassUtilError::SerializeError)?;
    Ok(cache_key)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_insert_and_get() {
        let mut cache = TimedCache::new(DEFAULT_TIMEOUT_IN_SECONDS);
        let key = "test_key";
        let value = PublicKey {
            x: String::from("abcdef"),
            y: String::from("fedbca"),
        };

        // Insert the value into the cache
        cache.insert(key, value.clone()).unwrap();

        // Retrieve the value from the cache
        let result = cache.get::<PublicKey>(key).unwrap();

        // Check if the retrieved value matches the inserted value
        assert_eq!(result.unwrap().0, value);
    }

    #[test]
    fn test_remove() {
        let mut cache = TimedCache::new(DEFAULT_TIMEOUT_IN_SECONDS);
        let key = "test_key";
        let value = PublicKey {
            x: String::from("abcdef"),
            y: String::from("fedbca"),
        };

        // Insert the value into the cache
        cache.insert(key, value.clone()).unwrap();

        // Remove the value from the cache
        cache.remove(&key.to_string());

        // Check if the cache is empty after removal
        assert!(cache.is_empty());
    }

    #[test]
    fn test_create_cache_key() {
        let object = PublicKey {
            x: String::from("abcdef"),
            y: String::from("fedbca"),
        };

        // Create the cache key
        let cache_key = create_cache_key(object).unwrap();

        // Check if the cache key is not empty
        assert!(!cache_key.is_empty());
    }
}
