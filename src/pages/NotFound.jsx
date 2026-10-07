import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import Button from '../components/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-500/10">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Page not found</h2>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        The page you are looking for doesn’t exist or may have been moved.
      </p>
      <Link to="/" className="mt-6">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  )
}
