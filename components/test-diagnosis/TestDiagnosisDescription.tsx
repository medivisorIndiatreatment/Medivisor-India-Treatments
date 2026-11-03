"use client"

import { useMemo } from "react"
import { sanitizeHtml, isRichTextContent, extractRichTextHtml } from "@/lib/cms"
import { RicosRenderer } from "@/components/RichContentViewer"
import { useTranslatedRicosContent, useTranslatedHtmlString, useTranslatedString } from "@/lib/i18n"

interface TestDiagnosisDescriptionProps {
  description?: string | null
  descriptionHtml?: string | { nodes: unknown[] } | null
  richContent?: unknown
  testDiagnosisName?: string
  totalTreatments?: number | null
}

export default function TestDiagnosisDescription({
  description,
  descriptionHtml,
  richContent,
  testDiagnosisName,
  totalTreatments,
}: TestDiagnosisDescriptionProps) {
  const primaryRichContent = richContent ?? (isRichTextContent(descriptionHtml as any) ? descriptionHtml : null)
  const translatedRicosContent = useTranslatedRicosContent(primaryRichContent)
  const translatedHtmlString = useTranslatedHtmlString(
    typeof descriptionHtml === "string" ? descriptionHtml : ""
  )
  const translatedDescription = useTranslatedString(description || "")
  const translatedTestDiagnosisName = useTranslatedString(testDiagnosisName || "")

  const renderContent = useMemo(() => {
    if (isRichTextContent(translatedRicosContent as any)) {
      return <RicosRenderer content={translatedRicosContent as any} />
    }

    const content = translatedHtmlString || translatedDescription || ""
    if (content) {
      return (
        <div
          className="prose custom-list max-w-none text-sm md:text-lg"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(extractRichTextHtml(content, false)),
          }}
          data-i18n-html
          data-trans-managed="true"
        />
      )
    }

    if (testDiagnosisName && totalTreatments) {
      return (
        <div className="prose max-w-none text-sm md:text-lg">
          <p data-i18n="test-diagnosis.default-desc-1" data-i18n-original={`The ${testDiagnosisName} Test & Diagnosis at our partner hospitals offers comprehensive medical tests and diagnostic services with world-class facilities. Our team of experienced specialists provides personalized care using advanced medical technology.`} data-trans-managed="true">
            The {translatedTestDiagnosisName} Test & Diagnosis at our partner hospitals offers comprehensive medical
            tests and diagnostic services with world-class facilities. Our team of experienced specialists
            provides personalized care using advanced medical technology.
          </p>
          <p data-i18n="test-diagnosis.default-desc-2" data-i18n-original={`We offer ${totalTreatments} different ${testDiagnosisName} tests and diagnostic procedures, catering to both domestic and international patients seeking affordable healthcare in India.`} data-trans-managed="true">
            We offer {totalTreatments} different {translatedTestDiagnosisName} tests and diagnostic procedures,
            catering to both domestic and international patients seeking affordable
            healthcare in India.
          </p>
        </div>
      )
    }

    return null
  }, [translatedRicosContent, translatedHtmlString, translatedDescription, testDiagnosisName, translatedTestDiagnosisName, totalTreatments])

  if (!renderContent) return null

  return (
    <>
      <div className="prose custom-list max-w-none text-sm md:text-lg test-diagnosis-description-content">
        {renderContent}
      </div>
    </>
  )
}
