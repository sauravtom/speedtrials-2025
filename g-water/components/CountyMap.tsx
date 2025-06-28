'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

interface CountyData {
  county: string
  systemCount: number
  totalPopulation: number
  violationCount: number
}

interface CountyMapProps {
  data?: CountyData[]
}

export default function CountyMap({ data }: CountyMapProps) {
  const [selectedCounty, setSelectedCounty] = useState<CountyData | null>(null)

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Georgia Counties Map</CardTitle>
          <CardDescription>Loading county data...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    )
  }

  const getCountyColor = (county: CountyData) => {
    if (county.violationCount === 0) return 'bg-green-200 hover:bg-green-300'
    if (county.violationCount < 5) return 'bg-yellow-200 hover:bg-yellow-300'
    if (county.violationCount < 20) return 'bg-orange-200 hover:bg-orange-300'
    return 'bg-red-200 hover:bg-red-300'
  }

  const getCountyStatus = (county: CountyData) => {
    if (county.violationCount === 0) return 'Clean'
    if (county.violationCount < 5) return 'Minor Issues'
    if (county.violationCount < 20) return 'Some Issues'
    return 'Major Issues'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Georgia Counties Water Systems</CardTitle>
        <CardDescription>
          Click on a county to see detailed information. Colors indicate violation levels.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1 mb-6">
          {data.map((county, index) => (
            <div
              key={index}
              className={`
                ${getCountyColor(county)}
                p-2 rounded cursor-pointer transition-colors duration-200
                flex items-center justify-center text-xs font-medium
                min-h-[60px] relative group
              `}
              onClick={() => setSelectedCounty(county)}
              title={`${county.county}: ${county.systemCount} systems, ${county.violationCount} violations`}
            >
              <span className="text-center leading-tight">
                {county.county.length > 8 ? county.county.substring(0, 6) + '...' : county.county}
              </span>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap">
                {county.county}
                <br />
                {county.systemCount} systems
                <br />
                {county.violationCount} violations
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-200 rounded"></div>
            <span className="text-sm">Clean (0 violations)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-200 rounded"></div>
            <span className="text-sm">Minor Issues (1-4 violations)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-200 rounded"></div>
            <span className="text-sm">Some Issues (5-19 violations)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-200 rounded"></div>
            <span className="text-sm">Major Issues (20+ violations)</span>
          </div>
        </div>

        {/* Selected County Details */}
        {selectedCounty && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedCounty.county} County</span>
                <Badge variant={selectedCounty.violationCount === 0 ? 'default' : 'destructive'}>
                  {getCountyStatus(selectedCounty)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedCounty.systemCount}</div>
                  <div className="text-sm text-gray-500">Water Systems</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedCounty.totalPopulation.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">People Served</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{selectedCounty.violationCount}</div>
                  <div className="text-sm text-gray-500">Violations</div>
                </div>
                <div className="text-center">
                  <Link 
                    href={`/?city=${encodeURIComponent(selectedCounty.county)}`}
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    View Systems
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
} 