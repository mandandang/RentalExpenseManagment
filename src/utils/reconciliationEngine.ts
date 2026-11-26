import { Tenant, BillSplitShare, BankTransaction } from '../types';

/**
 * Calculates number of days between two dates inclusive (YYYY-MM-DD)
 */
export function getDaysBetween(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
}

/**
 * Checks if a tenant was resident during the specified bill period
 */
export function isTenantResidentInPeriod(tenant: Tenant, periodStart: string, periodEnd: string): boolean {
  const pStart = new Date(periodStart).getTime();
  const pEnd = new Date(periodEnd).getTime();
  const lStart = new Date(tenant.leaseStartDate).getTime();
  const lEnd = tenant.leaseEndDate ? new Date(tenant.leaseEndDate).getTime() : Infinity;

  // Overlap condition: lease start <= bill end AND lease end >= bill start
  return lStart <= pEnd && lEnd >= pStart;
}

export interface AbsenceConfig {
  startDate?: string | null;
  endDate?: string | null;
  reason?: string;
}

export interface CalculatedShareResult {
  tenant: Tenant;
  totalPeriodDays: number;
  residentDays: number;
  absentDays: number;
  activeDays: number;
  shareAmount: number;
  percentage: number;
  isExcluded: boolean;
  exclusionReason?: string;
  referenceCode: string;
}

/**
 * Calculates exact pro-rata bill distribution among apartment roommates based on
 * occupancy dates and custom absence date intervals.
 */
export function calculateProRataDistribution(
  totalBillAmount: number,
  billTitle: string,
  periodStart: string,
  periodEnd: string,
  apartmentTenants: Tenant[],
  absenceMap: Record<string, AbsenceConfig> = {},
  excludedTenantIds: string[] = []
): CalculatedShareResult[] {
  const totalPeriodDays = getDaysBetween(periodStart, periodEnd);
  const pStart = new Date(periodStart).getTime();
  const pEnd = new Date(periodEnd).getTime();

  // First pass: identify resident eligibility and active days
  const intermediate: {
    tenant: Tenant;
    residentDays: number;
    absentDays: number;
    activeDays: number;
    isEligible: boolean;
    exclusionReason?: string;
  }[] = [];

  for (const tenant of apartmentTenants) {
    // Check if manually excluded (e.g. agreed full exemption)
    if (excludedTenantIds.includes(tenant.id)) {
      intermediate.push({
        tenant,
        residentDays: 0,
        absentDays: totalPeriodDays,
        activeDays: 0,
        isEligible: false,
        exclusionReason: 'Manually excluded by landlord',
      });
      continue;
    }

    // Check tenancy timeline
    const isResident = isTenantResidentInPeriod(tenant, periodStart, periodEnd);
    if (!isResident) {
      intermediate.push({
        tenant,
        residentDays: 0,
        absentDays: 0,
        activeDays: 0,
        isEligible: false,
        exclusionReason: `Not resident during bill period (${periodStart} to ${periodEnd})`,
      });
      continue;
    }

    // Effective resident window
    const lStart = new Date(tenant.leaseStartDate).getTime();
    const lEnd = tenant.leaseEndDate ? new Date(tenant.leaseEndDate).getTime() : Infinity;
    const effStart = new Date(Math.max(pStart, lStart));
    const effEnd = new Date(Math.min(pEnd, lEnd));
    const effStartStr = effStart.toISOString().split('T')[0];
    const effEndStr = effEnd.toISOString().split('T')[0];
    const residentDays = getDaysBetween(effStartStr, effEndStr);

    // Calculate absent days if an absence window is specified
    let absentDays = 0;
    const absence = absenceMap[tenant.id];
    if (absence?.startDate && absence?.endDate) {
      const aStart = new Date(absence.startDate).getTime();
      const aEnd = new Date(absence.endDate).getTime();
      const overlapStart = Math.max(aStart, effStart.getTime());
      const overlapEnd = Math.min(aEnd, effEnd.getTime());

      if (overlapStart <= overlapEnd) {
        const oStartStr = new Date(overlapStart).toISOString().split('T')[0];
        const oEndStr = new Date(overlapEnd).toISOString().split('T')[0];
        absentDays = getDaysBetween(oStartStr, oEndStr);
      }
    }

    const activeDays = Math.max(0, residentDays - absentDays);

    intermediate.push({
      tenant,
      residentDays,
      absentDays,
      activeDays,
      isEligible: activeDays > 0,
      exclusionReason: activeDays === 0 ? 'Full period absence' : undefined,
    });
  }

  const totalActiveResidentDays = intermediate.reduce((sum, item) => sum + item.activeDays, 0);

  // If nobody was active, fallback to equal split among residents
  const validTotalDays = totalActiveResidentDays > 0 ? totalActiveResidentDays : 1;

  // Prefix generator for reference code: e.g. RF-ELEC-JULIA
  const shortCategory = billTitle
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 4)
    .toUpperCase();

  const results: CalculatedShareResult[] = [];
  let allocatedSum = 0;

  intermediate.forEach((item) => {
    if (!item.isEligible || item.activeDays === 0) {
      results.push({
        tenant: item.tenant,
        totalPeriodDays,
        residentDays: item.residentDays,
        absentDays: item.absentDays,
        activeDays: 0,
        shareAmount: 0,
        percentage: 0,
        isExcluded: true,
        exclusionReason: item.exclusionReason,
        referenceCode: `RF-${shortCategory}-${item.tenant.fullName.split(' ')[0].toUpperCase()}`,
      });
      return;
    }

    const rawShare = (item.activeDays / validTotalDays) * totalBillAmount;
    const roundedShare = Math.round(rawShare * 100) / 100;
    allocatedSum += roundedShare;

    results.push({
      tenant: item.tenant,
      totalPeriodDays,
      residentDays: item.residentDays,
      absentDays: item.absentDays,
      activeDays: item.activeDays,
      shareAmount: roundedShare,
      percentage: Math.round((item.activeDays / validTotalDays) * 1000) / 10,
      isExcluded: false,
      referenceCode: `RF-${shortCategory}-${item.tenant.fullName.split(' ')[0].toUpperCase()}`,
    });
  });

  // Adjust any rounding cent difference on the first eligible tenant
  const centDifference = Math.round((totalBillAmount - allocatedSum) * 100) / 100;
  if (centDifference !== 0 && results.some((r) => !r.isExcluded)) {
    const firstActive = results.find((r) => !r.isExcluded);
    if (firstActive) {
      firstActive.shareAmount = Math.round((firstActive.shareAmount + centDifference) * 100) / 100;
    }
  }

  return results;
}

