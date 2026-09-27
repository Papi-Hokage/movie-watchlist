import { useEffect, useMemo, useState } from 'react'
import { listMovies, createMovie, updateMovie, deleteMovie } from '../lib/movies'
import MovieForm from './MovieForm'
import MovieCard from './MovieCard'

const SORTS = {
  newest: (a, b) => b.created_at.localeCompare(a.created_at),
  title: (a, b) => a.title.localeCompare(b.title),
  year: (a, b) => (b.year ?? 0) - (a.year ?? 0),
  rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
}

export default function Watchlist() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    listMovies()
      .then(setMovies)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(row) {
    const created = await createMovie(row)
    setMovies((m) => [created, ...m])
  }

  async function handleUpdate(id, changes) {
    const updated = await updateMovie(id, changes)
    setMovies((m) => m.map((x) => (x.id === id ? updated : x)))
  }

  async function handleDelete(id) {
    await deleteMovie(id)
    setMovies((m) => m.filter((x) => x.id !== id))
  }

  const counts = useMemo(() => {
    const watched = movies.filter((m) => m.status === 'watched')
    const rated = watched.filter((m) => m.rating)
    const avg = rated.length ? rated.reduce((s, m) => s + m.rating, 0) / rated.length : null
    return { all: movies.length, want: movies.length - watched.length, watched: watched.length, avg }
  }, [movies])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return movies
      .filter((m) => filter === 'all' || m.status === filter)
      .filter((m) => !q || m.title.toLowerCase().includes(q) || (m.genre ?? '').toLowerCase().includes(q))
      .sort(SORTS[sort])
  }, [movies, filter, query, sort])

  return (
    <main className="container">
      <section className="stats">
        <div className="stat"><strong>{counts.all}</strong><span>Total</span></div>
        <div className="stat"><strong>{counts.want}</strong><span>To watch</span></div>
        <div className="stat"><strong>{counts.watched}</strong><span>Watched</span></div>
        <div className="stat">
          <strong>{counts.avg ? counts.avg.toFixed(1) : '—'}</strong><span>Avg rating</span>
        </div>
      </section>

      <section className="card">
        <h2>Add a movie</h2>
        <MovieForm onSubmit={handleCreate} />
      </section>

      <section>
        <div className="toolbar">
          <div className="tabs" role="tablist">
            {[
              ['all', `All (${counts.all})`],
              ['want', `To watch (${counts.want})`],
              ['watched', `Watched (${counts.watched})`],
            ].map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={filter === key}
                className={filter === key ? 'tab active' : 'tab'}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            type="search"
            placeholder="Search title or genre"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search"
          />
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
            <option value="newest">Newest added</option>
            <option value="title">Title A–Z</option>
            <option value="year">Release year</option>
            <option value="rating">Rating</option>
          </select>
        </div>

        {loading && <p className="muted">Loading your watchlist…</p>}
        {error && <p className="error" role="alert">{error}</p>}
        {!loading && !error && visible.length === 0 && (
          <p className="empty muted">
            {movies.length === 0 ? 'No movies yet. Add your first one above.' : 'No movies match.'}
          </p>
        )}

        <ul className="movie-list">
          {visible.map((m) => (
            <MovieCard key={m.id} movie={m} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </ul>
      </section>
    </main>
  )
}
