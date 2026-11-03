"use client";

import type { ReactNode, JSX } from "react";
import { Fragment } from "react";
import { useTranslatedRicosContent } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { extractYouTubeId, getYouTubeEmbedUrl } from "@/lib/utils/youtube"
import { getWixImageUrl } from "@/lib/wixMedia"

interface RicosContent {
  nodes: any[];
  metadata?: any;
}

interface RicosRendererProps {
  content: RicosContent | any[] | { nodes: any[] };
  maxDepth?: number;
  className?: string;
}

const YOUTUBE_EMBED_PARAMS = { autoplay: "0", modestbranding: "1", rel: "0" }

function isYouTubeUrl(url: string | undefined): boolean {
  if (!url) return false;
  return /youtube\.com|youtu\.be/.test(url);
}

export function RicosRenderer({
  content,
  maxDepth = 50,
  className,
}: RicosRendererProps) {
  const translatedContent = useTranslatedRicosContent(content);
  const { dir } = useI18n()
  const isRtl = dir === 'rtl'
  const displayContent = translatedContent || content;

  if (!displayContent) {
    return null;
  }

  const ricaContent = displayContent as RicosContent;
  const nodes =
    ricaContent?.nodes || (Array.isArray(displayContent) ? displayContent : []);

  if (nodes.length === 0) {
    return null;
  }

  const renderNode = (
    node: any,
    index: number,
    isInsideList = false,
    currentDepth: number = 0,
  ): ReactNode => {
    if (currentDepth > maxDepth) {
      return null;
    }
    if (!node) return null;

    if (node.type === "PARAGRAPH" || node.paragraphData) {
      return (
        <p
          key={index}
          className="text-base md:text-lg text-[#241d1f] leading-relaxed mb-4 font-poppins"
        >
          {node.nodes && renderNodes(node.nodes, isInsideList)}
          {node.textData && node.textData.text}
        </p>
      );
    }

    if (node.type === "HEADING" || node.headingData) {
      const level = node.headingData?.level || 4;
      const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

      return (
        <HeadingTag key={index}>
          {node.nodes && renderNodes(node.nodes)}
          {node.textData && node.textData.text}
        </HeadingTag>
      );
    }

    if (node.type === "TEXT" || node.textData) {
      const text = node.textData?.text || "";
      let className = "";
      let href: string | undefined;
      let target: string | undefined;
      let rel: string | undefined;

      if (node.textData?.decorations) {
        const decorations = node.textData.decorations.map(
          (d: any) => d.type || d,
        );
        if (decorations.includes("BOLD")) className += " font-bold";
        if (decorations.includes("ITALIC")) className += " italic";
        if (decorations.includes("UNDERLINE")) {
          className +=
            " underline cursor-pointer text-blue-600 hover:text-blue-800 transition-colors";
        }

        const linkDecoration = node.textData.decorations.find(
          (d: any) => d.type === "LINK",
        );
        if (linkDecoration?.linkData?.link) {
          const link = linkDecoration.linkData.link;
          href = link.url || (link.anchor ? `#${link.anchor}` : undefined);
          target = link.target === "BLANK" ? "_blank" : "_self";
          if (target === "_blank") {
            rel = "noopener noreferrer";
          }
        }
      }

      if (href) {
        const linkClass = className
          ? `${className} text-gray-800 hover:text-gray-800 transition-colors`
: "text-gray-600 hover:text-gray-800 transition-colors";
        return (
          <a
            key={index}
            href={href}
            target={target}
            rel={rel}
            className={linkClass}
          >
            {text}
          </a>
);
      }

      return (
        <span key={index} className={className || undefined}>
          {text}
        </span>
);
    }

    if (node.type === "BULLETED_LIST" || node.bulletedListData) {
      return (
        <ul key={index} className="mb-4 space-y-2">
          {node.nodes && renderNodes(node.nodes, true)}
        </ul>
      );
    }

    if (node.type === "ORDERED_LIST" || node.orderedListData) {
      return (
        <ol key={index} className="mb-4 space-y-2">
          {node.nodes && renderNodes(node.nodes, true)}
        </ol>
      );
    }

    if (node.type === "LIST_ITEM" || node.listItemData) {
      return (
        <li
          key={index}
          className="text-base md:text-lg text-[#241d1f] leading-relaxed mb-2"
        >
          {node.nodes && renderNodes(node.nodes, true)}
        </li>
      );
    }

    if (node.type === "IMAGE" || node.imageData) {
      const imageSourceData =
        node.imageData?.image?.src || node.imageData?.containerData?.image?.src;
      let imageSrc = "";

      if (imageSourceData && typeof imageSourceData === "object") {
        imageSrc = imageSourceData.id || imageSourceData.url || "";
      } else if (typeof imageSourceData === "string") {
        imageSrc = imageSourceData;
      }

      const alt = node.imageData?.altText || "Blog Image";
      let finalImageUrl = "";

      if (imageSrc) {
        if (imageSrc.startsWith("http")) {
          finalImageUrl = imageSrc;
        } else if (imageSrc.startsWith("wix:image://")) {
          finalImageUrl = getWixImageUrl(imageSrc) || imageSrc;
        } else {
          finalImageUrl = `https://static.wixstatic.com/media/${imageSrc}`;
        }
      }

      if (finalImageUrl) {
        return (
          <figure key={index} className="my-6 md:my-8">
            <img
              src={finalImageUrl}
              alt={alt}
              className="w-full h-auto rounded-md shadow-sm max-w-full"
              loading="lazy"
            />
            {alt && alt !== "Blog Image" && (
              <figcaption className="text-sm text-gray-500 text-center mt-2 italic">
                {alt}
              </figcaption>
            )}
          </figure>
);
      }
    }

    if (node.type === "DIVIDER" || node.dividerData) {
return <hr key={index} className="my-8 border-gray-200" />;
    }

    if (node.type === "BLOCKQUOTE" || node.blockquoteData) {
      return (
        <blockquote
          key={index}
          className="border-l-4 border-gray-300 pl-4 md:pl-6 italic text-gray-600 mb-4 md:mb-6"
        >
          {node.nodes && renderNodes(node.nodes)}
        </blockquote>
);
    }

    if (node.type === "LINK" || node.linkData) {
      const href = node.linkData?.link?.url || "#";
      const target = node.linkData?.link?.target || "_self";
      return (
        <a
          key={index}
          href={href}
          target={target}
          className="text-gray-600 hover:text-gray-800 underline transition-colors"
        >
          {node.nodes && renderNodes(node.nodes)}
        </a>
);
    }

    if (node.type === "VIDEO" || node.videoData) {
      const videoSrc = node.videoData?.video?.src?.url;
      const thumbnailSrc =
        node.videoData?.thumbnail?.src?.id ||
        node.videoData?.thumbnail?.src?.url;

      let thumbnailUrl = "";
      if (thumbnailSrc) {
        if (thumbnailSrc.startsWith("http")) {
          thumbnailUrl = thumbnailSrc;
        } else if (thumbnailSrc.startsWith("wix:image://")) {
          thumbnailUrl = getWixImageUrl(thumbnailSrc) || thumbnailSrc;
        } else {
          thumbnailUrl = `https://static.wixstatic.com/media/${thumbnailSrc}`;
        }
      }

      if (videoSrc && isYouTubeUrl(videoSrc)) {
        const youtubeVideoId = extractYouTubeId(videoSrc)
        const youtubeEmbedUrl = youtubeVideoId ? getYouTubeEmbedUrl(youtubeVideoId, YOUTUBE_EMBED_PARAMS) : null

        if (youtubeEmbedUrl) {
          return (
            <div
              key={index}
              className="my-6 md:my-8 relative w-full"
              style={{ paddingBottom: "56.25%", height: 0 }}
            >
              <iframe
                src={youtubeEmbedUrl}
                title={node.videoData?.title || "YouTube video player"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full rounded-md shadow-sm"
              />
            </div>
);
        }
      }

      if (videoSrc) {
        return (
          <div key={index} className="my-6 md:my-8">
            <video
              src={videoSrc}
              poster={thumbnailUrl || undefined}
              controls
              className="w-full h-auto rounded-md shadow-sm max-w-full"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
);
      }
    }

    if (node.type === "EMBED" || node.embedData) {
const embedSrc = node.embedData?.src;

      if (!embedSrc) return null;

      const youtubeVideoId = extractYouTubeId(embedSrc)
      const youtubeEmbedUrl = youtubeVideoId ? getYouTubeEmbedUrl(youtubeVideoId, YOUTUBE_EMBED_PARAMS) : null

      if (youtubeEmbedUrl) {
        return (
          <div
            key={index}
            className="my-6 md:my-8 relative w-full"
            style={{ paddingBottom: "56.25%", height: 0 }}
          >
            <iframe
              src={youtubeEmbedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full rounded-md shadow-sm"
              loading="lazy"
            />
          </div>
);
      }

      if (embedSrc.startsWith("http")) {
        return (
          <div
            key={index}
            className="my-6 md:my-8 relative w-full"
            style={{ paddingBottom: "56.25%", height: 0 }}
          >
            <iframe
              src={embedSrc}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full rounded-md shadow-sm"
              loading="lazy"
            />
          </div>
);
      }

      if (embedSrc.startsWith("<iframe") || embedSrc.startsWith("<div")) {
        return (
          <div
            key={index}
            className="my-6 md:my-8"
            dangerouslySetInnerHTML={{ __html: embedSrc }}
          />
        );
      }
    }

    if (node.type === "TABLE" || node.tableData) {
      return (
        <div key={index} className="my-6 md:my-8 overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            {node.nodes && renderNodes(node.nodes)}
          </table>
        </div>
);
    }

    if (node.type === "TABLE_ROW" || node.tableRowData) {
      return <tr key={index}>{node.nodes && renderNodes(node.nodes)}</tr>;
    }

    if (node.type === "TABLE_CELL" || node.tableCellData) {
      return (
        <td key={index} className="border border-gray-300 p-2 align-top">
          {node.nodes && renderNodes(node.nodes)}
        </td>
);
    }

    if (node.type === "TABLE_HEADER_CELL" || node.tableHeaderCellData) {
      return (
<th
          key={index}
          className="border border-gray-300 p-2 bg-gray-50 font-semibold align-top"
        >
          {node.nodes && renderNodes(node.nodes)}
        </th>
      );
    }

    if (node.type === "CODE_BLOCK" || node.codeBlockData) {
      const code = node.textData?.text || "";
      const language = node.codeBlockData?.language || "";
      return (
        <pre
          key={index}
          className="my-4 p-4 bg-gray-100 rounded-md overflow-x-auto"
        >
          <code className={`language-${language}`}>{code}</code>
        </pre>
      );
    }

    if (node.nodes && Array.isArray(node.nodes)) {
      return (
        <Fragment key={index}>{renderNodes(node.nodes, isInsideList)}</Fragment>
      );
    }

    return null;
  };

  const renderNodes = (nodes: any[], isInsideList = false): ReactNode[] => {
    if (!Array.isArray(nodes)) return [];
    return nodes.map((node, index) => renderNode(node, index, isInsideList));
  };

  return (
    <div
      className={
        isRtl
          ? `${className || ''} rtl-text prose custom-list max-w-none text-base md:text-lg department-description-content`
          : (className || "prose custom-list max-w-none text-base md:text-lg department-description-content")
      }
      data-trans-managed="true"
      data-i18n-html
      dir={isRtl ? 'auto' : undefined}
    >
      {renderNodes(nodes)}
    </div>
  );
}
