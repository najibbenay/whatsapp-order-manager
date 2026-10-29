import { useEffect, useRef, useState } from "react";
import {
  Menu,
  Search,
  Sparkles,
  X,
  ChevronDown,
  UserRound,
  LogOut,
  Mail,
  Store,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export default function Navbar({
  setMobileOpen,
  activePage,
  search = "",
  setSearch,
  setActivePage,
  user = null,
  onLogout,
}) {
  const reduceMotion = useReducedMotion();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] =
    useState(false);

  const profileRef = useRef(null);
  const searchRef = useRef(null);

  const userName =
    user?.name || user?.full_name || "Admin";

  const userRole =
    user?.role || "Store Manager";

  const storeName =
    user?.store_name || user?.storeName || "";

  const userEmail = user?.email || "";

  const initial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setMobileSearchOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutsideClick
    );
    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      );
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  const handleSearchChange = (value) => {
    setSearch?.(value);

    if (value.trim()) {
      setActivePage?.("Orders");
    }
  };

  const handleLogout = () => {
    setProfileOpen(false);
    onLogout?.();
  };

  return (
    <motion.header
      initial={
        reduceMotion
          ? false
          : { opacity: 0, y: -18 }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="sticky top-0 z-30 border-b border-[#22D3EE]/15 bg-[#080D1F]/90 text-white shadow-lg shadow-black/10 backdrop-blur-2xl"
    >
      <div className="relative flex h-20 items-center justify-between gap-3 px-4 sm:px-8">
        {}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#7C3AED]/10 via-transparent to-[#22D3EE]/5"
        />

        {}
        <div className="relative flex min-w-0 items-center gap-3">
          <motion.button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            whileTap={
              reduceMotion
                ? undefined
                : { scale: 0.92 }
            }
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-[#22D3EE] transition-colors hover:bg-white/10 lg:hidden"
          >
            <Menu size={22} />
          </motion.button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles
                size={18}
                className="hidden text-[#22D3EE] sm:block"
              />

              <h2 className="truncate text-lg font-bold tracking-tight sm:text-xl">
                {activePage}
              </h2>
            </div>

            <p className="hidden text-xs text-slate-400 sm:block">
              Manage your business efficiently
            </p>
          </div>
        </div>

        {}
        <div className="relative flex shrink-0 items-center gap-2 sm:gap-3">
          {}
          <div
            ref={searchRef}
            className="relative hidden md:block"
          >
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#22D3EE]"
            />

            <input
              type="search"
              aria-label="Search orders"
              placeholder="Search orders..."
              value={search}
              onChange={(event) =>
                handleSearchChange(event.target.value)
              }
              className="w-44 rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-9 text-sm text-white placeholder:text-slate-400 outline-none transition-all focus:w-60 focus:border-[#22D3EE]/50 focus:ring-2 focus:ring-[#7C3AED]/20 xl:w-56"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch?.("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {}
          <button
            type="button"
            onClick={() =>
              setMobileSearchOpen((prev) => !prev)
            }
            aria-label="Toggle search"
            aria-expanded={mobileSearchOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#22D3EE] transition hover:bg-white/10 md:hidden"
          >
            {mobileSearchOpen ? (
              <X size={19} />
            ) : (
              <Search size={19} />
            )}
          </button>

  

          {}
          <div
            ref={profileRef}
            className="relative border-l border-white/10 pl-2 sm:pl-3"
          >
            <button
              type="button"
              onClick={() =>
                setProfileOpen((prev) => !prev)
              }
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              className="flex items-center gap-2 rounded-xl p-1 transition hover:bg-white/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#22D3EE] p-[2px]">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-[#10182D] text-sm font-bold text-white">
                  {initial}
                </div>
              </div>

              <div className="hidden max-w-36 text-left sm:block">
                <p className="truncate text-sm font-semibold text-white">
                  {userName}
                </p>

                <p className="truncate text-xs text-slate-400">
                  {userRole}
                </p>
              </div>

              <ChevronDown
                size={15}
                className={`hidden text-slate-400 transition-transform sm:block ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {}
            {profileOpen && (
              <motion.div
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, y: -8 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-[#7C3AED]/30 bg-[#10182D] p-2 shadow-[0_20px_55px_rgba(0,0,0,0.5)]"
              >
                <div className="border-b border-white/10 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <UserRound
                      size={17}
                      className="text-[#22D3EE]"
                    />

                    <p className="truncate text-sm font-semibold text-white">
                      {userName}
                    </p>
                  </div>

                  <p className="mt-1 pl-6 text-xs text-slate-400">
                    {userRole}
                  </p>

                  {userEmail && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                      <Mail
                        size={14}
                        className="shrink-0"
                      />
                      <span className="truncate">
                        {userEmail}
                      </span>
                    </div>
                  )}

                  {storeName && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                      <Store
                        size={14}
                        className="shrink-0"
                      />
                      <span className="truncate">
                        {storeName}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={!onLogout}
                  className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#7C3AED]/60 to-[#22D3EE]/40"
        />
      </div>

      {}
      {mobileSearchOpen && (
        <div className="border-t border-white/10 px-4 pb-4 pt-3 md:hidden">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#22D3EE]"
            />

            <input
              type="search"
              aria-label="Search orders on mobile"
              placeholder="Search orders..."
              value={search}
              onChange={(event) =>
                handleSearchChange(event.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-[#10182D] py-3 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#22D3EE]/50"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch?.("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </div>
      )}
    </motion.header>
  );
}