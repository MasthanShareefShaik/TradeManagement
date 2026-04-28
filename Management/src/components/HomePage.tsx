import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  NotebookPen,
  LogOut,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Award,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  FileText,
  Clock,
} from "lucide-react";
import type { AccountBalance, TradeEntry, TradingNote } from "../Parameters";
import { apiService } from "../api";
import Expenses from "./Expenses";

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [balance, setBalance] = useState<AccountBalance | null>(null);
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [notes, setNotes] = useState<TradingNote[]>([]);
  const [editingTrade, setEditingTrade] = useState<TradeEntry | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateAmount, setUpdateAmount] = useState<number>(0);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });
 const [activeTab, setActiveTab] = useState<"dashboard"  | "notes" | "expenses">(
  "dashboard",
);
  const [updateType, setUpdateType] = useState<"add" | "deduct">("add");
  
  const [filteredTrades, setFilteredTrades] = useState<TradeEntry[]>([]);

  // State for profit/loss type
  const [profitLossType, setProfitLossType] = useState<"profit" | "loss">(
    "profit",
  );
  const [showTipCard, setShowTipCard] = useState(false);
const [tip, setTip] = useState("");
  const [profitLossValue, setProfitLossValue] = useState<number>(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  // State for form inputs
  const [formData, setFormData] = useState({
    stockName: "",
    lots: "",
    entryTrade: "",
    exitTrade: "",
  });
  const [newNote, setNewNote] = useState("");
  const [editingNote, setEditingNote] = useState<TradingNote | null>(null);

  const getTodayDate = () => new Date().toISOString().split("T")[0];
  const [selectedNoteFilterDate, setSelectedNoteFilterDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [selectedNoteDate, setSelectedNoteDate] =
    useState<string>(getTodayDate());
  const [selectedDate, setSelectedDate] = useState<string>("");
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };
 const tradingTips = [
  
  // === RISK MANAGEMENT ===
  "⚖️ Never risk more than 1-2% of your capital on a single trade.",
  "📉 Cut losses early. Protect your capital at all costs.",
  "💎 Preserve capital first, chase profits second.",
  "⚓ Always use a stop-loss — no exceptions.",
  "⚖️ Risk-to-reward ratio should be at least 1:2 or better.",
  "🔒 Lock in partial profits when trade moves in your favor.",
  "💸 A small loss is a good loss — it means you followed your rules.",
  
  // === PSYCHOLOGY & MINDSET ===
  "🧠 Trading is 80% psychology, 20% strategy.",
  "😌 Stay calm in both winning and losing streaks.",
  "🪞 Know yourself — understand your emotional triggers.",
  "🧘 Meditate or exercise before trading sessions for clarity.",
  "🚫 Never trade when angry, sad, or overly excited.",
  "💭 Accept that losses are part of the business.",
  "🧘‍♂️ Patience is the most profitable skill in trading.",
  "🌙 A bad trade doesn't make you a bad trader.",
  "🏃 Step away from screens after 2 consecutive losses.",
  "🎢 Emotional discipline beats market knowledge every time.",
  
  // === STRATEGY & EXECUTION ===
  "📊 Always follow your plan — no impulsive decisions.",
  "📈 Let your winners run, don't exit too early out of fear.",
  "🎯 Focus on consistency, not one big win.",
  "🗺️ Plan the trade, then trade the plan.",
  "⏳ Wait for confirmation — don't anticipate, react.",

  // === PROFIT & GROWTH ===
  "💡 Small consistent gains compound into massive wealth.",
  "📈 Aim for monthly consistency, not daily home runs.",
  "🌱 Grow your account slowly — speed kills accounts.",
  "🔄 Reinvest profits wisely — don't increase risk too quickly.",
  "💼 Treat trading like a business, not a casino.",
  "⬆️ Scale up position size only after proven consistency.",
  
  // === MISTAKES TO AVOID ===
  "⛔ Don't revenge trade after a loss — walk away.",
  "🚫 Overtrading is the fastest way to blow an account.",
  "❌ Never add to a losing position hoping it will turn around.",
  "💸 Don't risk money you can't afford to lose.",
  "📵 Limit social media influence during active trades.",
  "🛑 Don't chase the market — if you missed the move, wait for next setup.",

  "📝 End each day with a trade review, win or lose.",
  "💭 Visualize successful trade execution before market opens.",
  "📊 Maintain a daily watchlist — don't scan everything.",

  "🏔️ The market rewards patience, not speed.",
  "🎓 Every loss is tuition — learn the lesson or repeat the class.",
  "🔄 Adaptability is key — markets change, so should strategies.",
  "🌈 The best traders are survivors first, profit-makers second."
];

const getRandomTip = () => {
  return tradingTips[Math.floor(Math.random() * tradingTips.length)];
};
  const loadTrades = async () => {
    try {
  const data = (await apiService.getTrades()) as TradeEntry[];

      // optional: sort latest first
      data.sort(
        (a, b) =>
          new Date(b.timestamp ?? "").getTime() -
          new Date(a.timestamp ?? "").getTime(),
      );

      setTrades(data);
    } catch (err) {
      showToast("Failed to load trades", "error");
    }
  };
  const loadBalance = async () => {
    try {
      const data = await apiService.getBalance();
      setBalance(data);
    } catch {
      showToast("Failed to load balance", "error");
    }
  };
  useEffect(() => {
  if (location.state?.showTip && !localStorage.getItem("tipShown")) {
    setTip(getRandomTip());
    setShowTipCard(true);
    localStorage.setItem("tipShown", "true");
  }
}, [location.state]);
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const today = getTodayDate();

        const todayData = await apiService.getTradesByDate(today);
        setFilteredTrades(todayData);

        const todayNotes = await apiService.getNotesByDate(getTodayDate());
        setNotes(todayNotes);
        await loadTrades();
        await loadBalance();
      } catch {
        showToast("Failed to load data", "error");
      }
    };

    loadInitialData();
  }, []);
  
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        if (selectedNoteFilterDate) {
          const data = await apiService.getNotesByDate(selectedNoteFilterDate);
          setNotes(data);
        } else {
          const all = await apiService.getNotes();
          setNotes(all);
        }
      } catch {
        showToast("Failed to filter notes", "error");
      }
    };

    fetchNotes();
  }, [selectedNoteFilterDate]);
  useEffect(() => {
    const fetchFilteredTrades = async () => {
      try {
        if (selectedDate) {
          const data = await apiService.getTradesByDate(selectedDate);
          setFilteredTrades(data);
        } else {
          setFilteredTrades(trades);
        }
      } catch {
        showToast("Failed to filter trades", "error");
      }
    };

    fetchFilteredTrades();
  }, [selectedDate, trades]);

  const handleUpdateBalance = async () => {
    if (!updateAmount || updateAmount === 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    try {
      const finalAmount =
        updateType === "add" ? Math.abs(updateAmount) : -Math.abs(updateAmount);

      const updated = await apiService.updateBalance(finalAmount);

      setBalance(updated);
      setShowUpdateModal(false);
      setUpdateAmount(0);
      showToast("Balance updated successfully!", "success");
    } catch {
      showToast("Failed to update balance", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      stockName: "",
      lots: "",
      entryTrade: "",
      exitTrade: "",
    });
    setProfitLossValue(0);
    setProfitLossType("profit");
  };

  const handleAddTrade = async () => {
    try {
      if (!formData.stockName.trim()) {
        showToast("Please enter stock name", "error");
        return;
      }

      if (!formData.lots || parseFloat(formData.lots) <= 0) {
        showToast("Enter valid lots", "error");
        return;
      }

      if (!formData.entryTrade || parseFloat(formData.entryTrade) <= 0) {
        showToast("Enter valid entry price", "error");
        return;
      }

      if (!formData.exitTrade || parseFloat(formData.exitTrade) <= 0) {
        showToast("Enter valid exit price", "error");
        return;
      }

      const finalProfitLoss =
        profitLossType === "profit"
          ? Math.abs(profitLossValue)
          : -Math.abs(profitLossValue);

      const newTrade: TradeEntry = {
  stockName: formData.stockName.toUpperCase(),
  lots: parseFloat(formData.lots),
  entryTrade: parseFloat(formData.entryTrade),
  exitTrade: parseFloat(formData.exitTrade),
  profitLossAmount: finalProfitLoss,
  resultStatus: profitLossType === "profit" ? "PROFIT" : "LOSS",
};
      console.log(newTrade);

      await apiService.addTrade(newTrade);

      await loadTrades();
      await loadBalance();
      showToast("Trade added successfully!", "success");
      resetForm();
    } catch {
      showToast("Failed to add trade", "error");
    }
  };
  const handleUpdateTrade = async () => {
    if (!editingTrade) return;

    try {
      const finalProfitLoss =
        profitLossType === "profit"
          ? Math.abs(profitLossValue)
          : -Math.abs(profitLossValue);

    const updated: TradeEntry = {
  stockName: formData.stockName.toUpperCase(),
  lots: parseFloat(formData.lots),
  entryTrade: parseFloat(formData.entryTrade),
  exitTrade: parseFloat(formData.exitTrade),
  profitLossAmount: finalProfitLoss,
  resultStatus: profitLossType === "profit" ? "PROFIT" : "LOSS",
};

    await apiService.updateTrade(editingTrade.id!, updated);

      await loadTrades();
      await loadBalance();

      setEditingTrade(null);
      showToast("Trade updated successfully!", "success");
      resetForm();
    } catch {
      showToast("Update failed", "error");
    }
  };

  const handleEditClick = (trade: TradeEntry) => {
    setEditingTrade(trade);
    setFormData({
      stockName: trade.stockName || "",
      lots: trade.lots.toString(),
      entryTrade: trade.entryTrade.toString(),
      exitTrade: trade.exitTrade.toString(),
    });
    const absProfitLoss = Math.abs(trade.profitLossAmount);
    setProfitLossValue(absProfitLoss);
    setProfitLossType(trade.resultStatus === "PROFIT" ? "profit" : "loss");
  };

  const handleDeleteTrade = async (id: number) => {
    try {
      await apiService.deleteTrade(id);
      await loadTrades();
      await loadBalance();
      showToast("Trade deleted successfully!", "success");
    } catch {
      showToast("Delete failed", "error");
    }
  };
  const loadNotes = async () => {
    try {
      const data = await apiService.getNotes();
      setNotes(data);
    } catch {
      showToast("Failed to load notes", "error");
    }
  };
  const handleAddNote = async () => {
    try {
      if (!newNote.trim()) {
        showToast("Please enter a note", "error");
        return;
      }

     const note: Partial<TradingNote> = {
  content: newNote.trim(),
  date: selectedNoteDate,
};

      await apiService.addNote(note);
      await loadNotes();

      setNewNote("");
      showToast("Note added successfully!", "success");
    } catch {
      showToast("Failed to add note", "error");
    }
  };
  const handleUpdateNote = async () => {
    if (!editingNote) return;

    try {
      const updated = {
        content: newNote.trim(),
        date: selectedNoteDate,
      };

      await apiService.updateNote(editingNote.id!, updated);
      await loadNotes();

      setEditingNote(null);
      setNewNote("");
      showToast("Note updated successfully!", "success");
    } catch {
      showToast("Update failed", "error");
    }
  };
  const handleDeleteNote = async (id: number) => {
    try {
      await apiService.deleteNote(id);
      await loadNotes();
      showToast("Note deleted successfully!", "success");
    } catch {
      showToast("Delete failed", "error");
    }
  };
const handleDownloadPDF =async () => {
  await apiService.downloadTradesPdf(selectedDate);
}
  const handleEditNote = (note: TradingNote) => {
    setEditingNote(note);
    setNewNote(note.content);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("tipShown")
    navigate("/");
    showToast("Logged out successfully!", "success");
  };

  const clearFilters = () => {
    setSelectedDate("");

  };
  const calculateTradesTotal = () => {
    return filteredTrades.reduce(
      (sum, trade) => sum + (trade.profitLossAmount ?? 0),
      0,
    );
  };
  const calculateOverallTotal = () => {
    return trades.reduce(
      (sum, trade) => sum + (trade.profitLossAmount ?? 0),
      0,
    );
  };
  const calculateDailyTotal = () => {
    return filteredTrades.reduce(
      (sum, trade) => sum + (trade.profitLossAmount ?? 0),
      0,
    );
  };

  const calculateWinRate = () => {
    const winningTrades = trades.filter((trade) => trade.profitLossAmount > 0);
    return trades.length > 0
      ? ((winningTrades.length / trades.length) * 100).toFixed(1)
      : "0";
  };

  const getDailyPerformance = () => {
    const today = new Date().toDateString();

    const todayTrades = trades.filter(
      (trade) =>
        trade.timestamp && new Date(trade.timestamp).toDateString() === today,
    );

    return todayTrades.reduce((sum, trade) => sum + trade.profitLossAmount, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    {showTipCard && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center">
      <h2 className="text-lg font-bold mb-3 text-gray-800">
        💡 Trading Tip
      </h2>

      <p className="text-gray-600 text-sm mb-5">
        {tip}
      </p>

      <button
        onClick={() => setShowTipCard(false)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        OK
      </button>
    </div>
  </div>
)}
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 animate-slideInRight max-w-sm`}
        >
          <div
            className={`rounded-lg shadow-lg p-3 backdrop-blur-lg border ${
              toast.type === "success"
                ? "bg-green-500/90 border-green-400"
                : "bg-red-500/90 border-red-400"
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === "success" ? (
                <TrendingUp className="w-4 h-4 text-white" />
              ) : (
                <TrendingDown className="w-4 h-4 text-white" />
              )}
              <p className="text-white text-sm">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-white/5 backdrop-blur-lg rounded-lg p-4 border border-white/10">
          <div>
            <h1 className="text-xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-white/60 text-xs mt-1">Welcome, Back</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500/20 hover:bg-red-500/30 text-white text-sm font-medium py-1.5 px-3 rounded-lg transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "dashboard"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-white/60 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "notes"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-white/60 hover:text-white"
            }`}
          >
            <NotebookPen className="w-4 h-4" />
            Notes
          </button>
          <button
  onClick={() => setActiveTab("expenses")}
  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
    activeTab === "expenses"
      ? "text-blue-400 border-b-2 border-blue-400"
      : "text-white/60 hover:text-white"
  }`}
>
  <DollarSign className="w-4 h-4" />
  Expenses
</button>

        </div>

        {/* Dashboard View */}
        {activeTab === "dashboard" && (
          <div className="space-y-5">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Balance Card */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-blue-100 text-xs font-medium">Balance</p>
                  <DollarSign className="w-4 h-4 text-blue-200" />
                </div>
                <h2 className="text-2xl font-bold mb-1">
                  ₹{(balance?.balance ?? 0).toLocaleString("en-IN")}
                </h2>
                <p className="text-blue-100 text-xs">
                  Updated:{" "}
                  {balance?.lastUpdated
                    ? new Date(balance.lastUpdated).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "Never"}
                </p>
                <button
                  onClick={() => setShowUpdateModal(true)}
                  className="mt-3 w-full bg-white/20 hover:bg-white/30 text-white text-xs font-medium py-1.5 rounded transition-all"
                >
                  Update Balance
                </button>
              </div>

              {/* Total P&L Card */}
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg shadow-lg p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-purple-100 text-xs font-medium">
                    Total P&L
                  </p>
                  {calculateOverallTotal() >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-300" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-300" />
                  )}
                </div>
                <h2
                  className={`text-2xl font-bold mb-1 ${calculateTradesTotal() >= 0 ? "text-green-300" : "text-red-300"}`}
                >
                  {calculateOverallTotal() >= 0 ? "+" : ""}₹
                  {calculateOverallTotal().toLocaleString("en-IN")}
                </h2>
                <p className="text-purple-100 text-xs">Overall P&L</p>
              </div>

              {/* Win Rate Card */}
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-lg p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-100 text-xs font-medium">Win Rate</p>
                  <Award className="w-4 h-4 text-green-200" />
                </div>
                <h2 className="text-2xl font-bold mb-1">
                  {calculateWinRate()}%
                </h2>
                <p className="text-green-100 text-xs">Winning Trades</p>
              </div>

              {/* Today's P&L Card */}
              <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg shadow-lg p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-orange-100 text-xs font-medium">
                    Today's P&L
                  </p>
                  <Calendar className="w-4 h-4 text-orange-200" />
                </div>
                <h2
                  className={`text-2xl font-bold mb-1 ${getDailyPerformance() >= 0 ? "text-green-300" : "text-red-300"}`}
                >
                  {getDailyPerformance() >= 0 ? "+" : ""}₹
                  {(getDailyPerformance() ?? 0).toLocaleString("en-IN")}
                </h2>
                <p className="text-orange-100 text-xs">Today's Performance</p>
              </div>
            </div>

            {/* Trading Form */}
            <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-5">
              <h3 className="text-base font-bold mb-4 text-white flex items-center gap-2">
                {editingTrade ? (
                  <Edit2 className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {editingTrade ? "Edit Trade" : "Add New Trade"}
              </h3>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-white text-xs font-medium mb-1">
                      Stock Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.stockName}
                      onChange={(e) =>
                        setFormData({ ...formData, stockName: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="e.g., AAPL"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-xs font-medium mb-1">
                      Lots <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.lots}
                      onChange={(e) =>
                        setFormData({ ...formData, lots: e.target.value })
                      }
                      step="0.01"
                      className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="Enter lots"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-xs font-medium mb-1">
                      Entry Trade (₹) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.entryTrade}
                      onChange={(e) =>
                        setFormData({ ...formData, entryTrade: e.target.value })
                      }
                      step="0.01"
                      className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="Enter price"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-xs font-medium mb-1">
                      Exit Trade (₹) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.exitTrade}
                      onChange={(e) =>
                        setFormData({ ...formData, exitTrade: e.target.value })
                      }
                      step="0.01"
                      className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="Enter price"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-xs font-medium mb-1">
                      P&L (₹) <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-2 mb-1">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          checked={profitLossType === "profit"}
                          onChange={() => setProfitLossType("profit")}
                          className="w-3 h-3"
                        />
                        <span className="text-green-400 text-xs">Profit</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          checked={profitLossType === "loss"}
                          onChange={() => setProfitLossType("loss")}
                          className="w-3 h-3"
                        />
                        <span className="text-red-400 text-xs">Loss</span>
                      </label>
                    </div>
                    <input
                      type="number"
                      value={profitLossValue}
                      onChange={(e) =>
                        setProfitLossValue(Number(e.target.value))
                      }
                      step="0.01"
                      className={`w-full px-3 py-2 text-sm bg-white/10 border rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 ${
                        profitLossType === "profit"
                          ? "border-green-500/50 focus:ring-green-500"
                          : "border-red-500/50 focus:ring-red-500"
                      }`}
                      placeholder="Enter amount"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={editingTrade ? handleUpdateTrade : handleAddTrade}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-2 rounded-lg hover:shadow-lg transition-all"
                  >
                    {editingTrade ? "Update Trade" : "Add Trade"}
                  </button>
                  {editingTrade && (
                    <button
                      onClick={() => {
                        setEditingTrade(null);
                        resetForm();
                      }}
                      className="px-4 py-2 bg-gray-500/50 text-white text-sm rounded-lg hover:bg-gray-500/70 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                {/* Trades Table View */}

                <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 overflow-hidden">
                  <div className="p-4 border-b border-white/10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <ClipboardList className="w-4 h-4" />
                          Trade History
                        </h3>
                        <p className="text-white/60 text-xs">
                          Showing {filteredTrades.length} of {trades.length}{" "}
                          trades
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="px-3 py-1.5 text-sm bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
<button
  onClick={handleDownloadPDF}
  className="px-3 py-1.5 text-sm bg-green-500/20 hover:bg-green-500/30 text-white rounded transition-all flex items-center gap-1"
>
  Download PDF
</button>
                        {selectedDate && (
                          <button
                            onClick={clearFilters}
                            className="px-3 py-1.5 text-sm bg-red-500/20 hover:bg-red-500/30 text-white rounded transition-all flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-white/60">
                            #
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-white/60">
                            Stock
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-white/60">
                            Lots
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-white/60">
                            Entry
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-white/60">
  Exit
</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-white/60">
                            P&L
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-white/60">
                            Status
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-white/60 hidden sm:table-cell">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-white/60">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {filteredTrades.map((trade, index) => (
                          <tr
                            key={trade.id}
                            className="hover:bg-white/5 transition"
                          >
                            <td className="px-4 py-2 text-sm text-white">
                              {index + 1}
                            </td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs font-medium">
                                {trade.stockName || "N/A"}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-white">
                              {trade.lots}
                            </td>
                            <td className="px-4 py-2 text-sm text-white">
                              ₹{(trade.entryTrade ?? 0).toLocaleString("en-IN")}
                            </td>
                            <td className="px-4 py-2 text-sm text-white">
  ₹{(trade.exitTrade ?? 0).toLocaleString("en-IN")}
</td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  trade.profitLossAmount >= 0
                                    ? "bg-green-500/20 text-green-300"
                                    : "bg-red-500/20 text-red-300"
                                }`}
                              >
                                {trade.profitLossAmount >= 0 ? "+" : ""}
                                {(trade.profitLossAmount ?? 0).toLocaleString(
                                  "en-IN",
                                )}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  trade.resultStatus === "PROFIT"
                                    ? "bg-green-500/20 text-green-300"
                                    : "bg-red-500/20 text-red-300"
                                }`}
                              >
                                {trade.resultStatus}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-xs text-white/60 hidden sm:table-cell">
                              {trade.timestamp
                                ? new Date(trade.timestamp).toLocaleDateString()
                                : "-"}
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditClick(trade)}
                                  className="text-blue-400 hover:text-blue-300 transition"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteId(trade.id!)}
                                  className="text-red-400 hover:text-red-300 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {filteredTrades.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center">
                              <div className="text-white/60">
                                <ClipboardList className="w-12 h-12 mx-auto mb-2 text-white/20" />
                                <p className="text-sm">No trades found</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                      {filteredTrades.length > 0 && (
                        <tfoot className="bg-white/5">
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-2 text-right text-sm font-medium text-white"
                            >
                              Day Total:
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  calculateTradesTotal() >= 0
                                    ? "bg-green-500/20 text-green-300"
                                    : "bg-red-500/20 text-red-300"
                                }`}
                              >
                                {calculateDailyTotal() >= 0 ? "+" : ""}₹
                                {calculateDailyTotal().toLocaleString("en-IN")}
                              </span>
                            </td>
                            <td colSpan={2}></td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes Tab - Notebook Style */}
        {activeTab === "notes" && (
          <div className="space-y-5">
            {/* Add Note Section */}
            <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-5">
              <h3 className="text-base font-bold mb-3 text-white flex items-center gap-2">
                <NotebookPen className="w-4 h-4" />
                {editingNote ? "Edit Note" : "Add New Note"}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-white text-xs font-medium mb-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedNoteDate}
                    onChange={(e) => setSelectedNoteDate(e.target.value)}
                    className="px-3 py-1.5 text-sm bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-white text-xs font-medium mb-1">
                    Your Notes
                  </label>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                    placeholder="Write your trading thoughts, strategies, or observations here..."
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={editingNote ? handleUpdateNote : handleAddNote}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {editingNote ? "Update Note" : "Save Note"}
                  </button>
                  {editingNote && (
                    <button
                      onClick={() => {
                        setEditingNote(null);
                        setNewNote("");
                      }}
                      className="px-4 py-2 bg-gray-500/50 text-white text-sm rounded-lg hover:bg-gray-500/70 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Notes Display Section */}
            <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-5">
              <h3 className="text-base font-bold mb-4 text-white flex items-center gap-2">
                <FileText className="w-4 h-4" />
                My Trading Notes
              </h3>
              <div className="mb-4 flex gap-2 items-center">
                <input
                  type="date"
                  value={selectedNoteFilterDate}
                  onChange={(e) => setSelectedNoteFilterDate(e.target.value)}
                  className="px-3 py-1.5 text-sm bg-white/10 border border-white/20 rounded text-white"
                />

                <button
                  onClick={() => setSelectedNoteFilterDate("")}
                  className="px-3 py-1.5 text-sm bg-red-500/20 text-white rounded"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white/10 rounded-lg p-3 border-l-2 border-blue-400"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <p className="text-sm text-white/90 flex-1 whitespace-pre-wrap">
                        {note.content}
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditNote(note)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mt-2">
                      <Clock className="w-3 h-3 text-white/40" />
                      <p className="text-xs text-white/40">
                        {new Date(note.date).toLocaleDateString()} |{" "}
                        {note.timestamp
                          ? new Date(note.timestamp).toLocaleTimeString()
                          : "-"}
                      </p>
                    </div>
                  </div>
                ))}

                {notes.length === 0 && (
                  <div className="text-center py-8">
                    <NotebookPen className="w-12 h-12 mx-auto mb-2 text-white/20" />
                    <p className="text-white/60 text-sm">No notes found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === "expenses" && (
  <Expenses showToast={showToast} />
)}
      </div>

      {/* Update Balance Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              Update Balance
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter amount to Add or Dedut
            </p>
            <div className="mb-3">
              <label className="text-sm font-medium">Type</label>
              <div className="flex gap-3 mt-1">
                <label>
                  <input
                    type="radio"
                    checked={updateType === "add"}
                    onChange={() => setUpdateType("add")}
                  />
                  <span className="ml-1 text-green-600">Add</span>
                </label>

                <label>
                  <input
                    type="radio"
                    checked={updateType === "deduct"}
                    onChange={() => setUpdateType("deduct")}
                  />
                  <span className="ml-1 text-red-600">Deduct</span>
                </label>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Amount ($)
              </label>
              <input
                type="number"
                value={updateAmount}
                onChange={(e) => setUpdateAmount(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Enter amount"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBalance}
              
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50 text-sm"
              >
                Update Balance
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80">
            <h3 className="text-lg font-bold mb-3">Confirm Delete</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this trade?
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border px-3 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await handleDeleteTrade(deleteId);
                  setDeleteId(null);
                }}
                className="flex-1 bg-red-500 text-white px-3 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
