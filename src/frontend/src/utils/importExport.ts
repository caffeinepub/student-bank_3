import type { Account, BankDetail, Student, Transaction } from "../backend";
import { formatDate } from "./exportCSV";

// ─── CSV Download Helper ─────────────────────────────────────────────────────

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// ─── Export Functions ────────────────────────────────────────────────────────

export function exportStudentsCSV(students: Student[]): void {
  const headers = [
    "name",
    "dateOfBirth",
    "className",
    "attendanceNumber",
    "schoolName",
    "taluka",
    "district",
  ];
  const rows = students.map((s) => [
    escapeCSV(s.name),
    escapeCSV(s.dateOfBirth),
    escapeCSV(s.className),
    s.attendanceNumber.toString(),
    escapeCSV(s.schoolName),
    escapeCSV(s.taluka),
    escapeCSV(s.district),
  ]);
  const content = [headers.join(","), ...rows.map((r) => r.join(","))].join(
    "\n",
  );
  downloadCSV(content, "students_backup.csv");
}

export function exportAccountsCSV(
  accounts: Account[],
  students: Student[],
): void {
  const getStudentName = (studentId: bigint) => {
    const s = students.find((st) => st.id === studentId);
    return s ? s.name : "";
  };
  const headers = [
    "accountNumber",
    "studentName",
    "bankName",
    "ifscCode",
    "className",
    "initialAmount",
  ];
  const rows = accounts.map((a) => [
    escapeCSV(a.accountNumber),
    escapeCSV(getStudentName(a.studentId)),
    escapeCSV(a.bankName),
    escapeCSV(a.ifscCode),
    escapeCSV(a.className),
    a.initialAmount.toString(),
  ]);
  const content = [headers.join(","), ...rows.map((r) => r.join(","))].join(
    "\n",
  );
  downloadCSV(content, "accounts_backup.csv");
}

export function exportTransactionsCSVAll(transactions: Transaction[]): void {
  const headers = [
    "date",
    "accountNumber",
    "studentName",
    "transactionType",
    "amount",
    "previousBalance",
    "totalAmount",
    "runningBalance",
    "reason",
  ];
  const rows = transactions.map((t) => [
    escapeCSV(formatDate(t.date)),
    escapeCSV(t.accountNumber),
    escapeCSV(t.studentName),
    escapeCSV(t.transactionType),
    t.amount.toString(),
    t.previousBalance.toString(),
    t.totalAmount.toString(),
    t.runningBalance.toString(),
    escapeCSV(t.reason),
  ]);
  const content = [headers.join(","), ...rows.map((r) => r.join(","))].join(
    "\n",
  );
  downloadCSV(content, "transactions_backup.csv");
}

export function exportBankDetailsCSV(bankDetails: BankDetail[]): void {
  const headers = ["bankName", "taluka", "district", "ifscCode"];
  const rows = bankDetails.map((b) => [
    escapeCSV(b.bankName),
    escapeCSV(b.taluka),
    escapeCSV(b.district),
    escapeCSV(b.ifscCode),
  ]);
  const content = [headers.join(","), ...rows.map((r) => r.join(","))].join(
    "\n",
  );
  downloadCSV(content, "bank_details_backup.csv");
}

