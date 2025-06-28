import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { waterSystems, refCodeValues } from '@/lib/schema'
import { and, or, like, eq, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const city = searchParams.get('city')
    const systemType = searchParams.get('type')
    const sourceType = searchParams.get('source')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const whereConditions = []

    // General search query - searches across name, PWSID, and organization
    if (query) {
      whereConditions.push(
        or(
          like(waterSystems.pwsName, `%${query}%`),
          like(waterSystems.pwsid, `%${query}%`),
          like(waterSystems.orgName, `%${query}%`)
        )
      )
    }

    // City filter
    if (city) {
      whereConditions.push(like(waterSystems.cityName, `%${city}%`))
    }

    // System type filter
    if (systemType) {
      whereConditions.push(eq(waterSystems.pwsTypeCode, systemType))
    }

    // Source type filter
    if (sourceType) {
      whereConditions.push(eq(waterSystems.primarySourceCode, sourceType))
    }

    // Only show active systems by default
    whereConditions.push(eq(waterSystems.pwsActivityCode, 'A'))

    const results = await db
      .select({
        pwsid: waterSystems.pwsid,
        pwsName: waterSystems.pwsName,
        cityName: waterSystems.cityName,
        stateCode: waterSystems.stateCode,
        pwsTypeCode: waterSystems.pwsTypeCode,
        primarySourceCode: waterSystems.primarySourceCode,
        populationServedCount: waterSystems.populationServedCount,
        orgName: waterSystems.orgName,
        phoneNumber: waterSystems.phoneNumber,
        emailAddr: waterSystems.emailAddr,
      })
      .from(waterSystems)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(limit)
      .offset(offset)
      .orderBy(waterSystems.pwsName)

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(waterSystems)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)

    const totalCount = totalCountResult[0]?.count || 0

    // Get reference codes for display
    const systemTypes = await db
      .select()
      .from(refCodeValues)
      .where(eq(refCodeValues.valueType, 'PWS_TYPE_CODE'))

    const sourceTypes = await db
      .select()
      .from(refCodeValues)
      .where(eq(refCodeValues.valueType, 'PRIMARY_SOURCE_CODE'))

    return NextResponse.json({
      results,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      },
      filters: {
        systemTypes,
        sourceTypes
      }
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 