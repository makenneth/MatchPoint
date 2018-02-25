import express from "express";
import { jsonParser, csrfProtection } from "../helpers/appModules";
import Notes from '../controllers';

const router = express.Router();

router.post("/", jsonParser, csrfProtection, Notes.create);

export default router;
