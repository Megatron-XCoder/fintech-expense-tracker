const { parse } = require('csv-parse');
const fs = require('fs');
const crypto = require('crypto');
const xlsx = require('xlsx');

// ────────────────────────────────────────────
// HASH GENERATOR (for duplicate detection)
// ────────────────────────────────────────────
const generateHash = (date, description, amount, balance) => {
  return crypto.createHash('md5').update(`${date}-${description}-${amount}-${balance}`).digest('hex');
};

// ────────────────────────────────────────────
// CATEGORY DEFINITIONS (exact hex colors)
// ────────────────────────────────────────────
const CATEGORIES = {
  'Income':                 { color: '#10b981', keywords: [] },  // matched via type=Credit logic
  'Food & Dining':          { color: '#f87171', keywords: ['ZOMATO', 'ZOMATO L', 'SWIGGY', 'HOTEL TA', 'HOTEL TANDOOR', 'BLINKIT', 'SHAAN GR', 'SHRI SHY', 'MANOJ FR', 'RESTAURANT', 'CAFE', 'BAKERY', 'ANANDA A', 'BHANDARY', 'Mr SACHI', 'MADAN SA', 'SHREE MA', 'SHREE RA', 'B  NAGESHA', 'PAWAN KU', 'DWARIKA'] },
  'Bills & Utilities':      { color: '#fbbf24', keywords: ['AIRTEL', 'MYJIO', 'JIO', 'GOOGLE I', 'GOOGLE A', 'GOOGLE P', 'ONE97 CO', 'ELECTRICITY', 'RECHARGE', 'SBIPMOPA'] },
  'Entertainment':          { color: '#34d399', keywords: ['ZEE5', 'NETFLIX', 'PRIME', 'SPOTIFY', 'BOOKMYSHOW', 'PVR'] },
  'Shopping':               { color: '#60a5fa', keywords: ['AMAZON PAY', 'AMAZON P', 'MR DIY', 'FLIPKART', 'MYNTRA', 'MART'] },
  'Transportation':         { color: '#a78bfa', keywords: ['INDIAN R', 'IRCTCTOU', 'UBER', 'OLA', 'RAPIDO', 'METRO', 'FASTAG'] },
  'Transfer & Investments': { color: '#9ca3af', keywords: ['ZERODHA', 'ICCL ZER', 'ATM WDL', 'ATM CASH', 'CASH', 'GROWW', 'UPSTOX'] },
  'Personal Transfers':     { color: '#ec4899', keywords: [] },
  'Housing':                { color: '#fb923c', keywords: ['RENT', 'MAINTENANCE', 'SOCIETY', 'BROKER'] },
  'Other':                  { color: '#6b7280', keywords: ['RAZORPAY', 'INTELLIG', 'INSTITUT'] },
};

// Business suffixes to tell apart merchants from P2P personal names
const BUSINESS_SUFFIXES = ['PVT', 'LTD', 'HOTEL', 'GROCER', 'STORE', 'MART', 'SHOP', 'KITCHEN', 'RESTAURANT', 'CAFE', 'INC', 'CORP', 'LLC'];

// ────────────────────────────────────────────
// STEP 1: Fix broken newlines in text
// ────────────────────────────────────────────
const cleanNewlines = (text) => {
  if (!text) return '';
  // Remove literal \n followed by optional spaces (the SBI word-break bug)
  return text.replace(/\n\s*/g, '').replace(/\r/g, '').trim();
};

