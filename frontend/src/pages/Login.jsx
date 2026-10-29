import { useState } from "react";
import axios from "axios";
import {
  motion,
  useReducedMotion,
} from "motion/react";

import {
  LogIn,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  ShoppingBag,
  ShieldCheck,
  BarChart3,
  MessageCircle,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#080D1F]/75 py-3.5 pl-12 pr-12 text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-[#22D3EE]/60 focus:ring-2 focus:ring-[#7C3AED]/20";

export default function Login({
  onSuccess,
  onRegister,
}) {
  const reduceMotion = useReducedMotion();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );

      onSuccess?.(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: ShoppingBag,
      title: "Order Management",
      description:
        "Keep all your customer orders organized.",
    },
    {
      icon: BarChart3,
      title: "Business Analytics",
      description:
        "Understand your sales and performance.",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Integration",
      description:
        "Connect with customers in a few clicks.",
    },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080D1F] px-4 py-8 text-white sm:px-6 lg:px-8">
      {}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 -top-32 h-[450px] w-[450px] rounded-full bg-[#7C3AED]/20 blur-[110px]" />

        <div className="absolute -bottom-40 -right-24 h-[480px] w-[480px] rounded-full bg-[#22D3EE]/10 blur-[120px]" />

        <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7C3AED]/10 blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.18) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {}

      <motion.div
        initial={
          reduceMotion
            ? false
            : { opacity: 0, y: 25 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.65,
          ease: "easeOut",
        }}
        className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-[#10182D]/90 shadow-[0_25px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:grid-cols-[1fr_1fr]"
      >
        {}

        <div className="relative hidden overflow-hidden border-r border-white/10 bg-gradient-to-br from-[#171A3B] via-[#151632] to-[#0C2035] p-10 lg:flex lg:flex-col lg:justify-between xl:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-[#7C3AED]/20 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-[#22D3EE]/10 blur-3xl"
          />

          <div className="relative">
            <div className="mb-12 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#22D3EE]/25 bg-[#7C3AED]/20 text-[#22D3EE] shadow-[0_0_25px_rgba(124,58,237,0.2)]">
                <ShoppingBag size={25} />
              </div>

              <div>
                <p className="text-lg font-bold tracking-tight">
                  WhatsApp Order
                </p>

                <p className="text-xs font-semibold tracking-[0.25em] text-[#22D3EE]">
                  MANAGER
                </p>
              </div>
            </div>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#22D3EE]/20 bg-[#22D3EE]/10 px-3 py-1.5 text-xs font-semibold text-[#22D3EE]">
              <Sparkles size={14} />
              SMART BUSINESS WORKSPACE
            </div>

            <h2 className="max-w-sm text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Manage your
              <span className="block bg-gradient-to-r from-[#22D3EE] to-[#A78BFA] bg-clip-text text-transparent">
                business smarter.
              </span>
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              A centralized workspace to organize
              orders, manage inventory, connect with
              customers, and monitor business growth.
            </p>

            {}

            <div className="mt-10 space-y-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <motion.div
                    key={feature.title}
                    initial={
                      reduceMotion
                        ? false
                        : { opacity: 0, x: -15 }
                    }
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      duration: 0.4,
                      delay: reduceMotion
                        ? 0
                        : 0.2 + index * 0.1,
                    }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#22D3EE]">
                      <Icon size={20} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {feature.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="relative mt-12 flex items-center gap-2 border-t border-white/10 pt-6 text-xs text-slate-400">
            <ShieldCheck
              size={17}
              className="text-[#22D3EE]"
            />
            Secure access to your business workspace
          </div>
        </div>

        {}

        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-12 xl:px-14">
          {}

          <div className="mb-9 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#22D3EE]/25 bg-[#7C3AED]/20 text-[#22D3EE]">
              <ShoppingBag size={23} />
            </div>

            <div>
              <p className="text-base font-bold">
                WhatsApp Order
              </p>

              <p className="text-xs font-semibold tracking-[0.2em] text-[#22D3EE]">
                MANAGER
              </p>
            </div>
          </div>

          {}

          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#7C3AED]/30 bg-[#7C3AED]/15 text-[#C4B5FD]">
              <LogIn size={24} />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Sign in to access your business dashboard.
            </p>
          </div>

          {}

          {error && (
            <motion.div
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, y: -8 }
              }
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300"
            >
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>{error}</span>
            </motion.div>
          )}

          {}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {}

            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className={inputClass}
                />
              </div>
            </div>

            {}

            <div>
              <label
                htmlFor="login-password"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  aria-pressed={showPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#22D3EE]"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={
                reduceMotion || loading
                  ? undefined
                  : { y: -2 }
              }
              whileTap={
                reduceMotion || loading
                  ? undefined
                  : { scale: 0.98 }
              }
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] px-5 py-3.5 font-semibold text-white shadow-[0_8px_30px_rgba(124,58,237,0.25)] transition-all duration-300 hover:shadow-[0_10px_35px_rgba(124,58,237,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <LogIn size={19} />
              )}

              {loading
                ? "Signing in..."
                : "Sign In"}

              {!loading && (
                <ArrowRight
                  size={17}
                  className="ml-1 transition-transform duration-300 group-hover:translate-x-1"
                />
              )}
            </motion.button>
          </form>

          {}
          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onRegister}
                className="font-semibold text-[#22D3EE] transition hover:text-[#67E8F9]"
              >
                Create Account
              </button>
            </p>
          </div>

          {}

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
            <CheckCircle2
              size={14}
              className="text-emerald-400"
            />
            Your business, one workspace.
          </div>
        </div>
      </motion.div>
    </div>
  );
}