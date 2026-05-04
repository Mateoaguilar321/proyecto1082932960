"use client";

import { motion } from "framer-motion";
import AnimatedText from "./AnimatedText";

interface HolaMundoProps {
  title: string;
  subtitle: string;
  description: string;
}

export default function HolaMundo({ title, subtitle, description }: HolaMundoProps) {
  return (
    <div className="text-center select-none">
      <h1 className="text-6xl md:text-8xl font-bold text-white drop-shadow-lg">
        <AnimatedText text={title} />
      </h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: title.length * 0.1 + 0.5, duration: 0.8 }}
        className="mt-6 text-lg md:text-xl text-white/60 font-light uppercase tracking-widest"
      >
        {subtitle}
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: title.length * 0.1 + 0.9, duration: 0.8 }}
        className="mt-4 max-w-2xl text-sm md:text-base text-white/70 leading-7"
      >
        {description}
      </motion.p>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: title.length * 0.1 + 1.2, duration: 0.6 }}
        className="mt-8 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto w-64"
      />
    </div>
  );
}