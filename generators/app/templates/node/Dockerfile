# ARGs in multi-stage build, see https://stackoverflow.com/a/53682110
ARG COMMIT

# Install the app dependencies in a full Node docker image
FROM node:12
ARG COMMIT
WORKDIR "/app"
# Copy package.json and package-lock.json
COPY package*.json ./
# Install app dependencies
RUN npm install --production


# Copy the dependencies into a Slim Node docker image
FROM node:12-slim 
ARG COMMIT 
WORKDIR "/app"
# Install app dependencies
COPY --from=0 /app/node_modules /app/node_modules
COPY . /app
ENV PORT 3000
ENV COMMIT_SHA ${COMMIT}
RUN echo "COMMIT_SHA = $COMMIT_SHA"
EXPOSE 3000
CMD npm start
