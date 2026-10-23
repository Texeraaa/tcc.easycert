"use client";

/**
 * Menu dropdown do usuario autenticado.
 * Client Component necessario porque usa estado de abertura do dropdown.
 */

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/(auth)/_actions/logout";

interface UserMenuProps {
  userName: string | null;
}

export function UserMenu({ userName }: UserMenuProps) {
  const initials = userName
    ? userName
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-medium text-[var(--accent-foreground)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
          )}
          aria-label="Menu do usuario"
        >
          {initials}
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          sideOffset={8}
          className={cn(
            "z-50 min-w-[160px] rounded-lg border border-[var(--border)] bg-[var(--popover)] p-1 text-[var(--popover-foreground)] shadow-[var(--shadow-md)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2",
          )}
        >
          {userName && (
            <>
              <div className="px-2 py-1.5 text-sm font-medium">{userName}</div>
              <DropdownMenuPrimitive.Separator className="my-1 h-px bg-[var(--border)]" />
            </>
          )}

          <DropdownMenuPrimitive.Item asChild>
            <form action={logoutAction}>
              <button
                type="submit"
                className={cn(
                  "flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-sm text-[var(--destructive)]",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)]",
                  "hover:bg-[var(--muted)]",
                )}
              >
                Sair
              </button>
            </form>
          </DropdownMenuPrimitive.Item>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
