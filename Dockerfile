FROM node:12-alpine as build-stage
ARG COMMIT

WORKDIR /generator
# Copy package.json and package-lock.json
COPY . .
# install generator
RUN npm install --production

FROM node:12-alpine as environment-stage
# copy the installed generator to this stage
COPY --from=build-stage /generator /generator
# Setup environment: install yo bash and make
# /app is the place where the work space would be mounted to. create it for debugging with non-mount
# change the owner of folder /generator and /app to user "node"
# user "node" is the owner of the mounted volumn and the user would switch to it for next step for full access of the mounted work space.
RUN yarn global add yo && apk update && apk upgrade && apk add bash && apk add make && mkdir -p /app && chown -R node /app /generator
USER node
WORKDIR /generator
ENV YELLOW \\033[1;33m
ENV NO_COLOR \\033[0m
RUN yarn link && echo "alias generate='yo dsx-misvc' && echo -e '${YELLOW}type \"generate <micro-service name>\" to new a microservice${NO_COLOR}'"  >> ~/.bashrc
ENV COMMIT_SHA ${COMMIT}
WORKDIR /app
CMD [ "bash" ]
