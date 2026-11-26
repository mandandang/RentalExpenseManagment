import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  Apartment, 
  Tenant, 
  Bill, 
  BillSplitShare, 
  BankAccount, 
  BankTransaction, 
  LandlordExpense 
} from '../types';

/**
 * Service to sync landlord records directly to top-level Firestore collections:
 * /apartments, /tenants, /bills, /billShares, /bankAccounts, /expenses, /transactions
 * This gives immediate visibility and direct editing capabilities in the Firebase Console.
 */

// -------------------------------------------------------------
// LANDLORD PROFILE
// -------------------------------------------------------------
export async function saveLandlordProfile(landlordId: string, data: {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: string;
}): Promise<void> {
  const path = `landlords/${landlordId}`;
  try {
    await setDoc(doc(db, 'landlords', landlordId), {
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// -------------------------------------------------------------
// APARTMENTS
// -------------------------------------------------------------
export async function saveApartmentToFirestore(apt: Apartment): Promise<void> {
  const path = `apartments/${apt.id}`;
  try {
    await setDoc(doc(db, 'apartments', apt.id), apt);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteApartmentFromFirestore(apartmentId: string): Promise<void> {
  const path = `apartments/${apartmentId}`;
  try {
    await deleteDoc(doc(db, 'apartments', apartmentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchApartmentsFromFirestore(): Promise<Apartment[]> {
  const path = 'apartments';
  try {
    const snap = await getDocs(collection(db, 'apartments'));
    const items: Apartment[] = [];
    snap.forEach((d) => items.push(d.data() as Apartment));
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// -------------------------------------------------------------
// TENANTS
// -------------------------------------------------------------
export async function saveTenantToFirestore(tenant: Tenant): Promise<void> {
  const path = `tenants/${tenant.id}`;
  try {
    await setDoc(doc(db, 'tenants', tenant.id), tenant);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteTenantFromFirestore(tenantId: string): Promise<void> {
  const path = `tenants/${tenantId}`;
  try {
    await deleteDoc(doc(db, 'tenants', tenantId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchTenantsFromFirestore(): Promise<Tenant[]> {
  const path = 'tenants';
  try {
    const snap = await getDocs(collection(db, 'tenants'));
    const items: Tenant[] = [];
    snap.forEach((d) => items.push(d.data() as Tenant));
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// -------------------------------------------------------------
// BANK ACCOUNTS
// -------------------------------------------------------------
export async function syncBankAccountToFirestore(account: BankAccount): Promise<void> {
  const path = `bankAccounts/${account.id}`;
  try {
    await setDoc(doc(db, 'bankAccounts', account.id), {
      ...account,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBankAccountFromFirestore(accountId: string): Promise<void> {
  const path = `bankAccounts/${accountId}`;
  try {
    await deleteDoc(doc(db, 'bankAccounts', accountId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchBankAccountsFromFirestore(): Promise<BankAccount[]> {
  const path = 'bankAccounts';
  try {
    const snap = await getDocs(collection(db, 'bankAccounts'));
    const items: BankAccount[] = [];
    snap.forEach((d) => items.push(d.data() as BankAccount));
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// -------------------------------------------------------------
// BILLS & BILL SHARES
// -------------------------------------------------------------
export async function saveBillToFirestore(bill: Bill): Promise<void> {
  const path = `bills/${bill.id}`;
  try {
    await setDoc(doc(db, 'bills', bill.id), bill);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBillFromFirestore(billId: string): Promise<void> {
  const path = `bills/${billId}`;
  try {
    await deleteDoc(doc(db, 'bills', billId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchBillsFromFirestore(): Promise<Bill[]> {
  const path = 'bills';
  try {
    const snap = await getDocs(collection(db, 'bills'));
    const items: Bill[] = [];
    snap.forEach((d) => items.push(d.data() as Bill));
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveBillShareToFirestore(share: BillSplitShare): Promise<void> {
  const path = `billShares/${share.id}`;
  try {
    await setDoc(doc(db, 'billShares', share.id), share);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchBillSharesFromFirestore(): Promise<BillSplitShare[]> {
  const path = 'billShares';
  try {
    const snap = await getDocs(collection(db, 'billShares'));
    const items: BillSplitShare[] = [];
    snap.forEach((d) => items.push(d.data() as BillSplitShare));
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// -------------------------------------------------------------
// LANDLORD EXPENSES (Mortgage, HOA, Taxes)
// -------------------------------------------------------------
export async function saveExpenseToFirestore(exp: LandlordExpense): Promise<void> {
  const path = `expenses/${exp.id}`;
  try {
    await setDoc(doc(db, 'expenses', exp.id), exp);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteExpenseFromFirestore(expenseId: string): Promise<void> {
  const path = `expenses/${expenseId}`;
  try {
    await deleteDoc(doc(db, 'expenses', expenseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchExpensesFromFirestore(): Promise<LandlordExpense[]> {
  const path = 'expenses';
  try {
    const snap = await getDocs(collection(db, 'expenses'));
    const items: LandlordExpense[] = [];
    snap.forEach((d) => items.push(d.data() as LandlordExpense));
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// -------------------------------------------------------------
// TRANSACTIONS (Payment Histories)
// -------------------------------------------------------------
export async function saveTransactionToFirestore(tx: BankTransaction): Promise<void> {
  const path = `transactions/${tx.id}`;
  try {
    await setDoc(doc(db, 'transactions', tx.id), tx);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchTransactionsFromFirestore(): Promise<BankTransaction[]> {
  const path = 'transactions';
  try {
    const snap = await getDocs(collection(db, 'transactions'));
    const items: BankTransaction[] = [];
    snap.forEach((d) => items.push(d.data() as BankTransaction));
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// -------------------------------------------------------------
// PORTFOLIO INITIALIZER & FULL CLOUD SYNC
// Seeds all collections to Firestore immediately if not present,
// and retrieves cloud state so both app and Firebase Console match 100%.
// -------------------------------------------------------------
export async function syncInitialPortfolioIfEmpty(
  defaults: {
    apartments: Apartment[];
    tenants: Tenant[];
    bankAccounts: BankAccount[];
    bills: Bill[];
    shares: BillSplitShare[];
    expenses: LandlordExpense[];
    transactions: BankTransaction[];
  }
): Promise<{
  apartments: Apartment[];
  tenants: Tenant[];
  bankAccounts: BankAccount[];
  bills: Bill[];
  shares: BillSplitShare[];
  expenses: LandlordExpense[];
  transactions: BankTransaction[];
}> {
  try {
    const existingApts = await fetchApartmentsFromFirestore();
    if (existingApts && existingApts.length > 0) {
      // Cloud database already populated, pull all documents
      const [tenants, bankAccounts, bills, shares, expenses, transactions] = await Promise.all([
        fetchTenantsFromFirestore(),
        fetchBankAccountsFromFirestore(),
        fetchBillsFromFirestore(),
        fetchBillSharesFromFirestore(),
        fetchExpensesFromFirestore(),
        fetchTransactionsFromFirestore(),
      ]);

      return {
        apartments: existingApts,
        tenants: tenants && tenants.length > 0 ? tenants : defaults.tenants,
        bankAccounts: bankAccounts && bankAccounts.length > 0 ? bankAccounts : defaults.bankAccounts,
        bills: bills && bills.length > 0 ? bills : defaults.bills,
        shares: shares && shares.length > 0 ? shares : defaults.shares,
        expenses: expenses && expenses.length > 0 ? expenses : defaults.expenses,
        transactions: transactions && transactions.length > 0 ? transactions : defaults.transactions,
      };
    } else {
      // Database is empty in Firebase Console! Seed all current records to Firestore right now
      console.log('Seeding initial records to top-level Firestore collections...');
      await Promise.all([
        ...defaults.apartments.map((a) => saveApartmentToFirestore(a)),
        ...defaults.tenants.map((t) => saveTenantToFirestore(t)),
        ...defaults.bankAccounts.map((b) => syncBankAccountToFirestore(b)),
        ...defaults.bills.map((bi) => saveBillToFirestore(bi)),
        ...defaults.shares.map((s) => saveBillShareToFirestore(s)),
        ...defaults.expenses.map((e) => saveExpenseToFirestore(e)),
        ...defaults.transactions.map((tx) => saveTransactionToFirestore(tx)),
      ]);
      return defaults;
    }
  } catch (e) {
    console.warn('Initial cloud sync notice:', e);
    return defaults;
  }
}

// Force upload everything to Firestore top-level collections
export async function forceUploadAllToFirestore(data: {
  apartments: Apartment[];
  tenants: Tenant[];
  bankAccounts: BankAccount[];
  bills: Bill[];
  shares: BillSplitShare[];
  expenses: LandlordExpense[];
  transactions: BankTransaction[];
}): Promise<void> {
  await Promise.all([
    ...data.apartments.map((a) => saveApartmentToFirestore(a)),
    ...data.tenants.map((t) => saveTenantToFirestore(t)),
    ...data.bankAccounts.map((b) => syncBankAccountToFirestore(b)),
    ...data.bills.map((bi) => saveBillToFirestore(bi)),
    ...data.shares.map((s) => saveBillShareToFirestore(s)),
    ...data.expenses.map((e) => saveExpenseToFirestore(e)),
    ...data.transactions.map((tx) => saveTransactionToFirestore(tx)),
  ]);
}
