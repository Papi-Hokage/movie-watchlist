import { supabase } from './supabaseClient'

// All queries run as the logged-in user; RLS limits results to their own rows.

export async function listMovies() {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createMovie(movie) {
  const { data, error } = await supabase.from('movies').insert(movie).select().single()
  if (error) throw error
  return data
}

export async function updateMovie(id, changes) {
  const { data, error } = await supabase
    .from('movies')
    .update(changes)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteMovie(id) {
  const { error } = await supabase.from('movies').delete().eq('id', id)
  if (error) throw error
}
