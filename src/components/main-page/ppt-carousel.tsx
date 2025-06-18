'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import Image from 'next/image';
import { motion, type Variants } from 'motion/react';
// slides images
import slide1 from '@/public/slides/slides_1.png';
import slide2 from '@/public/slides/slides_2.png';
import slide3 from '@/public/slides/slides_3.png';
import slide4 from '@/public/slides/slides_4.png';
import slide5 from '@/public/slides/slides_5.png';
import slide6 from '@/public/slides/slides_6.png';
import slide7 from '@/public/slides/slides_7.png';
import slide8 from '@/public/slides/slides_8.png';
import slide9 from '@/public/slides/slides_9.png';
import slide10 from '@/public/slides/slides_10.png';
import slide11 from '@/public/slides/slides_11.png';
import slide12 from '@/public/slides/slides_12.png';
import slide13 from '@/public/slides/slides_13.png';
import slide14 from '@/public/slides/slides_14.png';
import slide15 from '@/public/slides/slides_15.png';
import slide16 from '@/public/slides/slides_16.png';
import slide17 from '@/public/slides/slides_17.png';
import slide18 from '@/public/slides/slides_18.png';
import slide19 from '@/public/slides/slides_19.png';
import slide20 from '@/public/slides/slides_20.png';
import slide21 from '@/public/slides/slides_21.png';

const fadeUpStaggerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function PresentationSlides() {
  const [api, setApi] = useState<CarouselApi>();
  const [current] = useState(0);

  // array of images from public/slides
  const slides = [slide1, slide2, slide3, slide4, slide5, slide6, slide7, slide8, slide9, slide10,
    slide11, slide12, slide13, slide14, slide15, slide16, slide17, slide18, slide19, slide20, slide21];

  return (
    <div className='flex flex-col mx-auto items-center'>
      <motion.div
        className='text-center'
        variants={fadeUpStaggerVariants}
      >
        <h2 className='text-3xl md:text-4xl text-nowrap font-bold mb-4 text-gray-900'>
          Presentation Slides
        </h2>
        <p className='text-lg text-gray-600'>
          See how our AI-powered platform can transform patient care.
        </p>
      </motion.div>

      <Carousel setApi={setApi} className='w-full max-w-4xl mx-auto'>
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index} className='w-full'>
              <Card className='border-none shadow-none'>
                <CardContent className='p-2'>
                  <div className='relative aspect-[16/9] w-full'>
                    <Image
                      src={slide}
                      alt={`Slide ${index + 1}`}
                      fill
                      className='object-contain rounded-lg'
                      sizes='(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1024px'
                      priority={index === 0}
                    />
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className='left-4' />
        <CarouselNext className='right-4' />
      </Carousel>
      
      <div className='flex items-center gap-2 mt-6'>
        {/* Slide indicators */}
        <div className='flex gap-2'>
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                current === index + 1 
                  ? 'bg-cyan-600' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
