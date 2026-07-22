"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
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

/** Recharts wrappers themed for the dark volt UI. */

const AXIS = { stroke: "#71717a", fontSize: 12 };
const GRID = "rgba(255,255,255,0.06)";
const VOLT = "#c8f43a";
const EMBER = "#ff6a3d";
const SKY = "#38bdf8";

function ChartTooltip({
  active,
  payload,
  label,
  prefix = "",
}: {
  active?: boolean;
  payload?: { name: string; value: number; color?: string }[];
  label?: string;
  prefix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm shadow-xl">
      <div className="mb-1 font-semibold">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-muted">
          <span
            className="inline-block size-2 rounded-full"
            style={{ background: p.color ?? VOLT }}
          />
          {p.name}: {prefix}
          {Number(p.value).toLocaleString("en-IN")}
        </div>
      ))}
    </div>
  );
}

export function RevenueChart({
  data,
}: {
  data: { month: string; revenue: number; expenses: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={VOLT} stopOpacity={0.35} />
            <stop offset="100%" stopColor={VOLT} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={EMBER} stopOpacity={0.3} />
            <stop offset="100%" stopColor={EMBER} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={70} />
        <Tooltip content={<ChartTooltip prefix="₹" />} />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke={VOLT}
          strokeWidth={2}
          fill="url(#revGrad)"
        />
        <Area
          type="monotone"
          dataKey="expenses"
          name="Expenses"
          stroke={EMBER}
          strokeWidth={2}
          fill="url(#expGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MembersChart({
  data,
}: {
  data: { month: string; joined: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} width={40} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey="joined" name="New members" fill={VOLT} radius={[6, 6, 0, 0]} maxBarSize={44} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const PIE_COLORS = [VOLT, SKY, EMBER, "#a78bfa", "#f472b6", "#facc15"];

export function PlanMixChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Tooltip content={<ChartTooltip />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={4}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
