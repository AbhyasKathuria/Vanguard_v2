import React from "react";

interface VanguardLogoProps {
  className?: string;
  size?: number;
  variant?: "emblem" | "full";
  alt?: string;
}

export default function VanguardLogo({
  className = "",
  size = 36,
  variant = "emblem",
  alt = "VANGUARD Logo",
}: VanguardLogoProps) {
  const src = variant === "full" ? "/logo.png" : "/logo-emblem.png";

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{ width: size, height: "auto" }}
      className={`object-contain shrink-0 ${className}`}
    />
  );
}
