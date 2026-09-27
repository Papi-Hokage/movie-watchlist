import { useState } from 'react'

const EMPTY = { title: '', year: '', genre: '', status: 'want', rating: '', notes: '' }

// Converts form strings to the shape the database expects
function toRow(form) {
  const watched = form.status === 'watched'
  return {
    title: form.title.trim(),
    year: form.year ? Number(form.year) : null,
    genre: form.genre.trim() || null,
    status: form.status,
    rating: watched && form.rating ? Number(form.rating) : null,
    notes: form.notes.trim() || null,
  }
}

export default function MovieForm({ initial, onSubmit, onCancel, submitLabel = 'Add movie' }) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          title: initial.title ?? '',
          year: initial.year ?? '',
          genre: initial.genre ?? '',
          status: initial.status ?? 'want',
          rating: initial.rating ?? '',
          notes: initial.notes ?? '',
        }
      : EMPTY
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return setError('Title is required.')
    setSaving(true)
    setError('')
    try {
      await onSubmit(toRow(form))
      if (!initial) setForm(EMPTY)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="movie-form" onSubmit={handleSubmit}>
      <div className="grid">
        <label className="span-2">
          Title *
          <input value={form.title} onChange={set('title')} maxLength={200} required />
        </label>
        <label>
          Year
          <input type="number" min="1888" max="2100" value={form.year} onChange={set('year')} />
        </label>
        <label>
          Genre
          <input value={form.genre} onChange={set('genre')} maxLength={50} placeholder="e.g. Sci-Fi" />
        </label>
        <label>
          Status
          <select value={form.status} onChange={set('status')}>
            <option value="want">Want to watch</option>
            <option value="watched">Watched</option>
          </select>
        </label>
        <label>
          Rating
          <select value={form.rating} onChange={set('rating')} disabled={form.status !== 'watched'}>
            <option value="">—</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{'★'.repeat(n)}</option>
            ))}
          </select>
        </label>
        <label className="span-2">
          Notes
          <textarea rows={2} value={form.notes} onChange={set('notes')} maxLength={1000} />
        </label>
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      <div className="row end">
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>Cancel</button>
        )}
        <button type="submit" className="btn primary" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
