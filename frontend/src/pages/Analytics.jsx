import { useMemo } from "react";
import {
  motion,
  useReducedMotion,
} from "motion/react";

import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  Sparkles,
  Activity,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const STATUS_COLORS = {
  New: "#22D3EE",
  Confirmed: "#7C3AED",
  Preparing: "#F59E0B",
  Ready: "#A78BFA",
  Delivered: "#10B981",
  Cancelled: "#F87171",
};

const FALLBACK_COLORS = [
  "#22D3EE",
  "#7C3AED",
  "#F59E0B",
  "#10B981",
  "#F87171",
  "#A78BFA",
];

const money = (value) =>
  `${Number(value || 0).toFixed(2)} MAD`;

const panelClass =
  "overflow-hidden rounded-[24px] border border-[#22D3EE]/15 bg-[#10182D]/90 p-5 shadow-[0_15px_50px_rgba(0,0,0,0.2)] backdrop-blur-2xl transition-colors duration-300 hover:border-[#7C3AED]/35 sm:p-6";

const tooltipStyle = {
  backgroundColor: "#10182D",
  border: "1px solid rgba(124,58,237,0.4)",
  borderRadius: "12px",
  color: "#F8FAFC",
  boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
};

export default function Analytics({ orders = [] }) {
  const reduceMotion = useReducedMotion();

  const analytics = useMemo(() => {
    const delivered = orders.filter(
      (order) => order.status === "Delivered"
    );

    const revenue = delivered.reduce(
      (sum, order) =>
        sum + Number(order.total || 0),
      0
    );

    const statusCounts = orders.reduce(
      (acc, order) => {
        const status = order.status || "New";

        acc[status] = (acc[status] || 0) + 1;

        return acc;
      },
      {}
    );

    const statusData = Object.entries(
      statusCounts
    ).map(([name, value]) => ({
      name,
      value,
    }));

    const monthlyMap = new Map();

    for (const order of delivered) {
      const date = new Date(order.created_at);

      if (Number.isNaN(date.getTime())) {
        continue;
      }

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      monthlyMap.set(
        key,
        (monthlyMap.get(key) || 0) +
          Number(order.total || 0)
      );
    }

    const monthlyData = [
      ...monthlyMap.entries(),
    ]
      .sort(([a], [b]) =>
        a.localeCompare(b)
      )
      .map(([month, total]) => ({
        month,
        revenue: Number(total.toFixed(2)),
      }));

    return {
      revenue,
      delivered: delivered.length,
      total: orders.length,
      average:
        delivered.length > 0
          ? revenue / delivered.length
          : 0,
      statusData,
      monthlyData,
    };
  }, [orders]);

  const cards = [
    {
      title: "Total Orders",
      value: analytics.total,
      icon: ShoppingBag,
      accent: "#22D3EE",
    },
    {
      title: "Delivered Orders",
      value: analytics.delivered,
      icon: CheckCircle2,
      accent: "#10B981",
    },
    {
      title: "Delivered Revenue",
      value: money(analytics.revenue),
      icon: TrendingUp,
      accent: "#7C3AED",
    },
    {
      title: "Average Delivered Order",
      value: money(analytics.average),
      icon: BarChart3,
      accent: "#A78BFA",
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
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2">
          <Sparkles
            size={16}
            className="text-[#22D3EE]"
          />

          <p className="text-sm font-medium text-[#22D3EE]">
            Business Intelligence
          </p>
        </div>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          Analytics Overview
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Monitor order performance and delivered revenue.
        </p>
      </motion.div>

      {}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.title}
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, y: 22 }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
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
              className="group relative overflow-hidden rounded-[24px] border border-[#22D3EE]/15 bg-[#10182D]/85 p-5 shadow-[0_12px_35px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-colors duration-300 hover:border-[#7C3AED]/50"
            >
              {}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-20 blur-3xl"
                style={{
                  backgroundColor: card.accent,
                }}
              />

              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-400">
                    {card.title}
                  </p>

                  <motion.h2
                    key={String(card.value)}
                    initial={
                      reduceMotion
                        ? false
                        : { opacity: 0, y: 10 }
                    }
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.35,
                    }}
                    className="mt-4 break-words text-2xl font-bold tracking-tight text-white xl:text-3xl"
                  >
                    {card.value}
                  </motion.h2>
                </div>

                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5"
                  style={{
                    color: card.accent,
                  }}
                >
                  <Icon size={23} />
                </div>
              </div>

              {}
              <div className="mt-7 h-[3px] overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={
                    reduceMotion
                      ? false
                      : { scaleX: 0 }
                  }
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: 0.9,
                    delay: 0.15,
                  }}
                  style={{
                    transformOrigin: "left",
                    background: `linear-gradient(90deg, ${card.accent}, #7C3AED)`,
                  }}
                  className="h-full w-full rounded-full"
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {}

      <div className="grid gap-6 xl:grid-cols-2">
        {}

        <motion.section
          initial={
            reduceMotion
              ? false
              : { opacity: 0, y: 24 }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.15,
          }}
          className={panelClass}
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                Monthly Delivered Revenue
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Revenue from delivered orders
              </p>
            </div>

            <div className="rounded-xl border border-[#22D3EE]/20 bg-[#22D3EE]/10 p-2.5 text-[#22D3EE]">
              <TrendingUp size={21} />
            </div>
          </div>

          {analytics.monthlyData.length === 0 ? (
            <div className="flex h-72 flex-col items-center justify-center gap-3 text-center text-sm text-slate-400">
              <BarChart3
                size={38}
                className="text-[#7C3AED]/50"
              />

              No delivered orders to display yet.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={analytics.monthlyData}
                  margin={{
                    top: 10,
                    right: 8,
                    left: -10,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="quantumRevenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#22D3EE"
                      />
                      <stop
                        offset="100%"
                        stopColor="#7C3AED"
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 5"
                    vertical={false}
                    stroke="#334155"
                    opacity={0.5}
                  />

                  <XAxis
                    dataKey="month"
                    tick={{
                      fill: "#94A3B8",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={12}
                  />

                  <YAxis
                    width={65}
                    tick={{
                      fill: "#94A3B8",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      Number(value).toLocaleString()
                    }
                  />

                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{
                      fill: "rgba(124,58,237,0.10)",
                    }}
                    formatter={(value) => [
                      money(value),
                      "Delivered Revenue",
                    ]}
                  />

                  <Bar
                    dataKey="revenue"
                    name="Delivered Revenue"
                    fill="url(#quantumRevenueGradient)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={55}
                    isAnimationActive={!reduceMotion}
                    animationDuration={900}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-5 h-[2px] bg-gradient-to-r from-[#7C3AED]/60 via-[#22D3EE]/40 to-transparent" />
        </motion.section>

        {}
        <motion.section
          initial={
            reduceMotion
              ? false
              : { opacity: 0, y: 24 }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.22,
          }}
          className={panelClass}
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                Orders by Status
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Distribution of all order statuses
              </p>
            </div>

            <div className="rounded-xl border border-[#7C3AED]/30 bg-[#7C3AED]/15 p-2.5 text-[#C4B5FD]">
              <Activity size={21} />
            </div>
          </div>

          {analytics.statusData.length === 0 ? (
            <div className="flex h-72 flex-col items-center justify-center gap-3 text-center text-sm text-slate-400">
              <ShoppingBag
                size={38}
                className="text-[#7C3AED]/50"
              />

              No orders available yet.
            </div>
          ) : (
            <>
              <div className="relative h-64 w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={analytics.statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      stroke="#10182D"
                      strokeWidth={2}
                      isAnimationActive={!reduceMotion}
                      animationDuration={900}
                    >
                      {analytics.statusData.map(
                        (entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={
                              STATUS_COLORS[
                                entry.name
                              ] ||
                              FALLBACK_COLORS[
                                index %
                                  FALLBACK_COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      contentStyle={tooltipStyle}
                      itemStyle={{
                        color: "#F8FAFC",
                      }}
                      formatter={(value) => [
                        value,
                        "Orders",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {analytics.total}
                  </span>

                  <span className="text-xs text-slate-400">
                    Total Orders
                  </span>
                </div>
              </div>

              {}
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-3">
                {analytics.statusData.map(
                  (entry, index) => (
                    <div
                      key={entry.name}
                      className="flex items-center gap-2 text-sm text-slate-300"
                    >
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            STATUS_COLORS[
                              entry.name
                            ] ||
                            FALLBACK_COLORS[
                              index %
                                FALLBACK_COLORS.length
                            ],
                        }}
                      />

                      <span>
                        {entry.name}:{" "}
                        <strong className="font-semibold text-white">
                          {entry.value}
                        </strong>
                      </span>
                    </div>
                  )
                )}
              </div>
            </>
          )}

          <div className="mt-5 h-[2px] bg-gradient-to-r from-[#7C3AED]/60 via-[#22D3EE]/40 to-transparent" />
        </motion.section>
      </div>
    </div>
  );
}