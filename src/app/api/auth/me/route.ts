import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const currentUser = getCurrentUser(req);
  if (!currentUser) {
    return errorResponse("UNAUTHENTICATED", "Authentication required", 401);
  }

  const user = await db.user.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      email: true,
      display_name: true,
      created_at: true,
    },
  });

  if (!user) {
    return errorResponse("USER_NOT_FOUND", "User record not found", 404);
  }

  return NextResponse.json({ data: user }, { status: 200 });
}
