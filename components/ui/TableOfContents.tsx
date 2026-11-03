"use client"

import { useState, useEffect, useCallback } from "react"

interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  headings: Heading[]
  className?: string
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[&/\#,+()$~%.'":*?<>{}|]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function TableOfContents({ headings, className = "" }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("")

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const top = element.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: "smooth" })
      history.pushState(null, "", `#${id}`)
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    )

    const headingElements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[]

    headingElements.forEach((el) => observer.observe(el))

    return () => {
      headingElements.forEach((el) => observer.unobserve(el))
      observer.disconnect()
    }
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav
      className={`bg-white border md:block hidden border-gray-200 rounded-xl p-4 md:p-5 ${className}`}
      aria-label="Table of Contents"
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
        On This Page
      </h3>
      <ul className="space-y-1.5">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              className={`block text-sm py-1 px-2 rounded transition-colors ${
                activeId === heading.id
                  ? "text-[#29A9B9] font-semibold bg-[#29A9B9]/10"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              } ${heading.level === 1 ? "font-semibold" : heading.level === 2 ? "ml-3" : "ml-6"}`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function extractHeadingsFromNodes(nodes: any[]): Heading[] {
  const headings: Heading[] = []

  function traverse(node: any) {
    if (!node) return

    if (node.type === "HEADING" || node.headingData) {
      const level = node.headingData?.level || 4
      const text = extractTextFromNode(node)
      if (text) {
        headings.push({ id: generateSlug(text), text, level })
      }
    }

    if (node.nodes && Array.isArray(node.nodes)) {
      node.nodes.forEach(traverse)
    }
  }

  function extractTextFromNode(node: any): string {
    if (!node) return ""
    if (node.textData?.text) return node.textData.text
    if (node.nodes && Array.isArray(node.nodes)) {
      return node.nodes.map(extractTextFromNode).join("")
    }
    return ""
  }

  if (Array.isArray(nodes)) {
    nodes.forEach(traverse)
  } else if (nodes && typeof nodes === "object" && "nodes" in nodes) {
    traverse(nodes)
  }

  return headings
}

export function extractHeadingsFromHtml(html: string): Heading[] {
  const headings: Heading[] = []
  const regex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gis
  let match

  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1], 10)
    const text = match[2].replace(/<[^>]*>/g, "").trim()
    if (text) {
      headings.push({ id: generateSlug(text), text, level })
    }
  }

  return headings
}
