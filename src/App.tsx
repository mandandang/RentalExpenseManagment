import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { ApartmentsView } from './components/ApartmentsView';
import { BillManagerView } from './components/BillManagerView';
import { BillUploadModal } from './components/BillUploadModal';
import { BankSyncView } from './components/BankSyncView';
import { ReconciliationView } from './components/ReconciliationView';
import { ArchitectureSecurityModal } from './components/ArchitectureSecurityModal';
import { WhatsAppDispatchServiceModal } from './components/WhatsAppDispatchServiceModal';
import { PhoneInstallModal } from './components/PhoneInstallModal';
import { DatabaseAccessModal } from './components/DatabaseAccessModal';
import { 
  initialApartments, 
  initialTenants, 
  initialBills, 
  initialBillShares, 
  initialBankAccounts, 
  initialTransactions,
  initialLandlordExpenses
} from './data/initialData';
import { Apartment, Tenant, Bill, BillSplitShare, BankAccount, BankTransaction, LandlordExpense } from './types';
import { LandlordUser } from './types/auth';
import { LoginScreen } from './components/LoginScreen';
import { matchTransaction } from './utils/reconciliationEngine';
import { advanceDueDate } from './components/LandlordExpensesSection';
import {
  saveApartmentToFirestore,
  deleteApartmentFromFirestore,
  saveTenantToFirestore,
  deleteTenantFromFirestore,
  saveBillToFirestore,
  saveBillShareToFirestore,
  syncBankAccountToFirestore,
  saveExpenseToFirestore,
  deleteExpenseFromFirestore,
  saveTransactionToFirestore,
  syncInitialPortfolioIfEmpty,
  forceUploadAllToFirestore,
  saveLandlordProfile,
} from './services/firestoreService';

