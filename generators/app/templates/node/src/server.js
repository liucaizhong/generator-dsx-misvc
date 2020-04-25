/**
 * Module dependencies.
 */
const http = require('http');
const debug = require('debug')('test:server');
const app = require('./app');

/**
 * Normalize a port into a number, string, or false.
 *
 * @param {string} value - port number
 * @returns {string|boolean} - normalized port number
 */
function normalizePort(value) {
  const portNumber = parseInt(value, 10);

  if (Number.isNaN(portNumber))
    // Named pipe
    return value;

  if (portNumber >= 0)
    // Port number
    return portNumber;

  return false;
}

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Event listener for HTTP server "error" event.
 *
 * @param {object} error - error info
 */
function onError(error) {
  if (error.syscall !== 'listen') throw error;

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      throw new Error(`${bind} requires elevated privileges`);
    case 'EADDRINUSE':
      throw new Error(`${bind} is already in use`);
    default:
      throw error;
  }
}

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
}

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
