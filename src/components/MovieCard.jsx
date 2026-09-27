import { useState } from 'react'
import MovieForm from './MovieForm'
import { todayLocal } from '../lib/date'

function Stars({ value, onChange }) {
  return (
    <div className="stars" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className={n <= (value ?? 0) ? 'star on' : 'star'}
          onClick={() => onChange(value === n ? null : n)}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function MovieCard({ movie, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const watched = movie.status === 'watched'

  async function run(fn) {
    setBusy(true)
    try {
      await fn()
    } catch (err) {
      alert(err.message)
    } finally {
      setBusy(false)
    }
  }

  function toggleWatched() {
    run(() =>
      onUpdate(movie.id, watched
        ? { status: 'want', rating: null, watched_on: null }
        : { status: 'watched', watched_on: todayLocal() })
    )
  }

  function handleDelete() {
    if (confirm(`Delete "${movie.title}"?`)) run(() => onDelete(movie.id))
  }

  if (editing) {
    return (
      <li className="card movie editing">
        <MovieForm
          initial={movie}
          submitLabel="Save changes"
          onCancel={() => setEditing(false)}
          onSubmit={async (row) => {
            const extra =
              row.status === 'watched' && !movie.watched_on
                ? { watched_on: todayLocal() }
                : row.status === 'want' ? { watched_on: null } : {}
            await onUpdate(movie.id, { ...row, ...extra })
            setEditing(false)
          }}
        />
      </li>
    )
  }

  return (
    <li className={`card movie ${watched ? 'is-watched' : ''}`} aria-busy={busy}>
      <div className="movie-main">
        <h3>
          {movie.title}
          {movie.year && <span className="muted"> ({movie.year})</span>}
        </h3>
        <div className="meta">
          <span className={`badge ${watched ? 'watched' : 'want'}`}>
            {watched ? 'Watched' : 'Want to watch'}
          </span>
          {movie.genre && <span className="badge">{movie.genre}</span>}
          {movie.watched_on && <span className="muted small">on {movie.watched_on}</span>}
        </div>
        {watched && (
          <Stars value={movie.rating} onChange={(r) => run(() => onUpdate(movie.id, { rating: r }))} />
        )}
        {movie.notes && <p className="notes">{movie.notes}</p>}
      </div>

      <div className="actions">
        <button className="btn small" onClick={toggleWatched} disabled={busy}>
          {watched ? 'Mark unwatched' : 'Mark watched'}
        </button>
        <button className="btn small" onClick={() => setEditing(true)} disabled={busy}>Edit</button>
        <button className="btn small danger" onClick={handleDelete} disabled={busy}>Delete</button>
      </div>
    </li>
  )
}
