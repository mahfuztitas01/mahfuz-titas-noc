import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import { ClientProvider } from './context/ClientContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Spinner } from './components/EmptyState'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

// Route-level code splitting for a lighter initial bundle.
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Clients = lazy(() => import('./pages/Clients'))
const Destinations = lazy(() => import('./pages/Destinations'))
const Devices = lazy(() => import('./pages/Devices'))
const LinkCapacity = lazy(() => import('./pages/LinkCapacity'))
const PPPWatchdog = lazy(() => import('./pages/PPPWatchdog'))
const ServiceGraphs = lazy(() => import('./pages/ServiceGraphs'))
const NetworkMap = lazy(() => import('./pages/NetworkMap'))
const Management = lazy(() => import('./pages/Management'))
const Reports = lazy(() => import('./pages/Reports'))
const Settings = lazy(() => import('./pages/Settings'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Spinner />
    </div>
  )
}

// Route guard — unauthenticated users are sent to /login.
function RequireAuth({ children }) {
  const { currentUser } = useAuth()
  const location = useLocation()
  if (!currentUser) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

// Route guard — client users cannot access team-only pages.
function RequireTeam({ children }) {
  const { currentUser } = useAuth()
  if (currentUser?.isClient) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ClientProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route
                path="/login"
                element={
                  <AuthLayout>
                    <Login />
                  </AuthLayout>
                }
              />

              <Route
                element={
                  <RequireAuth>
                    <MainLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="/clients" element={<RequireTeam><Clients /></RequireTeam>} />
                <Route path="/destinations" element={<Destinations />} />
                <Route path="/devices" element={<Devices />} />
                <Route path="/link-capacity" element={<LinkCapacity />} />
                <Route path="/ppp-watchdog" element={<PPPWatchdog />} />
                <Route path="/service-graphs" element={<ServiceGraphs />} />
                <Route path="/network-map" element={<NetworkMap />} />
                <Route path="/management" element={<RequireTeam><Management /></RequireTeam>} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<RequireTeam><Settings /></RequireTeam>} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </ClientProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
