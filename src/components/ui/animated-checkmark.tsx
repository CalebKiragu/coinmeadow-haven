// AnimatedCheckmark.tsx
import { motion } from "framer-motion";

export default function AnimatedCheckmark() {
  return (
    <div className="flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center justify-center text-center space-y-4 p-6"
      >
        {/* Animated Checkmark SVG */}
        <motion.svg
          width="96"
          height="96"
          viewBox="0 0 96 96"
          className="drop-shadow-xl"
          initial="hidden"
          animate="visible"
        >
          <motion.circle
            cx="48"
            cy="48"
            r="46"
            stroke="#22c55e"
            strokeWidth="4"
            fill="none"
            variants={{
              hidden: { pathLength: 0, opacity: 0 },
              visible: {
                pathLength: 1,
                opacity: 1,
                transition: { duration: 0.8, ease: "easeInOut" },
              },
            }}
          />
          <motion.path
            d="M30 50 L44 64 L70 38"
            fill="none"
            stroke="#22c55e"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={{
              hidden: { pathLength: 0 },
              visible: {
                pathLength: 1,
                transition: { duration: 0.6, delay: 0.3, ease: "easeInOut" },
              },
            }}
          />
        </motion.svg>
      </motion.div>
    </div>
  );
}
