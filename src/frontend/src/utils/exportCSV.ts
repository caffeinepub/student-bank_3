import type { Transaction } from "../backend";

export function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatCurrency(amount: bigint): string {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export function exportTransactionsCSV(
  transactions: Transaction[],
  accountNumber: string,
  studentName?: string,
): void {
  const headers = [
    "Date",
    "Student Name",
    "Transaction Type",
    "Amount (₹)",
    "Reason",
    "Running Balance (₹)",
  ];
  const rows = transactions.map((t) => [
    formatDate(t.date),
    t.studentName,
    t.transactionType,
    Number(t.amount).toString(),
    t.reason,
    Number(t.runningBalance).toString(),
  ]);

  const csvContent = [
    "Student Bank - Account Statement",
    `Account Number: ${accountNumber}`,
    studentName ? `Student Name: ${studentName}` : "",
    `Generated: ${new Date().toLocaleDateString("en-IN")}`,
    "",
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ]
    .filter((line) => line !== undefined)
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `passbook_${accountNumber}_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
