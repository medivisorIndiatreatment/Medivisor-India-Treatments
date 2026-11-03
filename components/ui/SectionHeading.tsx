"use client";

import React, { useContext } from "react";
import { cn } from "@/lib/utils";
import { DESIGN_TOKENS } from "@/components/design-tokens";
import { I18nContext } from "@/lib/i18n/I18nProvider";
import { getCachedTranslation, type LanguageCode } from "@/lib/googleTranslate";
import { useTranslatedStrings } from "@/lib/i18n";

export interface SectionHeadingProps {
  title: string;
  titleI18nKey?: string;
  subtitle?: string;
  subtitleI18nKey?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  align?: "left" | "center" | "right";
  as?: "h1" | "h2" | "h3" | "h4";
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

function getCachedText(lang: LanguageCode | undefined, text: string): string {
  if (!lang || lang === "en" || !text) return text;
  return getCachedTranslation(lang, text) || text;
}

function SectionHeading({
  title,
  titleI18nKey,
  subtitle,
  subtitleI18nKey,
  className,
  titleClassName,
  subtitleClassName,
  align,
  as: Component = "h2",
  size = "md",
  children,
  ...props
}: SectionHeadingProps & React.HTMLAttributes<HTMLElement>) {
  const ctx = useContext(I18nContext);
  const lang = ctx?.lang;
  const version = ctx?.langVersion ?? 0;
  const defaultAlign = ctx?.dir === 'rtl' ? 'right' : 'left';
  const resolvedAlign = align ?? defaultAlign;

  const keys = [title];
  if (subtitle) keys.push(subtitle);
  const translatedStrings = useTranslatedStrings(keys);
  const translatedTitle = translatedStrings[0] || getCachedText(lang, title);
  const translatedSubtitle = subtitle
    ? translatedStrings[1] || getCachedText(lang, subtitle)
    : undefined;

  const resolvedAlignmentClasses = {
    left: "text-left",
    center: "md:text-center",
    right: "text-right",
  };

  const sizeClasses = {
    sm: DESIGN_TOKENS.TYPOGRAPHY.H4,
    md: DESIGN_TOKENS.TYPOGRAPHY.SECTION_HEADING,
    lg: DESIGN_TOKENS.TYPOGRAPHY.H2,
};

  const i18nKey = titleI18nKey || title;

  return (
    <div className={cn("mb-2 md:mb-4", resolvedAlignmentClasses[resolvedAlign], className)}>
      <Component
        className={cn(
          sizeClasses[size],
          resolvedAlignmentClasses[resolvedAlign],
titleClassName,
        )}
        data-i18n={titleI18nKey}
        data-i18n-original={title}
        data-trans-managed="true"
        {...props}
      >
        {translatedTitle}
      </Component>
      {subtitle && (
        <p
          className={cn(
            DESIGN_TOKENS.TYPOGRAPHY.SECTION_SUBTITLE,
            resolvedAlignmentClasses[resolvedAlign],
subtitleClassName,
          )}
          data-i18n={subtitleI18nKey}
          data-i18n-original={subtitle}
          data-trans-managed="true"
        >
          {translatedSubtitle}
        </p>
      )}
      {children}
    </div>
);
}

export default SectionHeading;
export { SectionHeading };
