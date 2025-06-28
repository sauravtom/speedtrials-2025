import { notFound } from 'next/navigation'
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Droplets, 
  Building, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Phone,
  Mail,
  Factory,
  FileText,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import Link from 'next/link'
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

interface SystemDetails {
  system: {
    pwsid: string
    pwsName: string | null
    cityName: string | null
    stateCode: string | null
    pwsTypeCode: string | null
    pwsTypeDecoded: string | null
    primarySourceCode: string | null
    primarySourceDecoded: string | null
    populationServedCount: number | null
    orgName: string | null
    phoneNumber: string | null
    emailAddr: string | null
    ownerTypeDecoded: string | null
    addressLine1: string | null
    addressLine2: string | null
    zipCode: string | null
  }
  violations: Array<{
    violationId: string
    violationCode: string | null
    violationCodeDecoded: string | null
    contaminantCode: string | null
    contaminantDecoded: string | null
    nonComplPeriodBeginDate: string | null
    nonComplPeriodEndDate: string | null
  }>
  facilities: Array<{
    facilityId: string
    facilityName: string | null
    facilityTypeCode: string | null
    facilityTypeDecoded: string | null
    waterTypeCode: string | null
    waterTypeDecoded: string | null
    facilityActivityCode: string | null
    availabilityCode: string | null
  }>
  geographicAreas: Array<{
    geoId: string
    areaTypeCode: string | null
    countyServed: string | null
    cityServed: string | null
  }>
  siteVisits: Array<{
    visitId: string
    visitDate: string | null
    visitReasonCode: string | null
    visitReasonDecoded: string | null
  }>
  lcrSamples: Array<{
    sampleId: string
    samplingStartDate: string | null
    samplingEndDate: string | null
    contaminantCode: string | null
    sampleMeasure: number | null
    unitOfMeasure: string | null
  }>
  events: Array<{
    eventScheduleId: string
    eventActualDate: string | null
    eventMilestoneCode: string | null
    eventCommentsText: string | null
  }>
  summary: {
    totalViolations: number
    totalFacilities: number
    totalAreas: number
    recentVisits: number
    recentSamples: number
    recentEvents: number
  }
}

