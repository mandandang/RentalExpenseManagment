import { BillCategory } from '../types';

export interface ParsedInvoiceResult {
  success: boolean;
  rawTextExtracted: string;
  fileName: string;
  detectedTitle: string;
  detectedCategory: BillCategory;
  detectedTotalAmount: number | null;
  detectedPeriodStart: string | null;
  detectedPeriodEnd: string | null;
  detectedDueDate: string | null;
  confidenceScore: number; // 0 - 100
  extractionDetails: {
    amountSource?: string;
    periodSource?: string;
    categorySource?: string;
  };
  warnings: string[];
}

/**
 * Normalizes European currency strings like "1.240,50", "360,00", "49.99" into standard floats
 */
export function parseEuropeanNumber(str: string): number | null {
  if (!str) return null;
  let clean = str.replace(/[^0-9.,]/g, '').trim();
  if (!clean) return null;

  // Handle German/Dutch format: 1.250,50 -> 1250.50
  if (clean.includes('.') && clean.includes(',')) {
    if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else {
      clean = clean.replace(/,/g, '');
    }
  } else if (clean.includes(',')) {
    // Single comma e.g. "360,50" -> 360.50
    clean = clean.replace(',', '.');
  }

  const val = parseFloat(clean);
  return isNaN(val) ? null : Math.round(val * 100) / 100;
}

/**
 * Normalizes European dates (DD.MM.YYYY or DD/MM/YYYY) to YYYY-MM-DD
 */
export function normalizeDateToISO(dateStr: string): string | null {
  if (!dateStr) return null;

  // Format: DD.MM.YYYY or DD/MM/YYYY
  const dmyMatch = dateStr.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Format: YYYY-MM-DD
  const ymdMatch = dateStr.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return null;
}

/**
 * Extracts printable ASCII/Unicode text strings from a PDF buffer
 */
export async function extractTextFromPdf(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);
  let rawContent = '';

  // 1. Convert to string
  const decoder = new TextDecoder('latin1');
  const pdfString = decoder.decode(bytes);

  // 2. Extract text operators in PDF: (...) Tj or [...] TJ
  const textMatches: string[] = [];

  // Match Tj: (Text) Tj
  const tjRegex = /\(([^)]+)\)\s*Tj/g;
  let match: RegExpExecArray | null;
  while ((match = tjRegex.exec(pdfString)) !== null) {
    if (match[1]) textMatches.push(match[1]);
  }

  // Match TJ: [(T) 20 (ext)] TJ
  const tjArrayRegex = /\[([^\]]+)\]\s*TJ/g;
  while ((match = tjArrayRegex.exec(pdfString)) !== null) {
    const inner = match[1];
    const subMatches = inner.match(/\(([^)]+)\)/g);
    if (subMatches) {
      const combined = subMatches.map((s) => s.slice(1, -1)).join('');
      textMatches.push(combined);
    }
  }

  // 3. Fallback: Search for printable chunks if no BT/ET text operators matched
  if (textMatches.length < 5) {
    const readableChunks = pdfString.match(/[A-Za-z0-9€.,/: -]{4,}/g) || [];
    rawContent = readableChunks.slice(0, 1500).join(' ');
  } else {
    rawContent = textMatches.join(' ');
  }

  return rawContent;
}

/**
 * Main parser that ingests any uploaded file (PDF, TXT, JSON, CSV) and extracts
 * invoice totals, billing period dates, provider names, and category.
 */
