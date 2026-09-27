import { useEffect, useState } from 'react'
import { supabase, isConfigured } from './lib/supabaseClient'
import Auth from './components/Auth'
import Watchlist from './components/Watchlist'

export default function App() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isConfigured) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setReady(true)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!isConfigured) {
    return (
      <div className="auth-wrap">
        <div className="card">
          <h2>Supabase not configured</h2>
          <p>
            Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in a{' '}
            <code>.env</code> file (local) or in Netlify environment variables (deployed).
          </p>
        </div>
      </div>
    )
  }

  if (!ready) return <p className="center muted">Loading…</p>
  if (!session) return <Auth />

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="brand">Movie Watchlist</h1>
        <div className="row">
          <span className="muted small">{session.user.email}</span>
          <button className="btn small" onClick={() => supabase.auth.signOut()}>Log out</button>
        </div>
      </header>
      {/* key forces a fresh load if a different user logs in */}
      <Watchlist key={session.user.id} />
    </div>
  )
}
