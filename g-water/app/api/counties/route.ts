import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { waterSystems, violations, geographicAreas } from '@/lib/schema'
import { eq, sql, and, count } from 'drizzle-orm'

export async function GET() {
  try {
    // Get water systems count by county (from geographic areas)
    const countyStats = await db
      .select({
        county: geographicAreas.countyServed,
        systemCount: count(waterSystems.pwsid),
        totalPopulation: sql<number>`sum(${waterSystems.populationServedCount})`,
      })
      .from(geographicAreas)
      .innerJoin(waterSystems, eq(geographicAreas.pwsid, waterSystems.pwsid))
      .where(
        and(
          eq(waterSystems.pwsActivityCode, 'A'), // Only active systems
          eq(waterSystems.stateCode, 'GA') // Only Georgia
        )
      )
      .groupBy(geographicAreas.countyServed)
      .having(sql`${geographicAreas.countyServed} IS NOT NULL`)
      .orderBy(geographicAreas.countyServed)

    // Get violation counts by county
    const violationStats = await db
      .select({
        county: geographicAreas.countyServed,
        violationCount: count(violations.violationId),
      })
      .from(geographicAreas)
      .innerJoin(waterSystems, eq(geographicAreas.pwsid, waterSystems.pwsid))
      .innerJoin(violations, eq(waterSystems.pwsid, violations.pwsid))
      .where(
        and(
          eq(waterSystems.pwsActivityCode, 'A'),
          eq(waterSystems.stateCode, 'GA')
        )
      )
      .groupBy(geographicAreas.countyServed)
      .having(sql`${geographicAreas.countyServed} IS NOT NULL`)

    // Combine the data
    const violationMap = new Map(
      violationStats.map(v => [v.county, v.violationCount])
    )

    const countyData = countyStats.map(county => ({
      county: county.county,
      systemCount: county.systemCount,
      totalPopulation: county.totalPopulation || 0,
      violationCount: violationMap.get(county.county) || 0,
    }))

    // Get top counties by various metrics
    const topByPopulation = [...countyData]
      .sort((a, b) => b.totalPopulation - a.totalPopulation)
      .slice(0, 10)

    const topByViolations = [...countyData]
      .filter(c => c.violationCount > 0)
      .sort((a, b) => b.violationCount - a.violationCount)
      .slice(0, 10)

    const topBySystems = [...countyData]
      .sort((a, b) => b.systemCount - a.systemCount)
      .slice(0, 10)

    return NextResponse.json({
      counties: countyData,
      summary: {
        totalCounties: countyData.length,
        totalSystems: countyData.reduce((sum, c) => sum + c.systemCount, 0),
        totalPopulation: countyData.reduce((sum, c) => sum + c.totalPopulation, 0),
        totalViolations: countyData.reduce((sum, c) => sum + c.violationCount, 0),
      },
      topCounties: {
        byPopulation: topByPopulation,
        byViolations: topByViolations,
        bySystems: topBySystems,
      }
    })
  } catch (error) {
    console.error('Counties API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 