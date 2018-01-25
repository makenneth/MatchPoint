const express = require('express');
const httpProxy = require('http-proxy');
const addDevMiddleware = require('./devmiddleware');
const webpackConfig = require('../webpack.config.js');

const proxy = httpProxy.createProxyServer({
  ws: false,
});

const port = process.env.PORT || 4000;
const app = express();

app.use('/api', (req, res) => {
  proxy.web(req, res, { target: 'http://localhost:3000' })
});

app.use("/favicon.ico", (req, res) => {
  res.end();
});

addDevMiddleware(app, webpackConfig);

app.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('listening on port', port)
  }
});
