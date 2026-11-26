export interface Apartment {
  id: string;
  name: string;
  unitNumber: string;
  address: string;
  city: string;
  country: string;
  targetBankAccountId: string; // e.g. 'acc_ing_eur' or 'acc_revolut_eur'
  colorTag: string;
}

export interface Tenant {
  id: string;
  apartmentId: string;
  roomLabel: string; // e.g. 'Room 1 (Master)', 'Studio Flat'
  fullName: string;
  whatsappNumber: string; // e.g. '+31612345678'
  email: string;
  monthlyRent: number; // Custom rent per tenant (e.g. 650, 580, etc.)
  rentDueDay: number; // e.g. 1st of every month
  leaseStartDate: string; // YYYY-MM-DD
  leaseEndDate?: string | null; // YYYY-MM-DD, null if ongoing
  retainedDepositBalance: number; // e.g. €50.00 retained after move-out for future utility settlements
  isActive: boolean; // currently occupying
  targetBankAccountId?: string; // Tenant-specific payment bank: 'acc_ing_eur' or 'acc_revolut_eur'
  notes?: string;
}

export type BillCategory = 'electricity' | 'water' | 'gas' | 'internet' | 'heating' | 'other';

export interface Bill {
  id: string;
  apartmentId: string;
  title: string; // e.g. 'Stadtwerke Q1 Electricity'
  category: BillCategory;
  totalAmount: number;
  billingPeriodStart: string; // YYYY-MM-DD
  billingPeriodEnd: string; // YYYY-MM-DD
  invoiceDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  pdfFilename: string;
  pdfDataUrl?: string; // sample preview or data url
  status: 'draft' | 'split_calculated' | 'partially_paid' | 'settled';
  createdAt: string;
}

export interface BillSplitShare {
  id: string;
  billId: string;
  tenantId: string;
  tenantName: string;
  roomLabel: string;
  shareAmount: number; // Pro-rated or equal split amount in EUR
  totalPeriodDays: number;
  activeDays: number; // resident days minus absent days
  absenceStartDate?: string | null; // custom absence window
  absenceEndDate?: string | null;
  absenceReason?: string;
  settledFromDeposit: boolean;
  depositAmountApplied: number;
  referenceCode: string; // Unique payment token, e.g. 'RF-A2-ELEC-JULIA'
  status: 'pending' | 'paid' | 'settled_deposit';
  whatsappSentAt?: string | null;
  transactionId?: string | null;
  settledAt?: string | null;
}

export interface BankAccount {
  id: string;
  institutionName: 'ING' | 'Revolut';
  accountName: string;
  iban: string;
  bic: string;
  currency: 'EUR' | 'GBP' | 'USD';
  balance: number;
  lastSyncedAt: string;
  consentExpiresAt: string; // 180 days PSD2 rule
  status: 'connected' | 'reauth_needed' | 'syncing';
}

export interface BankTransaction {
  id: string;
  bankAccountId: string;
  bookingDate: string; // YYYY-MM-DD
  valueDate: string;
  amount: number; // positive for incoming credit
  currency: string;
  counterpartyName: string;
  counterpartyIban?: string;
  remittanceInformation: string; // Free text description from sender
  reconciliationStatus: 'matched' | 'unmatched' | 'ignored';
  matchedEntityType?: 'rent' | 'bill_share';
  matchedEntityId?: string; // tenantId (for rent) or shareId (for bill_share)
  matchedDescription?: string;
  matchConfidence?: number; // 0 - 100
  matchReason?: string;
  isSimulated?: boolean;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  bankAccountId: string;
  institutionName: string;
  transactionsFetched: number;
  status: 'success' | 'rate_limited' | 'error';
  message: string;
}

export type ExpenseFrequency = 
  | 'monthly' 
  | 'every_2_months' 
  | 'quarterly' 
  | 'semi_annually' 
  | 'annually' 
  | 'one_time';

export type ExpenseCategory = 
  | 'mortgage_installment' 
  | 'building_fees' 
  | 'property_tax' 
  | 'insurance' 
  | 'maintenance' 
  | 'utilities_owner' 
  | 'other';

export interface LandlordExpense {
  id: string;
  apartmentId: string;
  title: string; // e.g. "Mortgage Installment", "Building / HOA Fees"
  category: ExpenseCategory;
  amount: number; // in EUR
  frequency: ExpenseFrequency;
  dueDay: number; // e.g. 1st of month, 15th of month
  nextDueDate: string; // YYYY-MM-DD
  recipient?: string; // e.g. "ING Bank Hypotheken", "Hausverwaltung Schmidt"
  iban?: string;
  notes?: string;
  status: 'upcoming' | 'due_soon' | 'paid_for_period' | 'overdue';
  lastPaidDate?: string;
}
