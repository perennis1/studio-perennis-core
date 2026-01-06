// src/controllers/blogController.js
import prisma from "../lib/prisma.js";
import { verifyTokenStandalone } from "../middleware/authMiddleware.js";


// ---------- shared helper for current user ----------

// shared helper
async function getCurrentUserId(req) {
  // use authenticated user if middleware set it
  if (req.user?.id) return Number(req.user.id);
  return null;
}


  
// ========== PUBLIC ==========

// GET /api/blogs → list published posts (with optional search ?q=)
export const getPublishedPosts = async (req, res, next) => {
  try {
    const { q } = req.query;

    const where = {
      status: "PUBLISHED",
      deleted: false,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { excerpt: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    let userId = null;
    try {
      userId = await getCurrentUserId(req);
    } catch {
      userId = null;
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      include: {
        likes:
          userId != null
            ? {
                where: { userId },
                select: { id: true },
              }
            : false,
        bookmarks:
          userId != null
            ? {
                where: { userId },
                select: { id: true },
              }
            : false,
      },
    });

    const result = posts.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      coverImageUrl: p.coverImageUrl,
      publishedAt: p.publishedAt,
      createdAt: p.createdAt,
      category: p.category,
      type: p.type,
      views: p.views,
      _count: {
        likes: p.likesCount,
        bookmarks: p.bookmarksCount,
        comments: p.commentsCount,
      },
      likedByMe:
        userId != null && Array.isArray(p.likes) && p.likes.length > 0,
      savedByMe:
        userId != null && Array.isArray(p.bookmarks) && p.bookmarks.length > 0,
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/blogs/:slug → single published post + bump views
// GET /api/blogs/:slug → single published post + bump views
// GET /api/blogs/:slug → single published post + bump views
export const getPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    let userId = null;
    try {
      userId = await getCurrentUserId(req);
    } catch {
      userId = null;
    }

    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, tagline: true },
        },
        likes:
          userId != null
            ? {
                where: { userId },
                select: { id: true },
              }
            : false,
        bookmarks:
          userId != null
            ? {
                where: { userId },
                select: { id: true },
              }
            : false,
      },
    });

    if (!post || post.status !== "PUBLISHED" || post.deleted) {
      return res.status(404).json({ message: "Post not found" });
    }

    const likedByMe =
      userId != null && Array.isArray(post.likes) && post.likes.length > 0;
    const savedByMe =
      userId != null &&
      Array.isArray(post.bookmarks) &&
      post.bookmarks.length > 0;

    res.json({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      coverImageUrl: post.coverImageUrl,
      status: post.status,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      category: post.category,
      type: post.type,
      views: post.views,
      author: post.author,
      _count: {
        likes: post.likesCount,
        bookmarks: post.bookmarksCount,
        comments: post.commentsCount,
      },
      likedByMe,
      savedByMe,
    });
  } catch (err) {
    console.error("GET /blogs/:slug error", err);
    res.status(500).json({ message: "Internal error" });
  }
};


// ========== ADMIN LISTING + DETAIL ==========

// GET /api/blogs/admin → all non-deleted posts
export const getAllPostsAdmin = async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      where: { deleted: false },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        createdAt: true,
        category: true,
        type: true,
        deleted: true,
        deletedAt: true,
        views: true,
        _count: {
          select: {
            likes: true,
            bookmarks: true,
            comments: true,
          },
        },
      },
    });

    res.json(posts);
  } catch (err) {
    next(err);
  }
};

// GET /api/blogs/admin/trash → list soft-deleted posts
export const getDeletedPosts = async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      where: { deleted: true },
      orderBy: { deletedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        createdAt: true,
        deletedAt: true,
        category: true,
        type: true,
        views: true,
      },
    });

    res.json(posts);
  } catch (err) {
    next(err);
  }
};


// GET /api/blogs/admin/:id → get single post by id (even if draft)
export const getPostAdminById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const postId = Number(id);

    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.deleted) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    next(err);
  }
};


// GET /api/admin/comments
// GET /api/admin/comments
export const getAllCommentsAdmin = async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        post: {
          isNot: null, // only comments attached to blog posts
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        post: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    const result = comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      user: c.user,
      post: c.post,
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
};




// ========== ADMIN CREATE / UPDATE ==========

// POST /api/blogs → create post
export const createPost = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      content,
      excerpt,
      coverImageUrl,
      status = "DRAFT",
      publishedAt,
      category,
      type,
    } = req.body;

    let authorId = req.user?.id;

    if (!authorId) {
      const firstUser = await prisma.user.findFirst();
      if (!firstUser) {
        return res
          .status(400)
          .json({ message: "No users found. Create a user first." });
      }
      authorId = firstUser.id;
    }

    const isPublished = status === "PUBLISHED";

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImageUrl,
        status: isPublished ? "PUBLISHED" : "DRAFT",
        publishedAt: isPublished
          ? publishedAt
            ? new Date(publishedAt)
            : new Date()
          : null,
        authorId,
        category,
        type,
      },
    });

    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

