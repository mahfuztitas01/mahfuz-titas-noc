import { BRAND } from '../config/branding'
import { LogoMark } from '../components/Logo'

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-noc-bg">
      {/* Brand side */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/10 p-1">
            <LogoMark size={40} />
          </div>
          <div>
            <div className="text-lg font-extrabold tracking-tight">MAHFUZ TITAS NOC</div>
            <div className="text-xs text-white/70">{BRAND.subtitle}</div>
          </div>
        </div>

        <div>
          <h2 className="max-w-md text-4xl font-extrabold leading-tight">{BRAND.tagline}</h2>
          <p className="mt-4 max-w-md text-sm text-white/80">
            A unified NOC platform to monitor devices, links, PPPoE sessions, destinations and
            network health — all in one place.
          </p>
        </div>

        <div className="text-xs text-white/70">{BRAND.statement}</div>

        {/* decorative pulse */}
        <svg className="pointer-events-none absolute -bottom-10 left-0 w-full opacity-20" viewBox="0 0 600 120" fill="none">
          <path
            d="M0 80 H120 L150 40 L190 100 L230 20 L270 80 H600"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Form side */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
