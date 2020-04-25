const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const health = require('@cloudnative/health-connect');
const prometheus = require('appmetrics-prometheus');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// First load local env files
fs.readdirSync(__dirname)
  .filter(f => f.endsWith('.env'))
  .forEach(f => dotenv.config({ path: path.join(__dirname, f) }));

// Then load secret files injected by vault
const { VAULT_SECRETS_FOLDER, IS_USING_VAULT } = process.env;
if (IS_USING_VAULT && !VAULT_SECRETS_FOLDER)
  console.error('Vault secrets folder cannot be found in the env!');
else if (VAULT_SECRETS_FOLDER) {
  fs.readdirSync(VAULT_SECRETS_FOLDER)
    .filter(f => f.endsWith('.env'))
    .forEach(f => dotenv.config({ path: path.join(VAULT_SECRETS_FOLDER, f) }));
}

const router = require('./routes');

const healthcheck = new health.HealthChecker();

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Set cors header
app.all('*', (request, resp, next) => {
  resp.setHeader('Access-Control-Allow-Origin', '*');
  resp.setHeader('Access-Control-Allow-Credentials', false);
  resp.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Content-Length, Authorization, ' +
      'Accept, X-Requested-With , yourHeaderField',
  );
  resp.setHeader(
    'Access-Control-Allow-Methods',
    'PUT, POST, GET, DELETE, OPTIONS',
  );

  if (request.method === 'OPTIONS') resp.status(204);
  next();
});

app.use(router);

// Heath check
const liveCheck = new health.LivenessCheck();
healthcheck.registerLivenessCheck(liveCheck);

const readyCheck = new health.ReadinessCheck();
healthcheck.registerReadinessCheck(readyCheck);

app.use('/live', health.LivenessEndpoint(healthcheck));
app.use('/ready', health.ReadinessEndpoint(healthcheck));
app.use('/health', health.HealthEndpoint(healthcheck));
app.use('/metrics', prometheus.endpoint());

// Catch 404 and forward to error handler
app.use((request, resp, next) => {
  next(createError(404));
});

// Error handler
app.use((error, request, resp) => {
  // Render the error page
  resp.status(error.status || 500).send(error.message);
});

module.exports = app;
