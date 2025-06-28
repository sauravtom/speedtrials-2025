import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { 
  waterSystems, 
  violations, 
  facilities, 
  geographicAreas, 
  siteVisits, 
  lcrSamples, 
  refCodeValues,
  eventsMilestones
} from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ systemId: string }> }
) {
  try {
    const { systemId } = await params

    // Get main system information
    const system = await db
      .select()
      .from(waterSystems)
      .where(eq(waterSystems.pwsid, systemId))
      .limit(1)

    if (system.length === 0) {
      return NextResponse.json(
        { error: 'Water system not found' },
        { status: 404 }
      )
    }

    // Get violations
    const systemViolations = await db
      .select()
      .from(violations)
      .where(eq(violations.pwsid, systemId))
      .orderBy(desc(violations.nonComplPeriodBeginDate))
      .limit(100)

    // Get facilities
    const systemFacilities = await db
      .select()
      .from(facilities)
      .where(eq(facilities.pwsid, systemId))
      .orderBy(facilities.facilityName)

    // Get geographic areas served
    const systemAreas = await db
      .select()
      .from(geographicAreas)
      .where(eq(geographicAreas.pwsid, systemId))

    // Get recent site visits
    const systemVisits = await db
      .select()
      .from(siteVisits)
      .where(eq(siteVisits.pwsid, systemId))
      .orderBy(desc(siteVisits.visitDate))
      .limit(20)

    // Get LCR samples
    const systemSamples = await db
      .select()
      .from(lcrSamples)
      .where(eq(lcrSamples.pwsid, systemId))
      .orderBy(desc(lcrSamples.samplingEndDate))
      .limit(50)

    // Get events and milestones
    const systemEvents = await db
      .select()
      .from(eventsMilestones)
      .where(eq(eventsMilestones.pwsid, systemId))
      .orderBy(desc(eventsMilestones.eventActualDate))
      .limit(20)

    // Get reference codes for decoding
    const allRefCodes = await db
      .select()
      .from(refCodeValues)

    // Create lookup map for reference codes
    const refCodeMap = new Map<string, Map<string, string>>()
    allRefCodes.forEach(code => {
      if (!refCodeMap.has(code.valueType)) {
        refCodeMap.set(code.valueType, new Map())
      }
      refCodeMap.get(code.valueType)!.set(code.valueCode, code.valueDescription || '')
    })

    // Helper function to decode reference values
    const decodeRef = (type: string, code: string | null) => {
      if (!code) return null
      return refCodeMap.get(type)?.get(code) || code
    }

    // Enhance data with decoded values
    const enhancedSystem = {
      ...system[0],
      pwsTypeDecoded: decodeRef('PWS_TYPE_CODE', system[0].pwsTypeCode),
      primarySourceDecoded: decodeRef('PRIMARY_SOURCE_CODE', system[0].primarySourceCode),
      ownerTypeDecoded: decodeRef('OWNER_TYPE_CODE', system[0].ownerTypeCode),
    }

    const enhancedViolations = systemViolations.map(violation => ({
      ...violation,
      violationCodeDecoded: decodeRef('VIOLATION_CODE', violation.violationCode),
      contaminantDecoded: decodeRef('CONTAMINANT_CODE', violation.contaminantCode),
    }))

    const enhancedFacilities = systemFacilities.map(facility => ({
      ...facility,
      facilityTypeDecoded: decodeRef('FACILITY_TYPE_CODE', facility.facilityTypeCode),
      waterTypeDecoded: decodeRef('WATER_TYPE_CODE', facility.waterTypeCode),
    }))

    const enhancedVisits = systemVisits.map(visit => ({
      ...visit,
      visitReasonDecoded: decodeRef('VISIT_REASON_CODE', visit.visitReasonCode),
    }))

    return NextResponse.json({
      system: enhancedSystem,
      violations: enhancedViolations,
      facilities: enhancedFacilities,
      geographicAreas: systemAreas,
      siteVisits: enhancedVisits,
      lcrSamples: systemSamples,
      events: systemEvents,
      summary: {
        totalViolations: systemViolations.length,
        totalFacilities: systemFacilities.length,
        totalAreas: systemAreas.length,
        recentVisits: systemVisits.length,
        recentSamples: systemSamples.length,
        recentEvents: systemEvents.length,
      }
    })
  } catch (error) {
    console.error('System details API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 