import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
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
            Our Story
          </h1>
          <p className="text-xl md:text-2xl font-light">Nuestra Historia</p>
        </div>
      </section>

      {/* Brand Mission */}
      <section className="py-16 px-4 max-w-4xl mx-auto text-center">
        <p className="text-lg md:text-xl leading-relaxed text-gray-700">
          At MONARCA, we believe every woman holds a unique beauty, ready to
          transform and shine. Inspired by the incredible journey of the Monarch
          butterfly, we create pieces that not only adorn but also symbolize
          strength, femininity, and elegance.
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
              The Inspiration
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                The name MONARCA was born from a moment of pure inspiration.
                Like the Monarch butterfly&apos;s incredible transformation from
                caterpillar to one of nature&apos;s most beautiful creatures, we
                believe every woman has the power to transform and reveal her
                inner radiance.
              </p>
              <p>
                Our founder discovered this connection during a trip to Mexico,
                where millions of Monarch butterflies complete their miraculous
                migration. Witnessing their strength, beauty, and resilience
                sparked the vision for jewelry that would embody these same
                qualities.
              </p>
              <p>
                Each piece in our collection is crafted to celebrate the unique
                journey of transformation that every woman experiences
                throughout her life. From delicate everyday pieces to statement
                jewelry for special moments, MONARCA accompanies you through
                every chapter of your story.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          Our Process
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
            <h3 className="font-semibold mb-2">Design</h3>
            <p className="text-sm text-gray-600">
              Every piece begins with careful sketching and planning
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
            <h3 className="font-semibold mb-2">Materials</h3>
            <p className="text-sm text-gray-600">
              Only the finest gold and precious stones are selected
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
            <h3 className="font-semibold mb-2">Crafting</h3>
            <p className="text-sm text-gray-600">
              Expert artisans bring each design to life by hand
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
            <h3 className="font-semibold mb-2">Quality</h3>
            <p className="text-sm text-gray-600">
              Each piece undergoes rigorous quality inspection
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 text-center bg-gradient-to-r from-orange-50 to-peach-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Ready to Begin Your Transformation?
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Discover our collection of handcrafted jewelry designed to celebrate
            your unique journey.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg"
          >
            <Link href="/products">Discover the Collection</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
