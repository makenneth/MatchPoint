import express from 'express';
import path from 'path';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import csrf from 'csurf';
import mongoose from 'mongoose';
import sassMiddleware from 'node-sass-middleware';
import cookieParser from 'cookie-parser';

import config from './webpack.config.js';
import routes from './app/api/players';
import userMethoding from './app/api/userMethods';
import userRouting from "./app/api/userRoutes";
import sessionRouting from "./app/api/session";

const app = express();
const compiler = webpack(config);
const csrfProtection = csrf({ cookie: true })
const userMethods = new userMethoding(app);
const sessionRoutes = sessionRouting(app, userMethods);
const userRoutes = userRouting(app, userMethods);

mongoose.connect('mongodb://localhost/roundrobindb');
app.use(cookieParser());
app.use(csrf({ cookie: true, ignoreMethods: ['GET', 'DELETE'] }));
// app.use(function (err, req, res, next) {
//   if (err.code !== 'EBADCSRFTOKEN') return next(err);

//   res.status(403).send("Invalid session token");
// })
app.use(
  sassMiddleware({
    src: __dirname + "/sass",
    dest: __dirname + "/public/styles",
    prefix: '/styles',
    debug: true
  })
);
app.use(express.static(__dirname + "/public"));
app.use(webpackMiddleware(compiler));
app.use('/api', routes);
app.use('/session', sessionRoutes);
app.use('/user', userRoutes);
app.use('/*', (req, res, next) => {
  let origUrl = req.originalUrl;
  let needToRedirect = !/^(\/|\/login|\/form|\/signup)$/.test(origUrl);
  if (/(\..*|^\/form)$/.test(origUrl)){
    next();
    return;
  }
  userMethods.currentUser(req);
  app.once('foundUser', (user) => {
    console.log(origUrl + ": " + user + " " + needToRedirect);
    if (!user && needToRedirect){
      res.redirect("/login");
      res.end();
    } else if (user && !needToRedirect) {
      res.redirect('/players');
      res.end();
    } else {
      next();
    }
  })
});

app.get('/form', (req, res) => {
  res.status(200).send({ csrfToken: req.csrfToken() })
  res.end();
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
  res.end();
});  

app.listen(3000, () => {
  console.log('listening on port 3000...');
});



