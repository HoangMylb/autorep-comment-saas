import { NextResponse } from "next/server";

export async function withApiHandler<T>(action: () => Promise<T>, successStatus = 200) {
  try {
    const data = await action();
    return NextResponse.json({ data }, { status: successStatus });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
    return NextResponse.json({ message }, { status });
  }
}
