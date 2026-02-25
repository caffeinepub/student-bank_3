import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
    accountNumber : Text;
  };

  // Storage Variables
  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Student Record Type
  type Student = {
    id : Nat;
    name : Text;
    dateOfBirth : Text;
    className : Text;
    attendanceNumber : Nat;
    schoolName : Text;
    taluka : Text;
    district : Text;
  };

  // Account Record Type
  type Account = {
    studentId : Nat;
    bankName : Text;
    accountNumber : Text;
    initialAmount : Nat;
    ifscCode : Text;
    className : Text;
  };

  // Transaction Record Type
  type Transaction = {
    accountNumber : Text;
    studentName : Text;
    date : Time.Time;
    transactionType : Text; // "Deposit" or "Withdrawal"
    amount : Nat;
    reason : Text;
    runningBalance : Nat;
  };

  // Bank Detail Record Type
  type BankDetail = {
    bankName : Text;
    taluka : Text;
    district : Text;
    ifscCode : Text;
  };

  // Storage Variables
  let students = Map.empty<Nat, Student>();
  let accounts = Map.empty<Text, Account>();
  let transactions = Map.empty<Nat, Transaction>();
  let bankDetails = Map.empty<Text, BankDetail>();

  var nextStudentId = 1;
  var nextTransactionId = 1;

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
      Runtime.trap("Unauthorized: Only admins can perform this action");
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
      Runtime.trap("Unauthorized: Only admins can perform this action");
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
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    students.remove(id);
  };

  public query ({ caller }) func getAllStudents() : async [Student] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all students");
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
      Runtime.trap("Unauthorized: Only admins can perform this action");
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
      Runtime.trap("Unauthorized: Only admins can perform this action");
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
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    accounts.remove(accountNumber);
  };

  public query ({ caller }) func getAllAccounts() : async [Account] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all accounts");
    };
    accounts.values().toArray();
  };

  public query ({ caller }) func getAccountByNumber(accountNumber : Text) : async Account {
    // Users can view their own account; admins can view any account
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to view account details");
    };
    // If the caller is not an admin, verify they own this account via their profile
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      let profile = userProfiles.get(caller);
      switch (profile) {
        case (null) {
          Runtime.trap("Unauthorized: No profile found for caller");
        };
        case (?p) {
          if (p.accountNumber != accountNumber) {
            Runtime.trap("Unauthorized: Can only view your own account");
          };
        };
      };
    };
    switch (accounts.get(accountNumber)) {
      case (null) { Runtime.trap("Account not found") };
      case (?account) { account };
    };
  };

  // Transaction CRUD Operations
  public shared ({ caller }) func addTransaction(
    accountNumber : Text,
    transactionType : Text,
    amount : Nat,
    reason : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let account = getAccount(accountNumber);
    let student = getStudent(account.studentId);

    let transaction : Transaction = {
      accountNumber;
      studentName = student.name;
      date = Time.now();
      transactionType;
      amount;
      reason;
      runningBalance = calculateRunningBalance(accountNumber, amount, transactionType);
    };

    transactions.add(nextTransactionId, transaction);
    nextTransactionId += 1;
  };

  public query ({ caller }) func getTransactionsByAccount(accountNumber : Text) : async [Transaction] {
    // Users can view transactions for their own account; admins can view any
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to view transactions");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      let profile = userProfiles.get(caller);
      switch (profile) {
        case (null) {
          Runtime.trap("Unauthorized: No profile found for caller");
        };
        case (?p) {
          if (p.accountNumber != accountNumber) {
            Runtime.trap("Unauthorized: Can only view your own transactions");
          };
        };
      };
    };
    transactions.values().filter(func(t) { t.accountNumber == accountNumber }).toArray();
  };

  public query ({ caller }) func getTransactionsByDateRange(startDate : Time.Time, endDate : Time.Time) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view transactions by date range");
    };
    transactions.values().filter(func(t) { t.date >= startDate and t.date <= endDate }).toArray();
  };

  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all transactions");
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
      Runtime.trap("Unauthorized: Only admins can perform this action");
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
      Runtime.trap("Unauthorized: Only admins can perform this action");
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
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    bankDetails.remove(ifscCode);
  };

  public query ({ caller }) func getAllBankDetails() : async [BankDetail] {
    // Bank details are needed by users when creating/viewing accounts
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be logged in to view bank details");
    };
    bankDetails.values().toArray();
  };

  // Helper Functions
  func getStudent(id : Nat) : Student {
    switch (students.get(id)) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) { student };
    };
  };

  func getAccount(accountNumber : Text) : Account {
    switch (accounts.get(accountNumber)) {
      case (null) { Runtime.trap("Account not found") };
      case (?account) { account };
    };
  };

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
};
