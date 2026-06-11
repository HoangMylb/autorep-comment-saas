"use client";

import { Button } from "antd";

export function ConnectFacebookButton({ disabled = false }: { disabled?: boolean }) {
  return (
    <Button type="default" href="/api/facebook/connect" disabled={disabled}>
      Connect Facebook Page
    </Button>
  );
}
