// app/api/branches/[slug]/route.ts
// Get single branch by slug with all required fields including multi-department references

import { NextResponse } from "next/server"
import { getAllCMSData, fetchAllDepartments, fetchAllSubDepartments } from "@/lib/cms"
import { generateSlug, findBranchBySlug } from "@/lib/slug-utils"
import { CACHE_HEADERS } from "@/lib/api/pagination"
import { fetchBranchPageData } from "@/lib/cms/optimized-fetchers"
function extractAllBranches(cmsData: any): Map<string, any> {
  const branchesMap = new Map<string, any>()
  
  cmsData.hospitals?.forEach((hospital: any) => {
    hospital.branches?.forEach((branch: any) => {
      const branchId = branch._id
      const branchName = branch.branchName || branch.name || ''
      
      if (!branchId || !branchName) return
      
      const slug = generateSlug(branchName)
      
      // Extract city information
      const cityData = Array.isArray(branch.city) ? branch.city.map((c: any) => ({
        _id: c._id || '',
        cityName: c.cityName || c.name || '',
        state: c.state || '',
        country: c.country || 'India'
      })) : []

      // Extract department references with full data
      const departmentData = Array.isArray(branch.department) ? branch.department.map((d: any) => ({
        _id: d._id || d.ID || '',
        name: d.name || d.departmentName || d.department || d.title || ''
      })) : []

      // Extract sub-department references with full data
      const subDepartmentData = Array.isArray(branch.subDepartment) ? branch.subDepartment.map((d: any) => ({
        _id: d._id || d.ID || '',
        name: d.name || d.subDepartmentName || d.subDepartment || d.title || ''
      })) : []

      // Extract doctor names
      const doctorNames = Array.isArray(branch.doctors) 
        ? branch.doctors.map((d: any) => d.doctorName || d.name || '').filter(Boolean)
        : branch.doctorNames || []

      const existing = branchesMap.get(slug) || {
        _id: branchId,
        branchName: branchName,
        slug: slug,
        hospitalId: hospital._id,
        hospitalName: hospital.hospitalName,
        address: branch.address,
        // City data
        city: cityData,
        cityName: cityData[0]?.cityName || '',
        state: cityData[0]?.state || '',
        // Multi-reference department data
        department: departmentData,
        // Multi-reference sub-department data
        subDepartment: subDepartmentData,
        treatments: [],
        specialist: [],
        doctors: branch.doctors || [],
        doctorNames: doctorNames,
        accreditation: [],
        description: branch.description,
        descriptionHtml: branch.descriptionHtml,
        // Additional fields from CSV
        totalBeds: branch.totalBeds,
        noOfDoctors: branch.noOfDoctors,
        yearEstablished: branch.yearEstablished,
        branchImage: branch.branchImage,
        logo: branch.logo,
        showHospital: branch.showHospital,
        popular: branch.popular,
        hospitalGroup: branch.hospitalGroup,
        // System fields
        createdDate: branch.createdDate || null,
        updatedDate: branch.updatedDate || null,
        owner: branch.owner || null,
        // Custom sort field
        manualSort: branch.manualSort || null,
      }
      
      // Add departments (avoid duplicates)
      branch.department?.forEach((dept: any) => {
        const deptId = dept._id || dept.name
        if (deptId && !existing.department.some((d: any) => d._id === deptId)) {
          existing.department.push({ _id: deptId, name: dept.name || '' })
        }
      })

      // Add sub-departments (avoid duplicates)
      branch.subDepartment?.forEach((subDept: any) => {
        const subDeptId = subDept._id || subDept.name
        if (subDeptId && !existing.subDepartment.some((d: any) => d._id === subDeptId)) {
          existing.subDepartment.push({ _id: subDeptId, name: subDept.name || '' })
        }
      })
      
      // Add treatments
      branch.treatments?.forEach((treatment: any) => {
        const treatId = treatment._id || treatment.name
        if (treatId && !existing.treatments.some((t: any) => t._id === treatId)) {
          const rawImage = [treatment.treatmentImageUrl, treatment.treatmentImage, treatment.image].find(
            (value) => typeof value === "string" && value.length > 0,
          )
          existing.treatments.push({ 
            _id: treatId, 
            name: treatment.name || treatment.treatmentName || '',
            treatmentImage: rawImage || null,
            cost: treatment.cost,
          })
        }
      })
      
      // Add specialist
      branch.specialist?.forEach((spec: any) => {
        const specId = spec._id || spec.name
        if (specId && !existing.specialist.some((s: any) => s._id === specId)) {
          existing.specialist.push({ _id: specId, name: spec.name || '' })
        }
      })
      
      // Add doctors
      branch.doctors?.forEach((doc: any) => {
        const docId = doc._id || doc.doctorName
        if (docId && !existing.doctors.some((d: any) => d._id === docId)) {
          existing.doctors.push({ 
            _id: docId, 
            doctorName: doc.doctorName || doc.name || '',
            qualification: doc.qualification,
            profileImage: doc.profileImage,
          })
        }
      })
      
      // Add accreditations
      branch.accreditation?.forEach((acc: any) => {
        const accId = acc._id || acc.title
        if (accId && !existing.accreditation.some((a: any) => a._id === accId)) {
          existing.accreditation.push({ 
            _id: accId, 
            title: acc.title || '',
            image: acc.image,
          })
        }
      })
      
      branchesMap.set(slug, existing)
    })
  })
  
  return branchesMap
}

