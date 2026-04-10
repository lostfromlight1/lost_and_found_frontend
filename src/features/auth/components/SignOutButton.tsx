"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { SignOutIcon } from "@phosphor-icons/react/dist/ssr";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      className="w-full flex justify-start gap-2"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <SignOutIcon size={18} />
      <span>Log out</span>
    </Button>
  );
}
