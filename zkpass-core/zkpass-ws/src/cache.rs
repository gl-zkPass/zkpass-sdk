/*
 * cache.rs
 * this file contains all about caching.
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created Date: December 4th 2023
 * -----
 * Last Modified: April 2nd 2024
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
use std::{ path::PathBuf, time::Instant };

use lazy_static::lazy_static;
use tokio::sync::RwLock;
use zkpass_core::interface::{ KeysetEndpoint, PublicKey };
use zkpass_svc_common::interface::{
    cache::{ create_cache_key, Cacheable, TimedCache, DEFAULT_TIMEOUT_IN_SECONDS },
    errors::ZkPassUtilError,
};

lazy_static! {
    static ref TIMED_CACHE: RwLock<TimedCache> = {
        let my_path = PathBuf::from("./zkpass-ws/.env");
        dotenvy::from_path(my_path.as_path()).ok();
        let expired_duration = std::env
            ::var("TIMEOUT_IN_SECONDS")
            .unwrap_or(DEFAULT_TIMEOUT_IN_SECONDS.to_string())
            .parse::<u64>()
            .unwrap_or(DEFAULT_TIMEOUT_IN_SECONDS);
        RwLock::new(TimedCache::new(expired_duration))
    };
}

pub async fn get_from_cache<T>(cache_key: &str) -> Result<Option<(T, bool)>, ZkPassUtilError>
    where T: Cacheable<T> + Clone
{
    let cache_handle = TIMED_CACHE.read().await;
    let cache_value = cache_handle.get::<T>(cache_key)?;
    Ok(cache_value)
}

pub async fn insert_to_cache<T>(cache_key: &str, value: T) -> Result<(), ZkPassUtilError>
    where T: Cacheable<T>
{
    let mut cache_handle = TIMED_CACHE.write().await;
    cache_handle.insert::<T>(cache_key, value)?;
    Ok(())
}

pub async fn remove_single_public_keys(keyset: KeysetEndpoint) -> Result<(), ZkPassUtilError> {
    let mut cache_handle = TIMED_CACHE.write().await;
    let cache_key = create_cache_key(keyset.clone())?;
    cache_handle.remove(&cache_key);
    Ok(())
}

pub async fn remove_expired_public_keys() -> Result<(), ZkPassUtilError> {
    let cache_handle = TIMED_CACHE.read().await;
    if !cache_handle.is_empty() {
        let keys_to_remove = cache_handle.cache
            .iter()
            .filter(|&(_, (_, instant))| instant.elapsed() >= cache_handle.expire_duration)
            .map(|(key, _)| key.clone())
            .collect::<Vec<String>>();

        drop(cache_handle);
        let mut cache_handle = TIMED_CACHE.write().await;
        for key in keys_to_remove {
            cache_handle.remove(&key);
        }
    }
    Ok(())
}

pub async fn get_cache_public_keys(
    data: Option<KeysetEndpoint>
) -> Result<Vec<String>, ZkPassUtilError> {
    remove_expired_public_keys().await?;
    let cache_handle = TIMED_CACHE.read().await;
    if let Some(keyset) = data {
        let cache_key = create_cache_key(keyset.clone())?;
        let cache_value = cache_handle.get::<PublicKey>(&cache_key)?;
        let mut public_keys = Vec::<String>::new();
        if let Some((key, _)) = cache_value {
            public_keys.insert(0, serde_json::to_string(&key).unwrap());
        }
        Ok(public_keys)
    } else {
        let all_public_keys = if cache_handle.is_empty() {
            Vec::new()
        } else {
            cache_handle.cache
                .values()
                .cloned()
                .collect::<Vec<(String, Instant)>>()
                .into_iter()
                .map(|(s, _)| s)
                .collect::<Vec<String>>()
        };
        Ok(all_public_keys)
    }
}
#[cfg(test)]
mod tests {
    use std::{ thread::sleep, time::Duration };

    use super::*;
    use serial_test::serial;
    use zkpass_core::interface::PublicKey;
    use zkpass_svc_common::interface::cache::TimedCache;

    #[tokio::test]
    #[serial]
    async fn test_get_from_cache() {
        // Test when cache value exists
        let cache_key = "cache_key";
        let cache_value = PublicKey {
            x: "x".to_string(),
            y: "y".to_string(),
        };

        TIMED_CACHE.write().await.insert(cache_key, cache_value.clone()).unwrap();
        let (result, _): (PublicKey, bool) = get_from_cache(cache_key).await.unwrap().unwrap();
        assert_eq!(result, cache_value);

        // Test when cache value does not exist
        let non_existing_cache_key = "non_existing_cache_key";
        let result: Option<(PublicKey, bool)> = get_from_cache(
            non_existing_cache_key
        ).await.unwrap();
        assert_eq!(result, None);
    }

    #[tokio::test]
    #[serial]
    async fn test_insert_to_cache() {
        let cache_key = "cache_key";
        let value = PublicKey {
            x: "x".to_string(),
            y: "y".to_string(),
        };
        insert_to_cache(cache_key, value.clone()).await.unwrap();
        let cache_handle = TIMED_CACHE.read().await;
        let cache_value: Option<(PublicKey, bool)> = cache_handle.get(cache_key).unwrap();
        assert_eq!(cache_value, Some((value, false)));
    }

    #[tokio::test]
    #[serial]
    async fn test_remove_single_public_keys() {
        let keyset = KeysetEndpoint {
            jku: "jku".to_string(),
            kid: "kid".to_string(),
        };
        let cache_key = create_cache_key(keyset.clone()).unwrap();
        let value = PublicKey {
            x: "x".to_string(),
            y: "y".to_string(),
        };
        TIMED_CACHE.write().await.insert::<PublicKey>(&cache_key, value).unwrap();
        remove_single_public_keys(keyset).await.unwrap();
        let cache_handle = TIMED_CACHE.read().await;
        let cache_value = cache_handle.get::<PublicKey>(&cache_key).unwrap();
        assert_eq!(cache_value, None);
    }

    #[tokio::test]
    #[serial]
    async fn test_check_expired_public_keys() {
        // Test when cache is not empty and some keys are expired
        let cache_key1 = "cache_key1";
        let cache_key2 = "cache_key2";
        let cache_key3 = "cache_key3";
        let expired_cache_key = "expired_cache_key";
        let value = PublicKey {
            x: "x".to_string(),
            y: "y".to_string(),
        };
        let expired_value = PublicKey {
            x: "expired_x".to_string(),
            y: "expired_y".to_string(),
        };
        let mut timed_cache = TimedCache::new(1);

        timed_cache.insert(expired_cache_key, expired_value.clone()).unwrap();
        sleep(Duration::from_secs(3));

        timed_cache.insert(cache_key1, value.clone()).unwrap();
        timed_cache.insert(cache_key2, value.clone()).unwrap();
        timed_cache.insert(cache_key3, value.clone()).unwrap();

        let expired_cache: Option<(PublicKey, bool)> = timed_cache.get(expired_cache_key).unwrap();
        let cache1: Option<(PublicKey, bool)> = timed_cache.get(cache_key1).unwrap();
        let cache2: Option<(PublicKey, bool)> = timed_cache.get(cache_key2).unwrap();
        let cache3: Option<(PublicKey, bool)> = timed_cache.get(cache_key3).unwrap();
        assert!(expired_cache.unwrap().1); // if it is true, then, yes it is expired
        assert_eq!(cache1.unwrap().0, value.clone());
        assert_eq!(cache2.unwrap().0, value.clone());
        assert_eq!(cache3.unwrap().0, value.clone());

        // Test when cache is empty
        timed_cache.cache.clear();
        assert_eq!(timed_cache.is_empty(), true);
    }

    #[tokio::test]
    #[serial]
    async fn test_get_cache_public_keys() {
        // Test when data is Some
        let keyset = KeysetEndpoint {
            jku: "jku".to_string(),
            kid: "kid".to_string(),
        };
        let cache_key = create_cache_key(keyset.clone()).unwrap();
        let public_key = PublicKey {
            x: "x".to_string(),
            y: "y".to_string(),
        };
        TIMED_CACHE.write().await.insert::<PublicKey>(&cache_key, public_key.clone()).unwrap();
        let result = get_cache_public_keys(Some(keyset)).await.unwrap();
        assert_eq!(result, vec![serde_json::to_string(&public_key).unwrap()]);

        // Test when data is None and cache is empty
        TIMED_CACHE.write().await.cache.clear();
        let result = get_cache_public_keys(None).await.unwrap();
        assert_eq!(result.is_empty(), true);

        // Test when data is None and cache is not empty
        let cache_key1 = "cache_key1";
        let cache_key2 = "cache_key2";
        let cache_key3 = "cache_key3";
        let value = PublicKey {
            x: "x".to_string(),
            y: "y".to_string(),
        };
        TIMED_CACHE.write().await.insert(cache_key1, value.clone()).unwrap();
        TIMED_CACHE.write().await.insert(cache_key2, value.clone()).unwrap();
        TIMED_CACHE.write().await.insert(cache_key3, value.clone()).unwrap();
        let result = get_cache_public_keys(None).await.unwrap();
        let expected_result: Vec<String> = vec![
            value.clone().to_string().unwrap(),
            value.clone().to_string().unwrap(),
            value.clone().to_string().unwrap()
        ];
        assert_eq!(result, expected_result);
    }
}
