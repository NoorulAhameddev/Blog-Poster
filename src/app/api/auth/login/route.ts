import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword } from "@/lib/password";
import { loginSchema } from "@/lib/validations";
import { signToken, setAuthCookie } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { errorResponse, validateBodySize } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting (10 requests/min/IP)
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`login:${clientIp}`, 10, 60 * 1000);
    if (!rateLimit.success) {
      return errorResponse(
        "RATE_LIMIT_EXCEEDED",
        "Too many login attempts. Please try again later.",
        429
      );
    }

    // 2. Validate Content-Type, Body Size & Payload
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

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      const issue = validation.error.issues[0];
      return errorResponse("VALIDATION_ERROR", issue?.message || "Invalid input data", 400);
    }

    const { email, password } = validation.data;

    // 3. Find User
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return errorResponse("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    // 4. Compare Password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return errorResponse("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    // 5. Sign JWT & Set httpOnly Cookie
    const token = signToken({
      id: user.id,
      email: user.email,
      display_name: user.display_name,
    });

    const response = NextResponse.json(
      {
        data: {
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          created_at: user.created_at,
        },
      },
      { status: 200 }
    );

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    return errorResponse("INTERNAL_SERVER_ERROR", "An unexpected error occurred", 500);
  }
}
