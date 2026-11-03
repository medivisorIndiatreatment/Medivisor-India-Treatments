'use client';

import { useEffect } from 'react';
import { measureWebVitals } from '@/lib/utils/performance';

export default function WebVitals() {
  useEffect(() => {
    // Measure Core Web Vitals
    measureWebVitals();
  }, []);

  // This component renders nothing
  return null;
}