/**
 * Normalizes text for fuzzy counterparty matching
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Three-tier reconciliation matching algorithm
 */
export function matchTransaction(
  transaction: BankTransaction,
  tenants: Tenant[],
  openShares: BillSplitShare[]
): {
  reconciliationStatus: 'matched' | 'unmatched';
  matchedEntityType?: 'rent' | 'bill_share';
  matchedEntityId?: string;
  matchedDescription?: string;
  matchConfidence: number;
  matchReason: string;
} {
  const normRemittance = normalizeString(transaction.remittanceInformation);
  const normSender = normalizeString(transaction.counterpartyName);

  // 1. TIER 1: Exact reference token match in remittance info (e.g., 'RF-A2-ELEC-MATTEO')
  for (const share of openShares) {
    if (share.status === 'paid' || share.status === 'settled_deposit') continue;
    const cleanRef = normalizeString(share.referenceCode);
    if (normRemittance.includes(cleanRef)) {
      return {
        reconciliationStatus: 'matched',
        matchedEntityType: 'bill_share',
        matchedEntityId: share.id,
        matchedDescription: `Bill Split Share: ${share.tenantName} (${share.referenceCode})`,
        matchConfidence: 100,
        matchReason: `Exact reference token "${share.referenceCode}" detected in remittance note`,
      };
    }
  }

  // 2. TIER 2: Match against custom monthly rent
  // Check if amount exactly matches any tenant's monthlyRent
  for (const tenant of tenants) {
    const rentAmountMatch = Math.abs(transaction.amount - tenant.monthlyRent) < 0.05;
    const normTenantName = normalizeString(tenant.fullName);
    const tenantFirst = normTenantName.split(' ')[0];
    const tenantLast = normTenantName.split(' ')[1] || '';

    // Check if sender name contains tenant name
    const senderHasName =
      normSender.includes(normTenantName) ||
      (normSender.includes(tenantFirst) && normSender.includes(tenantLast));

    // Check if remittance contains tenant name (e.g. parent paying for tenant)
    const remittanceHasName =
      normRemittance.includes(normTenantName) ||
      (normRemittance.includes(tenantFirst) && normRemittance.includes(tenantLast));

    const hasRentKeyword =
      normRemittance.includes('rent') ||
      normRemittance.includes('miete') ||
      normRemittance.includes('huur') ||
      normRemittance.includes('loyer');

    if (rentAmountMatch && senderHasName) {
      return {
        reconciliationStatus: 'matched',
        matchedEntityType: 'rent',
        matchedEntityId: tenant.id,
        matchedDescription: `Monthly Rent: ${tenant.fullName} (€${tenant.monthlyRent.toFixed(2)})`,
        matchConfidence: hasRentKeyword ? 99 : 95,
        matchReason: `Sender "${transaction.counterpartyName}" matches tenant and amount €${transaction.amount.toFixed(2)} equals custom rent`,
      };
    }

    if (rentAmountMatch && remittanceHasName && !senderHasName) {
      return {
        reconciliationStatus: 'unmatched', // Flag for landlord 1-click review because 3rd-party/parent sender!
        matchedEntityType: 'rent',
        matchedEntityId: tenant.id,
        matchedDescription: `Likely Third-Party / Parent Rent Payment for ${tenant.fullName}`,
        matchConfidence: 78,
        matchReason: `Remittance mentions "${tenant.fullName}" with exact rent €${transaction.amount.toFixed(2)}, but sender is "${transaction.counterpartyName}"`,
      };
    }
  }

  // 3. TIER 3: Match against open bill split share by sender name & amount
  for (const share of openShares) {
    if (share.status === 'paid' || share.status === 'settled_deposit') continue;
    const amountMatch = Math.abs(transaction.amount - share.shareAmount) < 0.05;
    const normTenantName = normalizeString(share.tenantName);
    const senderHasName = normSender.includes(normTenantName);

    if (amountMatch && senderHasName) {
      return {
        reconciliationStatus: 'matched',
        matchedEntityType: 'bill_share',
        matchedEntityId: share.id,
        matchedDescription: `Utility Share: ${share.tenantName} (${share.roomLabel})`,
        matchConfidence: 94,
        matchReason: `Sender "${transaction.counterpartyName}" matches tenant and amount €${transaction.amount.toFixed(2)} equals split share`,
      };
    }
  }

  // Unmatched
  return {
    reconciliationStatus: 'unmatched',
    matchConfidence: 0,
    matchReason: 'No matching reference token, tenant rent, or bill share found',
  };
}
