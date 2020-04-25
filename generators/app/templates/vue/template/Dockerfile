# ARGs in multi-stage build, see https://stackoverflow.com/a/53682110
ARG COMMIT

FROM node:12 as build-stage
ARG COMMIT
WORKDIR /app
# Copy package.json and package-lock.json
COPY package*.json ./
ENV CI=1
# Install app dependencies
RUN npm install --production
COPY . .
RUN npm build

FROM nginx as production-stage
ARG COMMIT 
ENV NEW_PUBLIC_PATH='/'
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf
ENV COMMIT_SHA ${COMMIT}
CMD ["nginx", "-g", "daemon off;"]