async function getSystemData(systemId: string): Promise<SystemDetails | null> {
  try {
    // Get main system information
    const system = await db
      .select()
      .from(waterSystems)
      .where(eq(waterSystems.pwsid, systemId))
      .limit(1)

    if (system.length === 0) {
      return null
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

    const enhancedSystemTyped = {
      ...enhancedSystem,
      addressLine1: enhancedSystem.addressLine1,
      addressLine2: enhancedSystem.addressLine2,
    }
    
    // The schema for lcrSamples is more complex than what we can easily represent
    // For now, we are returning the raw sample data
    const enhancedLcrSamples = systemSamples.map(sample => ({
      ...sample,
    }))

    return {
      system: enhancedSystemTyped,
      violations: enhancedViolations,
      facilities: enhancedFacilities,
      geographicAreas: systemAreas,
      siteVisits: enhancedVisits,
      lcrSamples: enhancedLcrSamples,
      events: systemEvents,
      summary: {
        totalViolations: systemViolations.length,
        totalFacilities: systemFacilities.length,
        totalAreas: systemAreas.length,
        recentVisits: systemVisits.length,
        recentSamples: systemSamples.length,
        recentEvents: systemEvents.length,
      }
    }
  } catch (error) {
    console.error('System details error:', error)
    return null
  }
}

export default async function SystemDetailPage({
  params,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Promise<any>
}) {
  const { systemId } = await params
  const systemData = await getSystemData(systemId)

  if (!systemData) {
    notFound()
  }

  const { system, violations, facilities, geographicAreas, siteVisits, lcrSamples, events, summary } = systemData

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    try {
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(dateString))
    } catch {
      return dateString
    }
  }

  const getViolationSeverity = (complianceStatus: string) => {
    switch (complianceStatus) {
      case 'O': return 'destructive' // Open violation
      case 'R': return 'default' // Resolved
      default: return 'secondary'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <Droplets className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{system.pwsName}</h1>
                <p className="text-gray-600">System ID: {system.pwsid}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="violations">Violations</TabsTrigger>
                <TabsTrigger value="facilities">Facilities</TabsTrigger>
                <TabsTrigger value="inspections">Inspections</TabsTrigger>
                <TabsTrigger value="samples">Samples</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>System Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Organization:</span>
                            <span>{system.orgName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Location:</span>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              <p className="text-sm text-muted-foreground">
                                {system.addressLine1}{system.addressLine2 ? `, ${system.addressLine2}` : ''}, {system.cityName}, {system.stateCode} {system.zipCode}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Population Served:</span>
                            <span>{system.populationServedCount?.toLocaleString() || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Phone:</span>
                            <span>{system.phoneNumber || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Email:</span>
                            <span>{system.emailAddr || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="secondary">{system.pwsTypeDecoded || 'N/A'}</Badge>
                        <Badge variant="outline">{system.primarySourceDecoded || 'N/A'}</Badge>
                        <Badge variant="outline">{system.ownerTypeDecoded || 'N/A'}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Service Areas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {geographicAreas.length > 0 ? (
                        <div className="space-y-2">
                          {geographicAreas.map((area, index) => (
                            <div key={area.geoId || index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium">{area.cityServed || area.countyServed || 'N/A'}</span>
                                {area.cityServed && <span className="text-sm text-gray-600 ml-2">({area.cityServed})</span>}
                              </div>
                              <Badge variant="outline">{area.areaTypeCode}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No service area information available</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="violations">
                <Card>
                  <CardHeader>
                    <CardTitle>Violations History</CardTitle>
                    <CardDescription>
                      {summary.totalViolations} total violations found
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {violations.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Violation</TableHead>
                            <TableHead>Contaminant</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {systemData.violations.map((violation) => (
                            <TableRow key={violation.violationId}>
                              <TableCell>
                                <Badge variant={getViolationSeverity('')} className="text-xs">
                                  {violation.violationCodeDecoded || 'N/A'}
                                </Badge>
                              </TableCell>
                              <TableCell>{violation.contaminantDecoded || 'N/A'}</TableCell>
                              <TableCell>{formatDate(violation.nonComplPeriodBeginDate)}</TableCell>
                              <TableCell>{formatDate(violation.nonComplPeriodEndDate)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <p className="text-lg font-medium">No violations found</p>
                        <p className="text-gray-500">This system has no recorded violations</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="facilities">
                <Card>
                  <CardHeader>
                    <CardTitle>System Facilities</CardTitle>
                    <CardDescription>
                      {summary.totalFacilities} facilities registered
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {facilities.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Facility Name</TableHead>
                            <TableHead>Facility Type</TableHead>
                            <TableHead>Water Type</TableHead>
                            <TableHead>Availability</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {systemData.facilities.map((facility) => (
                            <TableRow key={facility.facilityId}>
                              <TableCell className="font-medium">{facility.facilityName}</TableCell>
                              <TableCell>{facility.facilityTypeDecoded || 'N/A'}</TableCell>
                              <TableCell>{facility.waterTypeDecoded || 'N/A'}</TableCell>
                              <TableCell>{facility.availabilityCode}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No facility information available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inspections">
                <Card>
                  <CardHeader>
                    <CardTitle>Site Visits & Inspections</CardTitle>
                    <CardDescription>
                      {summary.recentVisits} recent site visits
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {siteVisits.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Reason</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {systemData.siteVisits.map((visit) => (
                            <TableRow key={visit.visitId}>
                              <TableCell>{formatDate(visit.visitDate)}</TableCell>
                              <TableCell>{visit.visitReasonDecoded || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No inspection records available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="samples">
                <Card>
                  <CardHeader>
                    <CardTitle>Lead & Copper Samples</CardTitle>
                    <CardDescription>
                      {summary.recentSamples} recent sampling records
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {lcrSamples.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sample ID</TableHead>
                            <TableHead>Contaminant</TableHead>
                            <TableHead>Measure</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lcrSamples.map((sample, index) => (
                            <TableRow key={sample.sampleId || index}>
                              <TableCell>{sample.sampleId}</TableCell>
                              <TableCell>{sample.contaminantCode || 'N/A'}</TableCell>
                              <TableCell>{sample.sampleMeasure || 'N/A'}</TableCell>
                              <TableCell>{sample.unitOfMeasure || 'N/A'}</TableCell>
                              <TableCell>{formatDate(sample.samplingStartDate)}</TableCell>
                              <TableCell>{formatDate(sample.samplingEndDate)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No sampling data available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Violations</span>
                    </div>
                    <Badge variant={summary.totalViolations > 0 ? 'destructive' : 'default'}>
                      {summary.totalViolations}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Factory className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Facilities</span>
                    </div>
                    <Badge variant="secondary">{summary.totalFacilities}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Recent Inspections</span>
                    </div>
                    <Badge variant="outline">{summary.recentVisits}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Sample Tests</span>
                    </div>
                    <Badge variant="outline">{summary.recentSamples}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {events.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {events.slice(0, 5).map((event, index) => (
                      <div key={event.eventScheduleId || index} className="flex items-center space-x-3 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{event.eventMilestoneCode}</div>
                          <div className="text-gray-500">{formatDate(event.eventActualDate)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}