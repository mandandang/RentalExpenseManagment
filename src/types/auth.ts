export interface LandlordUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'google' | 'meta' | 'apple' | 'passcode';
  role: 'owner' | 'manager';
  lastLoginAt: string;
}

export interface BankAccountEditPayload {
  institutionName: 'ING' | 'Revolut';
  accountName: string;
  iban: string;
  bic: string;
  currency: 'EUR' | 'GBP' | 'USD';
  balance: number;
  revtag?: string;
  notes?: string;
}
