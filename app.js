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

const port = process.env.PORT || 3000;
const app = express();
const compiler = webpack(config);
const csrfProtection = csrf({ cookie: true })
const clubMethods = new clubMethoding(app);
const sessionRoutes = sessionRouting(clubMethods);
const clubRoutes = clubRouting(clubMethods);


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

app.use(express.static(path.join(__dirname + "/public"), { maxAge: 86400000 }));
app.use(webpackMiddleware(compiler));
app.use('/api', routes);
app.use('/api/club', clubRoutes);
app.use('/session', sessionRoutes);
app.use('/*', (req, res, next) => {
  var origUrl = req.originalUrl;
  console.log(origUrl);
  var redirectURL = origUrl.match(/^(\/login|\/signup|\/club|\/players)/);
  if (!redirectURL){
    console.log("path don't match");
    next();
    return;
  }
  var currentClub;
  clubMethods.currentClub(req)
    .then((club) => {
      currentClub = club;
    }).catch((err) => {
      currentClub = null;
    })

  if (!currentClub && redirectURL[0].match(/^(\/club|\/players)/)){
    console.log("redirecing to login");
    res.redirect("/login");
    res.end();
  } else if (currentClub && redirectURL[0].match(/^\/(login|signup)/)) {
    console.log("redirecting to clubs");
    res.redirect("/club");
    res.end()
  } else {
    console.log("route check..sending to next")
    next();
  }
  
});

app.get('/form', (req, res) => {
  console.log("sent csrf");
  res.status(200).send({ csrfToken: req.csrfToken() })
  res.end();
})

app.get('*', (req, res) => {
  console.log("rendering back public");
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  //TODO fix this....this is causing a weird response in get request
});  

app.listen(port, () => {
  console.log('listening on port 3000...');
});



