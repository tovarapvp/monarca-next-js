"use client"

import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const t = useTranslations('error')

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="space-y-2">
                    <h1 className="text-6xl font-bold text-destructive">!</h1>
                    <h2 className="text-3xl font-serif font-bold text-foreground">{t('title')}</h2>
                    <p className="text-muted-foreground">
                        {t('description')}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={() => reset()}>
                        {t('tryAgain')}
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = '/'}>
                        {t('backHome')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
