import { useState } from 'react'
import { FileText, FileSpreadsheet, FileDown, Calendar, BarChart3, CheckCircle2 } from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import { reports } from '../data/mockData'
import { useToast } from '../components/Toast'

export default function Reports() {
  const { push } = useToast()
  const [from, setFrom] = useState('2026-09-01')
  const [to, setTo] = useState('2026-09-30')
  const [selected, setSelected] = useState(reports[0])
  const [generated, setGenerated] = useState(false)

  const generate = () => {
    setGenerated(true)
    push(`Generated "${selected}" for ${from} → ${to}`, 'success')
  }

  return (
    <div className="space-y-6">
      <Card title="Report Parameters" subtitle="Select report type and date range">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="noc-label">Report Type</label>
            <select className="noc-input" value={selected} onChange={(e) => setSelected(e.target.value)}>
              {reports.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="noc-label">From</label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="date" className="noc-input pl-9" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="noc-label">To</label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="date" className="noc-input pl-9" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button icon={BarChart3} onClick={generate}>Generate Report</Button>
          <Button variant="outline" icon={FileDown} disabled={!generated} onClick={() => push('Exported report as PDF', 'success')}>Export PDF</Button>
          <Button variant="outline" icon={FileSpreadsheet} disabled={!generated} onClick={() => push('Exported report as CSV', 'success')}>Export CSV</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {reports.map((r) => (
          <Card key={r} className="cursor-pointer" >
            <div onClick={() => { setSelected(r); setGenerated(false) }} className="flex items-start gap-3">
              <span className="rounded-lg bg-brand-50 p-2 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"><FileText className="h-4 w-4" /></span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{r}</h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {selected === r && generated ? 'Generated' : 'Ready to generate'}
                </p>
              </div>
              {selected === r && generated && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
