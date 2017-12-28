#!/usr/bin/env sh

if [ $PROJECT == "www" ]
  then
    echo "Running tests for www"
    cd www && yarn install
    npm run ci
fi
