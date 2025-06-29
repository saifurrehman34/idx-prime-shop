'use client';
        
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Autoplay from 'embla-carousel-autoplay';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import type { HeroSlide } from '@/types';

interface HomeHeroSectionProps {
  slides: HeroSlide[];
}

export function HomeHeroSection({ slides }: HomeHeroSectionProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <Carousel
      className="w-full"
      opts={{ loop: true }}
      plugins={[plugin.current]}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {slides.length > 0 ? slides.map((slide, index) => (
          <CarouselItem key={slide.id}>
            <div className="relative h-[80vh] min-h-[600px] w-full">
              <Image
                src={slide.image_url}
                alt={slide.title}
                fill
                className="object-cover"
                data-ai-hint={slide.image_ai_hint || 'shopping technology'}
                priority={index === 0}
              />
              <div className="relative z-10 flex h-full w-full items-center">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl text-left">
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white [text-shadow:2px_2px_8px_rgba(0,0,0,0.6)]">
                          {slide.title}
                        </h1>
                        <p className="mt-6 max-w-lg text-xl font-medium text-white [text-shadow:1px_1px_4px_rgba(0,0,0,0.6)]">
                          {slide.subtitle}
                        </p>
                        <div className="mt-10 flex flex-wrap justify-start gap-4">
                          <Button asChild size="lg">
                            <Link href={slide.link || '/products'}>Shop Now</Link>
                          </Button>
                          <Button asChild size="lg" variant="outline" className="border-2 border-white bg-black/20 text-white hover:bg-white hover:text-black">
                            <Link href="/products">Learn More</Link>
                          </Button>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </CarouselItem>
        )) : (
            <CarouselItem>
              <div className="relative h-[80vh] min-h-[600px] w-full">
                <Image
                  src="https://source.unsplash.com/featured/1600x900/?fashion,model"
                  alt="Latest Tech Deals"
                  fill
                  className="object-cover"
                  data-ai-hint="fashion model"
                  priority
                />
                <div className="relative z-10 flex h-full w-full items-center">
                    <div className="container mx-auto px-4">
                        <div className="max-w-2xl text-left">
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white [text-shadow:2px_2px_8px_rgba(0,0,0,0.6)]">
                              Discover the Latest Tech Deals
                            </h1>
                            <p className="mt-6 max-w-lg text-xl font-medium text-white [text-shadow:1px_1px_4px_rgba(0,0,0,0.6)]">
                              Shop top-rated smartphones, laptops, and accessories at unbeatable prices.
                            </p>
                            <div className="mt-10 flex flex-wrap justify-start gap-4">
                              <Button asChild size="lg">
                                <Link href="/products">Shop Now</Link>
                              </Button>
                              <Button asChild size="lg" variant="outline" className="border-2 border-white bg-black/20 text-white hover:bg-white hover:text-black">
                                <Link href="/products">Learn More</Link>
                              </Button>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
          </CarouselItem>
        )}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 text-white bg-black/20 hover:bg-black/50 border-white/50" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 text-white bg-black/20 hover:bg-black/50 border-white/50" />
    </Carousel>
  );
}
