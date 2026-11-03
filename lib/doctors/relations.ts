// lib/doctors/relations.ts
// Single-source relationship resolver for Doctor → Hospital → Branch → Specialization → Treatments
// Built once per page load and reused across all transformers and UI components.

import type { HospitalData, DoctorData, TreatmentData, BranchData, SpecializationData, SpecialistWithBranchInfo } from '@/lib/cms/types'
import type { DoctorCardData, DoctorBranchInfo } from '@/components/cards/types'
import { generateSlug } from '@/lib/slug-utils'
import { getWixImageUrl } from '@/lib/wixMedia'
import { buildHospitalLookupMaps, processDoctorToCard, getSpecializationString } from '@/lib/utils/doctor-card-utils'
import { mapTreatmentToCard } from '@/lib/utils/treatment-card-utils'
import { extractRichText, extractAchievementsText } from '@/lib/cms'

// =============================================================================
// TYPES
// =============================================================================

export interface ResolvedBranchInfo {
  branchId: string
  branchName: string
  hospitalId: string
  hospitalName: string
  isStandalone: boolean
}

export interface RelatedDoctorScore {
  doctor: DoctorData
  score: number
}

// =============================================================================
// RESOLVER
// =============================================================================

export class DoctorRelationshipResolver {
  private hospitalLookup = new Map<string, HospitalData>()
  private hospitalNameLookup = new Map<string, HospitalData>()
  private branchToHospitalMap = new Map<string, ResolvedBranchInfo>()
  private doctorById = new Map<string, DoctorData>()
  private treatmentById = new Map<string, TreatmentData>()
  private specializationTreatments = new Map<string, Set<string>>()
  private specialistWithBranch: SpecialistWithBranchInfo[] = []

  constructor(
    private hospitals: HospitalData[],
    private doctors: DoctorData[],
    private treatments: TreatmentData[],
    specialistWithBranch: SpecialistWithBranchInfo[] = [],
  ) {
    this.specialistWithBranch = specialistWithBranch
    this.buildMaps()
  }

  // ---------------------------------------------------------------------------
  // Map building (runs once in constructor)
  // ---------------------------------------------------------------------------

