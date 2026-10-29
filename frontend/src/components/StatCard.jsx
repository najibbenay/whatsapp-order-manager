import { motion, useReducedMotion } from "motion/react";

const themes = {
  blue: {
    accent: "#22D3EE",
    gradient: "from-[#22D3EE] to-[#7C3AED]",
  },
  indigo: {
    accent: "#7C3AED",
    gradient: "from-[#7C3AED] to-[#22D3EE]",
  },
  green: {
    accent: "#22D3EE",
    gradient: "from-[#22D3EE] to-[#7C3AED]",
  },
  amber: {
    accent: "#7C3AED",
    gradient: "from-[#7C3AED] to-[#22D3EE]",
  },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = "blue",
}) {
  const reduceMotion = useReducedMotion();
  const theme = themes[color] || themes.blue;

  return (
    <motion.article
      initial={
        reduceMotion
          ? false
          : { opacity: 0, y: 25, scale: 0.96 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={
        reduceMotion
          ? undefined
          : { y: -6, scale: 1.015 }
      }
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        group relative isolate overflow-hidden
        rounded-[24px]
        border border-[#22D3EE]/15
        bg-[#10182D]/85 p-6
        text-white backdrop-blur-xl
        shadow-[0_10px_35px_rgba(0,0,0,0.15)]
        transition-[border-color,box-shadow] duration-300
        hover:border-[#7C3AED]/60
        hover:shadow-[0_12px_45px_rgba(124,58,237,0.18)]
      "
    >
      {}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -right-12 -top-12
          h-40 w-40 rounded-full opacity-20
          blur-3xl transition-opacity duration-500
          group-hover:opacity-40
        "
        style={{
          backgroundColor: theme.accent,
        }}
      />

      {}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium tracking-wide text-slate-400">
            {title}
          </p>

          <motion.h3
            key={String(value)}
            initial={
              reduceMotion
                ? false
                : { opacity: 0, y: 10 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              ease: "easeOut",
            }}
            className="mt-4 break-words text-3xl font-bold tracking-tight text-white"
          >
            {value}
          </motion.h3>
        </div>

        {}
        <motion.div
          whileHover={
            reduceMotion
              ? undefined
              : { rotate: -8, scale: 1.1 }
          }
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 18,
          }}
          className="
            flex h-14 w-14 shrink-0 items-center
            justify-center rounded-2xl
            border border-white/10
            bg-white/5
          "
          style={{
            color: theme.accent,
            boxShadow: `0 0 25px ${theme.accent}18`,
          }}
        >
          <Icon size={26} strokeWidth={1.8} />
        </motion.div>
      </div>

      {}
      <div className="relative z-10 mt-7 h-[3px] overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={
            reduceMotion ? false : { scaleX: 0 }
          }
          animate={{ scaleX: 1 }}
          transition={{
            duration: 0.9,
            delay: 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            transformOrigin: "left",
          }}
          className={`
            h-full w-full rounded-full
            bg-gradient-to-r ${theme.gradient}
          `}
        />
      </div>

      {}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-x-8 top-0
          h-px bg-gradient-to-r
          from-transparent via-[#22D3EE]/40
          to-transparent
        "
      />
    </motion.article>
  );
}