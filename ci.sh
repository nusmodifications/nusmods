#!/usr/bin/env sh

if [ $PROJECT == "api" ]
  then
    echo "Running tests for api"
    cd api && yarn install
    npm run ci
elif [ $PROJECT == "www" ]
  then
    echo "Running tests for www"
    cd www && yarn install
    npm run ci
fi
