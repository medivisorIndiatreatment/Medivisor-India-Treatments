import { NextResponse } from 'next/server'
import { fetchAllTreatmentsCached } from '@/lib/cms'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const treatments = await fetchAllTreatmentsCached()
  const maxHospitalId = 'd74971a3-6e19-42d2-97ff-56dcf32a1517'
  const branchId = '3c61dde2-da7e-4ac4-a069-b7f7fcdd434a'
  
  const withMaxHospital = treatments.filter((t: any) => 
    t.branchesAvailableAt?.some((b: any) => b.hospitalId === maxHospitalId)
  )
  const withBranchId = treatments.filter((t: any) => 
    t.branchesAvailableAt?.some((b: any) => b.branchId === branchId)
  )
  
  const sampleWithHospital = withMaxHospital.slice(0, 3).map((t: any) => ({
    _id: t._id,
    name: t.name,
    branchesAvailableAtCount: t.branchesAvailableAt?.length || 0,
    branchesAvailableAtSample: t.branchesAvailableAt?.slice(0, 3).map((b: any) => ({
      branchId: b.branchId,
      hospitalId: b.hospitalId,
      branchName: b.branchName,
    })),
  }))
  
  const sampleWithBranch = withBranchId.slice(0, 3).map((t: any) => ({
    _id: t._id,
    name: t.name,
    branchesAvailableAtCount: t.branchesAvailableAt?.length || 0,
    branchesAvailableAtSample: t.branchesAvailableAt?.slice(0, 3).map((b: any) => ({
      branchId: b.branchId,
      hospitalId: b.hospitalId,
      branchName: b.branchName,
    })),
  }))
  
  return NextResponse.json({
    totalRawTreatments: treatments.length,
    withMaxHospital: withMaxHospital.length,
    withBranchId: withBranchId.length,
    sampleWithHospital,
    sampleWithBranch,
  })
}
