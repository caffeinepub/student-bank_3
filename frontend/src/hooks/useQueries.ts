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
      if (!actor) throw new Error('Actor not ready — please try again');
      return actor.saveCallerUserProfile(profile);
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
      return actor.getAllStudents();
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
      attendanceNumber: number;
      schoolName: string;
      taluka: string;
      district: string;
    }) => {
      if (!actor) throw new Error('Actor not ready — please try again');
      return actor.addStudent(
        data.name,
        data.dateOfBirth,
        data.className,
        BigInt(data.attendanceNumber),
        data.schoolName,
        data.taluka,
        data.district
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error: Error) => {
      console.error('addStudent error:', error.message);
    },
  });
}

export function useUpdateStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: number;
      name: string;
      dateOfBirth: string;
      className: string;
      attendanceNumber: number;
      schoolName: string;
      taluka: string;
      district: string;
    }) => {
      if (!actor) throw new Error('Actor not ready — please try again');
      return actor.updateStudent(
        BigInt(data.id),
        data.name,
        data.dateOfBirth,
        data.className,
        BigInt(data.attendanceNumber),
        data.schoolName,
        data.taluka,
        data.district
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error: Error) => {
      console.error('updateStudent error:', error.message);
    },
  });
}

export function useDeleteStudent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!actor) throw new Error('Actor not ready — please try again');
      return actor.deleteStudent(BigInt(id));
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
      return actor.getAllAccounts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      studentId: number;
      bankName: string;
      accountNumber: string;
      initialAmount: number;
      ifscCode: string;
    }) => {
      if (!actor) throw new Error('Actor not ready — please try again');
      return actor.addAccount(
        BigInt(data.studentId),
        data.bankName,
        data.accountNumber,
        BigInt(data.initialAmount),
        data.ifscCode
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error: Error) => {
      console.error('addAccount error:', error.message);
    },
  });
}

export function useUpdateAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      studentId: number;
      bankName: string;
      accountNumber: string;
      initialAmount: number;
      ifscCode: string;
    }) => {
      if (!actor) throw new Error('Actor not ready — please try again');
      return actor.updateAccount(
        BigInt(data.studentId),
        data.bankName,
        data.accountNumber,
        BigInt(data.initialAmount),
        data.ifscCode
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
    onError: (error: Error) => {
      console.error('updateAccount error:', error.message);
    },
  });
}

export function useDeleteAccount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountNumber: string) => {
      if (!actor) throw new Error('Actor not ready — please try again');
      return actor.deleteAccount(accountNumber);
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
      return actor.getAllTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTransactionsByAccount(accountNumber: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['transactions', accountNumber],
    queryFn: async () => {
      if (!actor) return [];
      if (!accountNumber) return [];
      return actor.getTransactionsByAccount(accountNumber);
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
      return actor.getTransactionsByDateRange(startDate, endDate);
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
      amount: number;
      reason: string;
    }) => {
      if (!actor) throw new Error('Actor not ready — please try again');
      return actor.addTransaction(
        data.accountNumber,
        data.transactionType,
        BigInt(data.amount),
        data.reason
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.accountNumber] });
    },
    onError: (error: Error) => {
      console.error('addTransaction error:', error.message);
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
      return actor.getAllBankDetails();
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
      if (!actor) throw new Error('Actor not ready — please try again');
      return actor.addBankDetail(data.bankName, data.taluka, data.district, data.ifscCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankDetails'] });
    },
    onError: (error: Error) => {
      console.error('addBankDetail error:', error.message);
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
      if (!actor) throw new Error('Actor not ready — please try again');
      return actor.updateBankDetail(data.bankName, data.taluka, data.district, data.ifscCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankDetails'] });
    },
    onError: (error: Error) => {
      console.error('updateBankDetail error:', error.message);
    },
  });
}

export function useDeleteBankDetail() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ifscCode: string) => {
      if (!actor) throw new Error('Actor not ready — please try again');
      return actor.deleteBankDetail(ifscCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankDetails'] });
    },
  });
}
