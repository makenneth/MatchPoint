import express from "express";
import { jsonParser, csrfProtection } from "../helpers/appModules";
import Roundrobins from '../controllers/roundrobin';
import Clubs from '../controllers/club';

const router = express.Router();

router
  .get("/", Clubs.get)
  .post("/", csrfProtection, jsonParser, Clubs.create)
  .get("/all", Clubs.all)
  .get("/:clubId/sessions/:id", Roundrobins.get);

export default router;
