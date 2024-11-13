import express from "express";
import * as posts from "../controllers/post.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.post("/", verifyToken, posts.createPost);
router.get("/", posts.getPosts);
router.get("/:id", posts.getPostById);
router.post("/:id/comment", verifyToken, posts.commentPost);
router.post("/:id/like", verifyToken, posts.likePost);
router.get("/:id/user", posts.getPostsByUserId);

export default router;
