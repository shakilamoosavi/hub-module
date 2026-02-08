"use client";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";


export type LandingSlide = {
  image: string;
  textKey: string;
  link?: string;
};

interface LandingSliderProps {
  slides: LandingSlide[];
}

export default function LandingSlider({ slides }: LandingSliderProps) {
  const t = useTranslations("landing.slider");
  return (
    // max-w-4xl
    <div className="w-full">
      <div className="-mt-10 -mx-4 sm:-mx-8"> 
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000 }}
          loop
          className="overflow-hidden"
        >
          {slides.map((slide, idx) => (
            <SwiperSlide key={idx}>
              <div className="relative w-full h-64 sm:h-96 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900">
                <img
                  src={slide.image}
                  alt={t(`${slide.textKey}.alt`, { defaultValue: "" })}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="relative rounded-2xl z-10 bg-black/50 text-white p-6 max-w-lg mx-auto text-center">
                  {slide.link ? (
                    <a href={slide.link} className="underline text-blue-200 hover:text-blue-400">
                      {t(`${slide.textKey}.text`)}
                    </a>
                  ) : (
                    <span>{t(`${slide.textKey}.text`)}</span>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
