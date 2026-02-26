import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";

module {
  type OldStudent = {
    id : Nat;
    name : Text;
    dateOfBirth : Text;
    className : Text;
    attendanceNumber : Nat;
    schoolName : Text;
    taluka : Text;
    district : Text;
  };

  type OldAccount = {
    studentId : Nat;
    bankName : Text;
    accountNumber : Text;
    initialAmount : Nat;
    ifscCode : Text;
    className : Text;
  };

  type OldTransaction = {
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

  type OldBankDetail = {
    bankName : Text;
    taluka : Text;
    district : Text;
    ifscCode : Text;
  };

  type OldActor = {
    students : Map.Map<Nat, OldStudent>;
    accounts : Map.Map<Text, OldAccount>;
    transactions : Map.Map<Nat, OldTransaction>;
    bankDetails : Map.Map<Text, OldBankDetail>;
    nextStudentId : Nat;
    nextTransactionId : Nat;
  };

  type NewStudent = {
    id : Nat;
    name : Text;
    dateOfBirth : Text;
    className : Text;
    attendanceNumber : Nat;
    schoolName : Text;
    taluka : Text;
    district : Text;
  };

  type NewAccount = {
    studentId : Nat;
    bankName : Text;
    accountNumber : Text;
    initialAmount : Nat;
    ifscCode : Text;
    className : Text;
  };

  type NewTransaction = {
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

  type NewBankDetail = {
    bankName : Text;
    taluka : Text;
    district : Text;
    ifscCode : Text;
  };

  type NewActor = {
    students : Map.Map<Nat, NewStudent>;
    accounts : Map.Map<Text, NewAccount>;
    transactions : Map.Map<Nat, NewTransaction>;
    bankDetails : Map.Map<Text, NewBankDetail>;
    nextStudentId : Nat;
    nextTransactionId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newStudents = old.students.map<Nat, OldStudent, NewStudent>(
      func(_id, oldStudent) { oldStudent },
    );
    let newAccounts = old.accounts.map<Text, OldAccount, NewAccount>(
      func(_accountNumber, oldAccount) { oldAccount },
    );
    let newTransactions = old.transactions.map<Nat, OldTransaction, NewTransaction>(
      func(id, oldTransaction) {
        {
          id = id;
          accountNumber = oldTransaction.accountNumber;
          studentName = oldTransaction.studentName;
          date = oldTransaction.date;
          transactionType = oldTransaction.transactionType;
          amount = oldTransaction.amount;
          reason = oldTransaction.reason;
          runningBalance = oldTransaction.runningBalance;
          previousBalance = oldTransaction.previousBalance;
          totalAmount = oldTransaction.totalAmount;
        };
      },
    );
    let newBankDetails = old.bankDetails.map<Text, OldBankDetail, NewBankDetail>(
      func(_ifscCode, oldBankDetail) { oldBankDetail },
    );
    {
      students = newStudents;
      accounts = newAccounts;
      transactions = newTransactions;
      bankDetails = newBankDetails;
      nextStudentId = old.nextStudentId;
      nextTransactionId = old.nextTransactionId;
    };
  };
};
