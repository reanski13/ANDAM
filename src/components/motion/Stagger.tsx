"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { STAGGER_STEP } from "@/lib/motion-tokens";

interface StaggerProps {
  children: ReactNode;
  delayChildren?: number;
  className?: string;
}

export default function Stagger({ children, delayChildren = 0, className }: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-48px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: STAGGER_STEP, delayChildren } },
      }}
    >
      {children}
    </motion.div>
  );
}