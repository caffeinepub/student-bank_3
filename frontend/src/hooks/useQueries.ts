import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Student, Account, Transaction, BankDetail, UserProfile } from '../backend';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Students ────────────────────────────────────────────────────────────────

export function useGetAllStudents() {
  const { actor, isFetching } = useActor();

  return useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllStudents();
      } catch (e: any) {
        throw new Error(e?.message ?? 'Failed to fetch students');
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      dateOfBirth: string;
      className: string;
      attendanceNumber: bigint;
      schoolName: string;
      taluka: string;
      district: string;
    }) => {
      if (!actor) throw new Error('Actor not available. Please log in again.');
      try {
        const id = await actor.addStudent(
          data.name,
          data.dateOfBirth,
          data.className,
          data.attendanceNumber,
          data.schoolName,
          data.taluka,
          data.district
        );
        return id;
      } catch (e: any) {
        const msg = e?.message ?? String(e);
        if (msg.includes('Unauthorized')) throw new Error('Unauthorized: Only admins can add students.');
        throw new Error(msg || 'Failed to add student');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useUpdateStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      dateOfBirth: string;
      className: string;
      attendanceNumber: bigint;
      schoolName: string;
      taluka: string;
      district: string;
    }) => {
      if (!actor) throw new Error('Actor not available. Please log in again.');
      try {
        await actor.updateStudent(
          data.id,
          data.name,
          data.dateOfBirth,
          data.className,
          data.attendanceNumber,
          data.schoolName,
          data.taluka,
          data.district
        );
      } catch (e: any) {
        const msg = e?.message ?? String(e);
        if (msg.includes('Unauthorized')) throw new Error('Unauthorized: Only admins can update students.');
        throw new Error(msg || 'Failed to update student');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useDeleteStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available. Please log in again.');
      try {
        await actor.deleteStudent(id);
      } catch (e: any) {
        const msg = e?.message ?? String(e);
        if (msg.includes('Unauthorized')) throw new Error('Unauthorized: Only admins can delete students.');
        throw new Error(msg || 'Failed to delete student');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

// ─── Accounts ────────────────────────────────────────────────────────────────

export function useGetAllAccounts() {
  const { actor, isFetching } = useActor();

  return useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllAccounts();
      } catch (e: any) {
        throw new Error(e?.message ?? 'Failed to fetch accounts');
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAccountByNumber(accountNumber: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Account | null>({
    queryKey: ['account', accountNumber],
    queryFn: async () => {
      if (!actor || !accountNumber) return null;
      try {
        return await actor.getAccountByNumber(accountNumber);
      } catch (e: any) {
        throw new Error(e?.message ?? 'Failed to fetch account');
      }
    },
    enabled: !!actor && !isFetching && !!accountNumber,
  });
}

export function useAddAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      studentId: bigint;
      bankName: string;
      accountNumber: string;
      initialAmount: bigint;
      ifscCode: string;
    }) => {
      if (!actor) throw new Error('Actor not available. Please log in again.');
      try {
        await actor.addAccount(
          data.studentId,
          data.bankName,
          data.accountNumber,
          data.initialAmount,
          data.ifscCode
        );
      } catch (e: any) {
        const msg = e?.message ?? String(e);
        if (msg.includes('Unauthorized')) throw new Error('Unauthorized: Only admins can add accounts.');
        throw new Error(msg || 'Failed to add account');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useUpdateAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      studentId: bigint;
      bankName: string;
      accountNumber: string;
      initialAmount: bigint;
      ifscCode: string;
    }) => {
      if (!actor) throw new Error('Actor not available. Please log in again.');
      try {
        await actor.updateAccount(
          data.studentId,
          data.bankName,
          data.accountNumber,
          data.initialAmount,
          data.ifscCode
        );
      } catch (e: any) {
        const msg = e?.message ?? String(e);
        if (msg.includes('Unauthorized')) throw new Error('Unauthorized: Only admins can update accounts.');
        throw new Error(msg || 'Failed to update account');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useDeleteAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountNumber: string) => {
      if (!actor) throw new Error('Actor not available. Please log in again.');
      try {
        await actor.deleteAccount(accountNumber);
      } catch (e: any) {
        const msg = e?.message ?? String(e);
        if (msg.includes('Unauthorized')) throw new Error('Unauthorized: Only admins can delete accounts.');
        throw new Error(msg || 'Failed to delete account');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export function useGetAllTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllTransactions();
      } catch (e: any) {
        throw new Error(e?.message ?? 'Failed to fetch transactions');
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTransactionsByAccount(accountNumber: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['transactions', accountNumber],
    queryFn: async () => {
      if (!actor || !accountNumber) return [];
      try {
        return await actor.getTransactionsByAccount(accountNumber);
      } catch (e: any) {
        throw new Error(e?.message ?? 'Failed to fetch transactions');
      }
    },
    enabled: !!actor && !isFetching && !!accountNumber,
  });
}

export function useGetTransactionsByDateRange(startDate: bigint, endDate: bigint, enabled: boolean) {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['transactions', 'dateRange', startDate.toString(), endDate.toString()],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getTransactionsByDateRange(startDate, endDate);
      } catch (e: any) {
        throw new Error(e?.message ?? 'Failed to fetch transactions');
      }
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useAddTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      accountNumber: string;
      transactionType: string;
      amount: bigint;
      reason: string;
    }) => {
      if (!actor) throw new Error('Actor not available. Please log in again.');
      try {
        await actor.addTransaction(
          data.accountNumber,
          data.transactionType,
          data.amount,
          data.reason
        );
      } catch (e: any) {
        const msg = e?.message ?? String(e);
        if (msg.includes('Unauthorized')) throw new Error('Unauthorized: Only admins can add transactions.');
        throw new Error(msg || 'Failed to add transaction');
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.accountNumber] });
    },
  });
}

