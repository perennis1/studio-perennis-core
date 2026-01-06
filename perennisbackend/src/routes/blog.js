// src/routes/blog.js
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getPublishedPosts,
  getPostBySlug,
  getAllCommentsAdmin,
  getAllPostsAdmin,
  getDeletedPosts,
  getPostAdminById,
  createPost,
  updatePost,
  deletePost,
  softDeletePost,
  restorePost,
  hardDeletePost,
  getTrashPosts,
  addCommentForPost,
  getCommentsForPost,
   updateCommentForPost,
  deleteCommentForPost,
  toggleLikeForPost,
  toggleBookmarkForPost,
  toggleLikeOnComment,
  pinComment,
  unpinComment,
  toggleEmojiReactionForPost,

} from "../controllers/blogController.js";

const router = express.Router();

// ----- PUBLIC LIST -----
router.get("/", getPublishedPosts);

// ----- ADMIN LISTS / CRUD -----
router.get("/admin", getAllPostsAdmin);
router.get("/admin/trash", getTrashPosts); // uses soft-deleted posts
router.get("/admin/comments", getAllCommentsAdmin);

router.get("/admin/:id", getPostAdminById);
router.get("/:slug", getPostBySlug);
router.post("/", createPost);
router.put("/:id", updatePost);

// legacy hard delete if needed anywhere
router.delete("/:id", deletePost);

// soft delete / restore / hard delete from trash
router.delete("/admin/:id/soft", softDeletePost);
router.post("/admin/:id/restore", restorePost);
router.delete("/admin/:id/hard", hardDeletePost);

// ----- INTERACTIONS -----
// likes / saves / emoji reactions
router.post("/:id/like", verifyToken, toggleLikeForPost);
router.post("/:id/save", verifyToken, toggleBookmarkForPost);
router.post("/:id/react", verifyToken, toggleEmojiReactionForPost);

// ----- COMMENTS -----
// COMMENTS
router.get("/:id/comments", getCommentsForPost);
router.post("/:id/comments", verifyToken, addCommentForPost);
router.put("/:id/comments/:commentId", verifyToken, updateCommentForPost);
router.delete("/:id/comments/:commentId", verifyToken, deleteCommentForPost);
router.post("/:id/comments/:commentId/like", verifyToken, toggleLikeOnComment);
router.post("/:id/comments/:commentId/pin", verifyToken, pinComment);
router.delete("/:id/comments/:commentId/pin", verifyToken, unpinComment);

// ----- SINGLE POST BY SLUG (keep last so it doesn't swallow /admin etc.) -----







export default router;
