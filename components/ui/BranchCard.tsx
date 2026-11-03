"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, Phone, Building2 } from "lucide-react"
import ImageWithFallback from "./ImageWithFallback"
import { generateSlug, generateBranchSlug } from "@/lib/slug-utils"
import { getBranchImage, getBranchName, getPrimaryCity } from "@/lib/utils/cms"
import { BranchData } from "@/lib/types"

interface BranchCardProps {
  branch: BranchData
  hospitalName?: string
  showFullDetails?: boolean
  variant?: "default" | "compact"
}

const BranchCard = ({ branch, hospitalName, showFullDetails = false, variant = "default" }: BranchCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const branchImage = getBranchImage(branch.branchImage)
  const branchName = getBranchName(branch)
  const cityName = getPrimaryCity(branch)
  
const branchSlug = generateBranchSlug(branchName, cityName)
  
  const isCompact = variant === "compact"

  // Build href based on whether it's a standalone hospital or a branch
  // All branches now use the /hospital-branches/ path
  const getHref = () => {
    return `/hospital-branches/${branchSlug}`
  }

  return (
    <Link
      href={getHref()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group flex flex-col h-full bg-white border border-gray-100 rounded-md shadow-xs hover:shadow-md overflow-hidden transition-all focus:outline-none focus:ring-1 focus:ring-gray-400/50 ${isCompact ? 'rounded-md' : ''}`}
    >
      {/* Image */}
      <div className={`relative ${isCompact ? 'h-32' : 'h-40'} overflow-hidden bg-gray-50`}>
        <div className="absolute inset-0">
          <ImageWithFallback
            src={branchImage}
            alt={branchName}
            fallbackIcon={Building2}
            className="object-cover group-hover:scale-105 transition-transform duration-300 w-full h-full"
          />
        </div>
      </div>
      
      <div className={`flex-1 flex flex-col font-light ${isCompact ? 'p-2' : 'p-4'}`}>
        {/* Branch Name */}
        <h3 className={`font-medium text-gray-900 leading-tight mb-1 ${isCompact ? 'text-base' : 'text-lg'}`}>
          {branchName}
        </h3>
        
        {/* Hospital Name */}
        {hospitalName && (
          <p className="text-sm text-gray-600 mb-2">
            {hospitalName}
          </p>
        )}
        
        {/* Location */}
        <div className="flex items-start gap-1 text-sm text-gray-500 mb-1">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">
            {branch.address || cityName}
          </span>
        </div>
        
        {/* Show full details if requested */}
        {showFullDetails && (
          <div className="mt-auto pt-2 space-y-1">
            {/* Beds */}
            {branch.totalBeds && (
              <p className="text-xs text-gray-500">
                {branch.totalBeds} Beds
              </p>
            )}
            
            {/* Doctors count */}
            {branch.noOfDoctors && (
              <p className="text-xs text-gray-500">
                {branch.noOfDoctors} Doctors
              </p>
            )}
            
            {/* Contact */}
            {branch.contactNumber && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Phone className="w-3 h-3" />
                {branch.contactNumber}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

export default BranchCard
