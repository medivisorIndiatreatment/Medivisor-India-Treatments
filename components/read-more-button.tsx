"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ReadMoreButtonProps {
  text: string;
  limit?: number; // Optional prop to set a custom character limit
}

export function ReadMoreButton({ text, limit = 300 }: ReadMoreButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const shouldShowButton = text.length > limit;
  const displayText = isExpanded ? text : text.substring(0, limit) + "...";

  return (
    <div>
      <div className="prose max-w-none">
        {text.split("\n").map((paragraph, index) => (
          <p key={index} className="description mb-4 leading-relaxed">
            {isExpanded ? paragraph : text.substring(0, limit) + (shouldShowButton ? '...' : '')}
          </p>
        ))}
      </div>
      {shouldShowButton && (
        <Button
          variant="link"
          className="px-0 py-0 my-0 h-auto text-lg text-[#74BF44] "
          onClick={toggleExpanded}
        >
          {isExpanded ? "Read Less" : "Read More"}
        </Button>
      )}
    </div>
  );
}