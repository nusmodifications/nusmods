#!/usr/bin/env sh

if [ $PROJECT == "api" ]
  then
    echo "Running tests for api"
    cd api && yarn install
    npm test
elif [ $PROJECT == "www" ]
  then
    echo "Running tests for www"
    cd www && yarn install
    npm run ci
elif [ $PROJECT == "nusmoderator" ]
  then
    echo "Running tests for nusmoderator"
    cd packages/nusmoderator && yarn install
    npm test
fi
