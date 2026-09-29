import { AlertTriangle, Grid3x3, MessageCircle, Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { AskAi } from '@/features/insights/components/AskAi'
import { BottleneckHeatmap } from '@/features/insights/components/BottleneckHeatmap'
import { InsightCard } from '@/features/insights/components/InsightCard'
import { bottleneckHeatmap } from '@/features/insights/heatmap'
import { useDataStore } from '@/store/useDataStore'

export function InsightsPage() {
  const insights = useDataStore((s) => s.insights)
  const events = useDataStore((s) => s.events)
  const loaded = useDataStore((s) => s.loaded)

  const heatmap = useMemo(() => bottleneckHeatmap(events), [events])
  const alerts = useMemo(
    () => insights.filter((i) => i.severity === 'CRITICAL' || i.severity === 'WARNING'),
    [insights],
  )

  if (!loaded) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-brand-600" />
        <div>
          <h1 className="text-xl font-semibold text-ink">AI Insights</h1>
          <p className="text-sm text-muted">
            Bottleneck detection, anomalies and recommended actions.
          </p>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {alerts.length} active alert{alerts.length === 1 ? '' : 's'}
            </p>
            <p className="text-sm text-amber-700">
              {alerts.map((a) => a.title).join(' · ')}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader
            icon={<Grid3x3 className="h-5 w-5" />}
            title="Bottleneck heatmap"
            description="Average stage time by hour of day."
          />
          <CardBody>
            <BottleneckHeatmap data={heatmap} />
          </CardBody>
        </Card>

        <Card className="flex h-[30rem] flex-col lg:col-span-2">
          <CardHeader
            icon={<MessageCircle className="h-5 w-5" />}
            title="Ask AI"
            description="Try a suggested question."
          />
          <CardBody className="flex min-h-0 flex-1 flex-col">
            <AskAi />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
