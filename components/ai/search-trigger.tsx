"use client";

import { type ButtonHTMLAttributes, useState } from "react";
import dynamic from "next/dynamic";

// lazy load the dialog
const AIChat = dynamic(() => import("./chat"), { ssr: false });

/**
 * The trigger component for AI search dialog.
 *
 * Use it like a normal button component.
 */
export function AISearchTrigger(
  props: ButtonHTMLAttributes<HTMLButtonElement>
) {
  const [open, setOpen] = useState<boolean>();

  return (
    <>
      {open !== undefined ? (
        <AIChat open={open} onOpenChange={setOpen} />
      ) : null}
      <button {...props} onClick={() => setOpen(true)} />
    </>
  );
}
