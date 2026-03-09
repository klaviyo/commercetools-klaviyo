FROM node:22-alpine AS BUILD_IMAGE
RUN apk add --update dumb-init

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
# install dependencies
RUN yarn --frozen-lockfile
COPY . .
RUN yarn build
# remove development dependencies
RUN yarn install --production --ignore-scripts --prefer-offline --force --frozen-lockfile

FROM node:22-alpine

# Deal with vulnerabilities in npm/yarn dependencies by removing package managers from the production image
RUN rm -rf /usr/local/lib/node_modules/npm \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx \
    && rm -rf /opt/yarn* /usr/local/bin/yarn /usr/local/bin/yarnpkg

ENV NODE_ENV production
ENV NODE_CONFIG_DIR ./dist/config
USER node

WORKDIR /usr/src/app
COPY --chown=node:node --from=BUILD_IMAGE /usr/src/app/dist ./dist
COPY --chown=node:node --from=BUILD_IMAGE /usr/src/app/node_modules ./node_modules
COPY --from=BUILD_IMAGE /usr/bin/dumb-init /usr/bin/dumb-init

EXPOSE 8080
CMD [ "dumb-init", "node", "./dist/main.js" ]

