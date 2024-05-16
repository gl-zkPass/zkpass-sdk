/*
 * guard.rs
 * Implement available Actix Web Guard for our web service
 *
 * Authors:
 *   Khandar William (khandar.william@gdplabs.id)
 * Created at: February 29th 2024
 * -----
 * Last Modified: March 4th 2024
 * Modified By: Khandar William (khandar.william@gdplabs.id)
 * -----
 * Reviewers:
 *
 * ---
 * References:
 *   https://docs.rs/actix-web/latest/actix_web/guard/index.html
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use actix_web::guard::{ Guard, GuardContext };
use crate::{ api_key::authenticate, client_check::client_version_check };

/// ApiGuard will only allow requests with valid API key
pub struct ApiGuard;

impl Guard for ApiGuard {
    fn check(&self, ctx: &GuardContext) -> bool {
        authenticate(ctx.head().headers())
    }
}

/// ClientVersionGuard will only allow requests with compatible client version
pub struct ClientVersionGuard;

impl Guard for ClientVersionGuard {
    fn check(&self, ctx: &GuardContext) -> bool {
        let headers = ctx.head().headers();
        client_version_check(headers)
    }
}
