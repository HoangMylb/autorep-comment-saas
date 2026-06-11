"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Form, Input, Select, Switch } from "antd";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { TagListInput } from "@/frontend/components/common/tag-list-input";
import type { Automation, FacebookPage, FacebookPost } from "@/frontend/types/domain";
import { apiClient } from "@/frontend/lib/api-client";

const schema = z.object({
  facebook_page_id: z.string().uuid(),
  facebook_post_id: z.string().uuid(),
  name: z.string().trim().min(1),
  keywords: z.array(z.string()).min(1),
  inbox_message: z.string().trim().min(1),
  public_reply_message: z.string().optional(),
  is_active: z.boolean()
});

type FormValues = z.infer<typeof schema>;

export function AutomationForm({ pages, posts, initialValue }: { pages: FacebookPage[]; posts: FacebookPost[]; initialValue?: Automation }) {
  const router = useRouter();
  const {
    control,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      facebook_page_id: initialValue?.facebook_page_id ?? pages[0]?.id,
      facebook_post_id: initialValue?.facebook_post_id ?? posts[0]?.id,
      name: initialValue?.name ?? "",
      keywords: initialValue?.keywords ?? [],
      inbox_message: initialValue?.inbox_message ?? "",
      public_reply_message: initialValue?.public_reply_message ?? "",
      is_active: initialValue?.is_active ?? true
    }
  });

  const selectedPageId = watch("facebook_page_id");
  const selectedPostId = watch("facebook_post_id");
  const availablePosts = posts.filter((post) => post.facebook_page_id === selectedPageId);
  const previewPost = posts.find((post) => post.id === selectedPostId);
  const previewKeywords = watch("keywords");
  const inboxMessage = watch("inbox_message");
  const publicReplyMessage = watch("public_reply_message");

  const onSubmit = async (values: FormValues) => {
    try {
      if (initialValue) {
        await apiClient.put(`/automations/${initialValue.id}`, values);
        toast.success("Automation updated");
      } else {
        await apiClient.post("/automations", values);
        toast.success("Automation created");
      }
      router.push("/dashboard/automations");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save automation");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="rounded-[28px] border-slate-200">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item label="Page" validateStatus={errors.facebook_page_id ? "error" : ""} help={errors.facebook_page_id?.message}>
            <Controller name="facebook_page_id" control={control} render={({ field }) => <Select {...field} onChange={field.onChange} options={pages.map((page) => ({ label: page.page_name, value: page.id }))} />} />
          </Form.Item>
          <Form.Item label="Post" validateStatus={errors.facebook_post_id ? "error" : ""} help={errors.facebook_post_id?.message}>
            <Controller name="facebook_post_id" control={control} render={({ field }) => <Select {...field} onChange={field.onChange} options={availablePosts.map((post) => ({ label: post.message ?? post.post_id, value: post.id }))} />} />
          </Form.Item>
          <Form.Item label="Automation name" validateStatus={errors.name ? "error" : ""} help={errors.name?.message}>
            <Controller name="name" control={control} render={({ field }) => <Input {...field} />} />
          </Form.Item>
          <Form.Item label="Keywords" validateStatus={errors.keywords ? "error" : ""} help={errors.keywords?.message?.toString()}>
            <Controller name="keywords" control={control} render={({ field }) => <TagListInput value={field.value} onChange={field.onChange} />} />
          </Form.Item>
          <Form.Item label="Inbox message" validateStatus={errors.inbox_message ? "error" : ""} help={errors.inbox_message?.message}>
            <Controller name="inbox_message" control={control} render={({ field }) => <Input.TextArea {...field} rows={5} />} />
          </Form.Item>
          <Form.Item label="Public reply message">
            <Controller name="public_reply_message" control={control} render={({ field }) => <Input.TextArea {...field} rows={4} />} />
          </Form.Item>
          <Form.Item label="Active">
            <Controller name="is_active" control={control} render={({ field }) => <Switch checked={field.value} onChange={field.onChange} />} />
          </Form.Item>
          <div className="flex gap-3">
            <Button type="primary" htmlType="submit" loading={isSubmitting}>{initialValue ? "Update automation" : "Create automation"}</Button>
            <Button onClick={() => router.back()}>Cancel</Button>
          </div>
        </Form>
      </Card>
      <Card className="rounded-[28px] border-slate-200">
        <p className="text-sm font-medium text-slate-500">Preview</p>
        <div className="mt-4 space-y-4">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Comment sample</p>
            <p className="mt-2 text-sm text-slate-700">{previewKeywords[0] ? `Khách comment: “${previewKeywords[0]}”` : "Add keywords to preview matching"}</p>
          </div>
          <div className="rounded-3xl bg-blue-50 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600">Inbox preview</p>
            <p className="mt-2 text-sm text-slate-700">{inboxMessage || "Inbox message preview"}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Public reply preview</p>
            <p className="mt-2 text-sm text-slate-700">{publicReplyMessage || "No public reply message configured"}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Selected post</p>
            <p className="mt-2 text-sm text-slate-700">{previewPost?.message ?? "Select a post"}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
