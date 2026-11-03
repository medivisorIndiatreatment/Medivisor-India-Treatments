import type React from "react";
import { CheckCircle } from "lucide-react";
import { useState } from "react";
import type { JSX } from "react/jsx-runtime";
import { useTranslatedRicosContent, useTranslatedStrings } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/I18nProvider";

"use client";

interface RicosContentRendererProps {
  content: string;
}

export function RicosContentRenderer({ content }: RicosContentRendererProps) {
  const { dir } = useI18n()
  const isRtl = dir === 'rtl'
  const [isExpanded, setIsExpanded] = useState(false);
  const translatedStrings = useTranslatedStrings(["Read more...", "Show less"]);
  const readMoreText = translatedStrings[0] || "Read more...";
  const showLessText = translatedStrings[1] || "Show less";

  // Try to parse as Ricos document
  const tryParseRicos = (content: string) => {
    try {
const parsed = JSON.parse(content);
      if (parsed.nodes && Array.isArray(parsed.nodes)) {
        return parsed;
      }
    } catch (e) {
      // Not a valid Ricos document
    }
return null;
  };

  const translatedRicosContent = useTranslatedRicosContent(
    tryParseRicos(content),
  );

  const renderRicosNode = (node: any, index: number): React.ReactNode => {
    switch (node.type) {
      case "PARAGRAPH":
        return (
          <p key={index} className="mb-4 leading-relaxed">
{node.nodes?.map((textNode: any, textIndex: number) =>
              renderTextNode(textNode, textIndex),
            )}
          </p>
        );

      case "HEADING":
        const HeadingTag =
          `h${node.headingData?.level || 2}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag key={index} className="font-bold mb-4 text-slate-900">
            {node.nodes?.map((textNode: any, textIndex: number) =>
              renderTextNode(textNode, textIndex),
            )}
          </HeadingTag>
        );

      case "BLOCKQUOTE":
        return (
          <blockquote
            key={index}
            className="border-l-4 border-rose-300 pl-6 italic mb-4 text-slate-700"
          >
            {node.nodes?.map((childNode: any, childIndex: number) =>
              renderRicosNode(childNode, childIndex),
            )}
          </blockquote>
        );

      case "BULLETED_LIST":
        return (
          <ul key={index} className="  mb-0 space-y-0">
            {node.nodes?.map((listItem: any, listIndex: number) => (
              <li key={listIndex} className="leading-relaxed flex gap-x-2">
<CheckCircle className="text-[#75c045]" />
                {listItem.nodes?.map((childNode: any, childIndex: number) =>
                  renderRicosNode(childNode, childIndex),
                )}
              </li>
            ))}
          </ul>
        );

      case "ORDERED_LIST":
        return (
          <ol key={index} className="list-decimal list-inside mb-4 space-y-2">
            {node.nodes?.map((listItem: any, listIndex: number) => (
              <li key={listIndex} className="leading-relaxed">
{listItem.nodes?.map((childNode: any, childIndex: number) =>
                  renderRicosNode(childNode, childIndex),
                )}
              </li>
            ))}
          </ol>
        );

      case "DIVIDER":
        return <hr key={index} className="my-8 border-slate-200" />;

      default:
        return null;
    }
  };

  const renderTextNode = (textNode: any, index: number): React.ReactNode => {
    if (textNode.type !== "TEXT") return null;

    const content = textNode.textData?.text || "";
    let className = "";
    const style: React.CSSProperties = {};
    let href: string | undefined;
    let target: string | undefined;
    let rel: string | undefined;

    // Apply decorations
    textNode.textData?.decorations?.forEach((decoration: any) => {
      switch (decoration.type) {
        case "BOLD":
className += " font-bold";
          break;
        case "ITALIC":
          className += " italic";
          break;
        case "UNDERLINE":
          className += " underline";
          break;
        case "COLOR":
          style.color = decoration.colorData?.foreground;
          break;
        case "LINK":
          if (decoration.linkData?.link) {
            const link = decoration.linkData.link;
            href = link.url || (link.anchor ? `#${link.anchor}` : undefined);
            target = link.target === "BLANK" ? "_blank" : "_self";
            if (target === "_blank") {
              rel = "noopener noreferrer";
            }
          }
          break;
      }
    });

    if (href) {
      const linkClass = className
        ? `${className} text-blue-600 hover:text-blue-800 transition-colors`
: "text-blue-600 hover:text-blue-800 transition-colors";
      return (
        <a
          key={index}
          href={href}
          target={target}
          rel={rel}
          className={linkClass}
        >
          {content}
        </a>
      );
    }

    return (
      <span key={index} className={className} style={style}>
        {content}
      </span>
);
  };

  const ricosDocument = translatedRicosContent || tryParseRicos(content);

  if (ricosDocument) {
    // Render as Ricos document
    return (
<div className={`ricos-content ${isRtl ? 'rtl-text' : ''}`} dir={isRtl ? 'auto' : undefined}>
        {ricosDocument.nodes.map((node: any, index: number) =>
          renderRicosNode(node, index),
        )}
      </div>
    );
  }

  // Render as plain text with basic formatting
  const paragraphs = content.split("\n\n").filter((p) => p.trim());
  const shouldTruncate = paragraphs.length > 3 || content.length > 500;

  return (
    <div className="space-y-4">
      {paragraphs
        .slice(0, isExpanded ? undefined : 3)
        .map((paragraph, index) => (
          <p key={index} className="leading-relaxed text-slate-700">
            {paragraph.trim()}
          </p>
        ))}

      {shouldTruncate && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="text-rose-600 hover:text-rose-700 font-medium text-sm transition-colors"
data-trans-managed="true"
        >
          {readMoreText}
        </button>
      )}

      {isExpanded && shouldTruncate && (
        <button
          onClick={() => setIsExpanded(false)}
          className="text-rose-600 hover:text-rose-700 font-medium text-sm transition-colors"
data-trans-managed="true"
        >
          {showLessText}
        </button>
      )}
    </div>
  );
}
