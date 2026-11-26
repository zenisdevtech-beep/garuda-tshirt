'use client';

import Image from 'next/image';

export default function LogoWatermark() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden select-none"
      aria-hidden="true"
    >
      <div className="relative w-[340px] sm:w-[480px] md:w-[620px] aspect-square opacity-[0.06]">
        <Image
          src="/images/garud-logo.png"
          alt=""
          fill
          className="object-contain"
          priority={false}
        />
      </div>
    </div>
  );
}
