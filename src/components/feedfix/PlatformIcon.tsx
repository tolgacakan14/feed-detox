import type { ComponentType } from "react";
import { Globe } from "lucide-react";
import {
  SiInstagram,
  SiReddit,
  SiSpotify,
  SiSubstack,
  SiTiktok,
  SiX,
  SiYoutube,
} from "react-icons/si";
import type { Platform } from "@/types";

/** Real brand glyphs (simple-icons) for platforms; globe for the open web. */
export const PLATFORM_ICONS: Record<
  Platform,
  ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>
> = {
  x: SiX,
  instagram: SiInstagram,
  tiktok: SiTiktok,
  youtube: SiYoutube,
  reddit: SiReddit,
  newsletter: SiSubstack,
  spotify: SiSpotify,
  web: Globe,
};

/** Official-ish brand colors so cards read as the platform at a glance. */
export const PLATFORM_ICON_COLORS: Record<Platform, string> = {
  x: "text-foreground",
  instagram: "text-[#E1306C]",
  tiktok: "text-foreground",
  youtube: "text-[#FF0000]",
  reddit: "text-[#FF4500]",
  newsletter: "text-[#FF6719]",
  spotify: "text-[#1DB954]",
  web: "text-tealbrand",
};

export function PlatformIcon({
  platform,
  className,
  branded = false,
}: {
  platform: Platform;
  className?: string;
  /** true → tint with the platform's brand color */
  branded?: boolean;
}) {
  const Icon = PLATFORM_ICONS[platform];
  const color = branded ? PLATFORM_ICON_COLORS[platform] : "";
  return <Icon className={`${className ?? ""} ${color}`.trim()} aria-hidden />;
}
