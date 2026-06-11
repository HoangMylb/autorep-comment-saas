"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Form, Input } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { apiClient } from "@/frontend/lib/api-client";
import type { ApiSuccessResponse, AuthPayload } from "@/frontend/types/api";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters")
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;
type AuthValues = LoginValues | RegisterValues;

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const router = useRouter();
  const resolver = isRegister ? zodResolver(registerSchema) : zodResolver(loginSchema);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = useForm<AuthValues>({
    resolver,
    defaultValues: {
      email: "",
      password: "",
      fullName: ""
    }
  });

  const handleRegisterSubmit = async (values: RegisterValues) => {
    try {
      const response = await apiClient.post<ApiSuccessResponse<AuthPayload>>("/auth/register", {
        email: values.email,
        password: values.password,
        fullName: values.fullName
      });
      toast.success(response.data.message);
      router.replace(response.data.data.redirectTo);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    }
  };

  const handleLoginSubmit = async (values: LoginValues) => {
    try {
      const response = await apiClient.post<ApiSuccessResponse<AuthPayload>>("/auth/login", {
        email: values.email,
        password: values.password
      });
      toast.success(response.data.message);
      router.replace(response.data.data.redirectTo);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    }
  };

  const onSubmit = (values: AuthValues) => {
    if (isRegister) {
      return handleRegisterSubmit(values as RegisterValues);
    }

    return handleLoginSubmit(values as LoginValues);
  };

  const registerErrors = errors as FieldErrors<RegisterValues>;

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
          <Form.Item label="Full name" validateStatus={registerErrors.fullName ? "error" : ""} help={registerErrors.fullName?.message?.toString()}>
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
