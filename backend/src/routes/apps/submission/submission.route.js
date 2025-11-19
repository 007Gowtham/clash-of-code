import { SubmissionController } from "../../../controllers/apps/submission/submission.controller.js";
import { Router } from "express";



const router = Router();

router.route("/").post(SubmissionController);

export default router;