/*
 * /v1/service.rs
 * This file registers all routes with prefix "/v1/" and their handlers
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created Date: March 21st 2024
 * -----
 * Last Modified: May 3rd 2024
 * Modified By: William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * -----
 * Reviewers:
 *   NONE
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
use actix_web::{ web, Scope };

use crate::guard::{ ApiGuard, ClientVersionGuard };

use super::route_handlers::*;

pub fn service() -> Scope {
    web::scope("/v1").route(
        "/proof",
        web::post().guard(ApiGuard).guard(ClientVersionGuard).to(generate_proof)
    )
}
