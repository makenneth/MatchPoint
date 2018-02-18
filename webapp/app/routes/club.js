import express from "express";
import { jsonParser, csrfProtection } from "../helpers/appModules";
import Roundrobins from '../controllers/roundrobin';
import Clubs from '../controllers/club';

const router = express.Router();

router
  .get("/all", Clubs.all)
  .get("/:clubId/sessions/:id", Roundrobins.get);

export default router;
