"use client"

import type { Variants } from "framer-motion"

// Staggered children animation
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

// Fade up animation for items
export const fadeUpItem: Variants = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200, // Increased from 100 for less bounce
      damping: 25, // Increased from 15 for less bounce
    },
  },
}

// Fade in animation
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
}

// Scale animation for buttons and interactive elements
export const scaleUp: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.03, // Reduced from 1.05 for subtler effect
    transition: {
      type: "spring",
      stiffness: 500, // Increased from 400 for less bounce
      damping: 20, // Increased from 10 for less bounce
    },
  },
  tap: { scale: 0.98 },
}

// Slide in from right
export const slideInRight: Variants = {
  hidden: { x: 10, opacity: 0.8 },
  show: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
}

// Slide in from left
export const slideInLeft: Variants = {
  hidden: { x: -20, opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
}

// Pulse animation for attention
export const pulse: Variants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.6,
      ease: "easeInOut",
      times: [0, 0.5, 1],
      repeat: 0,
    },
  },
}

// Rotate animation
export const rotate: Variants = {
  initial: { rotate: 0 },
  rotate: {
    rotate: 360,
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
}

// Badge hover animation
export const badgeHover: Variants = {
  initial: { y: 0, scale: 1 },
  hover: {
    y: -1, // Reduced from -2 for subtler effect
    scale: 1.05, // Reduced from 1.08 for subtler effect
    transition: {
      type: "spring",
      stiffness: 500, // Increased from 400 for less bounce
      damping: 25, // Increased from 10 for less bounce
    },
  },
}

// Timeline item animation
export const timelineItem: Variants = {
  hidden: { x: -10, opacity: 0 },
  show: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200, // Increased from 100 for less bounce
      damping: 25, // Increased from 15 for less bounce
      delay: i * 0.05,
    },
  }),
}

// Card hover animation
export const cardHover: Variants = {
  initial: { y: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  hover: {
    y: -2,
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
    transition: {
      type: "spring",
      stiffness: 500, // Increased from 400 for less bounce
      damping: 25, // Increased from 15 for less bounce
    },
  },
}
