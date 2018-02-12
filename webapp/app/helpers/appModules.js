require('dotenv').config();
import csrf from "csurf";
import express from "express";
import bodyParser from "body-parser";
import redis from "redis";

const client = redis.createClient(`redis://${process.env.REDIS_HOST}:6379`);

export { client };
export const jsonParser = bodyParser.json();
export const app = express();
export const csrfProtection = process.env.NODE_ENV === "test" ?
  (req, res, next) => { return next() } : csrf({ cookie: true });
