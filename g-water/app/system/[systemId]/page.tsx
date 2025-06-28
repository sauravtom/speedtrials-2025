 'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SystemDetails {
  system: {
    pwsid: string
    pwsName: string
    cityName: string
    stateCode: string
    pwsTypeCode: string
    pwsTypeDecoded: string
    primarySourceCode: string
    primarySourceDecoded: string
    populationServedCount: number
    orgName: string
    phoneNumber: string
    emailAddr: string
    ownerTypeDecoded: string
    address: string
    zipCode: string
  }
  violations: Array<{
    violationId: string
    violationCode: string
    violationCodeDecoded: string
    contaminantCode: string
    contaminantDecoded: string
    nonComplPeriodBeginDate: string
    nonComplPeriodEndDate: string
    complianceStatusCode: string
    enforcementDate: string
  }>
  facilities: Array<{
    facilityId: string
    facilityName: string
    facilityTypeCode: string
    facilityTypeDecoded: string
    waterTypeCode: string
    waterTypeDecoded: string
    facilityActivityCode: string
    availabilityCode: string
  }>
  geographicAreas: Array<{
    geoAreaId: string
    areaTypeCode: string
    areaName: string
    countyServed: string
    cityServed: string
  }>
  siteVisits: Array<{
    visitId: string
    visitDate: string
    visitReasonCode: string
    visitReasonDecoded: string
    visitTypeCode: string
    stateInspectorId: string
  }>
  lcrSamples: Array<{
    sampleId: string
    samplingStartDate: string
    samplingEndDate: string
    leadResult90thPercentile: number
    copperResult90thPercentile: number
    leadSampleCount: number
    copperSampleCount: number
  }>
  events: Array<{
    eventId: string
    eventCode: string
    eventActualDate: string
    eventScheduledDate: string
    eventTypeCode: string
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

export default function SystemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [systemData, setSystemData] = useState<SystemDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        const response = await fetch(`/api/systems/${params.systemId}`)
        if (!response.ok) {
          throw new Error('System not found')
        }
        const data = await response.json()
        setSystemData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load system data')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.systemId) {
      fetchSystemData()
    }
  }, [params.systemId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !systemData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error || 'System not found'}
            </AlertDescription>
          </Alert>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const { system, violations, facilities, geographicAreas, siteVisits, lcrSamples, events, summary } = systemData

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString()
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
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
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
                            <span>{system.cityName}, {system.stateCode} {system.zipCode}</span>
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
                        <Badge variant="secondary">{system.pwsTypeDecoded}</Badge>
                        <Badge variant="outline">{system.primarySourceDecoded}</Badge>
                        <Badge variant="outline">{system.ownerTypeDecoded}</Badge>
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
                            <div key={area.geoAreaId || index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium">{area.areaName}</span>
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
                          {violations.map((violation, index) => (
                            <TableRow key={violation.violationId || index}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{violation.violationCodeDecoded}</div>
                                  <div className="text-sm text-gray-500">{violation.violationCode}</div>
                                </div>
                              </TableCell>
                              <TableCell>{violation.contaminantDecoded || violation.contaminantCode}</TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>{formatDate(violation.nonComplPeriodBeginDate)}</div>
                                  <div className="text-gray-500">to {formatDate(violation.nonComplPeriodEndDate)}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getViolationSeverity(violation.complianceStatusCode)}>
                                  {violation.complianceStatusCode === 'O' ? 'Open' : 'Resolved'}
                                </Badge>
                              </TableCell>
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
                      <div className="space-y-4">
                        {facilities.map((facility, index) => (
                          <div key={facility.facilityId || index} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium">{facility.facilityName}</h4>
                                <p className="text-sm text-gray-600">{facility.facilityTypeDecoded}</p>
                                {facility.waterTypeDecoded && (
                                  <p className="text-sm text-gray-500">Water Type: {facility.waterTypeDecoded}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="outline">{facility.facilityTypeCode}</Badge>
                                <Badge variant={facility.facilityActivityCode === 'A' ? 'default' : 'secondary'}>
                                  {facility.facilityActivityCode === 'A' ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
                            <TableHead>Type</TableHead>
                            <TableHead>Inspector</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {siteVisits.map((visit, index) => (
                            <TableRow key={visit.visitId || index}>
                              <TableCell>{formatDate(visit.visitDate)}</TableCell>
                              <TableCell>{visit.visitReasonDecoded || visit.visitReasonCode}</TableCell>
                              <TableCell>{visit.visitTypeCode}</TableCell>
                              <TableCell>{visit.stateInspectorId || 'N/A'}</TableCell>
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
                            <TableHead>Sample Period</TableHead>
                            <TableHead>Lead (90th %)</TableHead>
                            <TableHead>Copper (90th %)</TableHead>
                            <TableHead>Sample Count</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lcrSamples.map((sample, index) => (
                            <TableRow key={sample.sampleId || index}>
                              <TableCell>
                                <div className="text-sm">
                                  <div>{formatDate(sample.samplingStartDate)}</div>
                                  <div className="text-gray-500">to {formatDate(sample.samplingEndDate)}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {sample.leadResult90thPercentile ? 
                                  `${sample.leadResult90thPercentile} mg/L` : 'N/A'}
                              </TableCell>
                              <TableCell>
                                {sample.copperResult90thPercentile ? 
                                  `${sample.copperResult90thPercentile} mg/L` : 'N/A'}
                              </TableCell>
                              <TableCell>
                                Lead: {sample.leadSampleCount || 0}, Copper: {sample.copperSampleCount || 0}
                              </TableCell>
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
                      <div key={event.eventId || index} className="flex items-center space-x-3 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{event.eventCode}</div>
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