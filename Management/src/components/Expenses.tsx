import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Trash2,
  Edit2,
  Search,
  X,
  Save,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  PlusCircle,
  UserCircle,
  PieChart,
} from "lucide-react";
import { apiService } from "../api";
import type { PersonTransaction } from "../Parameters";

interface ExpensesProps {
  showToast: (message: string, type: "success" | "error") => void;
}

const Expenses = ({ showToast }: ExpensesProps) => {
  const [transactions, setTransactions] = useState<PersonTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<PersonTransaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<PersonTransaction | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"transactions" | "userSummary">("transactions");
  const [userSummaries, setUserSummaries] = useState<
  {
    userName: string;
    totalAdded: number;
    totalWithdrawn: number;
    netBalance: number;
  }[]
>([]);
  const [formData, setFormData] = useState({
  personName: "",
  type: "add" as "add" | "withdraw",
  amount: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
});

  useEffect(() => {
    loadTransactions();
  
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, selectedDate]);

  const loadTransactions = async () => {
    try {
      const data = (await apiService.getExpenses()) as PersonTransaction[];
      data.sort((a, b) => 
        new Date(b.timestamp || "").getTime() - new Date(a.timestamp || "").getTime()
      );
      setTransactions(data);
    } catch (error) {
      showToast("Failed to load transactions", "error");
    }
  };
const calculateUserSummaries = () => {
  const map = new Map<string, {
    totalAdded: number;
    totalWithdrawn: number;
  }>();

  transactions.forEach((t) => {
    const existing = map.get(t.personName) || {
      totalAdded: 0,
      totalWithdrawn: 0,
    };

    if (t.type === "ADD") {
      existing.totalAdded += t.amount;
    } else {
      existing.totalWithdrawn += t.amount;
    }

    map.set(t.personName, existing);
  });

  const result = Array.from(map.entries()).map(([name, val]) => ({
    userName: name,
    totalAdded: val.totalAdded,
    totalWithdrawn: val.totalWithdrawn,
    netBalance: val.totalAdded - val.totalWithdrawn,
  }));

  setUserSummaries(result);
};
useEffect(() => {
  calculateUserSummaries();
}, [transactions]);
  const filterTransactions = () => {
    let filtered = [...transactions];
    
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedDate) {
      filtered = filtered.filter(t => t.date === selectedDate);
    }
    
    setFilteredTransactions(filtered);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.personName.trim()) {
        showToast("Please enter person name", "error");
        return;
      }
      
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        showToast("Please enter a valid amount", "error");
        return;
      }
const payload: PersonTransaction = {
  personName: formData.personName.trim(),
  amount: parseFloat(formData.amount),
  type: formData.type === "add" ? "ADD" : "WITHDRAW",
  description: formData.description.trim(),
  date: formData.date,
};

      if (editingTransaction) {
         await apiService.updateExpense(editingTransaction.id!, payload);
        showToast("Transaction updated successfully!", "success");
      } else {
        await apiService.addExpense(payload);
        showToast("Transaction added successfully!", "success");
      }

      resetForm();
      await loadTransactions();
     
    } catch (error) {
      showToast(editingTransaction ? "Failed to update transaction" : "Failed to add transaction", "error");
    }
  };

  const handleDelete = async (id: number) => {

      try {
      await apiService.deleteExpense(id);
        await loadTransactions();

        showToast("Transaction deleted successfully!", "success");
      } catch (error) {
        showToast("Failed to delete transaction", "error");
      }
    
  };

  const handleEdit = (transaction: PersonTransaction) => {
    setEditingTransaction(transaction);
   setFormData({
  personName: transaction.personName,
  type: transaction.type === "ADD" ? "add" : "withdraw",
  amount: transaction.amount.toString(),
  description: transaction.description || "",
  date: transaction.date,
});
    setShowForm(true);
  };

  const resetForm = () => {
 setFormData({
  personName: "",
  type: "add",
  amount: "",
  description: "",
  date: new Date().toISOString().split("T")[0],
});
    setEditingTransaction(null);
    setShowForm(false);
  };
