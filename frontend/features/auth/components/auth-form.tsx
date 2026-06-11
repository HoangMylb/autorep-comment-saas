"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Form, Input } from "antd";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createClient } from "@/frontend/lib/supabase/client";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2)
});

type AuthValues = z.infer<typeof authSchema>;

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: ""
    }
  });

  const onSubmit = async (values: AuthValues) => {
    const supabase = createClient();

    if (isRegister) {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Account created. Check your email to confirm sign up.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    window.location.href = "/dashboard";
  };

  return (
    <Card className="w-full max-w-md rounded-[32px] border-slate-200">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">{isRegister ? "Create your account" : "Welcome back"}</h1>
        <p className="text-sm text-slate-500">
          {isRegister ? "Start with the project foundation: auth, roles, and dashboard access." : "Login to access the role-based dashboard foundation."}
        </p>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        {isRegister ? (
          <Form.Item label="Full name" validateStatus={errors["fullName"] ? "error" : ""} help={errors["fullName"]?.message?.toString()}>
            <Controller name="fullName" control={control} render={({ field }) => <Input {...field} size="large" />} />
          </Form.Item>
        ) : null}
        <Form.Item label="Email" validateStatus={errors["email"] ? "error" : ""} help={errors["email"]?.message?.toString()}>
          <Controller name="email" control={control} render={({ field }) => <Input {...field} size="large" />} />
        </Form.Item>
        <Form.Item label="Password" validateStatus={errors["password"] ? "error" : ""} help={errors["password"]?.message?.toString()}>
          <Controller name="password" control={control} render={({ field }) => <Input.Password {...field} size="large" />} />
        </Form.Item>
        <Button type="primary" htmlType="submit" size="large" block loading={isSubmitting}>
          {isRegister ? "Create account" : "Login"}
        </Button>
      </Form>
      <p className="mt-6 text-sm text-slate-500">
        {isRegister ? "Already have an account?" : "Need an account?"} {" "}
        <Link className="font-medium text-blue-600" href={isRegister ? "/login" : "/register"}>
          {isRegister ? "Login" : "Register"}
        </Link>
      </p>
    </Card>
  );
}
