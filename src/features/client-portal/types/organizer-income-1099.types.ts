export interface OrganizerIncome1099IntDetails {
  incomeSourceId: string
  payerIdentificationNumber: string
  interestIncome: number | null
  earlyWithdrawalPenalty: number | null
  interestOnUsSavingsBondsAndTreasuryObligations:
    number | null
  federalIncomeTaxWithheld: number | null
  investmentExpenses: number | null
  foreignTaxPaid: number | null
  foreignCountryOrUsPossession: string
  taxExemptInterest: number | null
  specifiedPrivateActivityBondInterest:
    number | null
  marketDiscount: number | null
  bondPremium: number | null
  bondPremiumOnTreasuryObligations:
    number | null
  bondPremiumOnTaxExemptBond: number | null
  stateCode: string
  stateIdentificationNumber: string
  stateTaxWithheld: number | null
  createdAt: string | null
  updatedAt: string | null
}

export interface SaveOrganizerIncome1099IntRequest {
  organizerId: string
  incomeSourceId: string
  payerIdentificationNumber: string
  interestIncome: number | null
  earlyWithdrawalPenalty: number | null
  interestOnUsSavingsBondsAndTreasuryObligations:
    number | null
  federalIncomeTaxWithheld: number | null
  investmentExpenses: number | null
  foreignTaxPaid: number | null
  foreignCountryOrUsPossession: string
  taxExemptInterest: number | null
  specifiedPrivateActivityBondInterest:
    number | null
  marketDiscount: number | null
  bondPremium: number | null
  bondPremiumOnTreasuryObligations:
    number | null
  bondPremiumOnTaxExemptBond: number | null
  stateCode: string
  stateIdentificationNumber: string
  stateTaxWithheld: number | null
  documentReceived: boolean
}

export interface SaveOrganizerIncome1099IntResult {
  incomeSourceId: string
  organizerId: string
  incomeType: "1099_int"
  payerName: string
  recipientType: string
  recordStatus: string
  documentReceived: boolean
  notes: string
  displayOrder: number
  incomeCreatedAt: string
  incomeUpdatedAt: string
  details: OrganizerIncome1099IntDetails
}

export interface OrganizerIncome1099DivDetails {
  incomeSourceId: string
  payerIdentificationNumber: string
  totalOrdinaryDividends: number | null
  qualifiedDividends: number | null
  totalCapitalGainDistributions: number | null
  unrecapturedSection1250Gain: number | null
  section1202Gain: number | null
  collectibles28PercentRateGain: number | null
  section897OrdinaryDividends: number | null
  section897CapitalGain: number | null
  nondividendDistributions: number | null
  federalIncomeTaxWithheld: number | null
  section199aDividends: number | null
  investmentExpenses: number | null
  foreignTaxPaid: number | null
  foreignCountryOrUsPossession: string
  exemptInterestDividends: number | null
  specifiedPrivateActivityBondInterestDividends:
    number | null
  stateCode: string
  stateIdentificationNumber: string
  stateTaxWithheld: number | null
  createdAt: string | null
  updatedAt: string | null
}

export interface SaveOrganizerIncome1099DivRequest {
  organizerId: string
  incomeSourceId: string
  payerIdentificationNumber: string
  totalOrdinaryDividends: number | null
  qualifiedDividends: number | null
  totalCapitalGainDistributions: number | null
  unrecapturedSection1250Gain: number | null
  section1202Gain: number | null
  collectibles28PercentRateGain: number | null
  section897OrdinaryDividends: number | null
  section897CapitalGain: number | null
  nondividendDistributions: number | null
  federalIncomeTaxWithheld: number | null
  section199aDividends: number | null
  investmentExpenses: number | null
  foreignTaxPaid: number | null
  foreignCountryOrUsPossession: string
  exemptInterestDividends: number | null
  specifiedPrivateActivityBondInterestDividends:
    number | null
  stateCode: string
  stateIdentificationNumber: string
  stateTaxWithheld: number | null
  documentReceived: boolean
}

export interface SaveOrganizerIncome1099DivResult {
  incomeSourceId: string
  organizerId: string
  incomeType: "1099_div"
  payerName: string
  recipientType: string
  recordStatus: string
  documentReceived: boolean
  notes: string
  displayOrder: number
  incomeCreatedAt: string
  incomeUpdatedAt: string
  details: OrganizerIncome1099DivDetails
}
