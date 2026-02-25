import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Include migration directive and with-clause
(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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

  let userProfiles = Map.empty<Principal, UserProfile>();
  let students = Map.empty<Nat, Student>();
  let accounts = Map.empty<Text, Account>();
  let transactions = Map.empty<Nat, Transaction>();
  let bankDetails = Map.empty<Text, BankDetail>();

  var nextStudentId = 1;
  var nextTransactionId = 1;

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

  func calculateTotalAmount(accountNumber : Text) : Nat {
    var total = 0;
    for (transaction in transactions.values()) {
      if (transaction.accountNumber == accountNumber) {
        total += transaction.amount;
      };
    };
    total;
  };

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
      Runtime.trap("Unauthorized: Only admins can add students");
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
      Runtime.trap("Unauthorized: Only admins can update students");
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
      Runtime.trap("Unauthorized: Only admins can delete students");
    };
    students.remove(id);
  };

  public query ({ caller }) func getAllStudents() : async [Student] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view students");
    };
    students.values().toArray();
  };

  public shared ({ caller }) func addAccount(
    studentId : Nat,
    bankName : Text,
    accountNumber : Text,
    initialAmount : Nat,
    ifscCode : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add accounts");
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
      Runtime.trap("Unauthorized: Only admins can update accounts");
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
      Runtime.trap("Unauthorized: Only admins can delete accounts");
    };
    accounts.remove(accountNumber);
  };

  public query ({ caller }) func getAllAccounts() : async [Account] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view accounts");
    };
    accounts.values().toArray();
  };

  public query ({ caller }) func getAccountByNumber(accountNumber : Text) : async Account {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view accounts");
    };
    switch (accounts.get(accountNumber)) {
      case (null) { Runtime.trap("Account not found") };
      case (?account) { account };
    };
  };

  // Updated Transaction Operations
  public shared ({ caller }) func addTransaction(
    accountNumber : Text,
    transactionType : Text,
    amount : Nat,
    reason : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add transactions");
    };
    let account = getAccount(accountNumber);
    let student = getStudent(account.studentId);

    let previousBalance = getPreviousBalance(accountNumber);
    let runningBalance = calculateRunningBalance(accountNumber, amount, transactionType);
    let totalAmount = calculateTotalAmount(accountNumber);

    let transaction : Transaction = {
      accountNumber;
      studentName = student.name;
      date = Time.now();
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

  public query ({ caller }) func getTransactionsByAccount(accountNumber : Text) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    transactions.values().filter(func(t) { t.accountNumber == accountNumber }).toArray();
  };

  public query ({ caller }) func getTransactionsByDateRange(startDate : Time.Time, endDate : Time.Time) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    transactions.values().filter(func(t) { t.date >= startDate and t.date <= endDate }).toArray();
  };

  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    transactions.values().toArray();
  };

  public shared ({ caller }) func addBankDetail(
    bankName : Text,
    taluka : Text,
    district : Text,
    ifscCode : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add bank details");
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
      Runtime.trap("Unauthorized: Only admins can update bank details");
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
      Runtime.trap("Unauthorized: Only admins can delete bank details");
    };
    bankDetails.remove(ifscCode);
  };

  public query ({ caller }) func getAllBankDetails() : async [BankDetail] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bank details");
    };
    bankDetails.values().toArray();
  };
};
