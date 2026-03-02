import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type {
  Account,
  BankDetail,
  Student,
  Transaction,
  UserProfile,
} from "../backend";
import { createActorWithConfig } from "../config";
import {
  getGlobalActor,
  setGlobalActor,
  waitForGlobalActor,
} from "../utils/actorStore";
import { getSecretParameter } from "../utils/urlParams";
import { useActor } from "./useActor";

// Keep global actor store in sync with hook actor
export function useSyncGlobalActor() {
  const { actor } = useActor();
  useEffect(() => {
    setGlobalActor(actor);
  }, [actor]);
}

// Initialize actor with admin token for write operations
async function initActorForAdmin(actor: {
  _initializeAccessControlWithSecret: (token: string) => Promise<void>;
}) {
  const adminToken = getSecretParameter("caffeineAdminToken") || "";
  if (adminToken) {
    try {
      await actor._initializeAccessControlWithSecret(adminToken);
    } catch {
      // Silently ignore — may already be initialized
    }
  }
}

// Get a ready actor — waits if not yet initialized, with fallback
async function getReadyActor() {
  // Try synchronous first
  let actor = getGlobalActor();
  if (actor) {
    await initActorForAdmin(actor);
    return actor;
  }
  // Otherwise wait up to 10 seconds (20 attempts x 500ms)
  try {
    actor = await waitForGlobalActor(20, 500);
  } catch {
    // Fallback: create anonymous actor directly if the global actor never initializes
    actor = await createActorWithConfig();
    setGlobalActor(actor);
  }
  await initActorForAdmin(actor);
  return actor;
}

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      const actor = await getReadyActor();
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ─── Students ────────────────────────────────────────────────────────────────

export function useGetAllStudents() {
  const { actor, isFetching } = useActor();

  return useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStudents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddStudent() {
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
      const actor = await getReadyActor();
      return actor.addStudent(
        data.name,
        data.dateOfBirth,
        data.className,
        BigInt(data.attendanceNumber),
        data.schoolName,
        data.taluka,
        data.district,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error: Error) => {
      console.error("addStudent error:", error.message);
    },
  });
}

export function useUpdateStudent() {
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
      const actor = await getReadyActor();
      return actor.updateStudent(
        BigInt(data.id),
        data.name,
        data.dateOfBirth,
        data.className,
        BigInt(data.attendanceNumber),
        data.schoolName,
        data.taluka,
        data.district,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error: Error) => {
      console.error("updateStudent error:", error.message);
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const actor = await getReadyActor();
      return actor.deleteStudent(BigInt(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

// ─── Accounts ────────────────────────────────────────────────────────────────

export function useGetAllAccounts() {
  const { actor, isFetching } = useActor();

  return useQuery<Account[]>({
    queryKey: ["accounts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAccounts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      studentId: number;
      bankName: string;
      accountNumber: string;
      initialAmount: number;
      ifscCode: string;
    }) => {
      const actor = await getReadyActor();
      return actor.addAccount(
        BigInt(data.studentId),
        data.bankName,
        data.accountNumber,
        BigInt(data.initialAmount),
        data.ifscCode,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (error: Error) => {
      console.error("addAccount error:", error.message);
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      studentId: number;
      bankName: string;
      accountNumber: string;
      initialAmount: number;
      ifscCode: string;
    }) => {
      const actor = await getReadyActor();
      return actor.updateAccount(
        BigInt(data.studentId),
        data.bankName,
        data.accountNumber,
        BigInt(data.initialAmount),
        data.ifscCode,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (error: Error) => {
      console.error("updateAccount error:", error.message);
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountNumber: string) => {
      const actor = await getReadyActor();
      return actor.deleteAccount(accountNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export function useGetAllTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
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
    queryKey: ["transactions", accountNumber],
    queryFn: async () => {
      if (!actor) return [];
      if (!accountNumber) return [];
      return actor.getTransactionsByAccount(accountNumber);
    },
    enabled: !!actor && !isFetching && !!accountNumber,
  });
}

export function useGetTransactionsByDateRange(
  startDate: bigint,
  endDate: bigint,
  enabled: boolean,
) {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: [
      "transactions",
      "dateRange",
      startDate.toString(),
      endDate.toString(),
    ],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactionsByDateRange(startDate, endDate);
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      accountNumber: string;
      transactionType: string;
      amount: number;
      reason: string;
      date?: string;
    }) => {
      const actor = await getReadyActor();
      const customDate = data.date?.trim()
        ? BigInt(new Date(data.date).getTime()) * BigInt(1_000_000)
        : BigInt(0);
      return actor.addTransaction(
        data.accountNumber,
        data.transactionType,
        BigInt(data.amount),
        data.reason,
        customDate,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({
        queryKey: ["transactions", variables.accountNumber],
      });
    },
    onError: (error: Error) => {
      console.error("addTransaction error:", error.message);
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: bigint) => {
      const actor = await getReadyActor();
      const result = await actor.deleteTransaction(transactionId);
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (error: Error) => {
      console.error("deleteTransaction error:", error.message);
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      transactionId: bigint;
      transactionType: string;
      amount: number;
      reason: string;
      date: string;
    }) => {
      const actor = await getReadyActor();
      const customDate = data.date?.trim()
        ? BigInt(new Date(data.date).getTime()) * BigInt(1_000_000)
        : BigInt(0);
      const result = await actor.updateTransaction(
        data.transactionId,
        data.transactionType,
        BigInt(data.amount),
        data.reason,
        customDate,
      );
      if (result.__kind__ === "err") {
        throw new Error(result.err);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (error: Error) => {
      console.error("updateTransaction error:", error.message);
    },
  });
}

// ─── Bank Details ─────────────────────────────────────────────────────────────

export function useGetAllBankDetails() {
  const { actor, isFetching } = useActor();

  return useQuery<BankDetail[]>({
    queryKey: ["bankDetails"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBankDetails();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddBankDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      bankName: string;
      taluka: string;
      district: string;
      ifscCode: string;
    }) => {
      const actor = await getReadyActor();
      return actor.addBankDetail(
        data.bankName,
        data.taluka,
        data.district,
        data.ifscCode,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bankDetails"] });
    },
    onError: (error: Error) => {
      console.error("addBankDetail error:", error.message);
    },
  });
}

export function useUpdateBankDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      bankName: string;
      taluka: string;
      district: string;
      ifscCode: string;
    }) => {
      const actor = await getReadyActor();
      return actor.updateBankDetail(
        data.bankName,
        data.taluka,
        data.district,
        data.ifscCode,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bankDetails"] });
    },
    onError: (error: Error) => {
      console.error("updateBankDetail error:", error.message);
    },
  });
}

export function useDeleteBankDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ifscCode: string) => {
      const actor = await getReadyActor();
      return actor.deleteBankDetail(ifscCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bankDetails"] });
    },
  });
}
