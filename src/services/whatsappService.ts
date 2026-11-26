import { Bill, BillSplitShare, BankAccount, Apartment, Tenant } from '../types';

export type WhatsAppMessageTone = 'standard_breakdown' | 'friendly_reminder' | 'urgent_notice';

export interface WhatsAppDeepLinkOptions {
  tone?: WhatsAppMessageTone;
  customNote?: string;
  includeAbsenceDetails?: boolean;
  includeBic?: boolean;
}

export interface WhatsAppDeepLinkResult {
  shareId: string;
  tenantId: string;
  tenantName: string;
  rawPhoneNumber: string;
  cleanPhoneNumber: string;
  isValidPhone: boolean;
  referenceCode: string;
  shareAmount: number;
  formattedAmount: string;
  deepLinkUrl: string; // Standard wa.me universal link (works on iOS, Android, macOS, Web)
  webAppUrl: string; // Direct web.whatsapp.com link
  rawMessage: string;
  encodedMessage: string;
  generatedAt: string;
}

/**
 * Service Layer for WhatsApp Deep-Link and Message Generation
 */
export class WhatsAppService {
  /**
   * Sanitizes phone number by stripping whitespace, dashes, brackets and leading plus
   */
  static cleanPhoneNumber(phone: string): string {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  }

  /**
   * Validates international phone format (must have European country code, min 8 digits)
   */
  static validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
    const cleaned = this.cleanPhoneNumber(phone);
    if (!cleaned) {
      return { isValid: false, error: 'Phone number is missing' };
    }
    if (cleaned.length < 8 || cleaned.length > 15) {
      return { isValid: false, error: `Invalid length (${cleaned.length} digits). Expected 8-15 digits with country code.` };
    }
    return { isValid: true };
  }

  /**
   * Constructs pre-filled message text tailored to tenant, apartment, bill, and tone
   */
  static buildMessageText(
    tenant: Tenant,
    apartment: Apartment,
    bill: Bill,
    share: BillSplitShare,
    bankAccount: BankAccount,
    options: WhatsAppDeepLinkOptions = {}
  ): string {
    const {
      tone = 'standard_breakdown',
      customNote = '',
      includeAbsenceDetails = true,
      includeBic = false,
    } = options;

    const firstName = tenant.fullName.trim().split(' ')[0];
    const amountStr = `€${share.shareAmount.toFixed(2)}`;

    // 1. Absence / Occupancy Notes
    let occupancyNote = '';
    if (includeAbsenceDetails && share.activeDays < share.totalPeriodDays) {
      const absentDays = share.totalPeriodDays - share.activeDays;
      occupancyNote = `\n📅 *Absence Adjustment:* ${absentDays} days away accounted for (${share.activeDays} of ${share.totalPeriodDays} active resident days in billing span).`;
    }

    // 2. Greeting & Lead-in based on tone
    let headerIntro = '';
    let closingTone = '';

    if (tone === 'standard_breakdown') {
      headerIntro = `Hi ${firstName}! 👋

Here is your calculated utility share breakdown for *${apartment.name}* (${apartment.unitNumber}):`;
      closingTone = `Thank you! Please let me know if you have any questions about the utility statement.`;
    } else if (tone === 'friendly_reminder') {
      headerIntro = `Hi ${firstName}! Hope you're having a great week! 😊

This is a gentle reminder regarding the open utility bill for *${apartment.name}* (${apartment.unitNumber}):`;
      closingTone = `If you have already sent the transfer in the last 24 hours, please disregard this reminder. Thanks a lot!`;
    } else {
      // urgent_notice
      headerIntro = `Hi ${firstName}, ⚠️ *Action Required*

We noticed your share for the utility bill at *${apartment.name}* (${apartment.unitNumber}) is approaching or past its due date:`;
      closingTone = `Please initiate this transfer today so we can finalize the property account reconciliation. Thank you!`;
    }

    // 3. Assemble Complete Message
    const messageParts = [
      headerIntro,
      '',
      `📄 *Bill:* ${bill.title}`,
      `🗓️ *Billing Period:* ${bill.billingPeriodStart} to ${bill.billingPeriodEnd} (${share.totalPeriodDays} days)${occupancyNote}`,
      `💰 *Your Share:* ${amountStr}`,
      `⏰ *Payment Due Date:* ${bill.dueDate}`,
      '',
      `*Bank Transfer Instructions:*`,
      `🏦 *Bank:* ${bankAccount.institutionName} (${bankAccount.accountName})`,
      `💳 *IBAN:* \`${bankAccount.iban}\``,
      includeBic ? `🌐 *BIC / SWIFT:* \`${bankAccount.bic}\`` : null,
      '',
      `⚠️ *IMPORTANT - Transfer Reference / Message:*`,
      `\`${share.referenceCode}\``,
      '',
      `*(Please enter the exact reference code "${share.referenceCode}" into your banking app's payment description/remittance note. Our automated bank feed parser matches payments using this code).*`,
      customNote ? `\n💬 *Note from Landlord:* ${customNote}` : null,
      '',
      closingTone,
    ].filter((part) => part !== null);

    return messageParts.join('\n');
  }

  /**
   * Generates a fully formed WhatsApp deep-link result for an individual bill share
   */
  static generateDeepLink(
    tenant: Tenant,
    apartment: Apartment,
    bill: Bill,
    share: BillSplitShare,
    bankAccount: BankAccount,
    options: WhatsAppDeepLinkOptions = {}
  ): WhatsAppDeepLinkResult {
    const cleanPhone = this.cleanPhoneNumber(tenant.whatsappNumber);
    const phoneValidation = this.validatePhoneNumber(tenant.whatsappNumber);
    const rawMessage = this.buildMessageText(tenant, apartment, bill, share, bankAccount, options);
    const encodedMessage = encodeURIComponent(rawMessage);

    // Universal WhatsApp deep-link (handles iOS app switch, Android, and Desktop WhatsApp)
    const deepLinkUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;

    // Direct WhatsApp Web URL fallback
    const webAppUrl = cleanPhone
      ? `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`
      : `https://web.whatsapp.com/send?text=${encodedMessage}`;

    return {
      shareId: share.id,
      tenantId: tenant.id,
      tenantName: tenant.fullName,
      rawPhoneNumber: tenant.whatsappNumber,
      cleanPhoneNumber: cleanPhone,
      isValidPhone: phoneValidation.isValid,
      referenceCode: share.referenceCode,
      shareAmount: share.shareAmount,
      formattedAmount: `€${share.shareAmount.toFixed(2)}`,
      deepLinkUrl,
      webAppUrl,
      rawMessage,
      encodedMessage,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generates deep-link payloads for all outstanding (pending and non-deposit) shares across bills
   */
  static generateOutstandingBatch(
    tenants: Tenant[],
    apartments: Apartment[],
    bills: Bill[],
    shares: BillSplitShare[],
    bankAccounts: BankAccount[],
    options: WhatsAppDeepLinkOptions = {}
  ): WhatsAppDeepLinkResult[] {
    const results: WhatsAppDeepLinkResult[] = [];

    // Filter to outstanding shares (exclude already paid or settled from deposit)
    const pendingShares = shares.filter(
      (s) => s.status === 'pending' && !s.settledFromDeposit
    );

    for (const share of pendingShares) {
      const bill = bills.find((b) => b.id === share.billId);
      if (!bill) continue;

      const tenant = tenants.find((t) => t.id === share.tenantId);
      if (!tenant) continue;

      const apartment = apartments.find((a) => a.id === bill.apartmentId);
      if (!apartment) continue;

      const targetBankId = tenant.targetBankAccountId || apartment.targetBankAccountId;
      const bankAccount =
        bankAccounts.find((b) => b.id === targetBankId) || bankAccounts[0];

      results.push(
        this.generateDeepLink(tenant, apartment, bill, share, bankAccount, options)
      );
    }

    return results;
  }
}
