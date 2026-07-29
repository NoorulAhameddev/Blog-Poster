import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api-response";

interface Params {
  params: {
    id: string;
  };
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const currentUser = getCurrentUser(req);
    if (!currentUser) {
      return errorResponse("UNAUTHENTICATED", "Authentication required", 401);
    }

    const { id } = params;

    const comment = await db.comment.findUnique({
      where: { id },
      include: {
        post: {
          select: {
            author_id: true,
          },
        },
      },
    });

    if (!comment) {
      return errorResponse("NOT_FOUND", "Comment not found", 404);
    }

    // Authorization check: Deletion allowed for comment author OR post author
    const isCommentAuthor = comment.author_id === currentUser.id;
    const isPostAuthor = comment.post.author_id === currentUser.id;

    if (!isCommentAuthor && !isPostAuthor) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to delete this comment",
        403
      );
    }

    await db.comment.delete({
      where: { id: comment.id },
    });

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    return errorResponse("INTERNAL_SERVER_ERROR", "Failed to delete comment", 500);
  }
}
