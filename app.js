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
import clubMethoding from './app/api/clubMethods';
import clubRouting from "./app/api/club";
import sessionRouting from "./app/api/session";
import bodyParser from "body-parser"
const parseUrlEncoded = bodyParser.urlencoded({ extended: true });
const port = process.env.PORT || 3000;
const app = express();
const compiler = webpack(config);
const csrfProtection = csrf({ cookie: true })
const clubMethods = new clubMethoding(app);
const sessionRoutes = sessionRouting(clubMethods);
const clubRoutes = clubRouting(clubMethods);
const Transform = require('stream').Transform;
const parser = new Transform();

app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost/roundrobindb');
app.use(cookieParser());
app.use(csrf({ cookie: true, ignoreMethods: ['GET'] }));
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

app.use(express.static(path.join(__dirname + "/public"), { maxAge: 86400000 }));
app.use(webpackMiddleware(compiler));
app.use('/api', routes);
app.use('/api/club', clubRoutes);
app.use('/session', sessionRoutes);
// app.use('/*', (req, res, next) => {
//   var origUrl = req.originalUrl;
//   var redirectURL = origUrl.match(/^(\/login|\/signup|\/club)/);
//   // if (!redirectURL){
//   //   console.log(origUrl);
//   //   console.log("path don't match", redirectURL);
//   //   next();
//   //   return;
//   // }
//   var currentClub;
//   clubMethods.currentClub(req)
//     .then((club) => {
//       currentClub = club;
//     }).catch((err) => {
//       currentClub = null;
//     }).then(() => {
//       if (!currentClub && redirectURL[0].match(/^(\/club)/)){
//         console.log("redirecing to login");
//         res.redirect("/login");
//         res.end();
//       } else if (currentClub && redirectURL[0].match(/^\/(login|signup)/)) {
//         console.log("redirecting to clubs");
//         res.redirect("/club");
//         res.end()
//       } else {
//         console.log("route check..sending to next")
//         next();
//       }
//     })
  
// });
app.post("/test", parseUrlEncoded, (req, res) => {
  console.log(res.body);
})
app.get('/form', (req, res) => {
  res.status(200).send({ csrfToken: req.csrfToken() })
  res.end();
})
app.get('/login', csrfProtection, (req, res) => {
  res.render("pages/login", { csrfToken: req.csrfToken() });
})
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});  

app.listen(port, () => {
  console.log('listening on port 3000...');
});



