import express from "express";
import { jsonParser, csrfProtection } from "../helpers/appModules";
import Session from '../controllers/session';

const router = express.Router();

router
  .post("/", jsonParser, csrfProtection, Session.create)
  .delete("/", Session.delete);

export default router;
