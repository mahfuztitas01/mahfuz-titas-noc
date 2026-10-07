import { useEffect, useRef, useState } from 'react'
import {
  Globe2, Router, Shield, Cable, Antenna, Server, Wifi, Users,
  Pencil, Trash2, Plus, Link2, RotateCcw, Save, Check, Move,
} from 'lucide-react'
import Card from '../components/Card'
import Button from '../components/Button'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import VendorBadge from '../components/VendorBadge'
import DeviceIcon from '../components/DeviceIcon'
import { useClient } from '../context/ClientContext'
import { useToast } from '../components/Toast'
import { CATEGORIES, VENDORS, getVendor, getCategoryIcon } from '../data/vendors'
import { getModel, getPorts, getModelsForVendor, KINDS } from '../data/deviceModels'
import { classes, statusToTone } from '../utils/format'

const NODE_ICONS = {
  internet: Globe2, isp: Globe2, core: Router, fw: Shield, sw: Cable,
  olt: Antenna, servers: Server, ap: Wifi, fttx: Users, pppoe: Users,
}
const NODE_W = 180
const NODE_H = 72
const COL = 250
const ROW = 120

// Cable / link types used to join device → device.
const LINK_TYPES = {
  fiber: { label: 'Fiber', color: '#2563eb', dash: '' },
  ethernet: { label: 'Ethernet', color: '#10b981', dash: '' },
  wireless: { label: 'Wireless', color: '#f59e0b', dash: '5 4' },
  copper: { label: 'Copper', color: '#64748b', dash: '2 3' },
  uplink: { label: 'Uplink', color: '#8b5cf6', dash: '' },
}

function layout(nodes) {
  const tiers = {}
  nodes.forEach((n) => { (tiers[n.tier] = tiers[n.tier] || []).push(n) })
  const pos = {}
  Object.entries(tiers).forEach(([tier, arr]) => {
    arr.forEach((n, i) => { pos[n.id] = { x: 40 + Number(tier) * COL, y: 40 + i * ROW } })
  })
  return pos
}

const cleanNode = (n) => ({ id: n.id, label: n.label, ip: n.ip, status: n.status, tier: n.tier, x: n.x, y: n.y, category: n.category, vendor: n.vendor, model: n.model })
const cleanEdge = (e) => ({ from: e.from, to: e.to, type: e.type || 'ethernet', fromPort: e.fromPort || '', toPort: e.toPort || '' })
const normEdge = (e) => (Array.isArray(e) ? { from: e[0], to: e[1], type: 'ethernet', fromPort: '', toPort: '' } : { from: e.from, to: e.to, type: e.type || 'ethernet', fromPort: e.fromPort || '', toPort: e.toPort || '' })

