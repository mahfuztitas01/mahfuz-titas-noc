import { getVendor } from '../data/vendors'
import { classes } from '../utils/format'

/**
 * Vendor badge — OUR OWN monogram mark (brand colour + 2-letter short).
 * This is intentionally not a copy of any vendor's official logo.
 */
export default function VendorBadge({ vendor, size = 28, showName = false, className }) {
  const v = getVendor(vendor)
  return (
    <span className={classes('inline-flex items-center gap-1.5', className)} title={v.name}>
      <span
        className="flex shrink-0 items-center justify-center rounded-md font-bold text-white shadow-sm"
        style={{ backgroundColor: v.color, width: size, height: size, fontSize: Math.round(size * 0.36) }}
      >
        {v.short}
      </span>
      {showName && <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{v.name}</span>}
    </span>
  )
}
