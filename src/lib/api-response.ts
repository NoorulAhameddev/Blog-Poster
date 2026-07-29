import { NextResponse } from "next/server";

const MAX_BODY_SIZE = 1_048_576; // 1MB

export function validateBodySize(req: Request): boolean {
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    return false;
  }
  return true;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse<PaginatedResponse<T>> {
  const hasMore = page * limit < total;
  return NextResponse.json(
    {
      data,
      page,
      limit,
      total,
      hasMore,
    },
    { status: 200 }
  );
}

export interface ErrorResponsePayload {
  error: {
    code: string;
    message: string;
  };
}

export function errorResponse(
  code: string,
  message: string,
  status: number = 400
): NextResponse<ErrorResponsePayload> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    { status }
  );
}
