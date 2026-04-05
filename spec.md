# Student Bank

## Current State

- Version 23 is live with all student bank features: Students, Accounts, Transactions, History, Passbook, Bank Details pages
- Admin login (admin/admin) and Student login (account number as both username and password)
- Colorful gradient UI with Poppins/Nunito fonts, vaibhavgavali branding
- CSV export exists only for passbook/history pages via exportCSV.ts utility
- No bulk CSV import/export for Students, Accounts, Transactions, Bank Details
- Data loss occurs when canister is replaced; user needs backup/restore capability

## Requested Changes (Diff)

### Add
- **Export CSV** button on Students, Accounts, Transactions (all), and Bank Details pages — downloads all data as CSV
- **Import CSV** button on Students, Accounts, and Bank Details pages — parses CSV file and bulk-adds records that don't already exist
- A new **ImportExportPage** accessible from sidebar (Admin only) for full backup/restore of ALL data at once
- CSV format documentation shown in import dialog so user knows what columns to use
- Success/error feedback after import (how many records imported, how many skipped)

### Modify
- StudentPage: add Export CSV + Import CSV buttons in header area
- AccountPage: add Export CSV button only (accounts depend on student IDs, so import is complex — skip import for accounts)
- BankDetailsPage: add Export CSV + Import CSV buttons
- Sidebar: add "Import/Export" nav link (admin only)
- App.tsx: add 'import-export' to PageId union and renderPage switch

### Remove
- Nothing removed

## Implementation Plan

1. Create `src/frontend/src/utils/importExport.ts` — utility functions for:
   - exportStudentsCSV(students): downloads students.csv
   - exportAccountsCSV(accounts, students): downloads accounts.csv  
   - exportBankDetailsCSV(bankDetails): downloads bank_details.csv
   - exportTransactionsCSV(transactions): downloads transactions.csv (all transactions)
   - exportAllDataCSV(students, accounts, transactions, bankDetails): downloads full_backup.csv with separate sections
   - parseStudentsCSV(text): returns array of student objects
   - parseBankDetailsCSV(text): returns array of bank detail objects

2. Create `src/frontend/src/pages/ImportExportPage.tsx` — admin-only page with:
   - Export All button (downloads full backup as JSON-friendly CSV)
   - Individual export buttons for each data type
   - Individual import buttons for students and bank details
   - Import dialog showing required CSV format/columns
   - Import result feedback (x records added, y skipped)

3. Modify `StudentPage.tsx` — add Export and Import buttons in page header
4. Modify `AccountPage.tsx` — add Export button in page header
5. Modify `BankDetailsPage.tsx` — add Export and Import buttons in page header
6. Modify `Sidebar.tsx` — add Import/Export nav item (admin only)
7. Modify `App.tsx` — add 'import-export' page routing

### CSV Format for Students Import:
```
name,dateOfBirth,className,attendanceNumber,schoolName,taluka,district
राहुल शर्मा,2010-05-15,5th,12,जिल्हा परिषद शाळा,कोल्हापूर,कोल्हापूर
```

### CSV Format for Bank Details Import:
```
bankName,taluka,district,ifscCode
स्टेट बँक ऑफ इंडिया,कोल्हापूर,कोल्हापूर,SBIN0001234
```
