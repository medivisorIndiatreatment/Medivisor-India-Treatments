"use client"

import Link from "next/link"
import { Home, Search, Phone, ArrowLeft, Heart, Stethoscope, Building2, BriefcaseMedical } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Medical Icon Animation */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-[#74BF44]/20 rounded-full flex items-center justify-center shadow-xs border border-[#74BF44]/10">
            <Stethoscope className="w-16 h-16 text-[#74BF44]" />
          </div>
         
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 text-balance">Page Not Found</h2>
          <p className="text-xl text-[#241d1f] leading-relaxed mb-2">
            Oops! The page you're looking for seems to have wandered off.
          </p>
          <p className="text-lg text-gray-500">Don't worry, our medical team is here to help you find what you need.</p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/"
            className="group bg-white rounded-2xl p-6 shadow-xs border border-gray-100 hover:shadow-sm transition-all duration-200 hover:border-[#74BF44]/20"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-[#74BF44]/20 rounded-xl mb-4 mx-auto transition-colors">
              <Home className="w-6 h-6 text-[#74BF44]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Go Home</h3>
            <p className="text-[#241d1f] text-sm">Return to our homepage</p>
          </Link>

          <Link
            href="/search"
            className="group bg-white rounded-2xl p-6 shadow-xs border border-gray-100 hover:shadow-sm transition-all duration-200 hover:border-[#74BF44]/20"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4 mx-auto transition-colors">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Hospitals</h3>
            <p className="text-[#241d1f] text-sm">Browse all hospitals</p>
          </Link>

          <Link
            href="/treatments"
            className="group bg-white rounded-2xl p-6 shadow-xs border border-gray-100 hover:shadow-sm transition-all duration-200 hover:border-[#74BF44]/20"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4 mx-auto transition-colors">
              <BriefcaseMedical className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Treatments</h3>
            <p className="text-[#241d1f] text-sm">View all treatments</p>
          </Link>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100">
          <p className="text-[#241d1f] mb-4">Still can't find what you're looking for?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-[#74BF44] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#5a9e32] transition-colors"
            >
              <Phone className="w-5 h-5" />
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
