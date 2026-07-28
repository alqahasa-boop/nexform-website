import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function getInitials(name: string | null, email: string): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || parts[0]!.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function UserAvatar({
  name,
  email,
  image,
  className,
}: {
  name: string | null;
  email: string;
  image?: string | null;
  className?: string;
}) {
  return (
    <Avatar className={cn("size-8", className)}>
      {image && <AvatarImage src={image} alt={name ?? email} />}
      <AvatarFallback className="text-xs font-medium">{getInitials(name, email)}</AvatarFallback>
    </Avatar>
  );
}
