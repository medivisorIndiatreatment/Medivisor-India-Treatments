'use client';

import React, { useState } from 'react';
import {
  FileText,
  MessageCircle,
  Plane,
  MapPin,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  Globe,
  Heart,
  Users,
  Award,
  Shield,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import TreatmentProcess from "@/components/TreatmentProcess"
import Banner from "@/components/BannerService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CtaSection from '@/components/CtaSection';
import WorkflowCompo from "@/components/QuickEVisaFlow"
import PatientSupport from '@/components/PatientSupport';
import { useI18n } from '@/lib/i18n';

const Treatment = () => {
  const [activeStep, setActiveStep] = useState(1);
  const { t } = useI18n();

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Hero Banner Section */}
        <Banner
          topSpanText="Treatment Process"
          title="Medical Treatment Process in India for International Patients"
          description="Medivisor India Treatment makes it easier for international patients to plan their medical journey to India. From sharing your medical reports and finding suitable hospitals to consulting doctors, understanding treatment options, and arranging medical travel, our team guides you through each step of the process.
Understand the Process"
          buttonText="Start Your Medical Journey"
          buttonLink="/contact"
          bannerBgImage="/banner/service.png"
          mainImageSrc="/banner/process-banner.png"
          mainImageAlt="Friendly Medivisor Advisors Guiding Patients Through Treatment"
        />
        <TreatmentProcess />

        <WorkflowCompo />

        <PatientSupport />

      </div>
    </>
  );
};

export default Treatment;
