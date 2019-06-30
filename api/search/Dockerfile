FROM node:10-alpine

# Add user so we don't need --no-sandbox.
RUN mkdir -p /home/node/Downloads \
    && mkdir -p /home/node/app/search \
    && chown -R node:node /home/node

WORKDIR /home/node/app/search

COPY ./api/search/package.json ./api/search/yarn.lock ./

RUN ls -la1; yarn --no-cache --frozen-lockfile --production

COPY ./api/search/src ./src

CMD yarn && yarn ts-node src/index.ts
