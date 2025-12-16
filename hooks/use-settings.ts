"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface Setting {
    id: string
    key: string
    value: any
    description: string | null
    updated_at: string
}

export function useSettings() {
    const [settings, setSettings] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        fetchSettings()
    }, [])

    async function fetchSettings() {
        try {
            setLoading(true)
            setError(null)

            const { data, error: fetchError } = await supabase
                .from('settings')
                .select('*')

            if (fetchError) throw fetchError

            // Convert array to key-value object
            const settingsObj = (data || []).reduce((acc, setting) => {
                acc[setting.key] = setting.value
                return acc
            }, {} as Record<string, any>)

            setSettings(settingsObj)
        } catch (err) {
            setError(err as Error)
            console.error('Error fetching settings:', err)
        } finally {
            setLoading(false)
        }
    }

    return { settings, loading, error, refetch: fetchSettings }
}

export async function getSetting(key: string): Promise<any> {
    const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single()

    if (error) throw error
    return data?.value
}

export async function updateSetting(key: string, value: any): Promise<void> {
    const { error } = await supabase
        .from('settings')
        .update({ value })
        .eq('key', key)

    if (error) throw error
}

export async function updateMultipleSettings(updates: Record<string, any>): Promise<void> {
    const promises = Object.entries(updates).map(([key, value]) =>
        supabase
            .from('settings')
            .update({ value })
            .eq('key', key)
    )

    const results = await Promise.all(promises)
    const errors = results.filter(r => r.error).map(r => r.error)

    if (errors.length > 0) throw errors[0]
}
