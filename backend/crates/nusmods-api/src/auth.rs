use axum::{routing::get, Router};

async fn get_user() -> &'static str {
    "User endpoint"
}

/// Routes for authentication
pub fn auth_routes() -> Router {
    Router::new().route("/user", get(get_user))
}
