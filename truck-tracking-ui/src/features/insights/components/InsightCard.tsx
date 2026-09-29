import { AlertTriangle, Lightbulb, TrendingUp, Zap } from 'lucide-react'
import type { ComponentType } from 'react'
import { Badge } from '@/components/Badge'
import { Card } from '@/components/ui/Card'
import type { Insight, InsightKind } from '@/types'
import { SEVERITY_META } from '@/utils/constants'

const KIND_META: Record<
  InsightKind,
  { label: string; icon: ComponentType<{ className?: string }> }
> = {
  BOTTLENECK: { label: 'Bottleneck', icon: Zap },
  ANOMALY: { label: 'Anomaly', icon: AlertTriangle },
  PREDICTION: { label: 'Prediction', icon: TrendingUp },
  RECOMMENDATION: { label: 'Recommendation', icon: Lightbulb },
}

export function InsightCard({ insight }: { insight: Insight }) {
  const { icon: Icon, label } = KIND_META[insight.kind]
  const severity = SEVERITY_META[insight.severity]

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${severity.hex}1a`, color: severity.hex }}
          >
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-xs font-medium text-muted">{label}</span>
        </div>
        <Badge className={severity.badge}>{severity.label}</Badge>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-ink">{insight.title}</h3>
        <p className="mt-1 text-sm text-muted">{insight.detail}</p>
      </div>

      {insight.recommendation && (
        <div className="mt-auto flex items-start gap-2 rounded-lg bg-slate-50 p-2.5">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-xs text-slate-600">{insight.recommendation}</p>
        </div>
      )}
    </Card>
  )
}
