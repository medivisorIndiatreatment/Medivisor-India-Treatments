"use client"
import { Phone, Send } from "lucide-react"
import ContactModal from "@/components/ContactModal"
import { useState } from 'react'
import { DESIGN_TOKENS } from "@/components/design-tokens"
import { Trans } from '@/lib/i18n/Trans';
import { useI18n, useTranslatedString, useTranslatedHtmlString } from "@/lib/i18n"

interface CtaSectionProps {
  title?: string;
  description?: string;
  primaryText?: string;
  primaryLink?: string;
  secondaryText?: string;
  secondaryLink?: string;
}

const ModernHelpSection = ({ title, description, primaryText, primaryLink, secondaryText, secondaryLink }: CtaSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { t } = useI18n()

  const translatedTitle = useTranslatedString(title || '')
  const translatedDescription = useTranslatedHtmlString(description || '')
  const translatedPrimaryText = useTranslatedString(primaryText || '')
  const translatedSecondaryText = useTranslatedString(secondaryText || '')

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <section className="bg-[#E22026] py-10 md:py-12 lg:py-16">
        <div className={`${DESIGN_TOKENS.CONTAINER.BASE} ${DESIGN_TOKENS.CONTAINER.MAX_WIDTH} ${DESIGN_TOKENS.CONTAINER.PADDING}`}>
          <div className="max-w-4xl mx-auto text-center">
            {/* Main CTA Content */}
            <div className="mb-2 md:mb-4">
<h2 className={`${DESIGN_TOKENS.TYPOGRAPHY.H2} text-white leading-snug mb-3 md:mb-4`} data-i18n-original={title || 'Get Treated'} data-trans-managed="true">
                {translatedTitle || <Trans id="cta.default-title">Get Treated</Trans>}
              </h2>
              <p className="text-base md:text-lg text-gray-100 leading-relaxed max-w-2xl mx-auto" data-i18n-original={description || 'Join thousands of patients who trust us with their health. Get started today and experience world-class medical care at your fingertips.'} data-trans-managed="true">
                {translatedDescription || <Trans id="cta.default-desc">Join thousands of patients who trust us with their health. Get started today and experience world-class medical care at your fingertips.</Trans>}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-4 md:mt-6 w-full">

              <button
                className="group w-full sm:w-auto sm:min-w-[200px] cursor-pointer border-2 border-white text-white px-6 py-3 rounded-lg font-medium text-sm md:text-base hover:bg-white hover:text-[#E22026] transition-all duration-300 flex items-center justify-center gap-2"
                onClick={openModal}
              >
                <Send className="w-4 h-4 md:w-5 md:h-5" />
{translatedPrimaryText || <Trans id="cta.send-message">Send Message</Trans>}
             </button>

              {secondaryLink && (
                <a href={secondaryLink} className="w-full sm:w-auto sm:min-w-[200px]">
                  <button
                    className="group w-full cursor-pointer border-2 border-white text-white px-6 py-3 rounded-lg font-medium text-sm md:text-base hover:bg-white hover:text-[#E22026] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4 md:w-5 md:h-5" />
{translatedSecondaryText || <Trans id="cta.call-us">Call Us</Trans>}
                  </button>
                </a>
              )}

            </div>

            {/* Trust Indicators */}
            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-white/30">
<p className="text-red-100 text-base md:text-lg" data-i18n="cta.trust" data-i18n-original="Trusted by 3,500+ patients worldwide 🌍">
                <Trans id="cta.trust">Trusted by 3,500+ patients worldwide 🌍</Trans>
              </p>
            </div>
          </div>
        </div>
      </section>

      <ContactModal
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  )
}

export default ModernHelpSection
