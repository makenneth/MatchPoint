import express from "express";
import { jsonParser, csrfProtection } from "../helpers/appModules";

import Clubs from '../controllers/club';
import Accounts from '../controllers/account';
import RoundRobins from '../controllers/roundrobin';
import GoogleApi from '../controllers/googleApi';

const router = express.Router();
router
  .post("/accounts/resend", Accounts.resend)
  .get("/sessions", RoundRobins.all)
  .post("/sessions", jsonParser, csrfProtection, RoundRobins.create)
  .get("/sessions/:id", RoundRobins.authorizedGet)
  .delete("/sessions/:id", RoundRobins.delete)
  .post("/sessions/:id", jsonParser, csrfProtection, RoundRobins.postResult)
  .patch("/sessions/:id/detail", jsonParser, csrfProtection, RoundRobins.update)
  .get("/sessions/latest-date", RoundRobins.getLatestDate)
  .get("/sessions/edit-status/:id", RoundRobins.getEditStatus)
  .patch("", jsonParser, Clubs.update)
  .patch("/schedule", jsonParser, Clubs.updateSchedule)
  .get('/geolocation/autocomplete', GoogleApi.autocomplete);

export default router;
