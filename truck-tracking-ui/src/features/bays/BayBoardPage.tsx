import { LayoutGrid, Tv, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { BayGrid } from '@/features/bays/components/BayGrid'
import { CallNextPanel } from '@/features/bays/components/CallNextPanel'
import { DisplayBoard } from '@/features/bays/components/DisplayBoard'
import { SmsPreview } from '@/features/bays/components/SmsPreview'
import { api } from '@/services'
import type { CallMode } from '@/services/api'
import { useDataStore } from '@/store/useDataStore'
import { toast } from '@/store/useToastStore'
import { TruckStatus, type Bay, type Token, type Truck } from '@/types'

interface LastCall {
  truck: Truck
  bay: Bay
  token?: Token
}

export function BayBoardPage() {
  const trucks = useDataStore((s) => s.trucks)
  const tokens = useDataStore((s) => s.tokens)
  const bays = useDataStore((s) => s.bays)
  const loaded = useDataStore((s) => s.loaded)
  const refresh = useDataStore((s) => s.refresh)

  const [mode, setMode] = useState<CallMode>('FIFO')
  const [calling, setCalling] = useState(false)
  const [lastCall, setLastCall] = useState<LastCall | null>(null)
  const [displayOpen, setDisplayOpen] = useState(false)

  const queue = useMemo(
    () => trucks.filter((t) => t.status === TruckStatus.IN_YARD_QUEUE),
    [trucks],
  )
  const freeBays = useMemo(() => bays.filter((b) => b.status === 'FREE').length, [bays])
  const occupied = useMemo(
    () => bays.filter((b) => b.status === 'OCCUPIED').length,
    [bays],
  )

  const handleCallNext = async () => {
    setCalling(true)
    try {
      const { truck, bay } = await api.callNextTruck(mode)
      await refresh()
      const token = useDataStore.getState().tokens.find((t) => t.id === truck.tokenId)
      setLastCall({ truck, bay, token })
      toast.success('Truck called', `${truck.regNo} → Bay ${bay.id}`)
    } catch (err) {
      toast.error('Could not call next truck', (err as Error).message)
    } finally {
      setCalling(false)
    }
  }

  if (!loaded) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 lg:col-span-2" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">Bay Control Board</h1>
          <p className="text-sm text-muted">
            {occupied} of {bays.length} bays active · {freeBays} free · {queue.length} waiting
          </p>
        </div>
        <Button
          variant="secondary"
          leftIcon={<Tv className="h-4 w-4" />}
          onClick={() => setDisplayOpen(true)}
        >
          Display board
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            icon={<LayoutGrid className="h-5 w-5" />}
            title="Bays"
            description="Live status, elapsed time and progress for every bay."
          />
          <CardBody>
            <BayGrid bays={bays} trucks={trucks} />
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card className="flex h-[26rem] flex-col">
            <CardHeader
              icon={<Users className="h-5 w-5" />}
              title="Call next"
              description="Choose ordering, then call a truck to a free bay."
            />
            <CardBody className="flex min-h-0 flex-1 flex-col">
              <CallNextPanel
                queue={queue}
                tokens={tokens}
                mode={mode}
                onModeChange={setMode}
                onCallNext={handleCallNext}
                calling={calling}
                freeBays={freeBays}
              />
            </CardBody>
          </Card>

          {lastCall && (
            <SmsPreview truck={lastCall.truck} bay={lastCall.bay} token={lastCall.token} />
          )}
        </div>
      </div>

      {displayOpen && (
        <DisplayBoard bays={bays} trucks={trucks} onClose={() => setDisplayOpen(false)} />
      )}
    </div>
  )
}
