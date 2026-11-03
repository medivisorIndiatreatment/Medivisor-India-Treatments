'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from '@/components/ui/dialog';

export default function PngMeetModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogOverlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm" />

      <DialogContent
        className="
          fixed left-1/2 top-1/2 z-50
          -translate-x-1/2 -translate-y-1/2
          md:w-auto
          sm:w-[calc(100%-40px)]
          w-full
          max-h-[95vh]
          p-0
          border-0
          bg-transparent
          shadow-none
          outline-none
        "
      >
        <DialogTitle className="sr-only">PNG Patient Meet</DialogTitle>

        {/* Premium Frame */}
        <div
          className="
            relative
            flex
            items-center
            justify-center
            w-full
            h-full
            max-h-[95vh]
            rounded-2xl
            sm:rounded-3xl
            bg-white
            p-1.5
            sm:p-2
            shadow-[0_30px_80px_rgba(0,0,0,0.55)]
            ring-1
            ring-white/20
          "
        >
          {/* Image Container */}
          <div
            className="
              relative
              flex
              items-center
              justify-center
              w-full
              max-h-[calc(95vh-12px)]
             
              rounded-xl
              sm:rounded-2xl
              bg-[#f5f7fa]
            "
          >
            <a href="/png-patient-meet" rel="noopener noreferrer">
              <img
              src="/png-meet.jpg"
              alt="PNG Patient Meet"
              className="
                block
                w-full
                h-auto
                max-w-full
                max-h-[calc(95vh-24px)]
                object-cover
                object-center
              "
            />
            </a>
          </div>

          {/* Close Button */}
         
        </div>
      </DialogContent>
    </Dialog>
  );
}