'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, MapPin, Users, Droplets, Building } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

interface WaterSystem {
  pwsid: string
  pwsName: string
  cityName: string
  stateCode: string
  pwsTypeCode: string
  primarySourceCode: string
  populationServedCount: number
  orgName: string
  phoneNumber: string
  emailAddr: string
}

interface SearchResponse {
  results: WaterSystem[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  filters: {
    systemTypes: Array<{ valueCode: string; valueDescription: string }>
    sourceTypes: Array<{ valueCode: string; valueDescription: string }>
  }
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedSystemType, setSelectedSystemType] = useState('')
  const [selectedSourceType, setSelectedSourceType] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const performSearch = async (offset = 0) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      if (selectedCity) params.set('city', selectedCity)
      if (selectedSystemType) params.set('type', selectedSystemType)
      if (selectedSourceType) params.set('source', selectedSourceType)
      params.set('limit', '20')
      params.set('offset', offset.toString())

      const response = await fetch(`/api/systems/search?${params}`)
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(0)
  }

  const loadMore = () => {
    if (searchResults?.pagination.hasMore) {
      performSearch(searchResults.pagination.offset + searchResults.pagination.limit)
    }
  }

  // Load initial data on mount
  useEffect(() => {
    performSearch(0)
  }, [])

  const getSystemTypeLabel = (code: string) => {
    const type = searchResults?.filters.systemTypes.find(t => t.valueCode === code)
    return type?.valueDescription || code
  }

  const getSourceTypeLabel = (code: string) => {
    const type = searchResults?.filters.sourceTypes.find(t => t.valueCode === code)
    return type?.valueDescription || code
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Droplets className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Georgia Water Systems</h1>
                <p className="text-gray-600">Safe Drinking Water Information System</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link href="/counties">
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                  View by Counties
                </Badge>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Search Water Systems</span>
              </CardTitle>
              <CardDescription>
                Find information about public water systems in Georgia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Search by system name, ID, or organization..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Searching...' : 'Search'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>

                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium mb-2">City</label>
                      <Input
                        type="text"
                        placeholder="Enter city name"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">System Type</label>
                      <Select value={selectedSystemType} onValueChange={setSelectedSystemType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select system type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Types</SelectItem>
                          {searchResults?.filters.systemTypes.map((type) => (
                            <SelectItem key={type.valueCode} value={type.valueCode}>
                              {type.valueDescription}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Water Source</label>
                      <Select value={selectedSourceType} onValueChange={setSelectedSourceType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select water source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Sources</SelectItem>
                          {searchResults?.filters.sourceTypes.map((type) => (
                            <SelectItem key={type.valueCode} value={type.valueCode}>
                              {type.valueDescription}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {searchResults && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Search Results ({searchResults.pagination.total.toLocaleString()} systems)
              </h2>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.results.map((system) => (
                    <Link key={system.pwsid} href={`/system/${system.pwsid}`}>
                      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <CardTitle className="text-lg line-clamp-2">
                            {system.pwsName}
                          </CardTitle>
                          <CardDescription>
                            ID: {system.pwsid}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>{system.cityName}, {system.stateCode}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Users className="h-4 w-4" />
                              <span>{system.populationServedCount?.toLocaleString() || 'N/A'} people served</span>
                            </div>

                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Building className="h-4 w-4" />
                              <span className="line-clamp-1">{system.orgName}</span>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-3">
                              <Badge variant="secondary">
                                {getSystemTypeLabel(system.pwsTypeCode)}
                              </Badge>
                              <Badge variant="outline">
                                {getSourceTypeLabel(system.primarySourceCode)}
                              </Badge>
                            </div>

                            {(system.phoneNumber || system.emailAddr) && (
                              <div className="text-xs text-gray-500 pt-2 border-t">
                                {system.phoneNumber && <div>📞 {system.phoneNumber}</div>}
                                {system.emailAddr && <div>✉️ {system.emailAddr}</div>}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {searchResults.pagination.hasMore && (
                  <div className="text-center mt-8">
                    <Button onClick={loadMore} variant="outline" disabled={isLoading}>
                      Load More Systems
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
