import Image from "next/image";
import { UserRound } from "lucide-react";
import { cn, initials } from "@/lib/utils";

function googleDriveImageSrc(src: string) {
  const patterns = [
    /drive\.google\.com\/file\/d\/([^/]+)/,
    /drive\.google\.com\/open\?id=([^&]+)/,
    /drive\.google\.com\/uc\?[^#]*id=([^&]+)/,
  ];
  const match = patterns.map((pattern) => src.match(pattern)).find(Boolean);
  const fileId = match?.[1];

  return fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w800` : src;
}

function validImageSrc(src?: string | null) {
  if (!src) return false;
  return src.startsWith("/") || src.startsWith("https://") || src.startsWith("http://");
}

export function PlayerAvatar({
  name,
  imageUrl,
  className,
}: {
  name: string;
  imageUrl?: string | null;
  className?: string;
}) {
  const canRenderImage = validImageSrc(imageUrl);
  const renderSrc = imageUrl ? googleDriveImageSrc(imageUrl) : null;

  return (
    <div
      className={cn(
        "relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-200 bg-white text-sm font-black text-primary shadow-sm",
        className,
      )}
    >
      {canRenderImage ? (
        <Image src={renderSrc!} alt={name} fill className="object-cover" sizes="96px" />
      ) : initials(name) ? (
        <span>{initials(name)}</span>
      ) : (
        <UserRound className="h-6 w-6 text-muted-foreground" />
      )}
    </div>
  );
}
