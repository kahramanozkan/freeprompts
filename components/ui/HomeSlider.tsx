"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { ReactNode } from "react";

interface HomeSliderProps {
  children: ReactNode[];
  slidesPerViewMobile?: number;
  slidesPerViewTablet?: number;
  slidesPerViewDesktop?: number;
  spaceBetween?: number;
  className?: string;
  gridCols?: number;
}

export default function HomeSlider({
  children,
  slidesPerViewMobile = 1,
  slidesPerViewTablet = 2,
  slidesPerViewDesktop = 4,
  spaceBetween = 16,
  className = "",
  gridCols = 4,
}: HomeSliderProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Slider for mobile & tablet (hidden on desktop) */}
      <div className="lg:hidden">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={spaceBetween}
          slidesPerView={slidesPerViewMobile}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            640: {
              slidesPerView: slidesPerViewTablet,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: slidesPerViewDesktop,
              spaceBetween: 24,
            },
          }}
          className="!pb-10"
        >
          {children.map((child, index) => (
            <SwiperSlide key={index}>{child}</SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Grid for desktop (hidden on mobile & tablet) */}
      <div className={`hidden lg:grid ${gridCols === 3 ? 'grid-cols-3' : 'grid-cols-4'} gap-6`}>
        {children.map((child, index) => (
          <div key={index} className="col-span-1">
            {child}
          </div>
        ))}
      </div>

      {/* Custom CSS for yellow navigation arrows */}
      <style jsx global>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: #fbbf24 !important; /* Tailwind yellow-400 */
          background-color: rgba(251, 191, 36, 0.1);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 20px;
          font-weight: bold;
        }
        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background-color: rgba(251, 191, 36, 0.2);
        }
        .swiper-pagination-bullet-active {
          background-color: #fbbf24 !important;
        }
      `}</style>
    </div>
  );
}