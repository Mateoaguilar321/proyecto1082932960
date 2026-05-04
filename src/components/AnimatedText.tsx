"use client";

import { motion } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  delay?: number;
}

const letterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: (delay || 0) + i * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

export default function AnimatedText({ text, delay = 0 }: AnimatedTextProps) {
  const letters = text.split("");

  return (
    <span className="inline-block">
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={letterVariants}
          initial="hidden"
          animate="visible"
          className="inline-block"
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </span>
  );
}