'use client'

import { useState, useEffect } from 'react'
import { MapPin, Users, AlertTriangle, Building } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import CountyMap from '@/components/CountyMap'

interface CountyData {
  county: string
  systemCount: number
  totalPopulation: number
  violationCount: number
}

interface CountyResponse {
  counties: CountyData[]
  summary: {
    totalCounties: number
    totalSystems: number
    totalPopulation: number
    totalViolations: number
  }
  topCounties: {
    byPopulation: CountyData[]
    byViolations: CountyData[]
    bySystems: CountyData[]
  }
}

export default function CountiesPage() {
  const [countyData, setCountyData] = useState<CountyResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchFilter, setSearchFilter] = useState('')
  const [sortBy, setSortBy] = useState<'county' | 'systems' | 'population' | 'violations'>('county')

  useEffect(() => {
    const fetchCountyData = async () => {
      try {
        const response = await fetch('/api/counties')
        const data = await response.json()
        setCountyData(data)
      } catch (error) {
        console.error('Failed to fetch county data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCountyData()
  }, [])

  const filteredAndSortedCounties = countyData?.counties
    .filter(county => 
      county.county.toLowerCase().includes(searchFilter.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'systems':
          return b.systemCount - a.systemCount
        case 'population':
          return b.totalPopulation - a.totalPopulation
        case 'violations':
          return b.violationCount - a.violationCount
        default:
          return a.county.localeCompare(b.county)
      }
    }) || []

  const getViolationSeverity = (count: number) => {
    if (count === 0) return 'default'
    if (count < 5) return 'secondary'
    if (count < 20) return 'outline'
    return 'destructive'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Georgia Counties</h1>
                <p className="text-gray-600">Water System Statistics by County</p>
              </div>
            </div>
            <Link href="/">
              <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                Back to Search
              </Badge>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Counties</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{countyData?.summary.totalCounties}</div>
              <p className="text-xs text-muted-foreground">
                With active water systems
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Systems</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{countyData?.summary.totalSystems.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Active water systems
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Population Served</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{countyData?.summary.totalPopulation.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                People served statewide
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{countyData?.summary.totalViolations.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Recorded violations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* County Map */}
        <div className="mb-8">
          <CountyMap data={countyData?.counties} />
        </div>

        <Tabs defaultValue="all-counties" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all-counties">All Counties</TabsTrigger>
            <TabsTrigger value="top-population">By Population</TabsTrigger>
            <TabsTrigger value="top-systems">By Systems</TabsTrigger>
            <TabsTrigger value="top-violations">By Violations</TabsTrigger>
          </TabsList>

          <TabsContent value="all-counties">
            <Card>
              <CardHeader>
                <CardTitle>All Georgia Counties</CardTitle>
                <CardDescription>
                  Complete list of counties with water system data
                </CardDescription>
                <div className="flex space-x-4">
                  <Input
                    placeholder="Search counties..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="max-w-sm"
                  />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'county' | 'systems' | 'population' | 'violations')}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="county">Sort by County Name</option>
                    <option value="systems">Sort by Systems Count</option>
                    <option value="population">Sort by Population</option>
                    <option value="violations">Sort by Violations</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>County</TableHead>
                      <TableHead className="text-right">Systems</TableHead>
                      <TableHead className="text-right">Population</TableHead>
                      <TableHead className="text-right">Violations</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedCounties.map((county, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <Link 
                            href={`/?city=${encodeURIComponent(county.county)}`}
                            className="text-blue-600 hover:underline"
                          >
                            {county.county}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">{county.systemCount}</TableCell>
                        <TableCell className="text-right">
                          {county.totalPopulation.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">{county.violationCount}</TableCell>
                        <TableCell>
                          <Badge variant={getViolationSeverity(county.violationCount)}>
                            {county.violationCount === 0 ? 'Clean' : 
                             county.violationCount < 5 ? 'Minor Issues' :
                             county.violationCount < 20 ? 'Some Issues' : 'Major Issues'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="top-population">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Top Counties by Population Served</span>
                </CardTitle>
                <CardDescription>
                  Counties serving the most people through their water systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {countyData?.topCounties.byPopulation.map((county, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <Link 
                            href={`/?city=${encodeURIComponent(county.county)}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {county.county}
                          </Link>
                          <p className="text-sm text-gray-500">
                            {county.systemCount} systems, {county.violationCount} violations
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{county.totalPopulation.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">people served</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="top-systems">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Top Counties by System Count</span>
                </CardTitle>
                <CardDescription>
                  Counties with the most water systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {countyData?.topCounties.bySystems.map((county, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                          <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                        </div>
                        <div>
                          <Link 
                            href={`/?city=${encodeURIComponent(county.county)}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {county.county}
                          </Link>
                          <p className="text-sm text-gray-500">
                            {county.totalPopulation.toLocaleString()} people, {county.violationCount} violations
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{county.systemCount}</div>
                        <div className="text-sm text-gray-500">systems</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="top-violations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Counties with Most Violations</span>
                </CardTitle>
                <CardDescription>
                  Counties that need the most attention for water quality issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {countyData?.topCounties.byViolations.map((county, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                          <span className="text-sm font-bold text-red-600">#{index + 1}</span>
                        </div>
                        <div>
                          <Link 
                            href={`/?city=${encodeURIComponent(county.county)}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {county.county}
                          </Link>
                          <p className="text-sm text-gray-500">
                            {county.systemCount} systems, {county.totalPopulation.toLocaleString()} people
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">{county.violationCount}</div>
                        <div className="text-sm text-gray-500">violations</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 