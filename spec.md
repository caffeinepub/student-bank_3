# Specification

## Summary
**Goal:** Fix data persistence for the admin role so that all create, update, and delete operations correctly save to the canister and survive page refreshes and canister upgrades.

**Planned changes:**
- Fix the backend Motoko actor (`main.mo`) to declare all storage variables with the `stable` keyword, ensuring student, account, transaction, and bank detail records persist across canister upgrades and are never silently dropped.
- Fix frontend mutation hooks (`useQueries.ts`) to use the authenticated actor (from `useActor`) instead of an anonymous actor for all write operations, correctly call the matching backend update methods, handle returned error variants, and invalidate the React Query cache on success.
- Ensure the `useActor` hook returns an authenticated actor when an admin session is active in localStorage, an anonymous actor when logged out, and refreshes the actor identity on session changes.

**User-visible outcome:** After logging in as admin, all add/edit/delete actions for students, accounts, transactions, and bank details are saved immediately and remain visible after a page refresh, with visible error messages shown if any operation fails.