export default function NetworkMap() {
  const { client, data, saveTopology } = useClient()
  const { push } = useToast()

  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [edit, setEdit] = useState(false)
  const [connectMode, setConnectMode] = useState(false)
  const [connectFrom, setConnectFrom] = useState(null)
  const [dragging, setDragging] = useState(null)
  const [nodeModal, setNodeModal] = useState(null)
  const [form, setForm] = useState({ label: '', ip: '', status: 'online', tier: 5, category: 'Router', vendor: 'mikrotik', model: 'rb4011' })
  const [linkModal, setLinkModal] = useState(null) // { index?, from, to, type }
  const [selected, setSelected] = useState(null)

  const containerRef = useRef(null)
  const nodesRef = useRef(nodes)
  const edgesRef = useRef(edges)
  useEffect(() => { nodesRef.current = nodes }, [nodes])
  useEffect(() => { edgesRef.current = edges }, [edges])

  useEffect(() => {
    const t = data.topology
    const laid = layout(t.nodes)
    setNodes(t.nodes.map((n) => ({ ...n, x: n.x ?? laid[n.id].x, y: n.y ?? laid[n.id].y })))
    setEdges(t.edges.map(normEdge))
    setEdit(false); setConnectMode(false); setConnectFrom(null); setSelected(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client.id])

  const persist = (n = nodesRef.current, e = edgesRef.current) =>
    saveTopology(client.id, { nodes: n.map(cleanNode), edges: e.map(cleanEdge) })

  useEffect(() => {
    if (!dragging) return
    const move = (ev) => {
      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.max(0, ev.clientX - rect.left - dragging.dx)
      const y = Math.max(0, ev.clientY - rect.top - dragging.dy)
      setNodes((prev) => prev.map((n) => (n.id === dragging.id ? { ...n, x, y } : n)))
    }
    const up = () => { persist(); setDragging(null) }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging])

  const startDrag = (ev, n) => {
    if (!edit || connectMode) return
    ev.stopPropagation()
    const rect = containerRef.current.getBoundingClientRect()
    setDragging({ id: n.id, dx: ev.clientX - rect.left - n.x, dy: ev.clientY - rect.top - n.y })
    setSelected(n.id)
  }

  const onNodeClick = (n) => {
    if (!edit) { setSelected(n.id); return }
    if (!connectMode) { setSelected(n.id); return }
    if (!connectFrom) { setConnectFrom(n.id); push('Now click the second device', 'info'); return }
    if (connectFrom === n.id) { setConnectFrom(null); return }
    const exists = edgesRef.current.some((e) => (e.from === connectFrom && e.to === n.id) || (e.from === n.id && e.to === connectFrom))
    if (exists) { push('These devices are already connected', 'warning'); setConnectFrom(null); return }
    setLinkModal({ from: connectFrom, to: n.id, type: 'ethernet', fromPort: getPorts(nodesRef.current.find((x) => x.id === connectFrom)?.model)[0]?.label || '', toPort: getPorts(n.model)[0]?.label || '' })
    setConnectFrom(null)
  }

  const addNode = () => { setForm({ label: '', ip: '', status: 'online', tier: 5, category: 'Router', vendor: 'mikrotik', model: 'rb4011' }); setNodeModal({ mode: 'add' }) }
  const editNode = (n) => { setForm({ label: n.label, ip: n.ip, status: n.status, tier: n.tier, category: n.category || 'Router', vendor: n.vendor || 'generic', model: n.model || '', id: n.id }); setNodeModal({ mode: 'edit' }) }

  const saveNode = () => {
    if (!form.label.trim()) { push('Device name is required', 'error'); return }
    const base = { label: form.label.trim(), ip: form.ip.trim() || '—', status: form.status, tier: Number(form.tier), category: form.category, vendor: form.vendor, model: form.model }
    if (nodeModal.mode === 'add') {
      const next = [...nodesRef.current, { ...base, id: `n${Date.now()}`, x: 60, y: 60 }]
      setNodes(next); persist(next, edgesRef.current); push('Device added', 'success')
    } else {
      const next = nodesRef.current.map((n) => (n.id === form.id ? { ...n, ...base } : n))
      setNodes(next); persist(next, edgesRef.current); push('Device updated', 'success')
    }
    setNodeModal(null)
  }

  const deleteNode = (id) => {
    const nextNodes = nodesRef.current.filter((n) => n.id !== id)
    const nextEdges = edgesRef.current.filter((e) => e.from !== id && e.to !== id)
    setNodes(nextNodes); setEdges(nextEdges); persist(nextNodes, nextEdges)
    setNodeModal(null); setSelected(null); push('Node deleted', 'warning')
  }

  const saveLink = () => {
    const { index, from, to, type, fromPort, toPort } = linkModal
    if (index != null) {
      const next = edgesRef.current.map((e, i) => (i === index ? { ...e, type, fromPort, toPort } : e))
      setEdges(next); persist(nodesRef.current, next); push('Link updated', 'success')
    } else {
      const next = [...edgesRef.current, { from, to, type, fromPort, toPort }]
      setEdges(next); persist(nodesRef.current, next); push(`${LINK_TYPES[type].label} link added (${fromPort || '?'} → ${toPort || '?'})`, 'success')
    }
    setLinkModal(null)
  }

  const deleteLink = (index) => {
    const next = edgesRef.current.filter((_, i) => i !== index)
    setEdges(next); persist(nodesRef.current, next); push('Link removed', 'warning'); setLinkModal(null)
  }

  const resetLayout = () => {
    const laid = layout(data.topology.nodes)
    const fresh = data.topology.nodes.map((n) => ({ ...n, x: laid[n.id].x, y: laid[n.id].y }))
    const freshEdges = data.topology.edges.map(normEdge)
    setNodes(fresh); setEdges(freshEdges); persist(fresh, freshEdges)
    push('Layout reset to default', 'info')
  }

  const maxX = Math.max(600, ...nodes.map((n) => n.x + NODE_W))
  const maxY = Math.max(300, ...nodes.map((n) => n.y + NODE_H))
  const width = maxX + 60
  const height = maxY + 60
  const posOf = (id) => nodes.find((n) => n.id === id)
  const labelOf = (id) => posOf(id)?.label || id

  return (
    <div className="space-y-6">
      <Card
        title={`Network Map — ${client.name}`}
        subtitle={edit ? 'Edit: drag to move · Connect: click 2 devices & pick cable · click a link to edit/remove' : 'Interactive topology — click a device for details'}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {edit && (
              <>
                <Button size="sm" variant="outline" icon={Plus} onClick={addNode}>Add Device</Button>
                <Button size="sm" variant={connectMode ? 'primary' : 'outline'} icon={Link2} onClick={() => { setConnectMode((m) => !m); setConnectFrom(null) }}>
                  {connectMode ? 'Click 2 devices…' : 'Connect Cable'}
                </Button>
                <Button size="sm" variant="outline" icon={RotateCcw} onClick={resetLayout}>Reset</Button>
              </>
            )}
            {edit ? (
              <Button size="sm" variant="secondary" icon={Check} onClick={() => { persist(); setEdit(false); setConnectMode(false); setConnectFrom(null); push('Network map saved', 'success') }}>Done</Button>
            ) : (
              <Button size="sm" variant="outline" icon={Pencil} onClick={() => setEdit(true)}>Edit Map</Button>
            )}
          </div>
        }
      >
        <div className="overflow-auto">
          <div ref={containerRef} className="relative" style={{ width, height, minWidth: width }}>
            <svg className="absolute inset-0" width={width} height={height}>
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                </marker>
              </defs>
              {edges.map((e, i) => {
                const a = posOf(e.from); const b = posOf(e.to)
                if (!a || !b) return null
                const t = LINK_TYPES[e.type] || LINK_TYPES.ethernet
                const x1 = a.x + NODE_W; const y1 = a.y + NODE_H / 2
                const x2 = b.x; const y2 = b.y + NODE_H / 2
                const midX = (x1 + x2) / 2
                const mx = (x1 + x2) / 2; const my = (y1 + y2) / 2
                return (
                  <g key={i}>
                    <path
                      d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                      fill="none" stroke={t.color} strokeWidth={edit ? 3 : 2.5} strokeDasharray={t.dash}
                      className={edit ? '' : 'animate-pulse-line'} opacity="0.85"
                      style={edit ? { pointerEvents: 'stroke', cursor: 'pointer' } : undefined}
                      onClick={() => edit && setLinkModal({ index: i, from: e.from, to: e.to, type: e.type })}
                    />
                    <text x={mx} y={my - 5} textAnchor="middle" fontSize="9" fill={t.color} className="select-none" style={{ pointerEvents: 'none' }}>
                      {t.label}
                    </text>
                    {(e.fromPort || e.toPort) && (
                      <text x={mx} y={my + 6} textAnchor="middle" fontSize="8" fill="#94a3b8" className="select-none" style={{ pointerEvents: 'none' }}>
                        {e.fromPort || '?'} → {e.toPort || '?'}
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>

            {nodes.map((n) => {
              const Icon = getCategoryIcon(n.category)
              const isSel = selected === n.id
              const isConnectFrom = connectFrom === n.id
              return (
                <div
                  key={n.id}
                  style={{ left: n.x, top: n.y, width: NODE_W, height: NODE_H }}
                  className={classes(
                    'absolute flex items-center gap-2 rounded-xl border bg-white px-3 shadow-card transition dark:bg-noc-panel',
                    isConnectFrom ? 'ring-2 ring-brand-500' : isSel ? 'ring-2 ring-brand-400/60' : '',
                    n.status === 'warning' ? 'border-amber-300 dark:border-amber-500/40' : 'border-slate-200 dark:border-noc-border',
                    edit && !connectMode && 'cursor-grab active:cursor-grabbing'
                  )}
                  onPointerDown={(ev) => startDrag(ev, n)}
                  onClick={() => onNodeClick(n)}
                >
                  <DeviceIcon category={n.category} status={n.status} size={40} />
                  {n.vendor && (
                    <span className="absolute -right-1.5 -top-1.5">
                      <VendorBadge vendor={n.vendor} size={18} />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{n.label}</span>
                    <span className="block truncate font-mono text-[10px] text-slate-500 dark:text-slate-400">{n.ip}</span>
                  </span>
                  {edit && !connectMode && (
                    <span className="flex flex-col gap-0.5">
                      <button className="rounded p-0.5 text-slate-400 hover:text-brand-600" onPointerDown={(ev) => ev.stopPropagation()} onClick={(ev) => { ev.stopPropagation(); editNode(n) }} title="Edit"><Pencil className="h-3 w-3" /></button>
                      <button className="rounded p-0.5 text-slate-400 hover:text-red-600" onPointerDown={(ev) => ev.stopPropagation()} onClick={(ev) => { ev.stopPropagation(); deleteNode(n.id) }} title="Delete"><Trash2 className="h-3 w-3" /></button>
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          {Object.entries(LINK_TYPES).map(([k, t]) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-5" style={{ backgroundColor: t.color, borderTop: t.dash ? `2px dashed ${t.color}` : undefined }} />
              {t.label}
            </span>
          ))}
          {edit && <span className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400"><Move className="h-3.5 w-3.5" /> Drag · Connect Cable · click a link to edit/remove</span>}
        </div>
      </Card>

      {/* device details */}
      <Modal open={!!selected && !edit} onClose={() => setSelected(null)} title="Device Details">
        {(() => {
          const n = posOf(selected)
          if (!n) return null
          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{n.label}</div>
                  <div className="font-mono text-xs text-slate-500 dark:text-slate-400">{n.ip}</div>
                </div>
                <StatusBadge tone={statusToTone(n.status)} label={n.status} />
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-noc-panel2"><dt className="text-xs text-slate-500">Tier</dt><dd className="mt-0.5 font-medium text-slate-800 dark:text-slate-100">Level {n.tier}</dd></div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-noc-panel2"><dt className="text-xs text-slate-500">Links</dt><dd className="mt-0.5 font-medium text-slate-800 dark:text-slate-100">{edges.filter((e) => e.from === n.id || e.to === n.id).length}</dd></div>
              </dl>
            </div>
          )
        })()}
      </Modal>

      {/* add/edit device */}
      <Modal
        open={!!nodeModal}
        onClose={() => setNodeModal(null)}
        title={nodeModal?.mode === 'edit' ? 'Edit Device' : 'Add Device'}
        footer={
          <>
            {nodeModal?.mode === 'edit' && <Button variant="danger" icon={Trash2} onClick={() => deleteNode(form.id)}>Delete</Button>}
            <Button variant="outline" onClick={() => setNodeModal(null)}>Cancel</Button>
            <Button icon={Save} onClick={saveNode}>{nodeModal?.mode === 'edit' ? 'Save' : 'Add'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="noc-label">Device name</label>
            <input className="noc-input" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="CORE-RT-1" />
          </div>
          <div>
            <label className="noc-label">IP address</label>
            <input className="noc-input font-mono" value={form.ip} onChange={(e) => setForm({ ...form, ip: e.target.value })} placeholder="172.17.55.1" />
          </div>
          <div>
            <label className="noc-label">Status</label>
            <select className="noc-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {['online', 'warning', 'offline'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="noc-label">Category</label>
            <select className="noc-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="noc-label">Vendor</label>
            <select className="noc-input" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value, model: getModelsForVendor(e.target.value)[0]?.id || '' })}>
              {VENDORS.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label className="noc-label">Model (ports source)</label>
            <select className="noc-input" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })}>
              <option value="">— none —</option>
              {getModelsForVendor(form.vendor).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            {form.model && <p className="mt-1 text-[10px] text-slate-400">{getPorts(form.model).length} ports · {getPorts(form.model).slice(0, 6).map((p) => p.label).join(', ')}{getPorts(form.model).length > 6 ? '…' : ''}</p>}
          </div>
          <div>
            <label className="noc-label">Tier (column)</label>
            <input type="number" className="noc-input" value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} />
          </div>
        </div>
      </Modal>

      {/* cable / link modal */}
      <Modal
        open={!!linkModal}
        onClose={() => setLinkModal(null)}
        title={linkModal?.index != null ? 'Edit Link' : 'New Cable Connection'}
        footer={
          <>
            {linkModal?.index != null && <Button variant="danger" icon={Trash2} onClick={() => deleteLink(linkModal.index)}>Remove Link</Button>}
            <Button variant="outline" onClick={() => setLinkModal(null)}>Cancel</Button>
            <Button icon={Save} onClick={saveLink}>{linkModal?.index != null ? 'Save' : 'Connect'}</Button>
          </>
        }
      >
        {linkModal && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 rounded-lg bg-slate-50 p-3 text-sm dark:bg-noc-panel2">
              <span className="font-medium text-slate-700 dark:text-slate-200">{labelOf(linkModal.from)}</span>
              <Link2 className="h-4 w-4 text-brand-600" />
              <span className="font-medium text-slate-700 dark:text-slate-200">{labelOf(linkModal.to)}</span>
            </div>
            <div>
              <label className="noc-label">Cable / link type</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Object.entries(LINK_TYPES).map(([k, t]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setLinkModal({ ...linkModal, type: k })}
                    className={classes(
                      'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition',
                      linkModal.type === k ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 hover:bg-slate-50 dark:border-noc-border dark:hover:bg-noc-panel2'
                    )}
                  >
                    <span className="inline-block h-0.5 w-5" style={{ backgroundColor: t.color, borderTop: t.dash ? `2px dashed ${t.color}` : undefined }} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="noc-label">{labelOf(linkModal.from)} — port</label>
                <select className="noc-input" value={linkModal.fromPort} onChange={(e) => setLinkModal({ ...linkModal, fromPort: e.target.value })}>
                  <option value="">(no port)</option>
                  {getPorts(posOf(linkModal.from)?.model).map((p) => (
                    <option key={p.label} value={p.label}>{p.label} · {KINDS[p.kind]?.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-[10px] text-slate-400">{getModel(posOf(linkModal.from)?.model)?.name || 'unknown model'}</p>
              </div>
              <div>
                <label className="noc-label">{labelOf(linkModal.to)} — port</label>
                <select className="noc-input" value={linkModal.toPort} onChange={(e) => setLinkModal({ ...linkModal, toPort: e.target.value })}>
                  <option value="">(no port)</option>
                  {getPorts(posOf(linkModal.to)?.model).map((p) => (
                    <option key={p.label} value={p.label}>{p.label} · {KINDS[p.kind]?.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-[10px] text-slate-400">{getModel(posOf(linkModal.to)?.model)?.name || 'unknown model'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
