// add a token that is associated with device id
//
// table
// id user_id device_id token
//

// prefixed with "/m"
import express from "express";
import Clubs from '../controllers/club';
import Users from '../controllers/user';
import { jsonParser } from "../helpers/appModules";

const router = express.Router();

router
  .post("/user", Users.create)
  .patch("/user/:userId", Users.update);

router.route("/session")
  .get((req, res, next) => {

  })
  .delete((req, res, next) => {

  });

router
  .get("/clubs", Clubs.mobileAll)
  .get("/clubs/:clubId", Clubs.mobileDetail);

export default router;
