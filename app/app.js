require('dotenv').config()
import Raven from "raven";
import path from "path";
import cookieParser from "cookie-parser";
import express from "express";
import db from './utils/connection';
import { app, csrfProtection, jsonParser } from "./helpers/appModules";
import ClubHelper  from "./helpers/clubHelper";
import ClubModel  from "./models/club";
import playerRoutes from "./api/players";
import clubRoutes from "./api/club";
import sessionRoutes from "./api/session";
import accountRoutes from "./api/account";
import uploadRoutes from "./api/upload";
import currentUserRoutes from "./api/currentUser";

const port = process.env.APP_PORT || 3000;
Raven.config(process.env.RAVEN_URL).install();
// db.connect();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "public", "views"));
app.use((err, req, res, next) => {
  try {
    next();
  } catch (e) {
    Raven.captureException(JSON.stringify(e));
    res.status(500).send({ error_description: "Internal Server Error" });
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
app.use("/api/clubs", clubRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/my", jsonParser, (req, res, next) => {
  ClubModel.findBySessionToken(req.cookies.matchpoint_session)
    .then(
      (club) => {
        req.club = club;
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
app.use("/api/my", currentUserRoutes);
app.use("/api/my", playerRoutes);
app.use("/api/*", (req, res) => {
  res.status(404).send("Invalid route");
  res.end();
});
app.use("/session", sessionRoutes);
app.use("/accounts", accountRoutes);
app.get("*", csrfProtection, (req, res) => {
  res.render("index", { csrfToken: req.csrfToken() });
});

app.use((err, req, res, next) => {
  if (err.code && err.code === 500) {
    Raven.captureException(JSON.stringify(err));
    return next({ code: 500 });
  }
  next(err);
});

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

app.listen(port, () => {
  console.log("listening on port", port);
});
