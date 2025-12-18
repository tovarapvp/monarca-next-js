import { createClient } from '@supabase/supabase-js'

// Cliente Supabase para operaciones de admin (bypass RLS)
// IMPORTANTE: Solo usar en rutas protegidas de admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Esta key NO debe ser pública

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})