  private buildMaps(): void {
    const { hospitalLookup, hospitalNameLookup, branchToHospitalMap } = buildHospitalLookupMaps(this.hospitals)
    this.hospitalLookup = hospitalLookup
    this.hospitalNameLookup = hospitalNameLookup

    for (const [bid, entry] of branchToHospitalMap) {
      this.branchToHospitalMap.set(bid, {
        branchId: bid,
        branchName: entry.branchName,
        hospitalId: entry.hospitalId,
        hospitalName: entry.hospitalName,
        isStandalone: entry.isStandalone,
      })
    }

    for (const doc of this.doctors) {
      if (doc._id) this.doctorById.set(doc._id, doc)
    }

    for (const t of this.treatments) {
      if (t._id) this.treatmentById.set(t._id, t)
    }

    // Build specialization → treatment mapping
    for (const t of this.treatments) {
      if (t.specialists && Array.isArray(t.specialists)) {
        for (const spec of t.specialists) {
          const specName = (spec.name || '').toLowerCase().trim()
          if (!specName) continue
          if (!this.specializationTreatments.has(specName)) {
            this.specializationTreatments.set(specName, new Set())
          }
          this.specializationTreatments.get(specName)!.add(t._id)
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  getHospitalById(id: string): HospitalData | undefined {
    return this.hospitalLookup.get(id)
  }

  getHospitalByName(name: string): HospitalData | undefined {
    const key = name.trim().toLowerCase()
    return this.hospitalNameLookup.get(key) || this.hospitalNameLookup.get(key.trim())
  }

  getBranchInfo(branchId: string): ResolvedBranchInfo | undefined {
    return this.branchToHospitalMap.get(branchId)
  }

  getDoctorById(id: string): DoctorData | undefined {
    return this.doctorById.get(id)
  }

  getTreatmentById(id: string): TreatmentData | undefined {
    return this.treatmentById.get(id)
  }

  getTreatmentsForSpecialization(specName: string): Set<string> {
    return this.specializationTreatments.get(specName.toLowerCase().trim()) || new Set()
  }

  /**
   * Resolve hospital + branch info for a doctor using the canonical priority chain:
   * 1. doctor.hospital[0].hospital + doctor.hospital[0].branchName/branchId
   * 2. doctor.hospitalId + doctor.branchId/branchName
   * 3. BranchesMaster_doctor / branches multi-reference
   * 4. _branchIds / _branchNames enrichment
   * 5. Fallback: hospital name → branch name (only when absolutely necessary)
   */
  resolveDoctorBranchInfo(doctor: DoctorData): { hospitalId: string; hospitalName: string; branchId: string; branchName: string } {
    let hospitalName = ''
    let hospitalId = ''
    let branchName = ''
    let branchId = ''

    // Priority 1: doctor.hospital multi-reference (array or single object)
    if (doctor.hospital && !Array.isArray(doctor.hospital) && typeof doctor.hospital === 'object') {
      const h = doctor.hospital as any
      hospitalName = h.hospital?.name || h.hospital?.hospitalName || h.name || h.hospitalName || ''
      hospitalId = h.hospital?._id || h.hospital?.ID || h._id || h.ID || ''
      branchName = h.branch?.name || h.branchName || ''
      branchId = h.branch?._id || h.branch?.ID || h.branchId || ''
    } else if (Array.isArray(doctor.hospital) && doctor.hospital.length > 0) {
      const ref = doctor.hospital[0] as any
      if (ref.hospital && typeof ref.hospital === 'object') {
        hospitalName = ref.hospital.name || ref.hospital.hospitalName || ''
        hospitalId = ref.hospital._id || ref.hospital.ID || ''
        branchName = ref.branchName || (ref.branch && ref.branch.name) || ''
        branchId = ref.branchId || (ref.branch && ref.branch._id) || ''
      } else {
        hospitalName = ref.name || ref.hospitalName || ''
        hospitalId = ref._id || ref.ID || ''
        branchName = ref.branchName || (ref.branch && ref.branch.name) || ''
        branchId = ref.branchId || (ref.branch && ref.branch._id) || ''
      }
    }

    // Priority 2: Denormalized fields
    if (!hospitalName) hospitalName = doctor.hospitalName || ''
    if (!hospitalId) hospitalId = doctor.hospitalId || ''
    if (!branchName) branchName = doctor.branchName || ''
    if (!branchId) branchId = doctor.branchId || ''

    // Priority 3: Resolve hospital by name if we have name but not ID
    if (!hospitalId && hospitalName) {
      const matched = this.getHospitalByName(hospitalName)
      if (matched) {
        hospitalId = matched._id
        hospitalName = matched.hospitalName
      }
    }

    // Priority 4: Resolve branch via branchToHospitalMap
    if (branchId && this.branchToHospitalMap.has(branchId)) {
      const branchInfo = this.branchToHospitalMap.get(branchId)!
      if (!branchName) branchName = branchInfo.branchName
      if (!hospitalId) {
        hospitalId = branchInfo.hospitalId
        hospitalName = branchInfo.hospitalName
      }
    }

    // Priority 5: Resolve branch from multi-reference fields
    if (!branchId || !branchName) {
      const branchRefs = (doctor as any).BranchesMaster_doctor || (doctor as any).branches || []
      const refArray = Array.isArray(branchRefs) ? branchRefs : [branchRefs]
      for (const ref of refArray) {
        if (!ref) continue
        const refId = typeof ref === 'string' ? ref : (ref._id || ref.ID || '')
        if (refId && this.branchToHospitalMap.has(refId)) {
          const info = this.branchToHospitalMap.get(refId)!
          if (!branchId) branchId = refId
          if (!branchName) branchName = info.branchName
          if (!hospitalId) {
            hospitalId = info.hospitalId
            hospitalName = info.hospitalName
          }
          break
        }
      }
    }

    // Priority 6: _branchIds enrichment
    if (!branchId || !branchName) {
      const branchIdsValue = (doctor as any)._branchIds
      if (branchIdsValue) {
        const ids = branchIdsValue instanceof Set ? Array.from(branchIdsValue) : Array.isArray(branchIdsValue) ? branchIdsValue : []
        for (const bid of ids) {
          if (bid && this.branchToHospitalMap.has(bid)) {
            const info = this.branchToHospitalMap.get(bid)!
            if (!branchId) branchId = bid
            if (!branchName) branchName = info.branchName
            if (!hospitalId) {
              hospitalId = info.hospitalId
              hospitalName = info.hospitalName
            }
            break
          }
        }
      }
    }

    // Priority 7: _branchNames enrichment
    if (!branchName) {
      const branchNamesValue = (doctor as any)._branchNames
      if (branchNamesValue) {
        const names = branchNamesValue instanceof Set ? Array.from(branchNamesValue) : Array.isArray(branchNamesValue) ? branchNamesValue : []
        if (names.length > 0 && typeof names[0] === 'string') {
          branchName = names[0]
        }
      }
    }

    // Canonical reconciliation: the branchId is the authoritative
    // Hospital → Branch link. If it resolves to a known branch, its canonical
    // branch name (and hospital linkage) must win over any stale denormalized
    // `branchName` to prevent incorrect branch data.
    if (branchId && this.branchToHospitalMap.has(branchId)) {
      const branchInfo = this.branchToHospitalMap.get(branchId)!
      if (branchInfo.branchName) branchName = branchInfo.branchName
      if (!hospitalId) {
        hospitalId = branchInfo.hospitalId
        hospitalName = branchInfo.hospitalName
      }
    }

    return { hospitalId, hospitalName, branchId, branchName }
  }

  /**
   * Get hospitals associated with a doctor
   */
  getDoctorHospitals(doctor: DoctorData): HospitalData[] {
    const { hospitalId, branchId } = doctor
    const resolved = this.resolveDoctorBranchInfo(doctor)

    return this.hospitals.filter((h) => {
      if (h._id === resolved.hospitalId) return true
      if (resolved.branchId && h.branches?.some((b) => b._id === resolved.branchId)) return true
      if (resolved.branchName && h.branches?.some((b) => b.branchName === resolved.branchName)) return true
      return false
    })
  }

  /**
   * Get all branch info for a doctor
   */
  getDoctorBranchInfo(doctor: DoctorData): DoctorBranchInfo[] {
    const info: DoctorBranchInfo[] = []
    const seen = new Set<string>()

    const branchRefs = (doctor as any).BranchesMaster_doctor || (doctor as any).branches || []
    const refArray = Array.isArray(branchRefs) ? branchRefs : [branchRefs]

    for (const ref of refArray) {
      if (!ref) continue
      const refId = typeof ref === 'string' ? ref : (ref._id || ref.ID || '')
      if (!refId || seen.has(refId)) continue
      seen.add(refId)

      const branchData = this.branchToHospitalMap.get(refId)
      if (branchData) {
        info.push({
          branchId: branchData.branchId,
          branchName: branchData.branchName,
          hospitalId: branchData.hospitalId,
          hospitalName: branchData.hospitalName,
        })
      }
    }

    // Fallback to _branchIds
    if (info.length === 0) {
      const branchIdsValue = (doctor as any)._branchIds
      if (branchIdsValue) {
        const ids = branchIdsValue instanceof Set ? Array.from(branchIdsValue) : Array.isArray(branchIdsValue) ? branchIdsValue : []
        for (const bid of ids) {
          if (!bid || seen.has(bid)) continue
          seen.add(bid)
          const branchData = this.branchToHospitalMap.get(bid)
          if (branchData) {
            info.push({
              branchId: branchData.branchId,
              branchName: branchData.branchName,
              hospitalId: branchData.hospitalId,
              hospitalName: branchData.hospitalName,
            })
          }
        }
      }
    }

    return info.slice(0, 3)
  }

  /**
   * Score doctors for relatedness using four-axis scoring
   */
  scoreRelatedDoctors(currentDoctor: DoctorData, allDoctors: DoctorData[]): RelatedDoctorScore[] {
    const currentSpecs = new Set(
      (currentDoctor.specialization || [])
        .map((s) => (typeof s === 'string' ? s : (s?.name || '')).toLowerCase())
        .filter(Boolean),
    )

    const currentTreats = new Set<string>()
    for (const s of currentDoctor.specialization || []) {
      const specName = (typeof s === 'string' ? s : s?.name || '').toLowerCase()
      const treats = this.getTreatmentsForSpecialization(specName)
      for (const t of treats) currentTreats.add(t)
    }
    if ((currentDoctor as any).treatments) {
      for (const t of (currentDoctor as any).treatments) {
        const id = typeof t === 'string' ? t : t?._id || ''
        if (id) currentTreats.add(id.toLowerCase())
      }
    }

    const currentDepts = new Set<string>()
    for (const s of currentDoctor.specialization || []) {
      const spec = s as any
      if (spec?.department && Array.isArray(spec.department)) {
        for (const d of spec.department) {
          const name = typeof d === 'string' ? d : d?.name || ''
          if (name) currentDepts.add(name.toLowerCase())
        }
      }
    }

    const resolved = this.resolveDoctorBranchInfo(currentDoctor)

    const scored = allDoctors
      .filter((d) => d._id !== currentDoctor._id)
      .map((doc) => {
        let score = 0

        // Specialization match
        for (const spec of (doc.specialization || []).map((s) => (typeof s === 'string' ? s : (s?.name || '')).toLowerCase()).filter(Boolean)) {
          if (currentSpecs.has(spec)) {
            score += 3
          } else {
            for (const cur of currentSpecs) {
              if (spec.includes(cur) || cur.includes(spec)) { score += 1; break }
            }
          }
        }

        // Shared treatments
        const docTreats = new Set<string>()
        for (const s of doc.specialization || []) {
          const specName = (typeof s === 'string' ? s : s?.name || '').toLowerCase()
          for (const t of this.getTreatmentsForSpecialization(specName)) docTreats.add(t)
        }
        score += [...currentTreats].filter((t) => docTreats.has(t)).length * 5

        // Shared departments
        const docDepts = new Set<string>()
        for (const s of doc.specialization || []) {
          const spec = s as any
          if (spec?.department && Array.isArray(spec.department)) {
            for (const d of spec.department) {
              const name = typeof d === 'string' ? d : d?.name || ''
              if (name) docDepts.add(name.toLowerCase())
            }
          }
        }
        score += [...currentDepts].filter((d) => docDepts.has(d)).length * 3

        // Same hospital / branch
        const docResolved = this.resolveDoctorBranchInfo(doc)
        if (docResolved.hospitalId && resolved.hospitalId && docResolved.hospitalId === resolved.hospitalId) score += 1
        if (docResolved.branchId && resolved.branchId && docResolved.branchId === resolved.branchId) score += 1

        return { doctor: doc, score }
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score !== a.score ? b.score - a.score : (a.doctor.doctorName || a.doctor.name || '').localeCompare(b.doctor.doctorName || b.doctor.name || ''))

    return scored
  }

  /**
   * Build DoctorCardData array for all doctors (used for search/related carousels)
   */
  buildAllDoctorCards(hospitalLogoMap: Record<string, string | null>): DoctorCardData[] {
    return this.doctors
      .filter((d) => d._id)
      .map((doc) => processDoctorToCard(doc, hospitalLogoMap, this.hospitalLookup, this.hospitalNameLookup, this.branchToHospitalMap))
  }

  /**
   * Get treatments available for a specific doctor
   * Matches through:
   * 1. Doctor's specializations' treatments array
   * 2. Specialist treatment mappings (specialistWithBranch)
   * 3. Treatments offered at branches where the doctor works
   */
  getTreatmentsByDoctorId(doctorId: string): TreatmentData[] {
    const doctor = this.doctorById.get(doctorId)
    if (!doctor) return []

    const uniqueTreatments = new Map<string, TreatmentData>()

    const doctorSpecNames = (doctor.specialization || [])
      .map(s => (s.name || '').toLowerCase())
      .filter(Boolean)

    const addTreatment = (treatment: TreatmentData) => {
      if (treatment._id && !uniqueTreatments.has(treatment._id)) {
        uniqueTreatments.set(treatment._id, treatment)
      }
    }

    // Method 1: Check doctor's specializations for treatments
    for (const spec of doctor.specialization || []) {
      const specTreatments = (spec as any).treatments || []
      for (const t of specTreatments) {
        const tId = typeof t === 'string' ? t : (t as any)?._id || String(t)
        const treatment = this.treatmentById.get(tId)
        if (treatment && doctorSpecNames.some(name => name.includes((treatment.name || '').toLowerCase()))) {
          addTreatment(treatment)
        }
      }
    }

    // Method 2: Check specialistWithBranch mappings
    for (const specialist of this.specialistWithBranch) {
      const specName = specialist.name?.toLowerCase() || ''
      const hasMatchingSpec = doctorSpecNames.some(dSpec =>
        dSpec.includes(specName) || specName.includes(dSpec)
      )

      if (hasMatchingSpec && specialist.treatments) {
        for (const t of specialist.treatments) {
          const tId = t._id || String(t)
          const treatment = this.treatmentById.get(tId)
          if (treatment) {
            addTreatment(treatment)
          }
        }
      }
    }

    // Method 3: Check treatments at branches where the doctor works
    const resolved = this.resolveDoctorBranchInfo(doctor)
    if (resolved.hospitalId) {
      const hospital = this.hospitalLookup.get(resolved.hospitalId)
      if (hospital?.branches) {
        for (const branch of hospital.branches) {
          const worksAtBranch = resolved.branchId && branch._id === resolved.branchId
          const isInBranchDoctors = branch.doctors?.some((d: any) => d._id === doctorId)
          const hasDoctorRef = (branch as any).DoctorMaster_hospital?.some((ref: any) =>
            (ref._id || ref.ID) === doctorId
          ) || false

          if (worksAtBranch || isInBranchDoctors || hasDoctorRef) {
            for (const t of branch.treatments || []) {
              const tId = typeof t === 'string' ? t : (t as any)?._id || String(t)
              const treatment = this.treatmentById.get(tId)
              if (treatment) {
                addTreatment(treatment)
              }
            }
          }
        }
      }
    }

    return Array.from(uniqueTreatments.values())
  }
}
