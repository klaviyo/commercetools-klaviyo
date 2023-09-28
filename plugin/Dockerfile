FROM node:20-alpine AS BUILD_IMAGE
RUN apk add --update dumb-init

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
# install dependencies
RUN yarn --frozen-lockfile
COPY . .
RUN yarn test
RUN yarn build
# remove development dependencies
RUN yarn install --production --ignore-scripts --prefer-offline --force --frozen-lockfile


FROM node:20-slim

ENV NODE_ENV production
ENV NODE_CONFIG_DIR ./dist/config
USER node

WORKDIR /usr/src/app
COPY --chown=node:node --from=BUILD_IMAGE /usr/src/app/dist ./dist
COPY --chown=node:node --from=BUILD_IMAGE /usr/src/app/node_modules ./node_modules
COPY --from=BUILD_IMAGE /usr/bin/dumb-init /usr/bin/dumb-init

EXPOSE 8080
CMD [ "dumb-init", "node", "./dist/main.js" ]