const getTotalBalance = () => {
  return transactions.reduce(
    (sum, t) => sum + (t.type === "ADD" ? t.amount : -t.amount),
    0
  );
};

  const getTotalAdded = () => {
    return transactions
      .filter(t => t.type === "ADD")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalWithdrawn = () => {
    return transactions
      .filter(t => t.type === "WITHDRAW")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="space-y-5">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-100 text-xs font-medium">Total Added</p>
            <ArrowUpCircle className="w-4 h-4 text-green-200" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-1">
            +₹{getTotalAdded().toLocaleString("en-IN")}
          </h2>
          <p className="text-green-100 text-xs">Money Added</p>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg shadow-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-red-100 text-xs font-medium">Total Withdrawn</p>
            <ArrowDownCircle className="w-4 h-4 text-red-200" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-1">
            -₹{getTotalWithdrawn().toLocaleString("en-IN")}
          </h2>
          <p className="text-red-100 text-xs">Money Withdrawn</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg shadow-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-purple-100 text-xs font-medium">Total Persons</p>
            <Users className="w-4 h-4 text-purple-200" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-1">
           {userSummaries.length}
          </h2>
          <p className="text-purple-100 text-xs">Active Persons</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-100 text-xs font-medium">Net Balance</p>
            <DollarSign className="w-4 h-4 text-blue-200" />
          </div>
          <h2 className={`text-xl sm:text-2xl font-bold mb-1 ${getTotalBalance() >= 0 ? 'text-green-300' : 'text-red-300'}`}>
            ₹{getTotalBalance().toLocaleString("en-IN")}
          </h2>
          <p className="text-blue-100 text-xs">Overall Balance</p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveSubTab("transactions")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
            activeSubTab === "transactions"
              ? "text-blue-400 border-b-2 border-blue-400"
              : "text-white/60 hover:text-white"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Transactions
        </button>
        <button
          onClick={() => setActiveSubTab("userSummary")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
            activeSubTab === "userSummary"
              ? "text-purple-400 border-b-2 border-purple-400"
              : "text-white/60 hover:text-white"
          }`}
        >
          <PieChart className="w-4 h-4" />
          User Summary
        </button>
      </div>

      {/* Add Transaction Button (only in transactions tab) */}
      {activeSubTab === "transactions" && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Transaction
        </button>
      )}

      {/* Transaction Form */}
      {activeSubTab === "transactions" && showForm && (
        <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-4 sm:p-5">
          <h3 className="text-base font-bold mb-4 text-white flex items-center gap-2">
            {editingTransaction ? <Edit2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
          </h3>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-white text-xs font-medium mb-1">
                  Person Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.personName}
                  onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="Enter person name"
                />
              </div>

              <div>
                <label className="block text-white text-xs font-medium mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-white text-xs font-medium mb-1">
                  Transaction Type <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                  checked={formData.type === "add"}
onChange={() => setFormData({ ...formData, type: "add" })}
                      className="w-3 h-3"
                    />
                    <div className="flex items-center gap-1">
                      <ArrowUpCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm">Add</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                    checked={formData.type === "withdraw"}
onChange={() => setFormData({ ...formData, type: "withdraw" })}
                      className="w-3 h-3"
                    />
                    <div className="flex items-center gap-1">
                      <ArrowDownCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 text-sm">Withdraw</span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-white text-xs font-medium mb-1">
                  Amount (₹) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  step="0.01"
                  className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="Enter amount"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-white text-xs font-medium mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="Add a note about this transaction"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-2 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                {editingTransaction ? "Update" : "Save"}
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-gray-500/50 text-white text-sm rounded-lg hover:bg-gray-500/70 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Summary Tab */}
      {activeSubTab === "userSummary" && (
        <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserCircle className="w-5 h-5" />
              User-wise Transaction Summary
            </h3>
            <p className="text-white/60 text-xs mt-1">
              Showing total added, withdrawn, and net balance for each user
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/60">User Name</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-white/60">Total Added</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-white/60">Total Withdrawn</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-white/60">Net Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {userSummaries.map((user, index) => (
                  <tr key={user.userName} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3 text-sm text-white">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <UserCircle className="w-5 h-5 text-blue-400" />
                        <span className="text-white font-medium">{user.userName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-green-400 font-medium">
                        +₹{user.totalAdded.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-red-400 font-medium">
                        -₹{user.totalWithdrawn.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${
                        user.netBalance >= 0 ? "text-green-400" : "text-red-400"
                      }`}>
                        ₹{user.netBalance.toLocaleString("en-IN")}
                      </span>
                    </td>
                  </tr>
                ))}

                {userSummaries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <div className="text-white/60">
                        <Users className="w-12 h-12 mx-auto mb-2 text-white/20" />
                        <p className="text-sm">No users found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
             
            </table>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      {activeSubTab === "transactions" && (
        <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Transaction History
                </h3>
                <p className="text-white/60 text-xs">
                  Showing {filteredTransactions.length} of {transactions.length} transactions
                </p>
              </div>

              {/* Mobile Filter Toggle */}
              <div className="sm:hidden w-full">
                <button
                  onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                  className="w-full px-3 py-2 bg-white/10 rounded-lg text-white text-sm flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  {isMobileFiltersOpen ? "Hide Filters" : "Show Filters"}
                </button>
              </div>

              {/* Filters */}
              <div className={`${isMobileFiltersOpen ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row gap-2 w-full sm:w-auto`}>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="pl-7 pr-3 py-1.5 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-purple-500 w-full sm:w-48 lg:w-64"
                  />
                </div>

            <button
  onClick={() => apiService.downloadExpensesPdf()}
  className="px-3 py-2 bg-green-600 text-white rounded"
>
  Download PDF
</button>

                {(searchQuery ) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedDate("");
                    }}
                    className="px-3 py-1.5 text-sm bg-red-500/20 hover:bg-red-500/30 text-white rounded transition-all flex items-center justify-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="block md:hidden divide-y divide-white/10">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-white/5 transition">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs font-medium">
                      {transaction.personName}
                    </span>
                    <p className="text-xs text-white/40 mt-1">
                      {transaction.date ? new Date(transaction.date).toLocaleDateString() : "-"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id!)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {transaction.type === "ADD"? (
                      <>
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-green-400 text-xs">Added</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3 h-3 text-red-400" />
                        <span className="text-red-400 text-xs">Withdrawn</span>
                      </>
                    )}
                  </div>
                  <span className={`text-base font-bold ${
                    transaction.type === "ADD" ? "text-green-400" : "text-red-400"
                  }`}>
                    {transaction.type === "ADD" ? "+" : "-"}₹
                    {transaction.amount.toLocaleString("en-IN")}
                  </span>
                </div>
                {transaction.description && (
                  <p className="text-xs text-white/60 mt-2 truncate">
                    {transaction.description}
                  </p>
                )}
              </div>
            ))}

            {filteredTransactions.length === 0 && (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 mx-auto mb-2 text-white/20" />
                <p className="text-white/60 text-sm">No transactions found</p>
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white/60">#</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white/60">Person</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white/60">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white/60">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white/60 hidden lg:table-cell">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white/60">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white/60">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredTransactions.map((transaction, index) => (
                  <tr key={transaction.id} className="hover:bg-white/5 transition">
                    <td className="px-4 py-2 text-sm text-white">{index + 1}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs font-medium">
                        {transaction.personName}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        {transaction.type === "ADD" ? (
                          <>
                            <TrendingUp className="w-3 h-3 text-green-400" />
                            <span className="text-green-400 text-xs">Added</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3 h-3 text-red-400" />
                            <span className="text-red-400 text-xs">Withdrawn</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-sm font-medium ${
                        transaction.type === "ADD" ? "text-green-400" : "text-red-400"
                      }`}>
                        {transaction.type === "ADD" ? "+" : "-"}₹
                        {transaction.amount.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-white/60 hidden lg:table-cell">
                      {transaction.description || "-"}
                    </td>
                    <td className="px-4 py-2 text-xs text-white/60">
                      {transaction.date ? new Date(transaction.date).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="text-blue-400 hover:text-blue-300 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id!)}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <div className="text-white/60">
                        <DollarSign className="w-12 h-12 mx-auto mb-2 text-white/20" />
                        <p className="text-sm">No transactions found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              {filteredTransactions.length > 0 && (
                <tfoot className="bg-white/5">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium text-white">
                      Total:
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-sm font-bold ${
                        filteredTransactions.reduce((sum, t) => 
                          sum + (t.type === "ADD" ? t.amount : -t.amount), 0
                        ) >= 0 ? "text-green-400" : "text-red-400"
                      }`}>
                        ₹{filteredTransactions.reduce((sum, t) => 
                          sum + (t.type === "ADD" ? t.amount : -t.amount), 0
                        ).toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;