import { NextResponse } from "next/server";

interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

interface ApiFailure {
  success: false;
  message: string;
  error: string;
}

export async function withApiHandler<T>(action: () => Promise<T>, successStatus = 200) {
  try {
    const data = await action();
    const body: ApiSuccess<T> = {
      success: true,
      message: successStatus === 201 ? "Created successfully" : "OK",
      data
    };
    return NextResponse.json(body, { status: successStatus });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const body: ApiFailure = {
      success: false,
      message,
      error: message
    };
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
    return NextResponse.json(body, { status });
  }
}
