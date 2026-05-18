use axum::{
    extract::Query,
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Redirect},
    routing::get,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use url::Url;

const ALLOWED_CALLBACK_DOMAINS: [&str; 4] =
    ["nusmods.com", "nuscourses.com", "modsn.us", "localhost"];

const USER_DETAILS_ENDPOINT: &str = "https://nusmods.com/api/nus/auth/user";
const SSO_LINK_ENDPOINT: &str = "https://nusmods.com/api/nus/auth/sso";

fn is_valid_callback_url(callback_url: &str) -> bool {
    let url = match Url::parse(callback_url) {
        Ok(url) => url,
        Err(_) => return false, // Invalid URL
    };

    let host = url.host_str().map(|h| h.to_lowercase());

    host.map(|host| {
        ALLOWED_CALLBACK_DOMAINS.iter().any(|allowed_domain| {
            host.ends_with(&format!(".{}", allowed_domain)) || &host == allowed_domain
        })
    })
    .unwrap_or(false)
}

async fn query_user_saml_details(token: &str) -> anyhow::Result<SamlUser> {
    let client = reqwest::Client::new();
    let saml_user = client
        .get(USER_DETAILS_ENDPOINT)
        .header("Authorization", token)
        .send()
        .await?
        .json::<SamlUser>()
        .await?;
    Ok(saml_user)
}

async fn query_login_url(callback: &str) -> anyhow::Result<String> {
    let client = reqwest::Client::new();
    let login_url = client
        .get(SSO_LINK_ENDPOINT)
        .query(&[("callback", callback)])
        .send()
        .await?
        .text()
        .await?;
    Ok(login_url)
}

async fn get_user(
    headers: HeaderMap,
    Query(query): Query<GetUser>,
) -> Result<impl IntoResponse, StatusCode> {
    let token = match query.token {
        Some(token) => token,
        None => headers
            .get("Authorization")
            .and_then(|header| header.to_str().ok())
            .ok_or(StatusCode::BAD_REQUEST)?
            .to_owned(),
    };

    let result = query_user_saml_details(&token).await;
    match result {
        Ok(user) => Ok(Json(user)),
        Err(_) => Err(StatusCode::UNAUTHORIZED),
    }
}

async fn get_login_url(Query(query): Query<GetLogin>) -> Result<impl IntoResponse, StatusCode> {
    let callback = query.callback;
    if !is_valid_callback_url(&callback) {
        return Err(StatusCode::BAD_REQUEST);
    }
    let login_url = query_login_url(&callback).await;
    match login_url {
        Ok(login_url) => Ok(Redirect::to(&login_url)),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

/// # Routes for authentication
///
/// These routes are nested under `/auth` in the API.
/// They currently dispatch all auth requests to the Vercel serverless functions,
/// that we have written and deployed in TypeScript for the CPEx.
///
/// This is to reduce the complexity of the auth portions for this backend for now.
/// Ideally, we should be able to handle SAML auth (IdP and SP) within Rust in the future.
pub fn auth_routes() -> Router {
    Router::new()
        .route("/user", get(get_user))
        .route("/login", get(get_login_url))
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SamlUser {
    account_name: String,
    upn: String,
    email: String,
}

#[derive(Deserialize)]
struct GetLogin {
    callback: String,
}

#[derive(Deserialize)]
struct GetUser {
    token: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_valid_callback_url_canonical() {
        assert!(is_valid_callback_url("http://nusmods.com"));
        assert!(is_valid_callback_url("http://nusmods.com/some/path"));
        assert!(is_valid_callback_url("http://nuscourses.com"));
        assert!(is_valid_callback_url("http://nuscourses.com/some/path"));
        assert!(is_valid_callback_url("http://modsn.us"));
        assert!(is_valid_callback_url("http://modsn.us/some/path"));
        assert!(is_valid_callback_url("http://localhost:3000"));
        assert!(is_valid_callback_url("http://localhost:3000/some/path"));
    }

    #[test]
    fn test_is_valid_callback_url_subdomain() {
        assert!(is_valid_callback_url("http://api.nusmods.com"));
        assert!(is_valid_callback_url("http://api.nusmods.com/some/path"));
        assert!(is_valid_callback_url("http://api.nuscourses.com"));
        assert!(is_valid_callback_url("http://api.nuscourses.com/some/path"));
        assert!(is_valid_callback_url("http://api.modsn.us"));
        assert!(is_valid_callback_url("http://api.modsn.us/some/path"));
        assert!(is_valid_callback_url("http://api.localhost:3000"));
        assert!(is_valid_callback_url("http://api.localhost:3000/some/path"));
    }

    #[test]
    fn test_is_valid_callback_url_malicious_domain() {
        assert!(!is_valid_callback_url("http://maliciousnusmods.com"));
        assert!(!is_valid_callback_url(
            "http://maliciousnusmods.com/some/path"
        ));
        assert!(!is_valid_callback_url("http://api.maliciousnusmods.com"));
        assert!(!is_valid_callback_url(
            "http://api.maliciousnusmods.com/some/path"
        ));
        assert!(!is_valid_callback_url("http://nusmods.com.malicious.com"));
        assert!(!is_valid_callback_url(
            "http://nusmods.com.malicious.com/some/path"
        ));
    }
}