// PUT /api/blogs/:id → update post
export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      content,
      excerpt,
      coverImageUrl,
      status,
      publishedAt,
      category,
      type,
    } = req.body;

    const isPublished = status === "PUBLISHED";

    const post = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImageUrl,
        status: isPublished ? "PUBLISHED" : "DRAFT",
        publishedAt: isPublished
          ? publishedAt
            ? new Date(publishedAt)
            : new Date()
          : null,
        category,
        type,
      },
    });

    res.json(post);
  } catch (err) {
    next(err);
  }
};

// ========== COMMENTS ==========

// GET /api/blogs/:id/comments
export const getCommentsForPost = async (req, res) => {
  try {
    const postId = Number(req.params.id);
    if (!Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({ message: "Invalid post id" });
    }

    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const user = verifyTokenStandalone(token);
        userId = user.id;
      } catch {
        userId = null;
      }
    }

    const comments = await prisma.comment.findMany({
      where: {
        targetId: postId,
        parentId: null, // top-level comments only
      },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        reactions:
          userId != null
            ? {
                where: { userId, type: "like" },
                select: { id: true },
              }
            : false,
      },
    });

    const result = comments.map((c) => ({
      id: c.id,
      userId: c.userId,
      parentId: c.parentId,
      postId,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      user: c.user,
      replies: c.replies,
      likedByMe:
        userId != null &&
        Array.isArray(c.reactions) &&
        c.reactions.length > 0,
    }));

    res.json(result);
  } catch (err) {
    console.error("GET /api/blogs/:id/comments error", err);
    res.status(500).json({ message: "Comments error" });
  }
};



// POST /api/blogs/:id/comments
// POST /api/blogs/:id/comments
export const addCommentForPost = async (req, res, next) => {
  try {
     console.log("ADD COMMENT auth:", req.headers.authorization);
    console.log("ADD COMMENT user:", req.user);

    const postId = Number(req.params.id);
    const { content, parentId, gifUrl } = req.body;

    if (!content && !gifUrl) {
      return res.status(400).json({ message: "Content or GIF is required" });
    }
let userId = await getCurrentUserId(req);
if (!userId) {
  return res.status(401).json({ message: "Login required" });
  
    }

    const comment = await prisma.comment.create({
  data: {
    targetType: "blog",     // ✅ NEW
    targetId: postId,       // ✅ NEW (instead of postId)
    userId,
    content: (content || "").trim(),
    parentId: parentId ? Number(parentId) : null,
    gifUrl: gifUrl || null,
  },
  include: {
    user: { select: { id: true, name: true, avatar: true } },
  },
});


    await prisma.post.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } },
    });

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};


// PUT /api/blogs/:id/comments/:commentId
// PUT /api/blogs/:id/comments/:commentId
export const updateCommentForPost = async (req, res, next) => {
  try {
    const commentId = Number(req.params.commentId);
    const { content, gifUrl } = req.body;

    if (!content && !gifUrl) {
      return res.status(400).json({ message: "Content or GIF is required" });
    }

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: (content || "").trim(),
        gifUrl: gifUrl || null, // <— INSIDE data
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    res.json(comment);
  } catch (err) {
    next(err);
  }
};


