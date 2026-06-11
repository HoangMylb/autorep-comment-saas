import { NextResponse } from "next/server";

interface ApiSuccess<T> {
  code: 0;
  message: string;
  data: T;
}

interface ApiFailure {
  code: 1;
  message: string;
  data: null;
}

export async function withApiHandler<T>(action: () => Promise<T>, successStatus = 200) {
  try {
    const data = await action();
    const body: ApiSuccess<T> = {
      code: 0,
      message: successStatus === 201 ? "Created successfully" : "Success",
      data
    };
    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const body: ApiFailure = {
      code: 1,
      message,
      data: null
    };
    return NextResponse.json(body, { status: 200 });
  }
}
