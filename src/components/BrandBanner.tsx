import Image from "next/image";
import styles from "./BrandBanner.module.css";

export default function BrandBanner({
  variant = "bar",
  className,
}: {
  variant?: "bar" | "hero";
  className?: string;
}) {
  return (
    <Image
      src="/banner-text.png"
      alt="ANDAM — Para sa Kaugmaon"
      width={2172}
      height={724}
      loading="eager"
      unoptimized
      className={`${styles.banner} ${variant === "hero" ? styles.hero : styles.bar} ${className ?? ""}`}
    />
  );
}