// ─── Bank Details ─────────────────────────────────────────────────────────────

export function useGetAllBankDetails() {
  const { actor, isFetching } = useActor();

  return useQuery<BankDetail[]>({
    queryKey: ['bankDetails'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllBankDetails();
      } catch (e: any) {
        throw new Error(e?.message ?? 'Failed to fetch bank details');
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddBankDetail() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      bankName: string;
      taluka: string;
      district: string;
      ifscCode: string;
    }) => {
      if (!actor) throw new Error('Actor not available. Please log in again.');
      try {
        await actor.addBankDetail(
          data.bankName,
          data.taluka,
          data.district,
          data.ifscCode
        );
      } catch (e: any) {
        const msg = e?.message ?? String(e);
        if (msg.includes('Unauthorized')) throw new Error('Unauthorized: Only admins can add bank details.');
        throw new Error(msg || 'Failed to add bank detail');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankDetails'] });
    },
  });
}

export function useUpdateBankDetail() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      bankName: string;
      taluka: string;
      district: string;
      ifscCode: string;
    }) => {
      if (!actor) throw new Error('Actor not available. Please log in again.');
      try {
        await actor.updateBankDetail(
          data.bankName,
          data.taluka,
          data.district,
          data.ifscCode
        );
      } catch (e: any) {
        const msg = e?.message ?? String(e);
        if (msg.includes('Unauthorized')) throw new Error('Unauthorized: Only admins can update bank details.');
        throw new Error(msg || 'Failed to update bank detail');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankDetails'] });
    },
  });
}

export function useDeleteBankDetail() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ifscCode: string) => {
      if (!actor) throw new Error('Actor not available. Please log in again.');
      try {
        await actor.deleteBankDetail(ifscCode);
      } catch (e: any) {
        const msg = e?.message ?? String(e);
        if (msg.includes('Unauthorized')) throw new Error('Unauthorized: Only admins can delete bank details.');
        throw new Error(msg || 'Failed to delete bank detail');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankDetails'] });
    },
  });
}

// ─── Admin / Role ─────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}
