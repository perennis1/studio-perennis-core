// src/controllers/userController.js
import prisma from "../lib/prisma.js";

export const getAllUsersAdmin = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        isAdmin: true,                 // ADD
        _count: {                      // ADD
          select: { posts: true, comments: true },
        },
      },
    });

    const shaped = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      avatar: u.avatar,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      isAdmin: u.isAdmin,
      postsCount: u._count.posts,
      commentsCount: u._count.comments,
    }));

    res.json(shaped);
  } catch (err) {
    next(err);
  }
};
