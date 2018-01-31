import express from "express";
import { csrfProtection, jsonParser } from "../helpers/appModules";
import Accounts from '../controllers/account';

const router = express.Router();

router
  .get("/activate", Accounts.activate)
  .post("/reset/request", csrfProtection, Accounts.resetRequest)
  .post("/reset", jsonParser, csrfProtection, Accounts.reset);

export default router;
