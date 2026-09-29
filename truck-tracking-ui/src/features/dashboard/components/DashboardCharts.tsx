import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type {
  BayUtilPoint,
  HourlyPoint,
  SplitPoint,
  StageSegment,
  TrendPoint,
} from '@/features/dashboard/metrics'
import { EmptyState } from '@/components/ui/EmptyState'

const AXIS = { fontSize: 12, fill: '#64748b' }
const GRID = '#e2e8f0'

const STAGE_SERIES = [
  { key: 'gateSecurity', label: 'Gate & Security', color: '#6366f1' },
  { key: 'docs', label: 'Docs', color: '#8b5cf6' },
  { key: 'yard', label: 'Yard wait', color: '#f59e0b' },
  { key: 'bay', label: 'Bay', color: '#06b6d4' },
  { key: 'exit', label: 'Exit', color: '#84cc16' },
] as const

const SPLIT_COLORS = ['#1f47f5', '#06b6d4']

export function InflowChart({ data }: { data: HourlyPoint[] }) {
  if (data.length === 0) return <EmptyState title="No inflow data" />
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="hour" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip cursor={{ fill: '#f1f5f9' }} />
        <Bar dataKey="trucks" name="Trucks" fill="#1f47f5" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function TatByStageChart({ data }: { data: StageSegment[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 8, right: 16, bottom: 0, left: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
        <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} unit="m" />
        <YAxis type="category" dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: '#f1f5f9' }} formatter={(v) => `${v} min`} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {STAGE_SERIES.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} stackId="tat" fill={s.color} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

export function BayUtilizationChart({ data }: { data: BayUtilPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="bay" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
        <Tooltip cursor={{ fill: '#f1f5f9' }} formatter={(v) => `${v}%`} />
        <Bar dataKey="utilization" name="Utilization" fill="#14b8a6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function TatTrendChart({ data }: { data: TrendPoint[] }) {
  if (data.length === 0) return <EmptyState title="No trend data" />
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="date" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} unit="m" />
        <Tooltip formatter={(v) => `${v} min`} />
        <Line
          type="monotone"
          dataKey="tat"
          name="Avg TAT"
          stroke="#1f47f5"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function InOutSplitChart({ data }: { data: SplitPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
        >
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={SPLIT_COLORS[i % SPLIT_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
