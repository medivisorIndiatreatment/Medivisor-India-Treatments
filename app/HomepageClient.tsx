'use client'

import dynamic from "next/dynamic";
import Hero from "@/components/Hero";
import Partners from "@/components/Partners";
import DepartmentServices from "@/components/DepartmentServices";
import TreatmentServices from "@/components/TreatmentServices";
import {
  DoctorSectionSkeleton,
  PopularHospitalsSkeleton,
  TechnologiesServicesSkeleton,
  GenericSectionSkeleton,
} from "@/components/homepage-skeletons";

const DoctorsSection = dynamic(() => import("@/components/sections/DoctorsSection"), {
  loading: () => <DoctorSectionSkeleton />,
});
const PopularHospitalsSection = dynamic(() => import("@/components/PopularHospitals"), {
  loading: () => <PopularHospitalsSkeleton />,
});
const TechnologiesServices = dynamic(() => import("@/components/TechnologiesServices"), {
  loading: () => <TechnologiesServicesSkeleton />,
});
const HomeBelowFold = dynamic(() => import("@/components/HomeBelowFold"), {
  loading: () => <GenericSectionSkeleton />,
});
import { useTranslatedString } from "@/lib/i18n";
import type { PreparedHomepageData } from "@/lib/services/homepage/prepare";

interface HomepageClientProps {
  data: PreparedHomepageData;
}

export default function HomepageClient({ data }: HomepageClientProps) {
  const translatedTitle = useTranslatedString("Leading Doctors In India");

  return (
    <div className="bg-white min-h-screen">
      {/* <PngMeetModal /> */}
      <main>
        <Hero />
        {/* <PacificBannerSlider /> */}

       

        <Partners initialLogos={data.partnersLogos} />

        <DepartmentServices
          departmentCards={data.departmentCards}
          searchOptions={data.departmentSearchOptions}
          error={null}
        />


        <DoctorsSection
          doctors={data.doctors}
          title={translatedTitle}
          showHospital
          limit={24}
        />

        <PopularHospitalsSection initialLocations={data.hospitals} />

        <TechnologiesServices initialTechnologies={data.technologies} />

        <TreatmentServices initialTreatments={data.treatments} />

        <HomeBelowFold />
      </main>
    </div>
  );
}