/**
 * GET /api/branches/[slug]
 * Get single branch by slug
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Use the same relationship-aware loader as the page so this API exposes
    // the complete Wix branch graph instead of only embedded branch fields.
    const optimized = await fetchBranchPageData(slug)
    if (optimized.branch) {
      return NextResponse.json(
        {
          ...optimized.branch,
          treatments: optimized.treatments,
          doctors: optimized.doctors,
          allDoctors: optimized.allDoctors,
          hospitals: optimized.hospitals,
          departments: optimized.departments,
        },
        { headers: CACHE_HEADERS },
      )
    }
    
    // Fetch all CMS data as a compatibility fallback
    const cmsData = await getAllCMSData()
    
    // Extract all branches
    const branchesMap = extractAllBranches(cmsData)
    const allBranches = Array.from(branchesMap.values())
    
    // Find the branch by slug using the same logic as the page component
    let branch = findBranchBySlug(allBranches, slug)
    
    if (!branch) {
      // Fallback: try to find by decoding the slug or fuzzy matching
      const searchName = slug.replace(/-/g, ' ')
      
      branch = allBranches.find((b: any) => {
        const branchName = (b.branchName || b.name || '').toLowerCase()
        return branchName.includes(searchName) || searchName.includes(branchName)
      })
    }
    
    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404, headers: CACHE_HEADERS }
      )
    }
    
    // Enrich department data with full department information if available
    // The department array already contains multi-reference data from CMS
    
    // Return the complete branch data with all required fields
    return NextResponse.json({
      // Core identification
      ID: branch._id,
      _id: branch._id,
      branchName: branch.branchName,
      slug: branch.slug,
      
      // Hospital reference
      hospitalId: branch.hospitalId,
      hospitalName: branch.hospitalName,
      hospitalGroup: branch.hospitalGroup,
      
      // Location
      address: branch.address,
      city: branch.city,
      cityName: branch.cityName,
      state: branch.state,
      
      // Department multi-references
      department: branch.department,
      SubDepartment: branch.subDepartment,
      
      // Medical data
      specialty: branch.specialist,
      specialization: branch.specialization,
      treatments: branch.treatments,
      doctors: branch.doctors,
      doctorNames: branch.doctorNames,
      accreditation: branch.accreditation,
      
      // Hospital details
      totalBeds: branch.totalBeds,
      noOfDoctors: branch.noOfDoctors,
      yearEstablished: branch.yearEstablished,
      
      // Media
      branchImage: branch.branchImage,
      logo: branch.logo,
      
      // Flags
      showHospital: branch.showHospital,
      popular: branch.popular,
      
      // Content
      description: branch.description,
      descriptionHtml: branch.descriptionHtml,
      
      // System fields
      createdDate: branch.createdDate,
      updatedDate: branch.updatedDate,
      owner: branch.owner,
      
      // Custom sort field - using bracket notation for special character in key
      'manualSort': branch.manualSort,
    } as any, {
      headers: CACHE_HEADERS,
    })
  } catch (error) {
    console.error('Error fetching branch:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branch' },
      { status: 500 }
    )
  }
}
