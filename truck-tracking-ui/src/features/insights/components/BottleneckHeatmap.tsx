import { EmptyState } from '@/components/ui/EmptyState'
import { HEATMAP_STAGES, type HeatmapData } from '@/features/insights/heatmap'
import { cn } from '@/utils/cn'

interface BottleneckHeatmapProps {
  data: HeatmapData
}

/** Stage × hour heatmap — darker cells mean longer average stage times. */
export function BottleneckHeatmap({ data }: BottleneckHeatmapProps) {
  if (data.hours.length === 0) {
    return <EmptyState title="No stage data yet" />
  }

  const intensity = (value: number) => (data.max > 0 ? value / data.max : 0)

  return (
    <div className="overflow-x-auto">
      <table className="border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="w-16" />
            {data.hours.map((h) => (
              <th key={h} className="px-1 text-center text-[11px] font-medium text-muted">
                {String(h).padStart(2, '0')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HEATMAP_STAGES.map((stage, r) => (
            <tr key={stage}>
              <td className="pr-2 text-right text-xs font-medium text-slate-600">{stage}</td>
              {data.hours.map((h, c) => {
                const value = data.cells[r][c]
                const t = intensity(value)
                return (
                  <td key={h}>
                    <div
                      title={`${stage} · ${String(h).padStart(2, '0')}:00 · ${value} min`}
                      className={cn(
                        'flex h-8 w-9 items-center justify-center rounded text-[11px] font-medium',
                        t > 0.55 ? 'text-white' : 'text-slate-600',
                      )}
                      style={{
                        backgroundColor:
                          value === 0 ? '#f1f5f9' : `rgba(31, 71, 245, ${0.15 + t * 0.85})`,
                      }}
                    >
                      {value || ''}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-muted">Cell value = average stage time (minutes).</p>
    </div>
  )
}
