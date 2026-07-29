import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { postSchema } from "@/lib/validations";
import { errorResponse, validateBodySize } from "@/lib/api-response";

interface Params {
  params: {
    slug: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { slug } = params;
    const currentUser = getCurrentUser(req);

    const post = await db.post.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        status: true,
        created_at: true,
        updated_at: true,
        author_id: true,
        author: {
          select: {
            id: true,
            display_name: true,
          },
        },
      },
    });

    if (!post) {
      return errorResponse("NOT_FOUND", "Post not found", 404);
    }

    // Authorization rule for drafts: only post author can view drafts
    if (post.status === "draft") {
      if (!currentUser || currentUser.id !== post.author_id) {
        // Return 404 to avoid leaking draft resource existence
        return errorResponse("NOT_FOUND", "Post not found", 404);
      }
    }

    return NextResponse.json({ data: post }, { status: 200 });
  } catch (error) {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to fetch post", 500);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return errorResponse("UNAUTHENTICATED", "Authentication required", 401);
    }

    const { slug } = params;

    const existingPost = await db.post.findUnique({
      where: { slug },
    });

    if (!existingPost) {
      return errorResponse("NOT_FOUND", "Post not found", 404);
    }

    // Owner authorization check
    if (existingPost.author_id !== currentUser.id) {
      return errorResponse("FORBIDDEN", "Only the author may update this post", 403);
    }

    if (!validateBodySize(req)) {
      return errorResponse("PAYLOAD_TOO_LARGE", "Request body exceeds maximum allowed size", 413);
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return errorResponse("MALFORMED_JSON", "Invalid or malformed JSON payload", 400);
    }

    const validation = postSchema.safeParse(body);
    if (!validation.success) {
      const issue = validation.error.issues[0];
      return errorResponse("VALIDATION_ERROR", issue?.message || "Invalid post data", 400);
    }

    const { title, content, status } = validation.data;
    const newSlug = validation.data.slug || existingPost.slug;

    // If changing slug, verify uniqueness
    if (newSlug !== existingPost.slug) {
      const slugConflict = await db.post.findUnique({
        where: { slug: newSlug },
      });
      if (slugConflict) {
        return errorResponse("DUPLICATE_SLUG", "A post with the new slug already exists", 400);
      }
    }

    const updatedPost = await db.post.update({
      where: { id: existingPost.id },
      data: {
        title,
        slug: newSlug,
        content,
        status,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        status: true,
        created_at: true,
        updated_at: true,
        author_id: true,
        author: {
          select: {
            id: true,
            display_name: true,
          },
        },
      },
    });

    return NextResponse.json({ data: updatedPost }, { status: 200 });
  } catch (error) {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to update post", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return errorResponse("UNAUTHENTICATED", "Authentication required", 401);
    }

    const { slug } = params;

    const existingPost = await db.post.findUnique({
      where: { slug },
    });

    if (!existingPost) {
      return errorResponse("NOT_FOUND", "Post not found", 404);
    }

    // Owner authorization check
    if (existingPost.author_id !== currentUser.id) {
      return errorResponse("FORBIDDEN", "Only the author may delete this post", 403);
    }

    await db.post.delete({
      where: { id: existingPost.id },
    });

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to delete post", 500);
  }
}
