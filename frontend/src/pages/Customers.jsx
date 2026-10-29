import { useMemo, useState } from "react";
import {
  motion,
  useReducedMotion,
} from "motion/react";

import {
  Users,
  Search,
  MessageCircle,
  ShoppingBag,
  Wallet,
  UserRound,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

const money = (value) =>
  `${Number(value || 0).toFixed(2)} MAD`;

const cardClass =
  "relative overflow-hidden rounded-[24px] border border-[#22D3EE]/15 bg-[#10182D]/85 shadow-[0_12px_35px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-[border-color,box-shadow] duration-300 hover:border-[#7C3AED]/50 hover:shadow-[0_16px_45px_rgba(124,58,237,0.12)]";

export default function Customers({ orders = [] }) {
  const reduceMotion = useReducedMotion();

  const [search, setSearch] = useState("");
  const customers = useMemo(() => {
    const map = new Map();

    orders.forEach((order) => {
      const phone = String(order.phone || "").replace(
        /\D/g,
        ""
      );

      if (!phone) return;

      if (!map.has(phone)) {
        map.set(phone, {
          phone,
          name: order.customer || "Unknown",
          orders: 0,
          totalSpent: 0,
          delivered: 0,
          lastOrder: null,
        });
      }

      const customer = map.get(phone);

      customer.orders += 1;

      if (order.status === "Delivered") {
        customer.delivered += 1;
        customer.totalSpent += Number(order.total || 0);
      }

      const date = new Date(order.created_at);

      if (
        !Number.isNaN(date.getTime()) &&
        (!customer.lastOrder || date > customer.lastOrder)
      ) {
        customer.lastOrder = date;
        customer.name = order.customer || customer.name;
      }
    });

    return [...map.values()].sort(
      (a, b) => b.orders - a.orders
    );
  }, [orders]);

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return customers.filter((customer) =>
      `${customer.name} ${customer.phone}`
        .toLowerCase()
        .includes(term)
    );
  }, [customers, search]);

  const totalRevenue = useMemo(
    () =>
      customers.reduce(
        (sum, customer) =>
          sum + customer.totalSpent,
        0
      ),
    [customers]
  );

  const openWhatsApp = (customer) => {
    if (!/^[1-9]\d{7,14}$/.test(customer.phone)) {
      alert("Invalid international WhatsApp number.");
      return;
    }

    const message = `Bonjour ${customer.name},\n\nMerci pour votre confiance !`;

    window.open(
      `https://wa.me/${customer.phone}?text=${encodeURIComponent(
        message
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const stats = [
    {
      title: "Total Customers",
      value: customers.length,
      icon: Users,
      accent: "#22D3EE",
    },
    {
      title: "Total Orders",
      value: orders.length,
      icon: ShoppingBag,
      accent: "#7C3AED",
    },
    {
      title: "Delivered Revenue",
      value: money(totalRevenue),
      icon: Wallet,
      accent: "#22D3EE",
    },
  ];

  return (
    <div className="space-y-7 pb-10 text-white">
      {}

      <motion.div
        initial={
          reduceMotion
            ? false
            : { opacity: 0, y: 18 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <Sparkles
            size={16}
            className="text-[#22D3EE]"
          />

          <p className="text-sm font-medium text-[#22D3EE]">
            Customer Insights
          </p>
        </div>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Customers Management
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Manage customers and track their order history.
        </p>
      </motion.div>

      {}

      <div className="grid gap-5 sm:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.title}
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, y: 22 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: reduceMotion
                  ? 0
                  : index * 0.08,
              }}
              whileHover={
                reduceMotion
                  ? undefined
                  : { y: -5, scale: 1.01 }
              }
              className={cardClass}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-20 blur-3xl"
                style={{
                  backgroundColor: stat.accent,
                }}
              />

              <div className="relative p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-400">
                      {stat.title}
                    </p>

                    <motion.h2
                      key={String(stat.value)}
                      initial={
                        reduceMotion
                          ? false
                          : { opacity: 0, y: 10 }
                      }
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{ duration: 0.35 }}
                      className="mt-4 break-words text-3xl font-bold tracking-tight text-white"
                    >
                      {stat.value}
                    </motion.h2>
                  </div>

                  <div
                    className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3"
                    style={{
                      color: stat.accent,
                    }}
                  >
                    <Icon size={24} />
                  </div>
                </div>

                <div className="mt-7 h-[3px] overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={
                      reduceMotion
                        ? false
                        : { scaleX: 0 }
                    }
                    animate={{ scaleX: 1 }}
                    transition={{
                      duration: 0.85,
                      delay: 0.15,
                    }}
                    style={{
                      transformOrigin: "left",
                      background: `linear-gradient(90deg, ${stat.accent}, #7C3AED)`,
                    }}
                    className="h-full w-full rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {}

      <motion.section
        initial={
          reduceMotion
            ? false
            : { opacity: 0, y: 20 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="overflow-hidden rounded-[24px] border border-[#22D3EE]/15 bg-[#10182D]/90 shadow-[0_15px_50px_rgba(0,0,0,0.25)] backdrop-blur-2xl"
      >
        {}

        <div className="flex flex-col gap-4 border-b border-white/10 bg-gradient-to-r from-[#7C3AED]/10 to-transparent p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              Customer Directory
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {filteredCustomers.length} customers found
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#22D3EE]"
            />

            <input
              type="search"
              aria-label="Search customers"
              placeholder="Search name or phone..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-xl border border-white/10 bg-[#080D1F]/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-[#22D3EE]/60 focus:ring-2 focus:ring-[#7C3AED]/20"
            />
          </div>
        </div>

        {}

        {filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-5 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#7C3AED]/20 bg-[#7C3AED]/10">
              <UserRound
                size={34}
                className="text-[#C4B5FD]"
              />
            </div>

            <h3 className="font-semibold text-white">
              No customers found
            </h3>

            <p className="text-sm text-slate-400">
              {search
                ? "Try another name or phone number."
                : "Customers will appear after you add orders."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-white/10 bg-[#7C3AED]/10 text-xs uppercase tracking-wide text-[#C4B5FD]">
                <tr>
                  {[
                    "Customer",
                    "Phone",
                    "Orders",
                    "Delivered",
                    "Delivered Value",
                    "Last Order",
                    "Action",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-4 font-semibold"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.phone}
                    className="border-t border-white/10 text-slate-200 transition-colors duration-300 hover:bg-[#7C3AED]/10"
                  >
                    {}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/20 font-bold text-[#C4B5FD]">
                          {customer.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <span className="font-semibold text-white">
                          {customer.name}
                        </span>
                      </div>
                    </td>

                    {}
                    <td className="px-5 py-4 text-slate-400">
                      {customer.phone}
                    </td>

                    {}
                    <td className="px-5 py-4">
                      <span className="rounded-lg border border-[#7C3AED]/20 bg-[#7C3AED]/10 px-2.5 py-1 font-semibold text-[#C4B5FD]">
                        {customer.orders}
                      </span>
                    </td>

                    {}
                    <td className="px-5 py-4">
                      <span className="font-medium text-emerald-400">
                        {customer.delivered}
                      </span>
                    </td>

                    {}
                    <td className="px-5 py-4 font-semibold text-white">
                      {money(customer.totalSpent)}
                    </td>

                    {}
                    <td className="px-5 py-4 text-slate-400">
                      {customer.lastOrder
                        ? customer.lastOrder.toLocaleDateString()
                        : "—"}
                    </td>

                    {}
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          openWhatsApp(customer)
                        }
                        aria-label={`Open WhatsApp for ${customer.name}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-2 font-semibold text-emerald-400 transition-all duration-300 hover:border-emerald-400/50 hover:bg-emerald-500/25"
                      >
                        <MessageCircle size={17} />
                        WhatsApp
                        <ArrowUpRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {}
        <div className="h-[2px] bg-gradient-to-r from-[#7C3AED]/60 via-[#22D3EE]/40 to-transparent" />
      </motion.section>

      {}

      <div className="flex items-start gap-3 rounded-xl border border-[#22D3EE]/15 bg-[#22D3EE]/5 p-4 text-sm text-slate-400">
        <AlertCircle
          size={18}
          className="mt-0.5 shrink-0 text-[#22D3EE]"
        />

        <p>
          Customers are grouped by phone number.
          Delivered value is calculated from delivered
          orders, not confirmed payments.
        </p>
      </div>
    </div>
  );
}