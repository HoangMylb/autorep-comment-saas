import { NextResponse } from "next/server";
import { createClient } from "@/frontend/lib/supabase/server";

interface LoginBody {
  email: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;

    if (!body.email || !body.password) {
      throw new Error("Email and password are required");
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(
      {
        code: 0,
        message: "Login successful",
        data: {
          email: body.email,
          redirectTo: "/dashboard/pages"
        }
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json(
      {
        code: 1,
        message,
        data: null
      },
      { status: 200 }
    );
  }
}
