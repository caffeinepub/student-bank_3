import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BankDetail {
    ifscCode: string;
    bankName: string;
    district: string;
    taluka: string;
}
export interface Transaction {
    id: bigint;
    transactionType: string;
    studentName: string;
    date: Time;
    totalAmount: bigint;
    runningBalance: bigint;
    accountNumber: string;
    amount: bigint;
    previousBalance: bigint;
    reason: string;
}
export interface Account {
    studentId: bigint;
    ifscCode: string;
    bankName: string;
    initialAmount: bigint;
    accountNumber: string;
    className: string;
}
export type Time = bigint;
export type Result = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export interface UserProfile {
    name: string;
    accountNumber: string;
}
export interface Student {
    id: bigint;
    attendanceNumber: bigint;
    dateOfBirth: string;
    name: string;
    district: string;
    taluka: string;
    className: string;
    schoolName: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAccount(studentId: bigint, bankName: string, accountNumber: string, initialAmount: bigint, ifscCode: string): Promise<void>;
    addBankDetail(bankName: string, taluka: string, district: string, ifscCode: string): Promise<void>;
    addStudent(name: string, dateOfBirth: string, className: string, attendanceNumber: bigint, schoolName: string, taluka: string, district: string): Promise<bigint>;
    addTransaction(accountNumber: string, transactionType: string, amount: bigint, reason: string, customDate: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteAccount(accountNumber: string): Promise<void>;
    deleteBankDetail(ifscCode: string): Promise<void>;
    deleteStudent(id: bigint): Promise<void>;
    deleteTransaction(transactionId: bigint): Promise<Result>;
    getAccountByNumber(accountNumber: string): Promise<Account>;
    getAllAccounts(): Promise<Array<Account>>;
    getAllBankDetails(): Promise<Array<BankDetail>>;
    getAllStudents(): Promise<Array<Student>>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getTransactionsByAccount(accountNumber: string): Promise<Array<Transaction>>;
    getTransactionsByDateRange(startDate: Time, endDate: Time): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateAccount(studentId: bigint, bankName: string, accountNumber: string, initialAmount: bigint, ifscCode: string): Promise<void>;
    updateBankDetail(bankName: string, taluka: string, district: string, ifscCode: string): Promise<void>;
    updateStudent(id: bigint, name: string, dateOfBirth: string, className: string, attendanceNumber: bigint, schoolName: string, taluka: string, district: string): Promise<void>;
    updateTransaction(transactionId: bigint, transactionType: string, amount: bigint, reason: string, date: bigint): Promise<Result>;
}
