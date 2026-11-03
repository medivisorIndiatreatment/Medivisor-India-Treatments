'use client';
import { Trans } from '@/lib/i18n/Trans';

export default function PNGBanner() {
    const scrollToForm = () => {
        document.getElementById('join-us-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="relative w-full overflow-hidden cursor-pointer">
            {/* ================= DESKTOP BANNER ================= */}
            <div className="relative hidden md:block min-h-[88vh] w-full">
                {/* Background */}
                <img
                    src="/banner/extended-banner.png"
                    alt="Medivisor Expanded Patient Support Network"
                    className="absolute inset-0 w-full h-full object-cover object-fill"
                />


                {/* Bottom Center Image with CTA Button */}
                <div className="absolute bottom-5 w-[60%] left-1/2 transform -translate-x-1/2 z-30 flex flex-col items-center gap-0">


                    {/* Image */}
                    {/* <img
                        src="/banner/Banner-Text.png"
                        alt="Medivisor Expanded Patient Support Network"
                        className=" md:w-full mx-auto h-auto object-contain"
                    /> */}

                    {/* CTA Button */}

                </div>
            </div>

            {/* ================= MOBILE BANNER ================= */}
            <div className="relative md:hidden w-full">
                {/* Mobile Image */}
                <img
                    src="/banner/extended-banner-mobile.png"
                    alt="Medivisor Expanded Patient Support Network"
                    className="w-full h-full object-cover"
                />
                {/* <div className="absolute left-4 top-0 z-40">
                    <img
                        src="/icon/Whale-logo-n.png"
                        alt="Whale Certified"
                        className="w-12"
                    />
                </div> */}
                {/* Mobile Bottom Center Image with CTA Button */}

            </div>
        </section>
    );
}
