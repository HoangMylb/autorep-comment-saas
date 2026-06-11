import { NextResponse } from "next/server";
import { createClient } from "@/frontend/lib/supabase/server";

interface RegisterBody {
  email: string;
  password: string;
  fullName: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody;

    if (!body.email || !body.password || !body.fullName) {
      throw new Error("Full name, email, and password are required");
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          full_name: body.fullName
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(
      {
        code: 0,
        message: "Account created successfully",
        data: {
          email: body.email,
          redirectTo: "/login"
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
