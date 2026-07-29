import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { commentSchema, paginationSchema } from "@/lib/validations";
import { paginatedResponse, errorResponse, validateBodySize } from "@/lib/api-response";

interface Params {
  params: {
    slug: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get("page") ?? "1";
    const limitParam = searchParams.get("limit") ?? "10";

    const paginationResult = paginationSchema.safeParse({
      page: pageParam,
      limit: limitParam,
    });

    if (!paginationResult.success) {
      return errorResponse("INVALID_PAGINATION", "Invalid page or limit parameter", 400);
    }

    const { page, limit } = paginationResult.data;
    const currentUser = getCurrentUser(req);

    const post = await db.post.findUnique({
      where: { slug },
      select: { id: true, status: true, author_id: true },
    });

    if (!post) {
      return errorResponse("NOT_FOUND", "Post not found", 404);
    }

    if (post.status === "draft") {
      if (!currentUser || currentUser.id !== post.author_id) {
        return errorResponse("NOT_FOUND", "Post not found", 404);
      }
    }

    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      db.comment.findMany({
        where: { post_id: post.id },
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          content: true,
          post_id: true,
          author_id: true,
          created_at: true,
          author: {
            select: {
              id: true,
              display_name: true,
            },
          },
        },
      }),
      db.comment.count({ where: { post_id: post.id } }),
    ]);

    return paginatedResponse(comments, page, limit, total);
  } catch (error) {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to fetch comments", 500);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return errorResponse("UNAUTHENTICATED", "Authentication required", 401);
    }

    const { slug } = params;

    const post = await db.post.findUnique({
      where: { slug },
      select: { id: true, status: true, author_id: true },
    });

    if (!post) {
      return errorResponse("NOT_FOUND", "Post not found", 404);
    }

    if (post.status === "draft" && currentUser.id !== post.author_id) {
      return errorResponse("NOT_FOUND", "Post not found", 404);
    }

    if (!validateBodySize(req)) {
      return errorResponse("PAYLOAD_TOO_LARGE", "Request body exceeds maximum allowed size", 413);
    }

    const contentType = req.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return errorResponse("INVALID_HEADER", "Content-Type must be application/json", 415);
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return errorResponse("MALFORMED_JSON", "Invalid or malformed JSON payload", 400);
    }

    const validation = commentSchema.safeParse(body);
    if (!validation.success) {
      const issue = validation.error.issues[0];
      return errorResponse("VALIDATION_ERROR", issue?.message || "Invalid comment data", 400);
    }

    const comment = await db.comment.create({
      data: {
        content: validation.data.content,
        post_id: post.id,
        author_id: currentUser.id,
      },
      select: {
        id: true,
        content: true,
        post_id: true,
        author_id: true,
        created_at: true,
        author: {
          select: {
            id: true,
            display_name: true,
          },
        },
      },
    });

    return NextResponse.json({ data: comment }, { status: 201 });
  } catch (error) {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to add comment", 500);
  }
}
