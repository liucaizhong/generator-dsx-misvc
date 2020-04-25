// Put all request handler here
const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (request, resp) => {
  resp.send('Hello World!');
});

/* GET example page. */
router.get('/example', (request, resp) => {
  resp.send("It's a good example!");
});

module.exports = router;
