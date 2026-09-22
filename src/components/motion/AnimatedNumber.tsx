"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion-tokens";

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  className?: string;
}

export default function AnimatedNumber({ value, decimals = 0, className }: AnimatedNumberProps) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(() => value.toFixed(decimals));
  const from = useRef(0);

  useEffect(() => {
    const controls = animate(from.current, value, {
      duration: reduce ? 0 : 0.6,
      ease: EASE,
      onUpdate: (v) => {
        from.current = v;
        setDisplay(v.toFixed(decimals));
      },
    });
    return () => controls.stop();
  }, [value, decimals, reduce]);

  return <span className={className}>{display}</span>;
}