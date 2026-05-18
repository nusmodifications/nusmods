use axum::{extract::Path, routing::get, Router};

async fn get_course_reviews(Path(course_id): Path<String>) -> String {
    format!("Course ID: {}", course_id)
}

/// Routes for reviews
pub fn reviews_routes() -> Router {
    Router::new().route("/:course_id", get(get_course_reviews))
}
