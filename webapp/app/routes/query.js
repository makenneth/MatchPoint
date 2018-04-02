import express from "express";
import { csrfProtection, jsonParser } from "../helpers/appModules";
import Query from "../controllers/query";

const router = express.Router();
router.get('/:clubId/range', Query.aggregatePlayerRecordWithinRange)

export default router;
