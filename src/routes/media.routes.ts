import { Router } from "express";
import { handleMedia } from "../controllers/media.controller";
const router = Router();

export const sessions = router.get("/:sessionId", handleMedia);
