import { RotateCcw, Search, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DocumentChecklist } from '@/features/gate/components/DocumentChecklist'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import type { GateEntryInput } from '@/services/api'
import type { Priority, Truck, TruckDocument, TruckType } from '@/types'
import { DOCUMENT_KINDS, MATERIALS } from '@/utils/constants'

interface GateEntryFormProps {
  expectedTrucks: Truck[]
  submitting: boolean
  onSubmit: (input: GateEntryInput) => void
}

interface FormState {
  existingTruckId?: string
  regNo: string
  transporter: string
  driverName: string
  driverPhone: string
  driverLicense: string
  type: TruckType
  material: string
  priority: Priority
  documents: TruckDocument[]
}

const emptyDocuments = (): TruckDocument[] =>
  DOCUMENT_KINDS.map((kind) => ({ kind, status: 'PENDING' }))

const INITIAL: FormState = {
  regNo: '',
  transporter: '',
  driverName: '',
  driverPhone: '',
  driverLicense: '',
  type: 'INBOUND',
  material: MATERIALS[0],
  priority: 'NORMAL',
  documents: emptyDocuments(),
}

export function GateEntryForm({ expectedTrucks, submitting, onSubmit }: GateEntryFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [touched, setTouched] = useState(false)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.regNo.trim()) e.regNo = 'Truck number is required'
    if (!form.driverName.trim()) e.driverName = 'Driver name is required'
    if (!form.driverPhone.trim()) e.driverPhone = 'Driver phone is required'
    return e
  }, [form])

  const pendingDocs = form.documents.some((d) => d.status === 'PENDING')
  const anyRejected = form.documents.some((d) => d.status === 'REJECTED')
  const isValid = Object.keys(errors).length === 0 && !pendingDocs

  const applyPreRegistered = (id: string) => {
    if (!id) {
      setForm(INITIAL)
      return
    }
    const truck = expectedTrucks.find((t) => t.id === id)
    if (!truck) return
    setForm({
      existingTruckId: truck.id,
      regNo: truck.regNo,
      transporter: truck.transporter,
      driverName: truck.driver.name,
      driverPhone: truck.driver.phone,
      driverLicense: truck.driver.license,
      type: truck.type,
      material: truck.material,
      priority: truck.priority,
      documents: emptyDocuments(),
    })
  }

  const handleSubmit = () => {
    setTouched(true)
    if (!isValid) return
    onSubmit({
      existingTruckId: form.existingTruckId,
      regNo: form.regNo.trim().toUpperCase(),
      transporter: form.transporter.trim() || 'Unregistered Transporter',
      driver: {
        name: form.driverName.trim(),
        phone: form.driverPhone.trim(),
        license: form.driverLicense.trim() || 'N/A',
      },
      type: form.type,
      material: form.material,
      priority: form.priority,
      documents: form.documents,
    })
    setForm(INITIAL)
    setTouched(false)
  }

  return (
    <div className="space-y-5">
      <Field label="Pre-registered truck lookup" htmlFor="prereg">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Select
            className="pl-9"
            value={form.existingTruckId ?? ''}
            onChange={(e) => applyPreRegistered(e.target.value)}
            options={[
              { value: '', label: 'New / walk-in truck' },
              ...expectedTrucks.map((t) => ({
                value: t.id,
                label: `${t.regNo} · ${t.transporter}`,
              })),
            ]}
          />
        </div>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Truck number" required error={touched ? errors.regNo : undefined}>
          <Input
            value={form.regNo}
            onChange={(e) => set('regNo', e.target.value)}
            placeholder="TN 09 AB 1234"
          />
        </Field>
        <Field label="Transporter">
          <Input
            value={form.transporter}
            onChange={(e) => set('transporter', e.target.value)}
            placeholder="Transporter name"
          />
        </Field>
        <Field label="Driver name" required error={touched ? errors.driverName : undefined}>
          <Input
            value={form.driverName}
            onChange={(e) => set('driverName', e.target.value)}
            placeholder="Full name"
          />
        </Field>
        <Field label="Driver phone" required error={touched ? errors.driverPhone : undefined}>
          <Input
            value={form.driverPhone}
            onChange={(e) => set('driverPhone', e.target.value)}
            placeholder="+91 98765 43210"
          />
        </Field>
        <Field label="Driver license">
          <Input
            value={form.driverLicense}
            onChange={(e) => set('driverLicense', e.target.value)}
            placeholder="DL number"
          />
        </Field>
        <Field label="Material">
          <Select
            value={form.material}
            onChange={(e) => set('material', e.target.value)}
            options={MATERIALS.map((m) => ({ value: m, label: m }))}
          />
        </Field>
        <Field label="Movement type">
          <Select
            value={form.type}
            onChange={(e) => set('type', e.target.value as TruckType)}
            options={[
              { value: 'INBOUND', label: 'Inbound' },
              { value: 'OUTBOUND', label: 'Outbound' },
            ]}
          />
        </Field>
        <Field label="Priority">
          <Select
            value={form.priority}
            onChange={(e) => set('priority', e.target.value as Priority)}
            options={[
              { value: 'NORMAL', label: 'Normal' },
              { value: 'HIGH', label: 'High' },
            ]}
          />
        </Field>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-slate-600">Document checklist</p>
        <DocumentChecklist
          documents={form.documents}
          onChange={(documents) => set('documents', documents)}
        />
        {touched && pendingDocs && (
          <p className="mt-1.5 text-xs text-amber-600">
            Verify or reject every document before approving.
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          className="flex-1"
          variant={anyRejected ? 'danger' : 'success'}
          leftIcon={<ShieldCheck className="h-4 w-4" />}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {anyRejected ? 'Gate-in & put on hold' : 'Approve & generate QR'}
        </Button>
        <Button
          variant="secondary"
          leftIcon={<RotateCcw className="h-4 w-4" />}
          onClick={() => {
            setForm(INITIAL)
            setTouched(false)
          }}
        >
          Clear
        </Button>
      </div>
    </div>
  )
}
