import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";

module {
  type OldTransaction = {
    accountNumber : Text;
    studentName : Text;
    date : Time.Time;
    transactionType : Text;
    amount : Nat;
    reason : Text;
    runningBalance : Nat;
  };

  type OldActor = {
    transactions : Map.Map<Nat, OldTransaction>;
  };

  type NewTransaction = {
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

  type NewActor = {
    transactions : Map.Map<Nat, NewTransaction>;
  };

  public func run(old : OldActor) : NewActor {
    let newTransactions = old.transactions.map<Nat, OldTransaction, NewTransaction>(
      func(_id, oldTransaction) {
        { oldTransaction with previousBalance = 0; totalAmount = 0 };
      },
    );
    { transactions = newTransactions };
  };
};
