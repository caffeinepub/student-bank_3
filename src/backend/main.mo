import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import CoreRuntime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Custom Result type for error handling
  public type Result<Ok, Err> = {
    #ok : Ok;
    #err : Err;
  };

  public type UserProfile = {
    name : Text;
    accountNumber : Text;
  };

  // Student Record Type
  public type Student = {
    id : Nat;
    name : Text;
    dateOfBirth : Text;
    className : Text;
    attendanceNumber : Nat;
    schoolName : Text;
    taluka : Text;
    district : Text;
  };

  public type Account = {
    studentId : Nat;
    bankName : Text;
    accountNumber : Text;
    initialAmount : Nat;
    ifscCode : Text;
    className : Text;
  };

  public type Transaction = {
    id : Nat;
    accountNumber : Text;
    studentName : Text;
    date : Time.Time;
    transactionType : Text;
    amount : Nat;
    reason : Text;
    runningBalance : Nat;
    previousBalance : Nat;
    totalAmount : Nat;
  };

  public type BankDetail = {
    bankName : Text;
    taluka : Text;
    district : Text;
    ifscCode : Text;
  };

  // STABLE variables for persistence across upgrades
  stable let userProfiles = Map.empty<Principal, UserProfile>();
  stable let students = Map.empty<Nat, Student>();
  stable let accounts = Map.empty<Text, Account>();
  stable let transactions = Map.empty<Nat, Transaction>();
  stable let bankDetails = Map.empty<Text, BankDetail>();

  stable var nextStudentId = 1;
  stable var nextTransactionId = 1;

  // Helper function to get a student by ID
  func getStudent(id : Nat) : Student {
    switch (students.get(id)) {
      case (null) { CoreRuntime.trap("Student not found") };
      case (?student) { student };
    };
  };

  // Helper function to get an account by account number
  func getAccount(accountNumber : Text) : Account {
    switch (accounts.get(accountNumber)) {
      case (null) { CoreRuntime.trap("Account not found") };
      case (?account) { account };
    };
  };

  // Helper function to calculate running balance up to a specific transaction
  func calculateRunningBalanceUpToTransaction(accountNumber : Text, upToTransactionId : Nat) : Nat {
    var balance = 0;
    let account = getAccount(accountNumber);
    balance += account.initialAmount;

    for ((id, transaction) in transactions.entries()) {
      if (transaction.accountNumber == accountNumber and id < upToTransactionId) {
        if (transaction.transactionType == "Deposit") {
          balance += transaction.amount;
        } else if (transaction.transactionType == "Withdrawal") {
          balance -= transaction.amount;
        };
      };
    };
    balance;
  };

  // Helper function to calculate running balance including a new transaction
  func calculateRunningBalance(accountNumber : Text, amount : Nat, transactionType : Text) : Nat {
    var balance = 0;
    let account = getAccount(accountNumber);
    balance += account.initialAmount;

    for (transaction in transactions.values()) {
      if (transaction.accountNumber == accountNumber) {
        if (transaction.transactionType == "Deposit") {
          balance += transaction.amount;
        } else if (transaction.transactionType == "Withdrawal") {
          balance -= transaction.amount;
        };
      };
    };

    if (transactionType == "Deposit") {
      balance += amount;
    } else if (transactionType == "Withdrawal") {
      balance -= amount;
    };

    balance;
  };

  // Helper function to calculate total amount of transactions for an account
  func calculateTotalAmount(accountNumber : Text) : Nat {
    var total = 0;
    for (transaction in transactions.values()) {
      if (transaction.accountNumber == accountNumber) {
        total += transaction.amount;
      };
    };
    total;
  };

  // Helper function to get the previous balance for an account
  func getPreviousBalance(accountNumber : Text) : Nat {
    var balance = 0;
    let account = getAccount(accountNumber);
    balance += account.initialAmount;

    for (transaction in transactions.values()) {
      if (transaction.accountNumber == accountNumber) {
        if (transaction.transactionType == "Deposit") {
          balance += transaction.amount;
        } else if (transaction.transactionType == "Withdrawal") {
          balance -= transaction.amount;
        };
      };
    };
    balance;
  };

  // User Profiles
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      CoreRuntime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      CoreRuntime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      CoreRuntime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Student CRUD Operations
  public shared ({ caller }) func addStudent(
    name : Text,
    dateOfBirth : Text,
    className : Text,
    attendanceNumber : Nat,
    schoolName : Text,
    taluka : Text,
    district : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      CoreRuntime.trap("Unauthorized: Only admins can add students");
    };
    let student : Student = {
      id = nextStudentId;
      name;
      dateOfBirth;
      className;
      attendanceNumber;
      schoolName;
      taluka;
      district;
    };

    students.add(nextStudentId, student);
    nextStudentId += 1;
    nextStudentId - 1;
  };

  public shared ({ caller }) func updateStudent(
    id : Nat,
    name : Text,
    dateOfBirth : Text,
    className : Text,
    attendanceNumber : Nat,
    schoolName : Text,
    taluka : Text,
    district : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      CoreRuntime.trap("Unauthorized: Only admins can update students");
    };
    let student : Student = {
      id;
      name;
      dateOfBirth;
      className;
      attendanceNumber;
      schoolName;
      taluka;
      district;
    };

    students.add(id, student);
  };

  public shared ({ caller }) func deleteStudent(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      CoreRuntime.trap("Unauthorized: Only admins can delete students");
    };
    students.remove(id);
  };

  public query ({ caller }) func getAllStudents() : async [Student] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      CoreRuntime.trap("Unauthorized: Only users can view students");
    };
    students.values().toArray();
  };

  // Account CRUD Operations
  public shared ({ caller }) func addAccount(
    studentId : Nat,
    bankName : Text,
    accountNumber : Text,
    initialAmount : Nat,
    ifscCode : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      CoreRuntime.trap("Unauthorized: Only admins can add accounts");
    };
    let student = getStudent(studentId);
    let account : Account = {
      studentId;
      bankName;
      accountNumber;
      initialAmount;
      ifscCode;
      className = student.className;
    };

    accounts.add(accountNumber, account);
  };

  public shared ({ caller }) func updateAccount(
    studentId : Nat,
    bankName : Text,
    accountNumber : Text,
    initialAmount : Nat,
    ifscCode : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      CoreRuntime.trap("Unauthorized: Only admins can update accounts");
    };
    let student = getStudent(studentId);
    let account : Account = {
      studentId;
      bankName;
      accountNumber;
      initialAmount;
      ifscCode;
      className = student.className;
    };

    accounts.add(accountNumber, account);
  };

  public shared ({ caller }) func deleteAccount(accountNumber : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      CoreRuntime.trap("Unauthorized: Only admins can delete accounts");
    };
    accounts.remove(accountNumber);
  };

  public query ({ caller }) func getAllAccounts() : async [Account] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      CoreRuntime.trap("Unauthorized: Only users can view accounts");
    };
    accounts.values().toArray();
  };

  public query ({ caller }) func getAccountByNumber(accountNumber : Text) : async Account {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      CoreRuntime.trap("Unauthorized: Only users can view accounts");
    };
    switch (accounts.get(accountNumber)) {
      case (null) { CoreRuntime.trap("Account not found") };
      case (?account) { account };
    };
  };

  // Transaction Operations
  public shared ({ caller }) func addTransaction(
    accountNumber : Text,
    transactionType : Text,
    amount : Nat,
    reason : Text,
    customDate : Int,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      CoreRuntime.trap("Unauthorized: Only admins can add transactions");
    };
    let account = getAccount(accountNumber);
    let student = getStudent(account.studentId);

    let previousBalance = getPreviousBalance(accountNumber);
    let runningBalance = calculateRunningBalance(accountNumber, amount, transactionType);
    let totalAmount = calculateTotalAmount(accountNumber);

    let date : Time.Time =
      if (customDate != 0) {
        if (customDate >= 0) {
          customDate;
        } else {
          CoreRuntime.trap("Invalid custom date: must be >= 0");
        };
      } else {
        Time.now();
      };

    let transaction : Transaction = {
      id = nextTransactionId;
      accountNumber;
      studentName = student.name;
      date;
      transactionType;
      amount;
      reason;
      runningBalance;
      previousBalance;
      totalAmount;
    };

    transactions.add(nextTransactionId, transaction);
    nextTransactionId += 1;
  };

  public shared ({ caller }) func updateTransaction(
    transactionId : Nat,
    transactionType : Text,
    amount : Nat,
    reason : Text,
    date : Int,
  ) : async Result<(), Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      CoreRuntime.trap("Unauthorized: Only admins can update transactions");
    };

    switch (transactions.get(transactionId)) {
      case (null) {
        #err("Transaction not found");
      };
      case (?oldTransaction) {
        let account = getAccount(oldTransaction.accountNumber);
        let student = getStudent(account.studentId);

        let previousBalance = calculateRunningBalanceUpToTransaction(oldTransaction.accountNumber, transactionId);

        var runningBalance = previousBalance;
        if (transactionType == "Deposit") {
          runningBalance += amount;
        } else if (transactionType == "Withdrawal") {
          runningBalance -= amount;
        };

        let totalAmount = calculateTotalAmount(oldTransaction.accountNumber);

        let transactionDate : Time.Time =
          if (date != 0) {
            if (date >= 0) {
              date;
            } else {
              return #err("Invalid date: must be >= 0");
            };
          } else {
            oldTransaction.date;
          };

        let updatedTransaction : Transaction = {
          id = transactionId;
          accountNumber = oldTransaction.accountNumber;
          studentName = student.name;
          date = transactionDate;
          transactionType;
          amount;
          reason;
          runningBalance;
          previousBalance;
          totalAmount;
        };

        transactions.add(transactionId, updatedTransaction);
        #ok(());
      };
    };
  };

  public shared ({ caller }) func deleteTransaction(transactionId : Nat) : async Result<(), Text> {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      CoreRuntime.trap("Unauthorized: Only admins can delete transactions");
    };
    switch (transactions.get(transactionId)) {
      case (null) {
        #err("Transaction not found");
      };
      case (?_transaction) {
        transactions.remove(transactionId);
        #ok(());
      };
    };
  };

  public query ({ caller }) func getTransactionsByAccount(accountNumber : Text) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      CoreRuntime.trap("Unauthorized: Only users can view transactions");
    };
    transactions.values().filter(func(t) { t.accountNumber == accountNumber }).toArray();
  };

  public query ({ caller }) func getTransactionsByDateRange(startDate : Time.Time, endDate : Time.Time) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      CoreRuntime.trap("Unauthorized: Only users can view transactions");
    };
    transactions.values().filter(func(t) { t.date >= startDate and t.date <= endDate }).toArray();
  };

  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      CoreRuntime.trap("Unauthorized: Only users can view transactions");
    };
    transactions.values().toArray();
  };

  // Bank Details CRUD Operations
  public shared ({ caller }) func addBankDetail(
    bankName : Text,
    taluka : Text,
    district : Text,
    ifscCode : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      CoreRuntime.trap("Unauthorized: Only admins can add bank details");
    };
    let bankDetail : BankDetail = {
      bankName;
      taluka;
      district;
      ifscCode;
    };

    bankDetails.add(ifscCode, bankDetail);
  };

  public shared ({ caller }) func updateBankDetail(
    bankName : Text,
    taluka : Text,
    district : Text,
    ifscCode : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      CoreRuntime.trap("Unauthorized: Only admins can update bank details");
    };
    let bankDetail : BankDetail = {
      bankName;
      taluka;
      district;
      ifscCode;
    };

    bankDetails.add(ifscCode, bankDetail);
  };

  public shared ({ caller }) func deleteBankDetail(ifscCode : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      CoreRuntime.trap("Unauthorized: Only admins can delete bank details");
    };
    bankDetails.remove(ifscCode);
  };

  public query ({ caller }) func getAllBankDetails() : async [BankDetail] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      CoreRuntime.trap("Unauthorized: Only users can view bank details");
    };
    bankDetails.values().toArray();
  };
};
