"use server";

import { prisma } from "@/lib/prisma";

// ============================================
// USER ACTIONS
// ============================================

/**
 * Fetches all users with their posts and comment counts
 */
export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        posts: true,
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw new Error("Failed to fetch users from database");
  }
}

/**
 * Fetches a single user by ID with all relations
 */
export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: {
          include: {
            _count: {
              select: {
                comments: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        comments: {
          include: {
            post: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user from database");
  }
}

/**
 * Creates a new user
 */
export async function createUser(data: {
  email: string;
  name?: string | null;
}) {
  try {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
      },
    });
    return user;
  } catch (error) {
    console.error("Failed to create user:", error);
    throw new Error("Failed to create user in database");
  }
}

/**
 * Updates an existing user
 */
export async function updateUser(
  userId: string,
  data: {
    email?: string;
    name?: string | null;
  },
) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });
    return user;
  } catch (error) {
    console.error("Failed to update user:", error);
    throw new Error("Failed to update user in database");
  }
}

/**
 * Deletes a user and all associated posts and comments
 */
export async function deleteUser(userId: string) {
  try {
    // Using transaction to ensure data integrity
    await prisma.$transaction(async (tx) => {
      // Delete all comments by this user
      await tx.comment.deleteMany({
        where: { authorId: userId },
      });

      // Delete all comments on this user's posts
      await tx.comment.deleteMany({
        where: {
          post: {
            authorId: userId,
          },
        },
      });

      // Delete all posts by this user
      await tx.post.deleteMany({
        where: { authorId: userId },
      });

      // Delete the user
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw new Error("Failed to delete user from database");
  }
}

// ============================================
// POST ACTIONS
// ============================================

/**
 * Fetches all posts with author and comment information
 */
export async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return posts;
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    throw new Error("Failed to fetch posts from database");
  }
}

/**
 * Fetches published posts only
 */
export async function getPublishedPosts() {
  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return posts;
  } catch (error) {
    console.error("Failed to fetch published posts:", error);
    throw new Error("Failed to fetch published posts from database");
  }
}

/**
 * Fetches a single post by ID with all relations
 */
export async function getPostById(postId: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    if (!post) {
      throw new Error(`Post with ID ${postId} not found`);
    }

    return post;
  } catch (error) {
    console.error("Failed to fetch post:", error);
    throw new Error("Failed to fetch post from database");
  }
}

/**
 * Creates a new post
 */
export async function createPost(data: {
  title: string;
  content?: string | null;
  authorId: string;
  published?: boolean;
}) {
  try {
    const post = await prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        published: data.published ?? false,
        authorId: data.authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
    return post;
  } catch (error) {
    console.error("Failed to create post:", error);
    throw new Error("Failed to create post in database");
  }
}

/**
 * Updates an existing post
 */
export async function updatePost(
  postId: string,
  data: {
    title?: string;
    content?: string | null;
    published?: boolean;
  },
) {
  try {
    const post = await prisma.post.update({
      where: { id: postId },
      data,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
    return post;
  } catch (error) {
    console.error("Failed to update post:", error);
    throw new Error("Failed to update post in database");
  }
}

/**
 * Toggles the published status of a post
 */
export async function togglePostPublished(postId: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { published: true },
    });

    if (!post) {
      throw new Error(`Post with ID ${postId} not found`);
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        published: !post.published,
      },
    });

    return updatedPost;
  } catch (error) {
    console.error("Failed to toggle post published status:", error);
    throw new Error("Failed to toggle post published status");
  }
}

/**
 * Deletes a post and all associated comments
 */
export async function deletePost(postId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // Delete all comments on this post
      await tx.comment.deleteMany({
        where: { postId },
      });

      // Delete the post
      await tx.post.delete({
        where: { id: postId },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete post:", error);
    throw new Error("Failed to delete post from database");
  }
}

// ============================================
// COMMENT ACTIONS
// ============================================

/**
 * Fetches all comments with author and post information
 */
export async function getComments() {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return comments;
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    throw new Error("Failed to fetch comments from database");
  }
}

/**
 * Fetches comments for a specific post
 */
export async function getCommentsByPostId(postId: string) {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return comments;
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    throw new Error("Failed to fetch comments from database");
  }
}

/**
 * Fetches comments by a specific user
 */
export async function getCommentsByUserId(userId: string) {
  try {
    const comments = await prisma.comment.findMany({
      where: { authorId: userId },
      include: {
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return comments;
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    throw new Error("Failed to fetch comments from database");
  }
}

/**
 * Fetches a single comment by ID
 */
export async function getCommentById(commentId: string) {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!comment) {
      throw new Error(`Comment with ID ${commentId} not found`);
    }

    return comment;
  } catch (error) {
    console.error("Failed to fetch comment:", error);
    throw new Error("Failed to fetch comment from database");
  }
}

/**
 * Creates a new comment
 */
export async function createComment(data: {
  content: string;
  postId: string;
  authorId: string;
}) {
  try {
    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        postId: data.postId,
        authorId: data.authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
    return comment;
  } catch (error) {
    console.error("Failed to create comment:", error);
    throw new Error("Failed to create comment in database");
  }
}

/**
 * Updates an existing comment
 */
export async function updateComment(
  commentId: string,
  data: {
    content: string;
  },
) {
  try {
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: data.content,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
    return comment;
  } catch (error) {
    console.error("Failed to update comment:", error);
    throw new Error("Failed to update comment in database");
  }
}

/**
 * Deletes a comment
 */
export async function deleteComment(commentId: string) {
  try {
    await prisma.comment.delete({
      where: { id: commentId },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete comment:", error);
    throw new Error("Failed to delete comment from database");
  }
}
