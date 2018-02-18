import express from "express";
import { jsonParser, csrfProtection } from "../helpers/appModules";

import Users from '../controllers/user';
import Accounts from '../controllers/account';

const router = express.Router();
router
  .get("/", Users.findBySessionToken)
  .post("/", jsonParser, csrfProtection, Users.create)

export default router;