// DELETE /api/blogs/:id/comments/:commentId
export const deleteCommentForPost = async (req, res, next) => {
  try {
    const postId = Number(req.params.id);
    const commentId = Number(req.params.commentId);

    await prisma.commentReaction.deleteMany({
      where: { commentId },
    });

    await prisma.comment.deleteMany({
      where: { parentId: commentId },
    });

    await prisma.comment.delete({
      where: { id: commentId },
    });

    await prisma.post.update({
      where: { id: postId },
      data: { commentsCount: { decrement: 1 } },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// POST /api/blogs/:id/comments/:commentId/like
export const toggleLikeOnComment = async (req, res, next) => {
  try {
    const commentId = Number(req.params.commentId);

    const userId = await getCurrentUserId(req);
    if (!userId) {
      return res.status(400).json({ message: "No users found" });
    }

    const existing = await prisma.commentReaction.findUnique({
      where: {
        userId_commentId_type: {
          userId,
          commentId,
          type: "like",
        },
      },
    });

    let delta = 0;
    let liked = false;

    if (existing) {
      await prisma.commentReaction.delete({ where: { id: existing.id } });
      delta = -1;
      liked = false;
    } else {
      await prisma.commentReaction.create({
        data: { userId, commentId, type: "like" },
      });
      delta = 1;
      liked = true;
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { likeCount: { increment: delta } },
      select: { id: true, likeCount: true },
    });

    res.json({ id: updated.id, likeCount: updated.likeCount, liked });
  } catch (err) {
    next(err);
  }
};

// POST /api/blogs/:id/comments/:commentId/pin
export const pinComment = async (req, res, next) => {
  try {
    const commentId = Number(req.params.commentId);

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { pinned: true },
      select: { id: true, pinned: true },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/blogs/:id/comments/:commentId/pin
export const unpinComment = async (req, res, next) => {
  try {
    const commentId = Number(req.params.commentId);

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { pinned: false },
      select: { id: true, pinned: true },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// ========== LIKES / BOOKMARKS ==========

// POST /api/blogs/:id/like
export const toggleLikeForPost = async (req, res, next) => {
  try {
    const postId = Number(req.params.id);

    const userId = await getCurrentUserId(req);
    if (!userId) {
      return res
        .status(400)
        .json({ message: "No users found. Create a user first." });
    }

    const existing = await prisma.like.findFirst({
      where: { userId, postId },
    });

    let liked;
    let post;

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      post = await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } },
        select: { likesCount: true },
      });
      liked = false;
    } else {
      await prisma.like.create({
        data: { userId, postId },
      });
      post = await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
        select: { likesCount: true },
      });
      liked = true;
    }

    res.json({
      liked,
      likesCount: post.likesCount,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/blogs/:id/save
export const toggleBookmarkForPost = async (req, res, next) => {
  try {
    const postId = Number(req.params.id);

    const userId = await getCurrentUserId(req);
    if (!userId) {
      return res
        .status(400)
        .json({ message: "No users found. Create a user first." });
    }

    const existing = await prisma.bookmark.findFirst({
      where: { userId, postId },
    });

    let saved;
    let post;

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      post = await prisma.post.update({
        where: { id: postId },
        data: { bookmarksCount: { decrement: 1 } },
        select: { bookmarksCount: true },
      });
      saved = false;
    } else {
      await prisma.bookmark.create({
        data: { userId, postId },
      });
      post = await prisma.post.update({
        where: { id: postId },
        data: { bookmarksCount: { increment: 1 } },
        select: { bookmarksCount: true },
      });
      saved = true;
    }

    res.json({
      saved,
      bookmarksCount: post.bookmarksCount,
    });
  } catch (err) {
    next(err);
  }
};

// ========== DELETE VARIANTS ==========

// HARD DELETE (legacy)
export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.post.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// SOFT DELETE /api/blogs/admin/:id/soft
export const softDeletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        deleted: true,
        deletedAt: new Date(),
      },
    });

    res.json({ message: "Post soft-deleted", post });
  } catch (err) {
    next(err);
  }
};

// RESTORE /api/blogs/admin/:id/restore
export const restorePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        deleted: false,
        deletedAt: null,
      },
    });

    res.json({ message: "Post restored", post });
  } catch (err) {
    next(err);
  }
};

// PERMANENT DELETE /api/blogs/admin/:id/hard
export const hardDeletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const postId = Number(id);

    // 1) delete likes and bookmarks for this post
    await prisma.like.deleteMany({ where: { postId } });
    await prisma.bookmark.deleteMany({ where: { postId } });

    // 2) delete comment reactions for comments on this post
    await prisma.commentReaction.deleteMany({
      where: {
        comment: {
          postId,
        },
      },
    });

    // 3) delete comments for this post
    await prisma.comment.deleteMany({ where: { postId } });

    // 4) finally delete the post itself
    await prisma.post.delete({
      where: { id: postId },
    });

    res.json({ message: "Post permanently deleted" });
  } catch (err) {
    next(err);
  }
};


// TRASH LIST /api/blogs/admin/trash
export const getTrashPosts = async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      where: { deleted: true },
      orderBy: { deletedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        createdAt: true,
        deletedAt: true,
        category: true,
        type: true,
        views: true,
      },
    });

    res.json(posts);
  } catch (err) {
    next(err);
  }}

  // POST /api/blogs/:id/react
// POST /api/blogs/:id/react
export const toggleEmojiReactionForPost = async (req, res, next) => {
  try {
    const postId = Number(req.params.id);
    const { emoji } = req.body;
    if (!emoji) {
      return res.status(400).json({ message: "Emoji is required" });
    }

    const userId = await getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Login required" });
    }

    const existing = await prisma.postReaction.findUnique({
      where: {
        userId_postId_emoji: { userId, postId, emoji },
      },
    });

    if (existing) {
      await prisma.postReaction.delete({ where: { id: existing.id } });
    } else {
      await prisma.postReaction.create({
        data: { userId, postId, emoji },
      });
    }

    const reactions = await prisma.postReaction.groupBy({
      by: ["emoji"],
      where: { postId },
      _count: { emoji: true },
    });

    const reactionSummary = reactions.reduce((acc, r) => {
      acc[r.emoji] = r._count.emoji;
      return acc;
    }, /** @type {Record<string, number>} */ ({}));

    res.json({ reactionSummary });
  } catch (err) {
    next(err);
  }
};