// ────────────────────────────────────────────
// STEP 2: Extract merchant name from Details
// ────────────────────────────────────────────
const extractMerchant = (details) => {
  if (!details) return 'UNKNOWN';
  const d = details.trim();

  // Rule A: UPI Transactions
  if (d.includes('UPI/DR/') || d.includes('UPI/CR/')) {
    const upiMatch = d.match(/UPI\/(DR|CR)\/[^\/]+\/([^\/]+)/);
    if (upiMatch) return upiMatch[2].trim();
  }

  // Rule B: NEFT
  if (d.includes('NEFT*') || d.includes('NEFT/')) {
    const parts = d.split(/[*\/]/);
    // Find the last meaningful text (non-numeric, non-empty)
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i].trim();
      if (p && !/^\d+$/.test(p) && p.length > 2) return p;
    }
  }

  // Rule C: IMPS
  if (d.includes('IMPS/')) {
    const parts = d.split('/');
    // RNB-XX553-Floccare pattern
    for (const p of parts) {
      const cleaned = p.trim();
      if (cleaned.includes('RNB-') || cleaned.includes('Flocc')) {
        const name = cleaned.replace(/^RNB-\w+-/, '');
        return name || cleaned;
      }
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i].trim();
      if (p && !/^\d+$/.test(p) && p.length > 3) return p;
    }
  }

  // Rule D: POS
  if (d.includes('POS ATM PURCH') || d.includes('OTHPOS')) {
    const posMatch = d.match(/\d{10,}([A-Z\s]+)/);
    if (posMatch) return posMatch[1].trim();
  }

  // Rule E: ATM Withdrawal
  if (d.includes('ATM WDL') || d.includes('ATM CASH')) return 'CASH WITHDRAWAL';

  // Rule F: Salary
  if (d.includes('PFS Salary')) return 'SALARY';

  // Rule G: Interest
  if (d.includes('INTEREST CREDIT') || d.includes('INTERES') && d.includes('CREDIT')) return 'INTEREST';

  // Rule H: Reverse
  if (d.includes('REVERSE')) return 'REVERSAL';

  return 'UNKNOWN';
};

// ────────────────────────────────────────────
// STEP 3: Categorize based on merchant + type
// ────────────────────────────────────────────
const categorizeTransaction = (merchantName, details, type) => {
  const upper = (merchantName || '').toUpperCase();
  const detailsUpper = (details || '').toUpperCase();

  // Salary / Interest always Income
  if (upper === 'SALARY' || upper === 'INTEREST') return 'Income';

  // Credit transactions: check for refund/income patterns
  if (type === 'Credit') {
    // Refund keywords → keep original category if possible, else Income
    if (detailsUpper.includes('REFUN') || detailsUpper.includes('REFU')) {
      // Check if the merchant matches a spending category
      for (const [cat, { keywords }] of Object.entries(CATEGORIES)) {
        if (cat === 'Income' || cat === 'Other') continue;
        for (const kw of keywords) {
          if (upper.includes(kw.toUpperCase())) return cat;
        }
      }
    }
    // NEFT inflows from NSE CLEARING, INDIAN CLEARING = Income
    if (detailsUpper.includes('NSE CLEARING') || detailsUpper.includes('INDIAN CLEARING')) return 'Income';
    // IMPS inflows (salary from Floccare etc) = Income
    if (detailsUpper.includes('IMPS/')) return 'Income';
    // Default credit = Income
    return 'Income';
  }

  // Debit: match keywords
  // Check Transfer & Investments first (ATM, Zerodha etc)
  for (const kw of CATEGORIES['Transfer & Investments'].keywords) {
    if (upper.includes(kw.toUpperCase()) || detailsUpper.includes(kw.toUpperCase())) return 'Transfer & Investments';
  }

  // Check all other categories
  for (const [cat, { keywords }] of Object.entries(CATEGORIES)) {
    if (cat === 'Income' || cat === 'Other' || cat === 'Transfer & Investments') continue;
    for (const kw of keywords) {
      if (upper.includes(kw.toUpperCase())) return cat;
    }
  }

  // Smart P2P Detection: if merchant looks like a personal name (short, no business suffixes)
  const isPersonalName = upper.length < 15 && 
    !BUSINESS_SUFFIXES.some(s => upper.includes(s)) &&
    /^[A-Z\s]+$/.test(upper) &&
    upper !== 'UNKNOWN';

  if (isPersonalName && type === 'Debit') return 'Personal Transfers';

  // Check details-level keywords for categories we might have missed
  for (const [cat, { keywords }] of Object.entries(CATEGORIES)) {
    if (cat === 'Income' || cat === 'Other') continue;
    for (const kw of keywords) {
      if (detailsUpper.includes(kw.toUpperCase())) return cat;
    }
  }

  return 'Other';
};

