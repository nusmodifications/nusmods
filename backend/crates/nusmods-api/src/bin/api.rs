use axum::{routing::get, Router};

const API_VERSION: &str = "v1";

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let api_routes = Router::new()
        .route("/", get(get_root))
        .nest("/auth", nusmods_api::auth::auth_routes())
        .nest("/reviews", nusmods_api::reviews::reviews_routes());

    let app = Router::new()
        .route("/", get(get_root))
        .nest(format!("/{}", API_VERSION).as_str(), api_routes);

    // Run our app with hyper, listening on port 3000
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn get_root() -> &'static str {
    "Welcome to the NUSMods API!"
}
