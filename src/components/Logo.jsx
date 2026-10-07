import { BRAND } from '../config/branding'
import { classes } from '../utils/format'

/**
 * Mahfuz Titas NOC logo — network nodes + connection lines + traffic pulse.
 * Original mark (not copied from any reference).
 */
export function LogoMark({ size = 36, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role="img"
      aria-label={`${BRAND.name} logo`}
    >
      <rect width="64" height="64" rx="14" className="fill-brand-600" />
      <path
        d="M12 40 L24 22 L34 34 L44 16 L54 30"
        className="stroke-white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="40" r="4.5" className="fill-white" />
      <circle cx="24" cy="22" r="4.5" className="fill-brand-200" />
      <circle cx="34" cy="34" r="4.5" className="fill-white" />
      <circle cx="44" cy="16" r="4.5" className="fill-brand-200" />
      <circle cx="54" cy="30" r="4.5" className="fill-white" />
      <rect x="16" y="46" width="32" height="6" rx="3" className="fill-brand-300" />
    </svg>
  )
}

export default function Logo({ size = 36, showText = true, showTagline = false, className }) {
  return (
    <div className={classes('flex items-center gap-3', className)}>
      <LogoMark size={size} />
      {showText && (
        <div className="leading-tight">
          <div className="font-extrabold tracking-tight text-slate-900 dark:text-white">
            MAHFUZ TITAS <span className="text-brand-600 dark:text-brand-400">NOC</span>
          </div>
          {showTagline ? (
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {BRAND.subtitle}
            </div>
          ) : (
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {BRAND.statement}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
