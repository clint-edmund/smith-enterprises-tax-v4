-- ==========================================================
-- Smith Enterprises Tax Management
-- Sprint 12.7.2C
-- Staff Income Review RPC with Review State
-- ==========================================================

begin;

create or replace function
public.get_staff_income_review(
  requested_client_id uuid,
  requested_tax_year integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_user_id uuid;
  staff_profile public.profiles;
  organizer_record public.client_tax_organizers;
  income_sources jsonb;
  income_source_count integer;
  completed_source_count integer;
  needs_review_source_count integer;
  missing_document_count integer;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Authentication is required.';
  end if;

  select profile.*
  into staff_profile
  from public.profiles as profile
  where profile.id = current_user_id
    and profile.is_active = true
  limit 1;

  if not found then
    raise exception 'An active staff profile is required.';
  end if;

  if requested_client_id is null then
    raise exception 'A client identifier is required.';
  end if;

  if requested_tax_year is null
    or requested_tax_year < 1900
    or requested_tax_year > 2200
  then
    raise exception 'A valid tax year is required.';
  end if;

  select organizer.*
  into organizer_record
  from public.client_tax_organizers as organizer
  where organizer.client_id = requested_client_id
    and organizer.tax_year = requested_tax_year
  order by organizer.created_at desc
  limit 1;

  if not found then
    raise exception 'The requested tax organizer was not found.';
  end if;

  select
    count(*)::integer,
    count(*) filter (
      where source.record_status = 'complete'
    )::integer,
    count(*) filter (
      where source.record_status = 'needs_review'
    )::integer,
    count(*) filter (
      where not source.document_received
    )::integer
  into
    income_source_count,
    completed_source_count,
    needs_review_source_count,
    missing_document_count
  from public.client_tax_organizer_income_sources as source
  where source.organizer_id = organizer_record.id;

  select
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'incomeSourceId', source.id,
          'organizerId', source.organizer_id,
          'incomeType', source.income_type,
          'payerName', source.payer_name,
          'recipientType', source.recipient_type,
          'recordStatus', source.record_status,
          'documentReceived', source.document_received,
          'notes', coalesce(source.notes, ''),
          'displayOrder', source.display_order,
          'createdAt', source.created_at,
          'updatedAt', source.updated_at,
          'reviewStatus',
            coalesce(
              income_review.review_status,
              'pending'
            ),
          'internalNotes',
            coalesce(
              income_review.internal_notes,
              ''
            ),
          'reviewedBy',
            income_review.reviewed_by,
          'reviewedByName',
            case
              when income_review.reviewed_by is null
                then null
              else coalesce(
                nullif(trim(reviewed_profile.display_name), ''),
                nullif(
                  trim(
                    concat_ws(
                      ' ',
                      reviewed_profile.first_name,
                      reviewed_profile.last_name
                    )
                  ),
                  ''
                ),
                reviewed_profile.email
              )
            end,
          'reviewedAt',
            income_review.reviewed_at,
          'followUpRequestedAt',
            income_review.follow_up_requested_at,
          'returnedToClientAt',
            income_review.returned_to_client_at,
          'reviewUpdatedAt',
            income_review.updated_at,
          'hasRequiredPrimaryAmount',
            case
              when source.income_type = 'w2'
                then w2.wages is not null
              when source.income_type = '1099_int'
                then details_1099_int.interest_income is not null
              when source.income_type = '1099_div'
                then details_1099_div.total_ordinary_dividends is not null
              else source.record_status = 'complete'
            end,
          'w2Details',
            case
              when w2.income_source_id is null then null
              else jsonb_build_object(
                'employerIdentificationNumber', w2.employer_identification_number,
                'wages', w2.wages,
                'federalIncomeTaxWithheld', w2.federal_income_tax_withheld,
                'socialSecurityWages', w2.social_security_wages,
                'socialSecurityTaxWithheld', w2.social_security_tax_withheld,
                'medicareWages', w2.medicare_wages,
                'medicareTaxWithheld', w2.medicare_tax_withheld,
                'stateCode', w2.state_code,
                'stateWages', w2.state_wages,
                'stateIncomeTaxWithheld', w2.state_income_tax_withheld,
                'localWages', w2.local_wages,
                'localIncomeTaxWithheld', w2.local_income_tax_withheld,
                'createdAt', w2.created_at,
                'updatedAt', w2.updated_at
              )
            end,
          'details1099Int',
            case
              when details_1099_int.income_source_id is null then null
              else jsonb_build_object(
                'payerIdentificationNumber', details_1099_int.payer_identification_number,
                'interestIncome', details_1099_int.interest_income,
                'earlyWithdrawalPenalty', details_1099_int.early_withdrawal_penalty,
                'interestOnUsSavingsBondsAndTreasuryObligations',
                  details_1099_int.interest_on_us_savings_bonds_and_treasury_obligations,
                'federalIncomeTaxWithheld', details_1099_int.federal_income_tax_withheld,
                'investmentExpenses', details_1099_int.investment_expenses,
                'foreignTaxPaid', details_1099_int.foreign_tax_paid,
                'foreignCountryOrUsPossession',
                  details_1099_int.foreign_country_or_us_possession,
                'taxExemptInterest', details_1099_int.tax_exempt_interest,
                'specifiedPrivateActivityBondInterest',
                  details_1099_int.specified_private_activity_bond_interest,
                'marketDiscount', details_1099_int.market_discount,
                'bondPremium', details_1099_int.bond_premium,
                'bondPremiumOnTreasuryObligations',
                  details_1099_int.bond_premium_on_treasury_obligations,
                'bondPremiumOnTaxExemptBond',
                  details_1099_int.bond_premium_on_tax_exempt_bond,
                'stateCode', details_1099_int.state_code,
                'stateIdentificationNumber',
                  details_1099_int.state_identification_number,
                'stateTaxWithheld', details_1099_int.state_tax_withheld,
                'createdAt', details_1099_int.created_at,
                'updatedAt', details_1099_int.updated_at
              )
            end,
          'details1099Div',
            case
              when details_1099_div.income_source_id is null then null
              else jsonb_build_object(
                'payerIdentificationNumber', details_1099_div.payer_identification_number,
                'totalOrdinaryDividends', details_1099_div.total_ordinary_dividends,
                'qualifiedDividends', details_1099_div.qualified_dividends,
                'totalCapitalGainDistributions',
                  details_1099_div.total_capital_gain_distributions,
                'unrecapturedSection1250Gain',
                  details_1099_div.unrecaptured_section_1250_gain,
                'section1202Gain', details_1099_div.section_1202_gain,
                'collectibles28PercentRateGain',
                  details_1099_div.collectibles_28_percent_rate_gain,
                'section897OrdinaryDividends',
                  details_1099_div.section_897_ordinary_dividends,
                'section897CapitalGain', details_1099_div.section_897_capital_gain,
                'nondividendDistributions',
                  details_1099_div.nondividend_distributions,
                'federalIncomeTaxWithheld',
                  details_1099_div.federal_income_tax_withheld,
                'section199aDividends', details_1099_div.section_199a_dividends,
                'investmentExpenses', details_1099_div.investment_expenses,
                'foreignTaxPaid', details_1099_div.foreign_tax_paid,
                'foreignCountryOrUsPossession',
                  details_1099_div.foreign_country_or_us_possession,
                'exemptInterestDividends',
                  details_1099_div.exempt_interest_dividends,
                'specifiedPrivateActivityBondInterestDividends',
                  details_1099_div.specified_private_activity_bond_interest_dividends,
                'stateCode', details_1099_div.state_code,
                'stateIdentificationNumber',
                  details_1099_div.state_identification_number,
                'stateTaxWithheld', details_1099_div.state_tax_withheld,
                'createdAt', details_1099_div.created_at,
                'updatedAt', details_1099_div.updated_at
              )
            end
        )
        order by source.display_order, source.created_at, source.id
      ),
      '[]'::jsonb
    )
  into income_sources
  from public.client_tax_organizer_income_sources as source
  left join public.client_tax_organizer_income_w2_details as w2
    on w2.income_source_id = source.id
  left join public.client_tax_organizer_income_1099_int_details as details_1099_int
    on details_1099_int.income_source_id = source.id
  left join public.client_tax_organizer_income_1099_div_details as details_1099_div
    on details_1099_div.income_source_id = source.id
  left join public.client_tax_organizer_income_reviews as income_review
    on income_review.income_source_id = source.id
  left join public.profiles as reviewed_profile
    on reviewed_profile.id = income_review.reviewed_by
  where source.organizer_id = organizer_record.id;

  return jsonb_build_object(
    'organizer',
      jsonb_build_object(
        'organizerId', organizer_record.id,
        'clientId', organizer_record.client_id,
        'taxYear', organizer_record.tax_year,
        'status', organizer_record.status,
        'currentSection', organizer_record.current_section,
        'progressPercentage', organizer_record.progress_percentage,
        'startedAt', organizer_record.started_at,
        'submittedAt', organizer_record.submitted_at,
        'lastSavedAt', organizer_record.last_saved_at,
        'createdAt', organizer_record.created_at,
        'updatedAt', organizer_record.updated_at
      ),
    'reviewer',
      jsonb_build_object(
        'staffId', staff_profile.id,
        'displayName',
          coalesce(
            nullif(trim(staff_profile.display_name), ''),
            nullif(
              trim(
                concat_ws(
                  ' ',
                  staff_profile.first_name,
                  staff_profile.last_name
                )
              ),
              ''
            ),
            staff_profile.email
          ),
        'role', staff_profile.role
      ),
    'summary',
      jsonb_build_object(
        'incomeSourceCount', coalesce(income_source_count, 0),
        'completedSourceCount', coalesce(completed_source_count, 0),
        'needsReviewSourceCount', coalesce(needs_review_source_count, 0),
        'missingDocumentCount', coalesce(missing_document_count, 0),
        'readySourceCount',
          greatest(
            coalesce(completed_source_count, 0)
            - coalesce(missing_document_count, 0),
            0
          )
      ),
    'incomeSources', income_sources
  );
end;
$function$;

revoke all
on function public.get_staff_income_review(uuid, integer)
from public;

revoke all
on function public.get_staff_income_review(uuid, integer)
from anon;

grant execute
on function public.get_staff_income_review(uuid, integer)
to authenticated;

comment on function
public.get_staff_income_review(uuid, integer)
is
'Returns a unified staff-only Income organizer review payload containing W-2, 1099-INT, 1099-DIV, and staff review-state records for the requested client and tax year.';

commit;