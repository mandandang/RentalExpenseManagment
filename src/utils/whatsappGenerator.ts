import { Bill, BillSplitShare, BankAccount, Apartment } from '../types';

export function formatWhatsAppMessage(
  tenantName: string,
  apartment: Apartment,
  bill: Bill,
  share: BillSplitShare,
  bankAccount: BankAccount
): string {
  const firstName = tenantName.split(' ')[0];

  let absenceNote = '';
  if (share.activeDays < share.totalPeriodDays) {
    const absentDays = share.totalPeriodDays - share.activeDays;
    absenceNote = `\n📅 *Absence Adjustment:* ${absentDays} days away accounted for (${share.activeDays} of ${share.totalPeriodDays} active resident days).`;
  }

  const message = `Hi ${firstName}! 👋

Here is your share breakdown for the utility bill for *${apartment.name}* (${apartment.unitNumber}):

📄 *Bill:* ${bill.title}
🗓️ *Period:* ${bill.billingPeriodStart} to ${bill.billingPeriodEnd} (${share.totalPeriodDays} days)${absenceNote}
💰 *Your Share:* €${share.shareAmount.toFixed(2)}
⏰ *Due Date:* ${bill.dueDate}

*Bank Transfer Details:*
🏦 *Bank:* ${bankAccount.institutionName} (${bankAccount.accountName})
💳 *IBAN:* ${bankAccount.iban}
⚠️ *Important - Transfer Note / Reference:*
\`${share.referenceCode}\`

*(Please include the exact reference code "${share.referenceCode}" in the payment description so our automated bank reconciliation system registers your payment immediately).*

Thank you! Let me know if you have any questions.`;

  return message;
}

export function createWhatsAppUrl(phoneNumber: string, message: string): string {
  // Clean phone number: remove spaces, dashes, parentheses
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '').replace('+', '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
