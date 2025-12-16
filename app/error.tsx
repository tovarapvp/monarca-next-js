'use client'

import { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Application error:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="flex justify-center">
                    <div className="rounded-full bg-destructive/10 p-6">
                        <AlertCircle className="h-16 w-16 text-destructive" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-3xl font-serif font-bold text-foreground">Something went wrong!</h2>
                    <p className="text-muted-foreground">
                        An unexpected error occurred. Please try again.
                    </p>
                    {error.message && (
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md mt-4">
                            {error.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={reset} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </Button>
                    <Link href="/">
                        <Button variant="outline" className="gap-2">
                            <Home className="h-4 w-4" />
                            Go Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
