'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import type { PollOption, DailyVoteData } from '@/lib/data-service';

// ─── Midnight Premium Colors ───
const COLORS = {
  pistachio: '#4ade80',
  coldBoost: '#facc15',
  coldCoffee: '#a1a1aa',
  grid: 'rgba(255, 255, 255, 0.05)',
  axis: '#71717a',
  tooltipBg: '#0a0a0a',
  tooltipBorder: 'rgba(255, 255, 255, 0.1)',
};

const PIE_COLORS = ['#4ade80', '#facc15', '#a1a1aa'];

// ─── Custom Tooltip ───
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div
      className="px-4 py-3 rounded-lg text-sm"
      style={{
        background: COLORS.tooltipBg,
        border: `1px solid ${COLORS.tooltipBorder}`,
        boxShadow: '0 8px 30px rgba(0,0,0,0.8)',
      }}
    >
      <p className="text-text-secondary mb-2 font-medium">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="font-semibold flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color, boxShadow: `0 0 8px ${entry.color}` }} />
          <span className="text-white">{entry.name}: <strong>{entry.value}</strong></span>
        </p>
      ))}
    </div>
  );
}

// ─── Vote Distribution Bar Chart ───
export function VoteBarChart({ options }: { options: PollOption[] }) {
  const data = options.map((o) => ({ name: o.label, votes: o.voteCount }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} barCategoryGap="40%">
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
        <XAxis dataKey="name" tick={{ fill: COLORS.axis, fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
        <YAxis tick={{ fill: COLORS.axis, fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
        <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Vote Share Pie Chart ───
export function VotePieChart({ options }: { options: PollOption[] }) {
  const data = options.map((o) => ({ name: o.label, value: o.voteCount }));
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          stroke="#111111"
          strokeWidth={2}
          label={({ name, value }) => `${name} (${Math.round((value / total) * 100)}%)`}
          labelLine={{ stroke: COLORS.axis, strokeWidth: 1 }}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Daily Trend Area Chart ───
export function TrendLineChart({ dailyData }: { dailyData: DailyVoteData[] }) {
  const formattedData = dailyData.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={formattedData}>
        <defs>
          <linearGradient id="gradP" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.pistachio} stopOpacity={0.2} />
            <stop offset="100%" stopColor={COLORS.pistachio} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.coldBoost} stopOpacity={0.2} />
            <stop offset="100%" stopColor={COLORS.coldBoost} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradC" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.coldCoffee} stopOpacity={0.2} />
            <stop offset="100%" stopColor={COLORS.coldCoffee} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
        <XAxis dataKey="date" tick={{ fill: COLORS.axis, fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
        <YAxis tick={{ fill: COLORS.axis, fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, color: COLORS.axis, paddingTop: '20px' }} iconType="circle" />
        <Area type="monotone" dataKey="pistachio" name="Pistachio Milk" stroke={COLORS.pistachio} fill="url(#gradP)" strokeWidth={2} dot={{ r: 3, fill: '#000', stroke: COLORS.pistachio, strokeWidth: 2 }} activeDot={{ r: 5, fill: COLORS.pistachio, stroke: '#000' }} />
        <Area type="monotone" dataKey="coldBoost" name="Cold Boost" stroke={COLORS.coldBoost} fill="url(#gradB)" strokeWidth={2} dot={{ r: 3, fill: '#000', stroke: COLORS.coldBoost, strokeWidth: 2 }} activeDot={{ r: 5, fill: COLORS.coldBoost, stroke: '#000' }} />
        <Area type="monotone" dataKey="coldCoffee" name="Cold Coffee" stroke={COLORS.coldCoffee} fill="url(#gradC)" strokeWidth={2} dot={{ r: 3, fill: '#000', stroke: COLORS.coldCoffee, strokeWidth: 2 }} activeDot={{ r: 5, fill: COLORS.coldCoffee, stroke: '#000' }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Hourly Distribution Chart ───
export function HourlyChart({ data }: { data: { hour: number; votes: number }[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: `${d.hour.toString().padStart(2, '0')}:00`,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: COLORS.axis, fontSize: 10 }} axisLine={false} tickLine={false} interval={2} dy={10} />
        <YAxis tick={{ fill: COLORS.axis, fontSize: 11 }} axisLine={false} tickLine={false} dx={-10} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
        <Bar dataKey="votes" name="Votes" fill="#ffffff" radius={[2, 2, 0, 0]} opacity={0.8} />
      </BarChart>
    </ResponsiveContainer>
  );
}
