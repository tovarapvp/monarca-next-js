import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <AboutContent />;
}

function AboutContent() {
    const t = useTranslations('about');

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center">
                <Image
                    src="/founder-workshop-elegant.png"
                    alt="MONARCA founder in workshop"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 text-center text-white">
                    <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">
                        {t('hero.title')}
                    </h1>
                    <p className="text-xl md:text-2xl font-light">{t('hero.subtitle')}</p>
                </div>
            </section>

            {/* Brand Mission */}
            <section className="py-16 px-4 max-w-4xl mx-auto text-center">
                <p className="text-lg md:text-xl leading-relaxed text-gray-700">
                    {t('mission')}
                </p>
            </section>

            {/* The Inspiration / The Founder */}
            <section className="py-16 px-4 max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative h-[500px] rounded-lg overflow-hidden">
                        <Image
                            src="/founder-portrait-warm.png"
                            alt="MONARCA founder"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="space-y-6">
                        <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">
                            {t('inspiration.title')}
                        </h2>
                        <div className="space-y-4 text-gray-700 leading-relaxed">
                            <p>{t('inspiration.p1')}</p>
                            <p>{t('inspiration.p2')}</p>
                            <p>{t('inspiration.p3')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Process */}
            <section className="py-16 px-4 max-w-6xl mx-auto">
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
                    {t('process.title')}
                </h2>
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                            <Image
                                src="/jewelry-design-sketch.png"
                                alt="Design process"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <h3 className="font-semibold mb-2">{t('process.design')}</h3>
                        <p className="text-sm text-gray-600">
                            {t('process.designDesc')}
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                            <Image
                                src="/gold-materials-selection.png"
                                alt="Material selection"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <h3 className="font-semibold mb-2">{t('process.materials')}</h3>
                        <p className="text-sm text-gray-600">
                            {t('process.materialsDesc')}
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                            <Image
                                src="/jewelry-crafting-hands.png"
                                alt="Crafting process"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <h3 className="font-semibold mb-2">{t('process.crafting')}</h3>
                        <p className="text-sm text-gray-600">
                            {t('process.craftingDesc')}
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                            <Image
                                src="/jewelry-quality-inspection.png"
                                alt="Quality control"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <h3 className="font-semibold mb-2">{t('process.quality')}</h3>
                        <p className="text-sm text-gray-600">
                            {t('process.qualityDesc')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 px-4 text-center bg-gradient-to-r from-orange-50 to-peach-50">
                <div className="max-w-2xl mx-auto">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                        {t('cta.title')}
                    </h2>
                    <p className="text-lg text-gray-700 mb-8">
                        {t('cta.description')}
                    </p>
                    <Button
                        asChild
                        size="lg"
                        className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg"
                    >
                        <Link href="/products">{t('cta.button')}</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
