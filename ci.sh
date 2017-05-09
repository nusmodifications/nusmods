#!/usr/bin/env sh

if [ $PROJECT == "v2" ]
  then
    echo "Running tests for v2"
    yarn install
    npm test
elif [ $PROJECT == "v3" ]
  then
    echo "Running tests for v3"
    cd v3 && yarn install
    npm run ci
fi
