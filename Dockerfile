FROM node:18-alpine AS BUILD_IMAGE

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

# install dependencies
RUN yarn --frozen-lockfile

COPY . .

# lint & test
#RUN yarn lint & yarn test
RUN yarn test

# build application
RUN yarn build

# remove development dependencies
RUN npm prune --production

FROM node:18-slim

WORKDIR /usr/src/app

# copy from build image
COPY --from=BUILD_IMAGE /usr/src/app/dist ./dist
COPY --from=BUILD_IMAGE /usr/src/app/node_modules ./node_modules

EXPOSE 6789

CMD [ "node", "./dist/main.js" ]
