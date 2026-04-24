import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Search,
  Save,
  FileText,
  Clock
} from 'lucide-react';
import type { AccountBalance, TradeEntry, TradingNote } from '../Parameters';

const HomePage = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<AccountBalance | null>(null);
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [notes, setNotes] = useState<TradingNote[]>([]);
  const [editingTrade, setEditingTrade] = useState<TradeEntry | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateAmount, setUpdateAmount] = useState<number>(0);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trades' | 'notes'>('dashboard');
  
  // State for filtering
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredTrades, setFilteredTrades] = useState<TradeEntry[]>([]);
  
  // State for profit/loss type
  const [profitLossType, setProfitLossType] = useState<'profit' | 'loss'>('profit');
  const [profitLossValue, setProfitLossValue] = useState<number>(0);
  
  // State for form inputs
  const [formData, setFormData] = useState({
    stockName: '',
    lots: '',
    entryTrade: '',
    exitTrade:'',
  });

  // State for notes
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<TradingNote | null>(null);
  const [selectedNoteDate, setSelectedNoteDate] = useState<string>(new Date().toDateString());
 const loadData = () => {
    // Load balance
    const savedBalance = localStorage.getItem('accountBalance');
    if (savedBalance) {
      setBalance(JSON.parse(savedBalance));
    } else {
      const initialBalance = { balance: 25000, lastUpdated: new Date().toISOString() };
      setBalance(initialBalance);
      localStorage.setItem('accountBalance', JSON.stringify(initialBalance));
    }

    // Load trades
    const savedTrades = localStorage.getItem('trades');
    if (savedTrades) {
      setTrades(JSON.parse(savedTrades));
    } else {
      const sampleTrades = [
        { id: 1, stockName: 'AAPL', lots: 2.5, entryTrade: 1850.50, exitTrade:2000, profitLoss: 125.75, timestamp: new Date().toISOString() },
        { id: 2, stockName: 'GOOGL', lots: 1.0, entryTrade: 1920.00,exitTrade:2040, profitLoss: -45.30, timestamp: new Date(Date.now() - 86400000).toISOString() },
        { id: 3, stockName: 'MSFT', lots: 3.0, entryTrade: 1780.25,exitTrade:1900, profitLoss: 89.50, timestamp: new Date(Date.now() - 172800000).toISOString() },
        { id: 4, stockName: 'TSLA', lots: 1.5, entryTrade: 1950.75, exitTrade:1000,profitLoss: -75.20, timestamp: new Date().toISOString() },
      ];
      setTrades(sampleTrades);
      localStorage.setItem('trades', JSON.stringify(sampleTrades));
    }

    // Load notes
    const savedNotes = localStorage.getItem('tradingNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else {
      const sampleNotes = [
        { id: 1, content: 'AAPL showing strong bullish momentum. Consider adding more positions.', date: new Date().toDateString(), timestamp: new Date().toISOString() },
        { id: 2, content: 'Market volatility expected due to Fed meeting tomorrow.', date: new Date().toDateString(), timestamp: new Date().toISOString() },
        { id: 3, content: 'TSLA broke key resistance level. Watch for continuation.', date: new Date(Date.now() - 86400000).toDateString(), timestamp: new Date(Date.now() - 86400000).toISOString() },
      ];
      setNotes(sampleNotes);
      localStorage.setItem('tradingNotes', JSON.stringify(sampleNotes));
    }
  };
  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      loadData();
    }
  }, [navigate]);

  // Filter trades
  useEffect(() => {
    let filtered = [...trades];
    
    if (selectedDate) {
      filtered = filtered.filter(trade => {
        if (!trade.timestamp) return false;
        const tradeDate = new Date(trade.timestamp).toDateString();
        const filterDate = new Date(selectedDate).toDateString();
        return tradeDate === filterDate;
      });
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(trade => 
        trade.stockName?.toLowerCase().includes(query) ||
        trade.lots.toString().includes(query) ||
        trade.entryTrade.toString().includes(query) ||
        trade.profitLoss.toString().includes(query)
      );
    }
    
    setFilteredTrades(filtered);
  }, [trades, selectedDate, searchQuery]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

 

  const updateBalance = (newBalance: AccountBalance) => {
    setBalance(newBalance);
    localStorage.setItem('accountBalance', JSON.stringify(newBalance));
    showToast('Balance updated successfully!', 'success');
  };

  const handleUpdateBalance = () => {
    if (!updateAmount || updateAmount === 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    setUpdateLoading(true);
    
    setTimeout(() => {
      if (balance) {
        const updatedBalance = {
          balance: balance.balance + updateAmount,
          lastUpdated: new Date().toISOString()
        };
        updateBalance(updatedBalance);
        setShowUpdateModal(false);
        setUpdateAmount(0);
      }
      setUpdateLoading(false);
    }, 500);
  };

  const resetForm = () => {
    setFormData({
      stockName: '',
      lots: '',
      entryTrade: '',
      exitTrade:'',
    });
    setProfitLossValue(0);
    setProfitLossType('profit');
  };

  const handleAddTrade = () => {
    if (!formData.stockName.trim()) {
      showToast('Please enter stock name', 'error');
      return;
    }
    if (!formData.lots || parseFloat(formData.lots) <= 0) {
      showToast('Please enter valid lots', 'error');
      return;
    }
    if (!formData.entryTrade || parseFloat(formData.entryTrade) <= 0) {
      showToast('Please enter valid entry trade value', 'error');
      return;
    }
    if (profitLossValue === 0) {
      showToast('Please enter profit/loss amount', 'error');
      return;
    }

    const finalProfitLoss = profitLossType === 'profit' ? Math.abs(profitLossValue) : -Math.abs(profitLossValue);
    
    const newTrade = {
      id: Date.now(),
      stockName: formData.stockName.toUpperCase(),
      lots: parseFloat(formData.lots),
      entryTrade: parseFloat(formData.entryTrade),
      profitLoss: finalProfitLoss,
      timestamp: new Date().toISOString()
    };
    
    const updatedTrades = [newTrade, ...trades];
    localStorage.setItem('trades', JSON.stringify(updatedTrades));
    showToast('Trade added successfully!', 'success');
    resetForm();
  };

  const handleUpdateTrade = () => {
    if (!editingTrade) return;
    
    if (!formData.stockName.trim()) {
      showToast('Please enter stock name', 'error');
      return;
    }
    if (!formData.lots || parseFloat(formData.lots) <= 0) {
      showToast('Please enter valid lots', 'error');
      return;
    }
    if (!formData.entryTrade || parseFloat(formData.entryTrade) <= 0) {
      showToast('Please enter valid entry trade value', 'error');
      return;
    }
    if (profitLossValue === 0) {
      showToast('Please enter profit/loss amount', 'error');
      return;
    }

    const finalProfitLoss = profitLossType === 'profit' ? Math.abs(profitLossValue) : -Math.abs(profitLossValue);
    
    const updatedTrades = trades.map(t => 
      t.id === editingTrade.id 
        ? { 
            ...t, 
            stockName: formData.stockName.toUpperCase(),
            lots: parseFloat(formData.lots),
            entryTrade: parseFloat(formData.entryTrade),
            profitLoss: finalProfitLoss,
            timestamp: new Date().toISOString()
          } 
        : t
    );
    
    setTrades(updatedTrades);
    localStorage.setItem('trades', JSON.stringify(updatedTrades));
    setEditingTrade(null);
    showToast('Trade updated successfully!', 'success');
    resetForm();
  };

  const handleEditClick = (trade: TradeEntry) => {
    setEditingTrade(trade);
    setFormData({
      stockName: trade.stockName || '',
      lots: trade.lots.toString(),
      entryTrade: trade.entryTrade.toString(),
      exitTrade:trade.exitTrade.toString(),
    });
    const absProfitLoss = Math.abs(trade.profitLoss);
    setProfitLossValue(absProfitLoss);
    setProfitLossType(trade.profitLoss >= 0 ? 'profit' : 'loss');
  };

  const handleDeleteTrade = (id: number) => {
    const updatedTrades = trades.filter(t => t.id !== id);
    setTrades(updatedTrades);
    localStorage.setItem('trades', JSON.stringify(updatedTrades));
    showToast('Trade deleted successfully!', 'success');
  };

  // Notes functions
  const handleAddNote = () => {
    if (!newNote.trim()) {
      showToast('Please enter a note', 'error');
      return;
    }

    const note: TradingNote = {
      id: Date.now(),
      content: newNote.trim(),
      date: selectedNoteDate,
      timestamp: new Date().toISOString()
    };

    const updatedNotes = [note, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem('tradingNotes', JSON.stringify(updatedNotes));
    setNewNote('');
    showToast('Note added successfully!', 'success');
  };

  const handleUpdateNote = () => {
    if (!editingNote) return;
    if (!newNote.trim()) {
      showToast('Please enter a note', 'error');
      return;
    }

    const updatedNotes = notes.map(note =>
      note.id === editingNote.id
        ? { ...note, content: newNote.trim(), timestamp: new Date().toISOString() }
        : note
    );

    setNotes(updatedNotes);
    localStorage.setItem('tradingNotes', JSON.stringify(updatedNotes));
    setEditingNote(null);
    setNewNote('');
    showToast('Note updated successfully!', 'success');
  };

  const handleDeleteNote = (id: number) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem('tradingNotes', JSON.stringify(updatedNotes));
    showToast('Note deleted successfully!', 'success');
  };

  const handleEditNote = (note: TradingNote) => {
    setEditingNote(note);
    setNewNote(note.content);
  };

  const getNotesByDate = (date: string) => {
    return notes.filter(note => note.date === date);
  };

  const getUniqueDates = () => {
    const dates = [...new Set(notes.map(note => note.date))];
    return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    navigate('/');
    showToast('Logged out successfully!', 'success');
  };

  const clearFilters = () => {
    setSelectedDate('');
    setSearchQuery('');
  };

  const calculateTotalPL = () => {
    return filteredTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  };

  const calculateWinRate = () => {
    const winningTrades = trades.filter(trade => trade.profitLoss > 0);
    return trades.length > 0 ? ((winningTrades.length / trades.length) * 100).toFixed(1) : '0';
  };

  const getDailyPerformance = () => {
    const today = new Date().toDateString();
    const todayTrades = trades.filter(trade => 
      new Date(trade.timestamp!).toDateString() === today
    );
    return todayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 animate-slideInRight max-w-sm`}>
          <div className={`rounded-lg shadow-lg p-3 backdrop-blur-lg border ${
            toast.type === 'success' 
              ? 'bg-green-500/90 border-green-400' 
              : 'bg-red-500/90 border-red-400'
          }`}>
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
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
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-white/60 text-xs mt-1">
              Welcome, Back
            </p>
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
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'trades'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Trades
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
              activeTab === 'notes'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <NotebookPen className="w-4 h-4" />
            Notes
          </button>
        </div>

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
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
                  ${balance?.balance.toLocaleString() || '0'}
                </h2>
                <p className="text-blue-100 text-xs">
                  Updated: {balance?.lastUpdated ? new Date(balance.lastUpdated).toLocaleDateString() : 'Never'}
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
                  <p className="text-purple-100 text-xs font-medium">Total P&L</p>
                  {calculateTotalPL() >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-300" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-300" />
                  )}
                </div>
                <h2 className={`text-2xl font-bold mb-1 ${calculateTotalPL() >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {calculateTotalPL() >= 0 ? '+' : ''}{calculateTotalPL().toLocaleString()}
                </h2>
                <p className="text-purple-100 text-xs">Overall P&L</p>
              </div>

              {/* Win Rate Card */}
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-lg p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-100 text-xs font-medium">Win Rate</p>
                  <Award className="w-4 h-4 text-green-200" />
                </div>
                <h2 className="text-2xl font-bold mb-1">{calculateWinRate()}%</h2>
                <p className="text-green-100 text-xs">Winning Trades</p>
              </div>

              {/* Today's P&L Card */}
              <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg shadow-lg p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-orange-100 text-xs font-medium">Today's P&L</p>
                  <Calendar className="w-4 h-4 text-orange-200" />
                </div>
                <h2 className={`text-2xl font-bold mb-1 ${getDailyPerformance() >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {getDailyPerformance() >= 0 ? '+' : ''}{getDailyPerformance().toLocaleString()}
                </h2>
                <p className="text-orange-100 text-xs">Today's Performance</p>
              </div>
            </div>

            {/* Trading Form */}
            <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-5">
              <h3 className="text-base font-bold mb-4 text-white flex items-center gap-2">
                {editingTrade ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingTrade ? 'Edit Trade' : 'Add New Trade'}
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
                      onChange={(e) => setFormData({...formData, stockName: e.target.value})}
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
                      onChange={(e) => setFormData({...formData, lots: e.target.value})}
                      step="0.01"
                      className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="Enter lots"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white text-xs font-medium mb-1">
                      Entry Trade ($) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.entryTrade}
                      onChange={(e) => setFormData({...formData, entryTrade: e.target.value})}
                      step="0.01"
                      className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="Enter price"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-xs font-medium mb-1">
                      Exit Trade ($) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.exitTrade}
                      onChange={(e) => setFormData({...formData, exitTrade: e.target.value})}
                      step="0.01"
                      className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="Enter price"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white text-xs font-medium mb-1">
                      P&L ($) <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-2 mb-1">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          checked={profitLossType === 'profit'}
                          onChange={() => setProfitLossType('profit')}
                          className="w-3 h-3"
                        />
                        <span className="text-green-400 text-xs">Profit</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          checked={profitLossType === 'loss'}
                          onChange={() => setProfitLossType('loss')}
                          className="w-3 h-3"
                        />
                        <span className="text-red-400 text-xs">Loss</span>
                      </label>
                    </div>
                    <input
                      type="number"
                      value={profitLossValue}
                      onChange={(e) => setProfitLossValue(parseFloat(e.target.value) || 0)}
                      step="0.01"
                      className={`w-full px-3 py-2 text-sm bg-white/10 border rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 ${
                        profitLossType === 'profit'
                          ? 'border-green-500/50 focus:ring-green-500'
                          : 'border-red-500/50 focus:ring-red-500'
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
                    {editingTrade ? 'Update Trade' : 'Add Trade'}
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
              </div>
            </div>
          </div>
        )}

        {/* Trades Table View */}
        {activeTab === 'trades' && (
          <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    Trade History
                  </h3>
                  <p className="text-white/60 text-xs">
                    Showing {filteredTrades.length} of {trades.length} trades
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="relative">
                    <Search className="absolute left-2 top-1.5 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search trades..."
                      className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-sm bg-white/10 border border-white/20 rounded text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1.5 text-sm bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />

                  {(selectedDate || searchQuery) && (
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
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/60">#</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/60">Stock</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/60">Lots</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/60">Entry</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/60">P&L</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/60 hidden sm:table-cell">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-white/60">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredTrades.map((trade, index) => (
                    <tr key={trade.id} className="hover:bg-white/5 transition">
                      <td className="px-4 py-2 text-sm text-white">{index + 1}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs font-medium">
                          {trade.stockName || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-white">{trade.lots}</td>
                      <td className="px-4 py-2 text-sm text-white">${trade.entryTrade.toLocaleString()}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          trade.profitLoss >= 0 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {trade.profitLoss >= 0 ? '+' : ''}{trade.profitLoss.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs text-white/60 hidden sm:table-cell">
                        {trade.timestamp ? new Date(trade.timestamp).toLocaleDateString() : '-'}
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
                            onClick={() => trade.id && handleDeleteTrade(trade.id)}
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
                      <td colSpan={4} className="px-4 py-2 text-right text-sm font-medium text-white">Total P&L:</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          calculateTotalPL() >= 0 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {calculateTotalPL() >= 0 ? '+' : ''}{calculateTotalPL().toLocaleString()}
                        </span>
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        {/* Notes Tab - Notebook Style */}
        {activeTab === 'notes' && (
          <div className="space-y-5">
            {/* Add Note Section */}
            <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-5">
              <h3 className="text-base font-bold mb-3 text-white flex items-center gap-2">
                <NotebookPen className="w-4 h-4" />
                {editingNote ? 'Edit Note' : 'Add New Note'}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-white text-xs font-medium mb-1">Select Date</label>
                  <input
                    type="date"
                    value={selectedNoteDate}
                    onChange={(e) => setSelectedNoteDate(e.target.value)}
                    className="px-3 py-1.5 text-sm bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-xs font-medium mb-1">Your Notes</label>
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
                    {editingNote ? 'Update Note' : 'Save Note'}
                  </button>
                  {editingNote && (
                    <button
                      onClick={() => {
                        setEditingNote(null);
                        setNewNote('');
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
              
              <div className="space-y-6">
                {getUniqueDates().map(date => (
                  <div key={date} className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <h4 className="text-sm font-semibold text-white">
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h4>
                      <span className="text-xs text-white/40">
                        ({getNotesByDate(date).length} notes)
                      </span>
                    </div>
                    
                    <div className="space-y-3 pl-2">
                      {getNotesByDate(date).map(note => (
                        <div key={note.id} className="bg-white/10 rounded-lg p-3 border-l-2 border-blue-400">
                          <div className="flex justify-between items-start gap-3">
                            <p className="text-sm text-white/90 flex-1 whitespace-pre-wrap">{note.content}</p>
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleEditNote(note)}
                                className="text-blue-400 hover:text-blue-300 transition"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="text-red-400 hover:text-red-300 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-2">
                            <Clock className="w-3 h-3 text-white/40" />
                            <p className="text-xs text-white/40">
                              {new Date(note.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {notes.length === 0 && (
                  <div className="text-center py-8">
                    <NotebookPen className="w-12 h-12 mx-auto mb-2 text-white/20" />
                    <p className="text-white/60 text-sm">No notes yet. Start adding your trading thoughts!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Update Balance Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Update Balance</h3>
            <p className="text-sm text-gray-600 mb-4">Enter amount to add or subtract</p>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Amount ($)</label>
              <input
                type="number"
                value={updateAmount}
                onChange={(e) => setUpdateAmount(parseFloat(e.target.value))}
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
                disabled={updateLoading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50 text-sm"
              >
                {updateLoading ? 'Updating...' : 'Update Balance'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;