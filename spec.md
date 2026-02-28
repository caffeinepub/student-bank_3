# Student Bank

## Current State
- PassbookPage shows passbook with student/account info and transaction table, but print layout is incomplete — transactions are truncated/missing on print, "Reason" column is hidden on small screens but also hidden on print.
- HistoryPage has print and download CSV, but print layout is missing full student/bank/account details in the printed output; all transactions may not appear.
- Footer on all pages shows "Built with ❤️ using caffeine.ai · © Student Bank".
- No PDF download option in PassbookPage.
- `hidden sm:table-cell` causes Reason column to be invisible on print.

## Requested Changes (Diff)

### Add
- PDF/print download button in PassbookPage (using window.print with proper @media print styles).
- Comprehensive `@media print` CSS: ensure all table columns including Reason are visible in print, force table to show all rows, hide browser UI artifacts.
- A complete print-header in PassbookPage showing: bank name, school name, student full details, account details, then full transaction table with all rows and all columns.
- A complete print-header in HistoryPage showing: Student Bank header, student details, account/bank details, date range, then full transaction table with all columns.
- "vaibhavgavali" credit text in footers of all pages.

### Modify
- PassbookPage footer: replace "Built with ❤️ using caffeine.ai" with "vaibhavgavali".
- HistoryPage footer: replace "Built with ❤️ using caffeine.ai" with "vaibhavgavali".
- All other page footers (HomePage, StudentPage, AccountPage, TransactionPage, BankDetailsPage): same footer replacement.
- PassbookPage transaction table: remove `hidden sm:table-cell` from Reason column so it appears on print.
- HistoryPage transaction table: remove `hidden sm:table-cell` from Reason column so it appears on print.
- Print CSS: ensure `.print-only` blocks are `display: block` and `.no-print` hidden during print, table cells visible.

### Remove
- "❤️ using caffeine" text from all page footers.

## Implementation Plan
1. Update PassbookPage.tsx:
   - Fix print area: add full print header (Student Bank title, student info, account & bank info all in print-visible divs).
   - Remove `hidden sm:table-cell` from Reason column in transaction table.
   - Add Download PDF button (triggers window.print).
   - Update footer text to "vaibhavgavali".

2. Update HistoryPage.tsx:
   - Enhance print header to include full student, account, bank details.
   - Remove `hidden sm:table-cell` from Reason column.
   - Update footer text to "vaibhavgavali".

3. Update all other pages (HomePage, StudentPage, AccountPage, TransactionPage, BankDetailsPage):
   - Replace footer text with "vaibhavgavali".

4. Update index.css print styles:
   - Ensure `table-cell` visibility for print (override `hidden sm:table-cell`).
   - Ensure all transaction rows show on print (no truncation).
