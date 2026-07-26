import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Official NEXFORM logo — the exact uploaded asset (public/logo.png), used
 * unmodified per explicit instruction. Its background is opaque gray (not
 * transparent), so it renders as a rectangular plate wherever it appears.
 */
export function Logo({
  variant = "compact",
  className,
}: {
  variant?: "compact" | "full";
  className?: string;
}) {
  const sizeClass = variant === "full" ? "w-72 sm:w-96 md:w-[28rem]" : "w-32 sm:w-40";

  return (
    <Image
      src="/logo.png"
      alt="NEXFORM — Architecture, Design, Inspiration"
      width={1536}
      height={1024}
      priority={variant === "full"}
      className={cn(sizeClass, "h-auto select-none", className)}
    />
  );
}
