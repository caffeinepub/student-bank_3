# Student Bank

## Current State
- Full Student Bank app with login, dashboard, student, account, transaction, history, passbook, bank details pages
- Transaction page supports add and delete
- Colors/theme are defined in src/frontend/src/index.css with OKLCH palette (teal, orange, green)
- Logo exists at /assets/generated/bank-logo.dim_256x256.png
- The root-level frontend/index.css has overwritten the color theme with a plain gray palette, causing colors to disappear
- No `updateTransaction` backend function exists

## Requested Changes (Diff)

### Add
- `updateTransaction` backend function to allow editing transaction date, type, amount, reason
- Transaction edit button in the table (admin only) with pre-filled edit form
- Edit/Update mutation hook in useQueries.ts

### Modify
- Fix the root-level `src/frontend/index.css` — restore the proper OKLCH vibrant color theme (it currently has a plain gray palette that overrides the correct one)
- TransactionPage.tsx — add Edit button alongside Delete, add edit mode to the form, show "Update" button when editing

### Remove
- Nothing

## Implementation Plan
1. Regenerate backend with updateTransaction function added
2. Add useUpdateTransaction hook in useQueries.ts
3. Update TransactionPage.tsx to support edit mode: edit button in table, pre-fill form, submit updates existing transaction
4. Fix root-level index.css to match the vibrant OKLCH theme from src/frontend/src/index.css
5. Verify logo path is correct and referenced consistently

## UX Notes
- Edit button: pencil icon (Pencil from lucide-react), next to delete button in transaction table (admin only)
- When edit clicked: form scrolls to top and shows pre-filled data, submit button changes to "व्यवहार अपडेट करा", cancel button appears
- Colors: restore teal-green sidebar, colorful gradient cards, vibrant primary theme
