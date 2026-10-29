import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Settings,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Orders", icon: ShoppingBag },
  { name: "Products", icon: Package },
  { name: "Customers", icon: Users },
  { name: "Analytics", icon: BarChart3 },
  { name: "Settings", icon: Settings },
];

export default function Sidebar({
  activePage,
  setActivePage,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const reduceMotion = useReducedMotion();

  const spring = {
    type: "spring",
    stiffness: 320,
    damping: 28,
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  const navigateTo = (page) => {
    setActivePage(page);
    closeMobile();
  };

  return (
    <>
      {}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-overlay"
            initial={
              reduceMotion ? false : { opacity: 0 }
            }
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#080D1F]/75 backdrop-blur-sm lg:hidden"
            onClick={closeMobile}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-64 flex-col overflow-hidden
          border-r border-[#22D3EE]/10
          bg-[#080D1F]/95
          text-white
          shadow-[10px_0_50px_rgba(0,0,0,0.18)]
          backdrop-blur-2xl
          transition-[width,transform] duration-300 ease-out
          ${collapsed ? "lg:w-20" : "lg:w-64"}
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
          lg:translate-x-0
        `}
      >
        {}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-20 h-64 w-64 rounded-full bg-[#7C3AED]/15 blur-[90px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 bottom-10 h-52 w-52 rounded-full bg-[#22D3EE]/10 blur-[80px]"
        />

        {}
        <div className="relative flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <motion.div
              whileHover={
                reduceMotion
                  ? undefined
                  : { rotate: -8, scale: 1.07 }
              }
              transition={spring}
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#22D3EE] p-[1px] shadow-lg shadow-[#7C3AED]/20"
            >
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#111A32]">
                <MessageCircle
                  size={22}
                  className="text-[#22D3EE]"
                />
              </div>
            </motion.div>

            {}
            <div
              className={`min-w-0 ${
                collapsed ? "lg:hidden" : ""
              }`}
            >
              <p className="truncate text-sm font-bold tracking-wide text-white">
                Order Manager
              </p>

              <p className="truncate text-[11px] text-slate-400">
                Business Workspace
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeMobile}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {}
        <div
          className={`relative px-5 pb-2 pt-7 ${
            collapsed ? "lg:hidden" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles
              size={13}
              className="text-[#22D3EE]"
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              Workspace
            </span>
          </div>
        </div>

        {}
        <nav
          className="relative flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden p-3"
          aria-label="Main navigation"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.name;

            return (
              <motion.button
                key={item.name}
                type="button"
                title={item.name}
                aria-current={
                  isActive ? "page" : undefined
                }
                onClick={() =>
                  navigateTo(item.name)
                }
                whileHover={
                  reduceMotion
                    ? undefined
                    : { x: collapsed ? 0 : 3 }
                }
                whileTap={
                  reduceMotion
                    ? undefined
                    : { scale: 0.97 }
                }
                className={`
                  group relative flex w-full
                  items-center gap-3 overflow-hidden
                  rounded-xl px-4 py-3
                  text-left text-sm font-medium
                  transition-colors duration-200
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#22D3EE]
                  ${
                    isActive
                      ? "text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                {}
                {isActive && (
                  <motion.div
                    layoutId="quantum-active-menu"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : spring
                    }
                    className="absolute inset-0 rounded-xl border border-[#7C3AED]/40 bg-gradient-to-r from-[#7C3AED]/35 to-[#7C3AED]/10 shadow-[inset_0_0_20px_rgba(124,58,237,0.08)]"
                  />
                )}

                {}
                {isActive && (
                  <motion.div
                    layoutId="quantum-menu-indicator"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : spring
                    }
                    className="absolute bottom-2 left-0 top-2 w-[3px] rounded-full bg-[#22D3EE] shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                  />
                )}

                <Icon
                  size={20}
                  strokeWidth={1.9}
                  className={`relative z-10 shrink-0 transition-colors ${
                    isActive
                      ? "text-[#22D3EE]"
                      : "text-slate-400 group-hover:text-[#22D3EE]"
                  }`}
                />

                <span
                  className={`relative z-10 truncate ${
                    collapsed ? "lg:hidden" : ""
                  }`}
                >
                  {item.name}
                </span>

                {isActive && (
                  <span
                    className={`relative z-10 ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#22D3EE] shadow-[0_0_8px_rgba(34,211,238,0.7)] ${
                      collapsed ? "lg:hidden" : ""
                    }`}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {}
        <div className="relative hidden border-t border-white/10 p-3 lg:block">
          <motion.button
            type="button"
            onClick={() =>
              setCollapsed(!collapsed)
            }
            whileHover={
              reduceMotion
                ? undefined
                : { scale: 1.02 }
            }
            whileTap={
              reduceMotion
                ? undefined
                : { scale: 0.97 }
            }
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            aria-expanded={!collapsed}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-400 transition-colors hover:border-[#7C3AED]/40 hover:bg-[#7C3AED]/10 hover:text-white"
          >
            {collapsed ? (
              <ChevronRight
                size={20}
                className="text-[#22D3EE]"
              />
            ) : (
              <>
                <ChevronLeft
                  size={20}
                  className="text-[#22D3EE]"
                />
                Collapse Sidebar
              </>
            )}
          </motion.button>
        </div>

        {}
        <div
          aria-hidden="true"
          className="relative h-[2px] shrink-0 bg-gradient-to-r from-[#7C3AED] via-[#22D3EE] to-transparent"
        />
      </aside>
    </>
  );
}