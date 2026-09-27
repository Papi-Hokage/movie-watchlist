import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const isRegister = mode === 'register'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setLoading(true)

    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      })
      if (error) setError(error.message)
      else if (!data.session) {
        // Email confirmation is enabled in Supabase: no session until the link is clicked
        setNotice('Account created. Check your email to confirm, then log in.')
        setMode('login')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }

    setLoading(false)
  }

  function switchMode() {
    setMode(isRegister ? 'login' : 'register')
    setError('')
    setNotice('')
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h1 className="brand">Movie Watchlist</h1>
        <p className="muted">Track what to watch and what you thought of it.</p>

        <h2>{isRegister ? 'Create an account' : 'Log in'}</h2>

        <form onSubmit={handleSubmit} className="stack">
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <p className="error" role="alert">{error}</p>}
          {notice && <p className="notice">{notice}</p>}

          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Please wait…' : isRegister ? 'Register' : 'Log in'}
          </button>
        </form>

        <p className="switch">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" className="link" onClick={switchMode}>
            {isRegister ? 'Log in' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  )
}