// ────────────────────────────────────────────
// MAIN PARSER
// ────────────────────────────────────────────
const parseSBIStatement = async (filePath, originalName) => {
  return new Promise((resolve, reject) => {
    let transactions = [];
    
    if (originalName.endsWith('.xlsx') || originalName.endsWith('.xls')) {
      try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        transactions = processData(data);
        resolve(transactions);
      } catch (err) {
        reject(err);
      }
    } else {
      // CSV
      const results = [];
      fs.createReadStream(filePath)
        .pipe(parse({ relax_column_count: true, skip_empty_lines: false, relax_quotes: true }))
        .on('data', (data) => results.push(data))
        .on('end', () => {
          try {
            transactions = processData(results);
            resolve(transactions);
          } catch (err) {
            reject(err);
          }
        })
        .on('error', (err) => reject(err));
    }
  });
};

const processData = (data) => {
  const transactions = [];
  let isTransactionSection = false;
  let pendingTransaction = null;

  const dateRegex = /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const row0 = cleanNewlines(String(row[0] || '')).trim();
    const row1 = cleanNewlines(String(row[1] || '')).trim();

    // Find header row
    if (row0 === 'Date' && (row1 === 'Details' || row1.includes('Details'))) {
      isTransactionSection = true;
      continue;
    }

    if (!isTransactionSection) continue;

    // Check for end of data
    const allEmpty = row.every(cell => !cell || cleanNewlines(String(cell)).trim() === '');
    if (allEmpty) {
      if (pendingTransaction) {
        finalizeTx(pendingTransaction, transactions);
        pendingTransaction = null;
      }
      break;
    }

    // If row[0] has a valid date → new transaction
    if (row0 && dateRegex.test(row0)) {
      if (pendingTransaction) {
        finalizeTx(pendingTransaction, transactions);
      }

      // Parse amounts
      const debitStr = cleanNewlines(String(row[3] || '')).replace(/,/g, '').trim();
      const creditStr = cleanNewlines(String(row[4] || '')).replace(/,/g, '').trim();

      let amount = 0;
      let type = 'Debit';

      if (debitStr && parseFloat(debitStr) > 0) {
        amount = parseFloat(debitStr);
        type = 'Debit';
      } else if (creditStr && parseFloat(creditStr) > 0) {
        amount = parseFloat(creditStr);
        type = 'Credit';
      } else {
        pendingTransaction = null;
        continue;
      }

      // Balance - strip CR/DR suffixes
      const balanceStr = cleanNewlines(String(row[5] || '')).replace(/,/g, '').replace(/CR/gi, '').replace(/DR/gi, '').trim();
      const balance = parseFloat(balanceStr) || 0;

      // Date parsing
      const dateParts = row0.split(/[-\/]/);
      let dateFromRow = new Date();
      if (dateParts.length === 3) {
        const year = dateParts[2].length === 2 ? `20${dateParts[2]}` : dateParts[2];
        dateFromRow = new Date(`${year}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`);
      }

      // Clean description (CRITICAL: fix the \n word-break bug)
      const rawDesc = cleanNewlines(String(row[1] || ''));
      const description = rawDesc.replace(/\s+/g, ' ').trim();

      pendingTransaction = {
        date: dateFromRow,
        description,
        refNo: cleanNewlines(String(row[2] || '')).trim(),
        amount,
        type,
        balance,
      };
    } else if (pendingTransaction && (!row0 || row0 === '') && row1) {
      // Continuation line — append to description & clean
      const continuation = row1.replace(/\s+/g, ' ').trim();
      pendingTransaction.description += ' ' + continuation;
      pendingTransaction.description = cleanNewlines(pendingTransaction.description).replace(/\s+/g, ' ').trim();
    } else {
      // Footer/summary row → stop
      if (pendingTransaction) {
        finalizeTx(pendingTransaction, transactions);
        pendingTransaction = null;
      }
      break;
    }
  }

  if (pendingTransaction) {
    finalizeTx(pendingTransaction, transactions);
  }

  if (transactions.length === 0) {
    throw new Error('MALFORMED_CSV: Could not locate valid transaction headers or rows. Ensure this is a valid SBI statement format.');
  }

  return transactions;
};

const finalizeTx = (tx, list) => {
  // Extract merchant
  tx.merchantName = extractMerchant(tx.description);
  
  // Auto categorize
  tx.categoryName = categorizeTransaction(tx.merchantName, tx.description, tx.type);
  
  // Generate hash including balance for uniqueness
  tx.hash = generateHash(tx.date.toISOString(), tx.description, tx.amount, tx.balance);
  
  list.push(tx);
};

module.exports = { parseSBIStatement, CATEGORIES };
