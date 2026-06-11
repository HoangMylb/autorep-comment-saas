import { NextResponse } from "next/server";
import { createClient } from "@/frontend/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Logout successful",
        data: {
          redirectTo: "/login"
        }
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json(
      {
        success: false,
        message,
        error: message
      },
      { status: 400 }
    );
  }
}
