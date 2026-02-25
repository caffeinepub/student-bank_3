# Specification

## Summary
**Goal:** Add Date, Previous Balance, and Total Amount fields to the Transaction page form, and update the backend to store and return these fields.

**Planned changes:**
- Add a Date field (date input, defaulting to today's date) to the Transaction form
- Add a read-only Previous Balance field that auto-fills with the selected account's current balance
- Add a read-only Total Amount field computed as Previous Balance + Amount (deposit) or Previous Balance − Amount (withdrawal), updating in real-time
- Include Date and Total Amount values when saving a transaction to the backend
- Update the Motoko Transaction record type to include `date`, `previousBalance`, and `totalAmount` fields
- Update `addTransaction` to accept and store these three new fields
- Update `getAllTransactions`, `getTransactionsByAccount`, and `getTransactionsByDateRange` to return the new fields
- Handle migration gracefully for existing stored transactions missing the new fields

**User-visible outcome:** Admins on the Transaction page will see Date, Previous Balance, and Total Amount fields in the form. The previous balance auto-populates on account selection, and the total amount updates automatically based on the entered amount and transaction type.
