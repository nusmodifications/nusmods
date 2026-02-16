#!/usr/bin/env bash

set -e

cargo_dir=$(dirname $(which cargo))

if [ ! -x "$cargo_dir/cargo-audit" ]; then
  echo "cargo-audit is not found in the same directory as cargo. Installing..."
  cargo install cargo-audit
fi

cargo fmt --check --all &&
cargo clippy --all-targets --all-features -- -D warnings &&
cargo check --all-targets --all-features &&
cargo test --all-targets --all-features &&
cargo build --profile=aggressive --all-targets --all-features &&
cargo audit &&
echo CI OK
