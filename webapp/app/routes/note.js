import express from "express";
import { jsonParser, csrfProtection } from "../helpers/appModules";
import Notes from '../controllers/note';

const router = express.Router();

router.post("/", jsonParser, csrfProtection, Notes.update);

export default router;
