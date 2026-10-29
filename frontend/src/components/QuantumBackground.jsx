import { motion, useReducedMotion } from "motion/react";

export default function QuantumBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#080D1F]"
    >
      {}
      <motion.div
        className="absolute -left-[20%] -top-[30%] h-[75vw] w-[75vw] min-h-[500px] min-w-[500px] rounded-full bg-[#7C3AED]/20 blur-[110px]"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, 120, -50, 0],
                y: [0, 80, 150, 0],
                scale: [1, 1.15, 0.95, 1],
              }
        }
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {}
      <motion.div
        className="absolute -right-[20%] top-[10%] h-[65vw] w-[65vw] min-h-[450px] min-w-[450px] rounded-full bg-[#22D3EE]/15 blur-[110px]"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, -100, 40, 0],
                y: [0, 120, -70, 0],
                scale: [1, 0.9, 1.2, 1],
              }
        }
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {}
      <div className="absolute inset-0 bg-[#080D1F]/35" />
    </div>
  );
}