export async function parseInvoiceFile(file: File): Promise<ParsedInvoiceResult> {
  const warnings: string[] = [];
  let extractedText = '';

  try {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const buffer = await file.arrayBuffer();
      extractedText = await extractTextFromPdf(buffer);
    } else {
      // Plain text or json
      extractedText = await file.text();
    }
  } catch (err) {
    warnings.push(`File text layer could not be fully decoded: ${(err as Error).message}`);
  }

  // Combine extracted text with the filename for context
  const fullContext = `${file.name} ${extractedText}`;

  // 1. Detect Utility Category & Title
  let detectedCategory: BillCategory = 'other';
  let detectedTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_.-]/g, ' ');

  const lower = fullContext.toLowerCase();

  if (lower.includes('strom') || lower.includes('elec') || lower.includes('energie') || lower.includes('kwh')) {
    detectedCategory = 'electricity';
    if (lower.includes('stadtwerke')) detectedTitle = 'Stadtwerke Electricity';
    else if (lower.includes('vattenfall')) detectedTitle = 'Vattenfall Strom';
    else if (lower.includes('e.on')) detectedTitle = 'E.ON Energie';
    else detectedTitle = 'Electricity Utility Invoice';
  } else if (lower.includes('wasser') || lower.includes('water') || lower.includes('abwasser') || lower.includes('waternet')) {
    detectedCategory = 'water';
    if (lower.includes('waternet')) detectedTitle = 'Waternet Drinking Water';
    else detectedTitle = 'Water & Sewage Utility';
  } else if (lower.includes('gas') || lower.includes('erdgas')) {
    detectedCategory = 'gas';
    detectedTitle = 'Natural Gas Bill';
  } else if (lower.includes('internet') || lower.includes('fiber') || lower.includes('glasfaser') || lower.includes('dsl') || lower.includes('vodafone') || lower.includes('telekom')) {
    detectedCategory = 'internet';
    if (lower.includes('vodafone')) detectedTitle = 'Vodafone Gigabit Fiber';
    else if (lower.includes('telekom')) detectedTitle = 'Telekom High-Speed Internet';
    else detectedTitle = 'Broadband Internet Bill';
  } else if (lower.includes('heizung') || lower.includes('fernwärme') || lower.includes('heating') || lower.includes('wärme')) {
    detectedCategory = 'heating';
    detectedTitle = 'District Heating & Utilities';
  }

  // 2. Detect Invoice Total Amount
  let detectedTotalAmount: number | null = null;
  let amountSource = '';

  // A. Priority Regex: Labeled Totals (German, Dutch, English, French)
  const labeledRegexes = [
    // German / Dutch / English labeled totals: e.g. "Gesamtbetrag: 360,00 €" or "Total: €49.99"
    /(?:gesamtbetrag|endbetrag|rechnungsbetrag|zu\s+zahlen|fälliger\s+betrag|total\s+amount|amount\s+due|total|totaal|te\s+betalen|montant\s+total)[^0-9€\n]{0,25}[:=]?\s*(?:€|eur)?\s*([0-9]{1,4}(?:[.,][0-9]{2,3})*(?:[.,][0-9]{2}))/i,
    // Symbol first: € 360,00 or EUR 360.00
    /(?:€|eur)\s*([0-9]{1,4}(?:[.,][0-9]{2,3})*(?:[.,][0-9]{2}))/i,
    // Amount first: 360,00 € or 360.00 EUR
    /([0-9]{1,4}(?:[.,][0-9]{2,3})*(?:[.,][0-9]{2}))\s*(?:€|eur)/i,
    // Number in filename: e.g. "Bill_240_Euro.pdf" or "Stadtwerke_Munich_Strom_360.pdf"
    /(?:[_\-\s])([0-9]{2,4}(?:[.,][0-9]{2})?)(?:[_\-\s]|eur|euro|\.pdf)/i,
  ];

  for (const regex of labeledRegexes) {
    const m = fullContext.match(regex);
    if (m && m[1]) {
      const parsed = parseEuropeanNumber(m[1]);
      if (parsed !== null && parsed > 5 && parsed < 50000) {
        detectedTotalAmount = parsed;
        amountSource = `Matched from "${m[0].trim()}"`;
        break;
      }
    }
  }

  // Fallback: search all float numbers in text and pick the most probable invoice total
  if (detectedTotalAmount === null) {
    const allNumbersRegex = /\b([0-9]{2,4}[.,][0-9]{2})\b/g;
    const candidates: number[] = [];
    let numMatch: RegExpExecArray | null;
    while ((numMatch = allNumbersRegex.exec(fullContext)) !== null) {
      const val = parseEuropeanNumber(numMatch[1]);
      if (val !== null && val >= 15 && val <= 5000) {
        candidates.push(val);
      }
    }
    if (candidates.length > 0) {
      // Pick the max candidate (utility totals are usually the highest sum on an itemized bill)
      detectedTotalAmount = Math.max(...candidates);
      amountSource = `Detected highest currency figure (€${detectedTotalAmount.toFixed(2)})`;
    }
  }

  // 3. Detect Billing Period Dates
  let detectedPeriodStart: string | null = null;
  let detectedPeriodEnd: string | null = null;
  let periodSource = '';

  // Look for date intervals: "01.01.2026 - 15.04.2026" or "15.01.2026 bis 15.04.2026"
  const dateIntervalRegex = /(\d{1,2}[./-]\d{1,2}[./-]\d{4})\s*(?:bis|to|-|–|—)\s*(\d{1,2}[./-]\d{1,2}[./-]\d{4})/i;
  const intervalMatch = fullContext.match(dateIntervalRegex);

  if (intervalMatch && intervalMatch[1] && intervalMatch[2]) {
    const startIso = normalizeDateToISO(intervalMatch[1]);
    const endIso = normalizeDateToISO(intervalMatch[2]);
    if (startIso && endIso) {
      detectedPeriodStart = startIso;
      detectedPeriodEnd = endIso;
      periodSource = `Detected interval ${intervalMatch[1]} to ${intervalMatch[2]}`;
    }
  }

  // Fallback: Quarter patterns like "Q1 2026" or "Q2 2026"
  if (!detectedPeriodStart) {
    const qMatch = fullContext.match(/q([1-4])\s*(?:20)?(2[4-7])/i);
    if (qMatch) {
      const q = parseInt(qMatch[1], 10);
      const yr = `20${qMatch[2]}`;
      if (q === 1) {
        detectedPeriodStart = `${yr}-01-01`;
        detectedPeriodEnd = `${yr}-03-31`;
      } else if (q === 2) {
        detectedPeriodStart = `${yr}-04-01`;
        detectedPeriodEnd = `${yr}-06-30`;
      } else if (q === 3) {
        detectedPeriodStart = `${yr}-07-01`;
        detectedPeriodEnd = `${yr}-09-30`;
      } else if (q === 4) {
        detectedPeriodStart = `${yr}-10-01`;
        detectedPeriodEnd = `${yr}-12-31`;
      }
      periodSource = `Derived from Q${q} ${yr} mention`;
    }
  }

  // Fallback: Month mentions (e.g. "April 2026" or "März 2026")
  if (!detectedPeriodStart) {
    const monthRegex = /(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember|january|february|march|may|june|july|october|december)\s*(?:20)?(2[4-7])/i;
    const mMatch = fullContext.match(monthRegex);
    if (mMatch) {
      const mName = mMatch[1].toLowerCase();
      const yr = `20${mMatch[2]}`;
      const monthsMap: Record<string, { start: string; end: string }> = {
        januar: { start: '01-01', end: '01-31' },
        january: { start: '01-01', end: '01-31' },
        februar: { start: '02-01', end: '02-28' },
        february: { start: '02-01', end: '02-28' },
        märz: { start: '03-01', end: '03-31' },
        march: { start: '03-01', end: '03-31' },
        april: { start: '04-01', end: '04-30' },
        mai: { start: '05-01', end: '05-31' },
        may: { start: '05-01', end: '05-31' },
        juni: { start: '06-01', end: '06-30' },
        june: { start: '06-01', end: '06-30' },
        juli: { start: '07-01', end: '07-31' },
        july: { start: '07-01', end: '07-31' },
        august: { start: '08-01', end: '08-31' },
        september: { start: '09-01', end: '09-30' },
        oktober: { start: '10-01', end: '10-31' },
        october: { start: '10-01', end: '10-31' },
        november: { start: '11-01', end: '11-30' },
        dezember: { start: '12-01', end: '12-31' },
        december: { start: '12-01', end: '12-31' },
      };
      const found = monthsMap[mName];
      if (found) {
        detectedPeriodStart = `${yr}-${found.start}`;
        detectedPeriodEnd = `${yr}-${found.end}`;
        periodSource = `Derived from ${mName} ${yr} mention`;
      }
    }
  }

  // 4. Detect Due Date
  let detectedDueDate: string | null = null;
  const dueRegex = /(?:fällig\s+am|zahlbar\s+bis|due\s+date|payment\s+due|vervaldatum|échéance)[^0-9\n]{0,20}(\d{1,2}[./-]\d{1,2}[./-]\d{4})/i;
  const dueMatch = fullContext.match(dueRegex);
  if (dueMatch && dueMatch[1]) {
    detectedDueDate = normalizeDateToISO(dueMatch[1]);
  } else if (detectedPeriodEnd) {
    // Default due date: 15-20 days after period end
    const pEndDate = new Date(detectedPeriodEnd);
    pEndDate.setDate(pEndDate.getDate() + 20);
    detectedDueDate = pEndDate.toISOString().split('T')[0];
  }

  // Confidence Score Calculation
  let confidence = 30;
  if (detectedTotalAmount !== null) confidence += 40;
  if (detectedPeriodStart && detectedPeriodEnd) confidence += 20;
  if (detectedCategory !== 'other') confidence += 10;

  if (detectedTotalAmount === null) {
    warnings.push('No currency amount detected automatically. Please verify or input the invoice total manually.');
  }

  return {
    success: true,
    rawTextExtracted: extractedText.slice(0, 1000),
    fileName: file.name,
    detectedTitle,
    detectedCategory,
    detectedTotalAmount,
    detectedPeriodStart,
    detectedPeriodEnd,
    detectedDueDate,
    confidenceScore: Math.min(100, confidence),
    extractionDetails: {
      amountSource,
      periodSource,
      categorySource: detectedCategory,
    },
    warnings,
  };
}