export function exportAllDataCSV(
  students: Student[],
  accounts: Account[],
  transactions: Transaction[],
  bankDetails: BankDetail[],
): void {
  const getStudentName = (studentId: bigint) => {
    const s = students.find((st) => st.id === studentId);
    return s ? s.name : "";
  };

  const studentsSection = [
    "## STUDENTS ##",
    "name,dateOfBirth,className,attendanceNumber,schoolName,taluka,district",
    ...students.map((s) =>
      [
        escapeCSV(s.name),
        escapeCSV(s.dateOfBirth),
        escapeCSV(s.className),
        s.attendanceNumber.toString(),
        escapeCSV(s.schoolName),
        escapeCSV(s.taluka),
        escapeCSV(s.district),
      ].join(","),
    ),
  ];

  const accountsSection = [
    "## ACCOUNTS ##",
    "accountNumber,studentName,bankName,ifscCode,className,initialAmount",
    ...accounts.map((a) =>
      [
        escapeCSV(a.accountNumber),
        escapeCSV(getStudentName(a.studentId)),
        escapeCSV(a.bankName),
        escapeCSV(a.ifscCode),
        escapeCSV(a.className),
        a.initialAmount.toString(),
      ].join(","),
    ),
  ];

  const transactionsSection = [
    "## TRANSACTIONS ##",
    "date,accountNumber,studentName,transactionType,amount,previousBalance,totalAmount,runningBalance,reason",
    ...transactions.map((t) =>
      [
        escapeCSV(formatDate(t.date)),
        escapeCSV(t.accountNumber),
        escapeCSV(t.studentName),
        escapeCSV(t.transactionType),
        t.amount.toString(),
        t.previousBalance.toString(),
        t.totalAmount.toString(),
        t.runningBalance.toString(),
        escapeCSV(t.reason),
      ].join(","),
    ),
  ];

  const bankSection = [
    "## BANK DETAILS ##",
    "bankName,taluka,district,ifscCode",
    ...bankDetails.map((b) =>
      [
        escapeCSV(b.bankName),
        escapeCSV(b.taluka),
        escapeCSV(b.district),
        escapeCSV(b.ifscCode),
      ].join(","),
    ),
  ];

  const content = [
    "Student Bank - Full Data Backup",
    `Generated: ${new Date().toLocaleDateString("en-IN")}`,
    "",
    ...studentsSection,
    "",
    ...accountsSection,
    "",
    ...transactionsSection,
    "",
    ...bankSection,
  ].join("\n");

  downloadCSV(
    content,
    `full_backup_${new Date().toISOString().split("T")[0]}.csv`,
  );
}

// ─── CSV Parsing ─────────────────────────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export interface ParsedStudent {
  name: string;
  dateOfBirth: string;
  className: string;
  attendanceNumber: string;
  schoolName: string;
  taluka: string;
  district: string;
}

export interface ParsedBankDetail {
  bankName: string;
  taluka: string;
  district: string;
  ifscCode: string;
}

export interface ParsedAccount {
  accountNumber: string;
  studentName: string;
  bankName: string;
  ifscCode: string;
  className: string;
  initialAmount: string;
}

export interface ParsedTransaction {
  date: string;
  accountNumber: string;
  studentName: string;
  transactionType: string;
  amount: string;
  reason: string;
}

export function parseStudentsCSV(text: string): ParsedStudent[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  // Skip header row
  const dataLines = lines.slice(1).filter((l) => !l.startsWith("#"));

  return dataLines
    .map((line) => {
      const cols = parseCSVLine(line);
      return {
        name: cols[0] || "",
        dateOfBirth: cols[1] || "",
        className: cols[2] || "",
        attendanceNumber: cols[3] || "0",
        schoolName: cols[4] || "",
        taluka: cols[5] || "",
        district: cols[6] || "",
      };
    })
    .filter((s) => s.name.length > 0);
}

export function parseBankDetailsCSV(text: string): ParsedBankDetail[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  // Skip header row
  const dataLines = lines.slice(1).filter((l) => !l.startsWith("#"));

  return dataLines
    .map((line) => {
      const cols = parseCSVLine(line);
      return {
        bankName: cols[0] || "",
        taluka: cols[1] || "",
        district: cols[2] || "",
        ifscCode: cols[3] || "",
      };
    })
    .filter((b) => b.bankName.length > 0 && b.ifscCode.length > 0);
}

export function parseAccountsCSV(text: string): ParsedAccount[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  const dataLines = lines.slice(1).filter((l) => !l.startsWith("#"));

  return dataLines
    .map((line) => {
      const cols = parseCSVLine(line);
      return {
        accountNumber: cols[0] || "",
        studentName: cols[1] || "",
        bankName: cols[2] || "",
        ifscCode: cols[3] || "",
        className: cols[4] || "",
        initialAmount: cols[5] || "0",
      };
    })
    .filter((a) => a.accountNumber.length > 0);
}

export function parseTransactionsCSV(text: string): ParsedTransaction[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  const dataLines = lines.slice(1).filter((l) => !l.startsWith("#"));

  return dataLines
    .map((line) => {
      const cols = parseCSVLine(line);
      // CSV columns: date,accountNumber,studentName,transactionType,amount,...,reason
      return {
        date: cols[0] || "",
        accountNumber: cols[1] || "",
        studentName: cols[2] || "",
        transactionType: cols[3] || "",
        amount: cols[4] || "0",
        reason: cols[8] || cols[5] || "", // reason is last column
      };
    })
    .filter(
      (t) =>
        t.accountNumber.length > 0 &&
        (t.transactionType === "Deposit" || t.transactionType === "Withdrawal"),
    );
}