// Storage Helper: Safely reads from localStorage with fallback
function getStoredData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback)) {
      return (Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback) as T;
    }
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'apartments' | 'bills' | 'banks' | 'reconciliation'>('overview');
  
  // Landlord Authentication State (Session remembered in localStorage)
  const [currentUser, setCurrentUser] = useState<LandlordUser | null>(() => {
    try {
      const saved = localStorage.getItem('rentreconcile_landlord_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Application State — Initialized from localStorage cache so data is NEVER lost on reload
  const [apartments, setApartments] = useState<Apartment[]>(() => 
    getStoredData('rentreconcile_apartments', initialApartments)
  );
  const [tenants, setTenants] = useState<Tenant[]>(() => 
    getStoredData('rentreconcile_tenants', initialTenants)
  );
  const [bills, setBills] = useState<Bill[]>(() => 
    getStoredData('rentreconcile_bills', initialBills)
  );
  const [shares, setShares] = useState<BillSplitShare[]>(() => 
    getStoredData('rentreconcile_shares', initialBillShares)
  );
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => 
    getStoredData('rentreconcile_bank_accounts', initialBankAccounts)
  );
  const [transactions, setTransactions] = useState<BankTransaction[]>(() => 
    getStoredData('rentreconcile_transactions', initialTransactions)
  );
  const [landlordExpenses, setLandlordExpenses] = useState<LandlordExpense[]>(() => 
    getStoredData('rentreconcile_expenses', initialLandlordExpenses)
  );

  // Modals
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadTargetApartmentId, setUploadTargetApartmentId] = useState<string>('apt_2');
  const [showSecurityGuide, setShowSecurityGuide] = useState<boolean>(false);
  const [showWhatsAppService, setShowWhatsAppService] = useState<boolean>(false);
  const [whatsAppInitialShareId, setWhatsAppInitialShareId] = useState<string | undefined>(undefined);
  const [showPhoneInstallModal, setShowPhoneInstallModal] = useState<boolean>(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState<boolean>(false);

  // Success Notification Banner
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification((curr) => (curr === message ? null : curr));
    }, 4000);
  };

  // Immediate synchronous persistence to browser localStorage whenever any state changes
  useEffect(() => {
    try {
      localStorage.setItem('rentreconcile_apartments', JSON.stringify(apartments));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [apartments]);

  useEffect(() => {
    try {
      localStorage.setItem('rentreconcile_tenants', JSON.stringify(tenants));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [tenants]);

  useEffect(() => {
    try {
      localStorage.setItem('rentreconcile_bills', JSON.stringify(bills));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [bills]);

  useEffect(() => {
    try {
      localStorage.setItem('rentreconcile_shares', JSON.stringify(shares));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [shares]);

  useEffect(() => {
    try {
      localStorage.setItem('rentreconcile_bank_accounts', JSON.stringify(bankAccounts));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [bankAccounts]);

  useEffect(() => {
    try {
      localStorage.setItem('rentreconcile_expenses', JSON.stringify(landlordExpenses));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [landlordExpenses]);

  useEffect(() => {
    try {
      localStorage.setItem('rentreconcile_transactions', JSON.stringify(transactions));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [transactions]);

  // Validate Firestore connection on initial boot
  useEffect(() => {
    import('./firebase').then(({ validateFirestoreConnection }) => {
      validateFirestoreConnection().catch(console.warn);
    });
  }, []);

  // Sync to/from Google Cloud Firestore on initial load
  useEffect(() => {
    let isMounted = true;

    syncInitialPortfolioIfEmpty({
      apartments,
      tenants,
      bankAccounts,
      bills,
      shares,
      expenses: landlordExpenses,
      transactions,
    }).then((cloudData) => {
      if (!isMounted) return;
      if (cloudData.apartments && cloudData.apartments.length > 0) {
        setApartments(cloudData.apartments);
      }
      if (cloudData.tenants && cloudData.tenants.length > 0) {
        setTenants(cloudData.tenants);
      }
      if (cloudData.bankAccounts && cloudData.bankAccounts.length > 0) {
        setBankAccounts(cloudData.bankAccounts);
      }
      if (cloudData.bills && cloudData.bills.length > 0) {
        setBills(cloudData.bills);
      }
      if (cloudData.shares && cloudData.shares.length > 0) {
        setShares(cloudData.shares);
      }
      if (cloudData.expenses && cloudData.expenses.length > 0) {
        setLandlordExpenses(cloudData.expenses);
      }
      if (cloudData.transactions && cloudData.transactions.length > 0) {
        setTransactions(cloudData.transactions);
      }
    }).catch(console.warn);

    return () => {
      isMounted = false;
    };
  }, []);

  // Landlord Auth Handlers
  const handleLoginSuccess = (user: LandlordUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('rentreconcile_landlord_session', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to persist session', e);
    }
    // Sync profile to Firestore
    saveLandlordProfile(user.id, {
      uid: user.id,
      email: user.email,
      displayName: user.name,
      photoURL: user.avatarUrl,
      provider: user.provider,
    }).catch(console.warn);

    showToast(`Welcome back, ${user.name}! Connected to Google Cloud Firestore.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('rentreconcile_landlord_session');
    } catch (e) {
      console.error('Failed to clear session', e);
    }
    showToast('Landlord session locked. All financial and tenant details are now shielded.');
  };

  // Manual Full Cloud Sync Handler
  const handleForceSync = async () => {
    await forceUploadAllToFirestore({
      apartments,
      tenants,
      bankAccounts,
      bills,
      shares,
      expenses: landlordExpenses,
      transactions,
    });
    showToast('All apartments, tenants, bills, and bank accounts pushed to Google Cloud Firestore!');
  };

  // Full Tenant Profile & Lease Edit Handler (Name, WhatsApp, Room, Dates, Deposit, Bank)
  const handleUpdateFullTenant = (updatedTenant: Tenant) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === updatedTenant.id ? updatedTenant : t))
    );
    saveTenantToFirestore(updatedTenant).catch(console.warn);
    showToast(`Updated profile and lease timeline for ${updatedTenant.fullName}.`);
  };

  // Bank Account Update Handlers
  const handleUpdateBankAccount = (updatedAccount: BankAccount) => {
    setBankAccounts((prev) => 
      prev.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc))
    );

    if (currentUser) {
      syncBankAccountToFirestore(updatedAccount).catch(console.warn);
    }

    showToast(`Saved updated bank details for ${updatedAccount.institutionName} (${updatedAccount.accountName}).`);
  };

  const handleAddBankAccount = (newAccount: BankAccount) => {
    setBankAccounts((prev) => [...prev, newAccount]);

    if (currentUser) {
      syncBankAccountToFirestore(newAccount).catch(console.warn);
    }

    showToast(`Added new bank account ${newAccount.institutionName} (${newAccount.iban}).`);
  };

  // Update Tenant Rent
  const handleUpdateTenantRent = (tenantId: string, newRent: number) => {
    let updatedTenant: Tenant | null = null;
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          updatedTenant = { ...t, monthlyRent: newRent };
          return updatedTenant;
        }
        return t;
      })
    );
    if (currentUser && updatedTenant) {
      saveTenantToFirestore(updatedTenant).catch(console.warn);
    }
    showToast(`Updated custom monthly rent to €${newRent.toFixed(2)}.`);
  };

  // Update Tenant Retained Deposit
  const handleUpdateTenantDeposit = (tenantId: string, newDeposit: number) => {
    let updatedTenant: Tenant | null = null;
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          updatedTenant = { ...t, retainedDepositBalance: newDeposit };
          return updatedTenant;
        }
        return t;
      })
    );
    if (currentUser && updatedTenant) {
      saveTenantToFirestore(updatedTenant).catch(console.warn);
    }
    showToast(`Updated retained deposit reserve to €${newDeposit.toFixed(2)}.`);
  };

  // Add New Tenant
  const handleAddTenant = (tenantData: Omit<Tenant, 'id'>) => {
    const newId = `ten_${Date.now()}`;
    const newTenant: Tenant = {
      ...tenantData,
      id: newId,
    };
    setTenants((prev) => [...prev, newTenant]);
    if (currentUser) {
      saveTenantToFirestore(newTenant).catch(console.warn);
    }
    showToast(`Enrolled new tenant "${newTenant.fullName}" into lease ledger.`);
  };

  // End Tenancy / Move Out & Archive
  const handleEndTenancy = (
    tenantId: string,
    moveOutDate: string,
    retainedDeposit: number,
    notes?: string
  ) => {
    let modified: Tenant | null = null;
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          modified = {
            ...t,
            isActive: false,
            leaseEndDate: moveOutDate,
            retainedDepositBalance: retainedDeposit,
            notes: notes ? `${t.notes ? t.notes + ' · ' : ''}${notes}` : t.notes,
          };
          return modified;
        }
        return t;
      })
    );
    if (currentUser && modified) {
      saveTenantToFirestore(modified).catch(console.warn);
    }
    showToast('Tenant moved out and preserved in Tenancy Archive.');
  };

  // Reactivate Tenant Lease
  const handleReactivateTenant = (tenantId: string) => {
    let modified: Tenant | null = null;
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          modified = {
            ...t,
            isActive: true,
            leaseEndDate: null,
          };
          return modified;
        }
        return t;
      })
    );
    if (currentUser && modified) {
      saveTenantToFirestore(modified).catch(console.warn);
    }
    showToast('Tenant reactivated to active resident.');
  };

  // Update Apartment Details
  const handleUpdateApartment = (updatedApartment: Apartment) => {
    setApartments((prev) =>
      prev.map((a) => (a.id === updatedApartment.id ? updatedApartment : a))
    );
    if (currentUser) {
      saveApartmentToFirestore(updatedApartment).catch(console.warn);
    }
    showToast(`Updated details for "${updatedApartment.name}".`);
  };

  // Add New Apartment
  const handleAddApartment = (newAptData: Omit<Apartment, 'id'>) => {
    const newId = `apt_${Date.now()}`;
    const newApartment: Apartment = {
      ...newAptData,
      id: newId,
    };
    setApartments((prev) => [...prev, newApartment]);
    if (currentUser) {
      saveApartmentToFirestore(newApartment).catch(console.warn);
    }
    showToast(`Added new property "${newApartment.name}" (${newApartment.unitNumber}) to portfolio.`);
  };

  // Update Tenant Target Bank Account (ING vs Revolut routing)
  const handleUpdateTenantBank = (tenantId: string, bankId: string) => {
    let modified: Tenant | null = null;
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          modified = { ...t, targetBankAccountId: bankId };
          return modified;
        }
        return t;
      })
    );
    if (currentUser && modified) {
      saveTenantToFirestore(modified).catch(console.warn);
    }
    const bank = bankAccounts.find((b) => b.id === bankId);
    showToast(`Assigned tenant payment destination to ${bank?.institutionName || 'bank'}.`);
  };

  // Safe Delete Apartment & Cascade Cleanup
  const handleDeleteApartment = (apartmentId: string) => {
    if (apartments.length <= 1) {
      showToast('Cannot delete the only property in your portfolio.');
      return;
    }
    const targetApt = apartments.find((a) => a.id === apartmentId);

    // 1. Remove apartment
    setApartments((prev) => prev.filter((a) => a.id !== apartmentId));
    if (currentUser) {
      deleteApartmentFromFirestore(apartmentId).catch(console.warn);
    }

    // 2. Cascade cleanup of associated tenants
    setTenants((prev) => {
      const remaining = prev.filter((t) => t.apartmentId !== apartmentId);
      if (currentUser) {
        prev.filter((t) => t.apartmentId === apartmentId).forEach((t) => {
          deleteTenantFromFirestore(t.id).catch(console.warn);
        });
      }
      return remaining;
    });

    // 3. Cascade cleanup of bills and shares
    const aptBillIds = new Set(bills.filter((b) => b.apartmentId === apartmentId).map((b) => b.id));
    setBills((prev) => prev.filter((b) => b.apartmentId !== apartmentId));
    setShares((prev) => prev.filter((s) => !aptBillIds.has(s.billId)));

    // 4. Cascade cleanup of landlord expenses
    setLandlordExpenses((prev) => prev.filter((e) => e.apartmentId !== apartmentId));

    showToast(`Permanently deleted "${targetApt?.name || 'Property'}" and cleaned up records.`);
  };

  // Add Landlord Expense
  const handleAddLandlordExpense = (expenseData: Omit<LandlordExpense, 'id'>) => {
    const newId = `exp_${Date.now()}`;
    const newExpense: LandlordExpense = {
      ...expenseData,
      id: newId,
    };
    setLandlordExpenses((prev) => [newExpense, ...prev]);
    if (currentUser) {
      saveExpenseToFirestore(newExpense).catch(console.warn);
    }
    showToast(`Scheduled recurring obligation "${newExpense.title}" (€${newExpense.amount.toFixed(2)}).`);
  };

  // Update Landlord Expense
  const handleUpdateLandlordExpense = (updatedExpense: LandlordExpense) => {
    setLandlordExpenses((prev) =>
      prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e))
    );
    if (currentUser) {
      saveExpenseToFirestore(updatedExpense).catch(console.warn);
    }
    showToast(`Updated "${updatedExpense.title}".`);
  };

  // Delete Landlord Expense
  const handleDeleteLandlordExpense = (expenseId: string) => {
    const target = landlordExpenses.find((e) => e.id === expenseId);
    setLandlordExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    if (currentUser) {
      deleteExpenseFromFirestore(expenseId).catch(console.warn);
    }
    showToast(`Removed "${target?.title || 'Expense'}" from obligations.`);
  };

  // Mark Landlord Expense as Paid & Roll Cycle
  const handleMarkExpensePaid = (expenseId: string) => {
    const target = landlordExpenses.find((e) => e.id === expenseId);
    if (!target) return;

    const nextCycleDate = advanceDueDate(target.nextDueDate, target.frequency, target.dueDay);
    const today = new Date().toISOString().split('T')[0];

    let updatedExp: LandlordExpense | null = null;
    setLandlordExpenses((prev) =>
      prev.map((e) => {
        if (e.id === expenseId) {
          updatedExp = {
            ...e,
            lastPaidDate: today,
            nextDueDate: nextCycleDate,
            status: 'upcoming',
          };
          return updatedExp;
        }
        return e;
      })
    );

    if (currentUser && updatedExp) {
      saveExpenseToFirestore(updatedExp).catch(console.warn);
    }

    showToast(
      `Marked "${target.title}" (€${target.amount.toFixed(2)}) as paid. Next deadline rolled to ${nextCycleDate}.`
    );
  };

  // Create Bill with Split Shares
  const handleCreateBillWithShares = (
    billData: Omit<Bill, 'id' | 'createdAt'>,
    sharesData: Omit<BillSplitShare, 'id'>[]
  ) => {
    const newBillId = `bill_${Date.now()}`;
    const newBill: Bill = {
      ...billData,
      id: newBillId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const newShares: BillSplitShare[] = sharesData.map((s, idx) => ({
      ...s,
      id: `share_${Date.now()}_${idx}`,
      billId: newBillId,
    }));

    setBills((prev) => [newBill, ...prev]);
    setShares((prev) => [...prev, ...newShares]);

    if (currentUser) {
      saveBillToFirestore(newBill).catch(console.warn);
      newShares.forEach((s) => saveBillShareToFirestore(s).catch(console.warn));
    }

    showToast(`Saved invoice "${newBill.title}" and generated ${newShares.length} roommate shares.`);
    setActiveTab('bills');
  };

  // Mark Share Paid Manually
  const handleMarkSharePaid = (shareId: string) => {
    let updatedShare: BillSplitShare | null = null;
    setShares((prev) =>
      prev.map((s) => {
        if (s.id === shareId) {
          updatedShare = { ...s, status: 'paid', settledAt: new Date().toISOString().split('T')[0] };
          return updatedShare;
        }
        return s;
      })
    );
    if (currentUser && updatedShare) {
      saveBillShareToFirestore(updatedShare).catch(console.warn);
    }
    showToast('Utility share marked as paid.');
  };

  // Settle Share from Retained Deposit (e.g. for Julia)
  const handleSettleShareFromDeposit = (shareId: string, depositAmount: number) => {
    const targetShare = shares.find((s) => s.id === shareId);
    if (!targetShare) return;

    // Deduct from tenant deposit balance
    let updatedTenant: Tenant | null = null;
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === targetShare.tenantId) {
          updatedTenant = {
            ...t,
            retainedDepositBalance: Math.max(0, t.retainedDepositBalance - depositAmount),
          };
          return updatedTenant;
        }
        return t;
      })
    );

    // Update share status
    let updatedShare: BillSplitShare | null = null;
    setShares((prev) =>
      prev.map((s) => {
        if (s.id === shareId) {
          updatedShare = {
            ...s,
            status: 'settled_deposit',
            settledFromDeposit: true,
            depositAmountApplied: depositAmount,
            settledAt: new Date().toISOString().split('T')[0],
          };
          return updatedShare;
        }
        return s;
      })
    );

    if (currentUser) {
      if (updatedTenant) saveTenantToFirestore(updatedTenant).catch(console.warn);
      if (updatedShare) saveBillShareToFirestore(updatedShare).catch(console.warn);
    }

    showToast(
      `Deducted €${depositAmount.toFixed(2)} from retained deposit for ${targetShare.tenantName}. WhatsApp communication suppressed.`
    );
  };

  // Sync Bank Accounts (PSD2 Refresh)
  const handleSyncAccounts = () => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' CET';
    setBankAccounts((prev) =>
      prev.map((acc) => {
        const updated = {
          ...acc,
          lastSyncedAt: `Today at ${nowTime}`,
        };
        if (currentUser) {
          syncBankAccountToFirestore(updated).catch(console.warn);
        }
        return updated;
      })
    );
    showToast('Synced ING and Revolut accounts via European PSD2 endpoints.');
  };

  // Simulate Incoming Payment
  const handleSimulateIncomingPayment = (preset: 'ref_token' | 'rent_name' | 'parent_transfer') => {
    const today = new Date().toISOString().split('T')[0];
    let newTx: BankTransaction;

    if (preset === 'ref_token') {
      const pendingShare = shares.find((s) => s.status === 'pending');
      const share = pendingShare || shares[0];

      newTx = {
        id: `tx_sim_${Date.now()}`,
        bankAccountId: 'acc_revolut_eur',
        bookingDate: today,
        valueDate: today,
        amount: share.shareAmount,
        currency: 'EUR',
        counterpartyName: share.tenantName,
        remittanceInformation: `SEPA Credit Transfer ${share.referenceCode} payment`,
        reconciliationStatus: 'matched',
        matchedEntityType: 'bill_share',
        matchedEntityId: share.id,
        matchedDescription: `Bill Split Share: ${share.tenantName} (${share.referenceCode})`,
        matchConfidence: 100,
        matchReason: `Exact reference token "${share.referenceCode}" detected in remittance note`,
        isSimulated: true,
      };

      setShares((prev) =>
        prev.map((s) => {
          if (s.id === share.id) {
            const updated = { ...s, status: 'paid' as const, settledAt: today };
            if (currentUser) saveBillShareToFirestore(updated).catch(console.warn);
            return updated;
          }
          return s;
        })
      );

      showToast(`Simulated receipt of €${share.shareAmount.toFixed(2)} from ${share.tenantName}. Auto-matched!`);
    } else if (preset === 'rent_name') {
      const tenant = tenants[1]; // Lukas Schmidt
      newTx = {
        id: `tx_sim_${Date.now()}`,
        bankAccountId: 'acc_ing_eur',
        bookingDate: today,
        valueDate: today,
        amount: tenant.monthlyRent,
        currency: 'EUR',
        counterpartyName: tenant.fullName,
        remittanceInformation: `Miete ${tenant.roomLabel} April 2026`,
        reconciliationStatus: 'matched',
        matchedEntityType: 'rent',
        matchedEntityId: tenant.id,
        matchedDescription: `Monthly Rent: ${tenant.fullName} (${tenant.roomLabel})`,
        matchConfidence: 95,
        matchReason: `Sender name matches tenant "${tenant.fullName}", keyword "Miete", and exact rent €${tenant.monthlyRent.toFixed(2)}`,
        isSimulated: true,
      };
      showToast(`Simulated rent payment of €${tenant.monthlyRent.toFixed(2)} from ${tenant.fullName}. Auto-matched!`);
    } else {
      newTx = {
        id: `tx_sim_${Date.now()}`,
        bankAccountId: 'acc_revolut_eur',
        bookingDate: today,
        valueDate: today,
        amount: 540.0,
        currency: 'EUR',
        counterpartyName: 'Dr. Heinrich Schmidt',
        remittanceInformation: 'Unterstützung WG Lukas',
        reconciliationStatus: 'unmatched',
        isSimulated: true,
      };
      showToast('Simulated payment from 3rd party payer (parent). Flagged for manual review.');
    }

    setTransactions((prev) => [newTx, ...prev]);
    if (currentUser) {
      saveTransactionToFirestore(newTx).catch(console.warn);
    }
  };

  // Manual Reconciliation Match
  const handleApproveMatch = (
    transactionId: string,
    entityType: 'rent' | 'bill_share',
    entityId: string
  ) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) return;

    let desc = '';
    if (entityType === 'rent') {
      const tenant = tenants.find((t) => t.id === entityId);
      desc = `Monthly Rent: ${tenant?.fullName || 'Tenant'} (${tenant?.roomLabel || ''})`;
    } else {
      const share = shares.find((s) => s.id === entityId);
      desc = `Bill Split Share: ${share?.tenantName || 'Tenant'} (${share?.referenceCode || ''})`;
      setShares((prev) =>
        prev.map((s) => {
          if (s.id === entityId) {
            const updated = {
              ...s,
              status: 'paid' as const,
              transactionId: transactionId,
              settledAt: new Date().toISOString().split('T')[0],
            };
            if (currentUser) saveBillShareToFirestore(updated).catch(console.warn);
            return updated;
          }
          return s;
        })
      );
    }

    let updatedTx: BankTransaction | null = null;
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === transactionId) {
          updatedTx = {
            ...t,
            reconciliationStatus: 'matched',
            matchedEntityType: entityType,
            matchedEntityId: entityId,
            matchedDescription: desc,
            matchConfidence: 100,
            matchReason: 'Manually verified and confirmed by landlord',
          };
          return updatedTx;
        }
        return t;
      })
    );

    if (currentUser && updatedTx) {
      saveTransactionToFirestore(updatedTx).catch(console.warn);
    }

    showToast(`Approved match: ${tx.counterpartyName} linked to ${desc}.`);
  };

  // Ignore Transaction
  const handleIgnoreTransaction = (transactionId: string) => {
    let updatedTx: BankTransaction | null = null;
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === transactionId) {
          updatedTx = { ...t, reconciliationStatus: 'ignored' };
          return updatedTx;
        }
        return t;
      })
    );
    if (currentUser && updatedTx) {
      saveTransactionToFirestore(updatedTx).catch(console.warn);
    }
    showToast('Transaction marked as ignored.');
  };

  // Mark WhatsApp Dispatched
  const handleMarkDispatched = (shareId: string) => {
    let updatedShare: BillSplitShare | null = null;
    setShares((prev) =>
      prev.map((s) => {
        if (s.id === shareId) {
          updatedShare = { ...s, whatsappSentAt: new Date().toISOString() };
          return updatedShare;
        }
        return s;
      })
    );
    if (currentUser && updatedShare) {
      saveBillShareToFirestore(updatedShare).catch(console.warn);
    }
  };

  // Open Upload Modal with Preselected Apartment
  const openUploadForApartment = (apartmentId: string) => {
    setUploadTargetApartmentId(apartmentId);
    setShowUploadModal(true);
  };

  // Open WhatsApp Service with preselected share
  const handleOpenWhatsAppService = (shareId?: string) => {
    setWhatsAppInitialShareId(shareId);
    setShowWhatsAppService(true);
  };

  // Pending Reviews Count
  const pendingReviewCount = transactions.filter((t) => t.reconciliationStatus === 'unmatched').length;
  const pendingWhatsAppCount = shares.filter((s) => s.status === 'pending' && !s.whatsappSentAt).length;

  // LANDLORD PRIVACY SHIELD:
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} defaultEmail="mandanahashemi74@gmail.com" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200 max-w-md">
          {notification}
        </div>
      )}

      {/* Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => openUploadForApartment('apt_2')}
        onOpenSecurityGuide={() => setShowSecurityGuide(true)}
        onOpenWhatsAppService={handleOpenWhatsAppService}
        onOpenPhoneInstall={() => setShowPhoneInstallModal(true)}
        onOpenDatabaseModal={() => setShowDatabaseModal(true)}
        pendingReviewCount={pendingReviewCount}
        pendingWhatsAppCount={pendingWhatsAppCount}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <DashboardOverview
            apartments={apartments}
            tenants={tenants}
            bills={bills}
            shares={shares}
            bankAccounts={bankAccounts}
            transactions={transactions}
            landlordExpenses={landlordExpenses}
            onOpenUpload={() => openUploadForApartment('apt_2')}
            onOpenSecurityGuide={() => setShowSecurityGuide(true)}
            onNavigateTab={setActiveTab}
            onMarkExpensePaid={handleMarkExpensePaid}
          />
        )}

        {activeTab === 'apartments' && (
          <ApartmentsView
            apartments={apartments}
            tenants={tenants}
            bankAccounts={bankAccounts}
            landlordExpenses={landlordExpenses}
            onUpdateTenantRent={handleUpdateTenantRent}
            onUpdateTenantDeposit={handleUpdateTenantDeposit}
            onUpdateTenantBank={handleUpdateTenantBank}
            onUpdateFullTenant={handleUpdateFullTenant}
            onAddTenant={handleAddTenant}
            onEndTenancy={handleEndTenancy}
            onReactivateTenant={handleReactivateTenant}
            onOpenUploadForApartment={openUploadForApartment}
            onUpdateApartment={handleUpdateApartment}
            onAddApartment={handleAddApartment}
            onDeleteApartment={handleDeleteApartment}
            onAddLandlordExpense={handleAddLandlordExpense}
            onUpdateLandlordExpense={handleUpdateLandlordExpense}
            onDeleteLandlordExpense={handleDeleteLandlordExpense}
            onMarkExpensePaid={handleMarkExpensePaid}
          />
        )}

        {activeTab === 'bills' && (
          <BillManagerView
            bills={bills}
            shares={shares}
            apartments={apartments}
            tenants={tenants}
            bankAccounts={bankAccounts}
            onOpenUpload={() => openUploadForApartment('apt_2')}
            onOpenWhatsAppService={handleOpenWhatsAppService}
            onMarkSharePaid={handleMarkSharePaid}
            onSettleShareFromDeposit={handleSettleShareFromDeposit}
          />
        )}

        {activeTab === 'banks' && (
          <BankSyncView
            bankAccounts={bankAccounts}
            transactions={transactions}
            onSyncAccounts={handleSyncAccounts}
            onSimulateIncomingPayment={handleSimulateIncomingPayment}
            onNavigateToReconcile={() => setActiveTab('reconciliation')}
            onOpenSecurityGuide={() => setShowSecurityGuide(true)}
            onUpdateBankAccount={handleUpdateBankAccount}
            onAddBankAccount={handleAddBankAccount}
          />
        )}

        {activeTab === 'reconciliation' && (
          <ReconciliationView
            transactions={transactions}
            tenants={tenants}
            shares={shares}
            bankAccounts={bankAccounts}
            onApproveMatch={handleApproveMatch}
            onIgnoreTransaction={handleIgnoreTransaction}
          />
        )}
      </main>

      {/* Upload PDF Bill Modal */}
      {showUploadModal && (
        <BillUploadModal
          apartments={apartments}
          tenants={tenants}
          initialApartmentId={uploadTargetApartmentId}
          onClose={() => setShowUploadModal(false)}
          onCreateBillWithShares={handleCreateBillWithShares}
        />
      )}

      {/* Open Banking PSD2 & Security Technical Guide Modal */}
      {showSecurityGuide && (
        <ArchitectureSecurityModal onClose={() => setShowSecurityGuide(false)} />
      )}

      {/* WhatsApp Dispatch Service Modal */}
      {showWhatsAppService && (
        <WhatsAppDispatchServiceModal
          bills={bills}
          shares={shares}
          apartments={apartments}
          tenants={tenants}
          bankAccounts={bankAccounts}
          initialShareId={whatsAppInitialShareId}
          onClose={() => {
            setShowWhatsAppService(false);
            setWhatsAppInitialShareId(undefined);
          }}
          onMarkDispatched={handleMarkDispatched}
        />
      )}

      {/* iPhone / Mobile Install & QR Code Modal */}
      {showPhoneInstallModal && (
        <PhoneInstallModal onClose={() => setShowPhoneInstallModal(false)} />
      )}

      {/* Google Cloud Firestore Database Access Modal */}
      <DatabaseAccessModal
        isOpen={showDatabaseModal}
        onClose={() => setShowDatabaseModal(false)}
        currentUser={currentUser}
        counts={{
          apartments: apartments.length,
          tenants: tenants.length,
          bills: bills.length,
          bankAccounts: bankAccounts.length,
          expenses: landlordExpenses.length,
          transactions: transactions.length,
        }}
        onForceSync={handleForceSync}
      />
    </div>
  );
}
