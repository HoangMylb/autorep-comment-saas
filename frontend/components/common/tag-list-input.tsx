"use client";

import { Input, Tag } from "antd";
import { useState } from "react";

export function TagListInput({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const next = draft.trim().toLowerCase();
    if (!next || value.includes(next)) {
      setDraft("");
      return;
    }
    onChange([...value, next]);
    setDraft("");
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-3">
      <div className="mb-3 flex flex-wrap gap-2">
        {value.map((item) => (
          <Tag key={item} closable onClose={() => onChange(value.filter((keyword) => keyword !== item))}>
            {item}
          </Tag>
        ))}
      </div>
      <Input
        value={draft}
        placeholder="Type keyword and press Enter"
        onChange={(event) => setDraft(event.target.value)}
        onPressEnter={addTag}
        onBlur={addTag}
      />
    </div>
  );
}
