import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { EmptyState } from '@/components/ui/EmptyState'

export interface TransporterTatPoint {
  name: string
  tat: number
}

const AXIS = { fontSize: 12, fill: '#64748b' }

/** Average TAT per transporter (horizontal bars). */
export function TransporterTatChart({ data }: { data: TransporterTatPoint[] }) {
  if (data.length === 0) return <EmptyState title="No data for these filters" />
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 34)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 16, bottom: 0, left: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
        <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} unit="m" />
        <YAxis
          type="category"
          dataKey="name"
          tick={AXIS}
          axisLine={false}
          tickLine={false}
          width={120}
        />
        <Tooltip cursor={{ fill: '#f1f5f9' }} formatter={(v) => `${v} min`} />
        <Bar dataKey="tat" name="Avg TAT" fill="#1f47f5" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
