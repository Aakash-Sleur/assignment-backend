import express from "express";
import * as user from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.post("/:id/follow", verifyToken, user.followUser);
router.get("/:id", user.getUserById);
router.put("/profile", verifyToken, user.updateUser);

export default router;
