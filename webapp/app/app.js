require('dotenv').config();
import path from "path";
import cookieParser from "cookie-parser";
import express from "express";
import db from './utils/connection';
import Token from './helpers/token';
import { app, csrfProtection, jsonParser, client } from "./helpers/appModules";
import ClubHelper from "./helpers/clubHelper";
import ClubModel from "./models/club";
import User from "./models/user";
import * as Routes from './routes';

const port = process.env.APP_PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "public", "views"));
app.use((err, req, res, next) => {
  try {
    next();
  } catch (e) {
    client.set(`issue:${Date.now()}`, JSON.stringify(e));
    // Raven.captureException(JSON.stringify(e));
    res.status(500).send({ error_description: "Internal Server Error", error: e });
  }
})
app.use(cookieParser());
app.use((err, req, res, next) => {
  if (err.code !== "EBADCSRFTOKEN") {
    next(err);
  } else {
    res.status(403).send("Forbidden Access");
  }
});

app.use("/favicon.ico", (req, res) => {
  res.end();
});

app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/api/clubs", Routes.club);
app.use("*", (req, res, next) => {
  if (!req.cookies._d) {
    res.cookie('_d', Token.generateToken(16), { maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true });
  }
  next();
});
app.use("/api/users", Routes.user);
app.use("/api/upload", Routes.upload);
app.use("/api/my", (req, res, next) => {
  console.log(req.cookies);
  User.findBySessionToken(req.cookies._s, req.cookies._d, false)
    .then(
      (user) => {
        console.log('found user', user);
        req.user = user;
        return next();
      },
      (err) => {
        res.status(403).send(err);
      }
    ).catch((err) => {
      console.warn(err);
      res.status(500).send(err);
    });
});
app.use("/api/my", Routes.currentUser);
app.use("/api/my", Routes.player);
app.use("/m/api", (req, res, next) => {
  if (req.query.api_key === 'vWYg8aJHhX4aqZmtpjIxF9RYBMV79y1k') {
    return next();
  }
  res.status(403).send({ error_description: "Invalid API Key" });
});
app.use("/m/api/my", (req, res, next) => {
  User.findBySessionToken(req.cookies._s, req.cookies._d)
    .then(
      (user) => {
        req.user = user;
        return next();
      },
      (err) => {
        res.status(403).send(err);
      }
    ).catch((err) => {
      res.status(500).send(err);
    });
});
app.use("/m/api", Routes.mobile);
app.use("/api/*", (req, res) => {
  res.status(404).send("Invalid route");
  res.end();
});
app.use("/session", Routes.session);
app.use("/accounts", Routes.account);
app.get("*", csrfProtection, (req, res) => {
  res.render("index", { csrfToken: req.csrfToken() });
});

// app.use((err, req, res, next) => {
//   if (err.code && err.code === 500) {
//     Raven.captureException(JSON.stringify(err));
//     return next({ code: 500 });
//   }
//   next(err);
// });

app.use((err, req, res, next) => {
  let errorMessage = err.message;
  // console.log(errorMessage);
  if (!errorMessage) {
    switch (err.code) {
      case 500:
        errorMessage = 'Internal Server Error';
        break;

      case 400:
        errorMessage = 'Bad Request';
        break;

      case 404:
        errorMessage = 'Not found';
        break;

      case 422:
        errorMessage = 'Unprocessable entity';
        break;
    }
  }
  res.status(err.code || 500).send({ error_description: errorMessage });
});

app.listen(port, process.env.APP_HOST || '127.0.0.1', () => {
  console.log("listening on port", port);
});
