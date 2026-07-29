import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { postSchema, paginationSchema } from "@/lib/validations";
import { paginatedResponse, errorResponse, validateBodySize } from "@/lib/api-response";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get("page") ?? "1";
    const limitParam = searchParams.get("limit") ?? "10";
    const filterMine = searchParams.get("mine") === "true";
    const authorParam = searchParams.get("author_id");

    const paginationResult = paginationSchema.safeParse({
      page: pageParam,
      limit: limitParam,
    });

    if (!paginationResult.success) {
      return errorResponse("INVALID_PAGINATION", "Invalid page or limit parameter", 400);
    }

    const { page, limit } = paginationResult.data;
    const currentUser = getCurrentUser(req);

    // Build filter criteria
    const where: any = {};

    if (filterMine) {
      if (!currentUser) {
        return errorResponse("UNAUTHENTICATED", "Authentication required to view your posts", 401);
      }
      where.author_id = currentUser.id;
    } else if (authorParam) {
      where.author_id = authorParam;
      // If querying another author's posts, show only published unless current user is that author
      if (!currentUser || currentUser.id !== authorParam) {
        where.status = "published";
      }
    } else {
      // General feed: show only published posts
      where.status = "published";
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
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
          _count: {
            select: { comments: true },
          },
        },
      }),
      db.post.count({ where }),
    ]);

    return paginatedResponse(posts, page, limit, total);
  } catch (error) {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to fetch posts", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return errorResponse("UNAUTHENTICATED", "Authentication required", 401);
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

    const validation = postSchema.safeParse(body);
    if (!validation.success) {
      const issue = validation.error.issues[0];
      return errorResponse("VALIDATION_ERROR", issue?.message || "Invalid post data", 400);
    }

    const { title, content, status } = validation.data;
    let slug = validation.data.slug ? validation.data.slug : generateSlug(title);

    if (!slug) {
      slug = `post-${Date.now()}`;
    }

    // Check slug uniqueness
    const existingPost = await db.post.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return errorResponse("DUPLICATE_SLUG", "A post with this slug already exists", 400);
    }

    const post = await db.post.create({
      data: {
        title,
        slug,
        content,
        status,
        author_id: currentUser.id,
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

    return NextResponse.json({ data: post }, { status: 201 });
  } catch (error) {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to create post", 500);
  }
}
