import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core'

// Public Water Systems - Main table
export const waterSystems = sqliteTable('water_systems', {
  submissionYearQuarter: text('submission_year_quarter').notNull(),
  pwsid: text('pwsid').notNull(),
  pwsName: text('pws_name'),
  primacyAgencyCode: text('primacy_agency_code'),
  epaRegion: text('epa_region'),
  seasonBeginDate: text('season_begin_date'),
  seasonEndDate: text('season_end_date'),
  pwsActivityCode: text('pws_activity_code'),
  pwsDeactivationDate: text('pws_deactivation_date'),
  pwsTypeCode: text('pws_type_code'),
  ownerTypeCode: text('owner_type_code'),
  populationServedCount: integer('population_served_count'),
  primarySourceCode: text('primary_source_code'),
  orgName: text('org_name'),
  adminName: text('admin_name'),
  emailAddr: text('email_addr'),
  phoneNumber: text('phone_number'),
  addressLine1: text('address_line1'),
  addressLine2: text('address_line2'),
  cityName: text('city_name'),
  zipCode: text('zip_code'),
  stateCode: text('state_code'),
  firstReportedDate: text('first_reported_date'),
  lastReportedDate: text('last_reported_date'),
}, (table) => ({
  pwsidIdx: index('pwsid_idx').on(table.pwsid),
  nameIdx: index('name_idx').on(table.pwsName),
  cityIdx: index('city_idx').on(table.cityName),
  stateIdx: index('state_idx').on(table.stateCode),
}))

// Violations and Enforcement
export const violations = sqliteTable('violations', {
  submissionYearQuarter: text('submission_year_quarter').notNull(),
  pwsid: text('pwsid').notNull(),
  violationId: text('violation_id').notNull(),
  violationCode: text('violation_code'),
  violationCategoryCode: text('violation_category_code'),
  contaminantCode: text('contaminant_code'),
  nonComplPeriodBeginDate: text('non_compl_period_begin_date'),
  nonComplPeriodEndDate: text('non_compl_period_end_date'),
  violationExplanation: text('violation_explanation'),
  violationMeasure: real('violation_measure'),
  unitOfMeasure: text('unit_of_measure'),
  mcl: real('mcl'),
  mclg: real('mclg'),
  firstReportedDate: text('first_reported_date'),
  lastReportedDate: text('last_reported_date'),
}, (table) => ({
  pwsidIdx: index('violations_pwsid_idx').on(table.pwsid),
  violationIdIdx: index('violation_id_idx').on(table.violationId),
}))

// Facilities
export const facilities = sqliteTable('facilities', {
  submissionYearQuarter: text('submission_year_quarter').notNull(),
  pwsid: text('pwsid').notNull(),
  facilityId: text('facility_id').notNull(),
  facilityName: text('facility_name'),
  facilityTypeCode: text('facility_type_code'),
  facilityActivityCode: text('facility_activity_code'),
  waterTypeCode: text('water_type_code'),
  availabilityCode: text('availability_code'),
  firstReportedDate: text('first_reported_date'),
  lastReportedDate: text('last_reported_date'),
}, (table) => ({
  pwsidIdx: index('facilities_pwsid_idx').on(table.pwsid),
  facilityIdIdx: index('facility_id_idx').on(table.facilityId),
}))

// Geographic Areas
export const geographicAreas = sqliteTable('geographic_areas', {
  submissionYearQuarter: text('submission_year_quarter').notNull(),
  pwsid: text('pwsid').notNull(),
  geoId: text('geo_id').notNull(),
  areaTypeCode: text('area_type_code'),
  stateServed: text('state_served'),
  zipCodeServed: text('zip_code_served'),
  cityServed: text('city_served'),
  countyServed: text('county_served'),
  lastReportedDate: text('last_reported_date'),
}, (table) => ({
  pwsidIdx: index('geo_pwsid_idx').on(table.pwsid),
  cityIdx: index('geo_city_idx').on(table.cityServed),
  countyIdx: index('geo_county_idx').on(table.countyServed),
}))

// Site Visits
export const siteVisits = sqliteTable('site_visits', {
  submissionYearQuarter: text('submission_year_quarter').notNull(),
  pwsid: text('pwsid').notNull(),
  visitId: text('visit_id').notNull(),
  visitDate: text('visit_date'),
  agencyTypeCode: text('agency_type_code'),
  visitReasonCode: text('visit_reason_code'),
  managementOpsEvalCode: text('management_ops_eval_code'),
  sourceWaterEvalCode: text('source_water_eval_code'),
  complianceEvalCode: text('compliance_eval_code'),
  treatmentEvalCode: text('treatment_eval_code'),
}, (table) => ({
  pwsidIdx: index('visits_pwsid_idx').on(table.pwsid),
  visitDateIdx: index('visit_date_idx').on(table.visitDate),
}))

// LCR Samples
export const lcrSamples = sqliteTable('lcr_samples', {
  submissionYearQuarter: text('submission_year_quarter').notNull(),
  pwsid: text('pwsid').notNull(),
  sampleId: text('sample_id').notNull(),
  sarId: integer('sar_id'),
  samplingStartDate: text('sampling_start_date'),
  samplingEndDate: text('sampling_end_date'),
  contaminantCode: text('contaminant_code'),
  resultSignCode: text('result_sign_code'),
  sampleMeasure: real('sample_measure'),
  unitOfMeasure: text('unit_of_measure'),
}, (table) => ({
  pwsidIdx: index('lcr_pwsid_idx').on(table.pwsid),
  sampleIdIdx: index('lcr_sample_id_idx').on(table.sampleId),
}))

// Reference Code Values - lookup table
export const refCodeValues = sqliteTable('ref_code_values', {
  valueType: text('value_type').notNull(),
  valueCode: text('value_code').notNull(),
  valueDescription: text('value_description'),
}, (table) => ({
  typeCodeIdx: index('ref_type_code_idx').on(table.valueType, table.valueCode),
}))

// Events and Milestones
export const eventsMilestones = sqliteTable('events_milestones', {
  submissionYearQuarter: text('submission_year_quarter').notNull(),
  pwsid: text('pwsid').notNull(),
  eventScheduleId: text('event_schedule_id').notNull(),
  eventEndDate: text('event_end_date'),
  eventActualDate: text('event_actual_date'),
  eventCommentsText: text('event_comments_text'),
  eventMilestoneCode: text('event_milestone_code'),
  eventReasonCode: text('event_reason_code'),
  firstReportedDate: text('first_reported_date'),
  lastReportedDate: text('last_reported_date'),
}, (table) => ({
  pwsidIdx: index('events_pwsid_idx').on(table.pwsid),
}))

export type WaterSystem = typeof waterSystems.$inferSelect
export type Violation = typeof violations.$inferSelect
export type Facility = typeof facilities.$inferSelect
export type GeographicArea = typeof geographicAreas.$inferSelect
export type SiteVisit = typeof siteVisits.$inferSelect
export type LcrSample = typeof lcrSamples.$inferSelect
export type RefCodeValue = typeof refCodeValues.$inferSelect
export type EventMilestone = typeof eventsMilestones.$inferSelect 