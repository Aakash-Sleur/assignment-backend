import express from "express";
import * as chat from "../controllers/chat.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.post("/:id", verifyToken, chat.createChat);
router.get("/", verifyToken, chat.getChats);
router.get("/:id", verifyToken, chat.getChatById);
router.post("/:id/message", verifyToken, chat.sendMessage);

export default router;
