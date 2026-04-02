import React, { useState, useEffect, useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Select, { components } from 'react-select';
import api from '../lib/api-client';
import { format } from 'date-fns';

const ITEMS_PER_PAGE = 15;

// Custom styles for react-select to match our dark theme
const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: state.isFocused ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.08)',
    borderRadius: '0.75rem',
    minHeight: '32px',
    fontSize: '13px',
    boxShadow: state.isFocused ? '0 0 0 1px rgba(59,130,246,0.2)' : 'none',
    '&:hover': { borderColor: 'rgba(255,255,255,0.15)' },
    cursor: 'pointer',
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#0f172a',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    zIndex: 9999,
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
  }),
  menuList: (base) => ({
    ...base,
    padding: '4px',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected 
      ? 'rgba(59,130,246,0.2)' 
      : state.isFocused 
        ? 'rgba(255,255,255,0.04)' 
        : 'transparent',
    color: state.isSelected ? '#60a5fa' : '#94a3b8',
    fontSize: '13px',
    borderRadius: '0.5rem',
    padding: '8px 12px',
    cursor: 'pointer',
    '&:active': { backgroundColor: 'rgba(59,130,246,0.15)' },
  }),
  singleValue: (base) => ({
    ...base,
    color: '#94a3b8',
    fontSize: '13px',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#475569',
    fontSize: '13px',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#475569',
    padding: '4px',
    '&:hover': { color: '#94a3b8' },
  }),
  input: (base) => ({
    ...base,
    color: '#e2e8f0',
    fontSize: '13px',
  }),
};

// Sleek styles for in-table selects
const tableSelectStyles = {
  ...selectStyles,
  control: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? 'rgba(255,255,255,0.06)' : 'transparent',
    borderColor: 'transparent',
    borderRadius: '0.5rem',
    minHeight: '28px',
    boxShadow: 'none',
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)' },
    cursor: 'pointer',
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 8px',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#475569',
    padding: '0 8px 0 0',
    '&:hover': { color: '#94a3b8' },
  }),
};

// Custom Option with color dot
const CategoryOption = (props) => (
  <components.Option {...props}>
    <div className="flex items-center gap-2">
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: props.data.color || '#6b7280' }} />
      <span className={`text-sm ${props.isSelected ? 'text-blue-400 font-medium' : 'text-slate-400'}`}>{props.data.label}</span>
    </div>
  </components.Option>
);

// Custom SingleValue with color dot
const CategoryValue = (props) => (
  <components.SingleValue {...props}>
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: props.data.color || '#6b7280' }} />
      <span className="text-sm text-slate-400">{props.data.label}</span>
    </div>
  </components.SingleValue>
);

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [txRes, catRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/categories')
      ]);
      setTransactions(txRes.data.data);
      setCategories(catRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async (txId, selectedOption) => {
    const categoryId = selectedOption?.value || '';
    try {
      const res = await api.patch(`/transactions/${txId}`, { categoryId });
      setTransactions(transactions.map(t => 
        t._id === txId ? { ...t, category: res.data.data.category } : t
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const categoryOptions = useMemo(() => {
    return categories.map(c => ({
      value: c._id,
      label: c.name,
      color: c.color,
    }));
  }, [categories]);

  const categoryFilterOptions = useMemo(() => {
    return [{ value: null, label: 'All Categories', color: '#94a3b8' }, ...categoryOptions];
  }, [categoryOptions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.merchantName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesCat = !filterCategory || t.category?._id === filterCategory;
      return matchesSearch && matchesType && matchesCat;
    });
  }, [transactions, searchTerm, filterType, filterCategory]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterCategory]);

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Transactions</h1>
          <p className="text-sm text-slate-500 mt-1">{filteredTransactions.length} transactions found</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
            <input 
              type="text" placeholder="Search..." 
              className="w-full bg-white/[0.04] border border-white/[0.08] text-white rounded-xl py-2 pl-9 pr-4 text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category filter */}
          <div className="w-40">
            <Select
              options={categoryFilterOptions}
              value={categoryFilterOptions.find(o => o.value === filterCategory) || categoryFilterOptions[0]}
              onChange={(opt) => setFilterCategory(opt?.value || null)}
              styles={selectStyles}
              isSearchable={false}
              components={{ Option: CategoryOption }}
            />
          </div>
          
          <div className="flex items-center rounded-xl border border-white/[0.08] overflow-hidden">
            {['all', 'Debit', 'Credit'].map((type) => (
              <button key={type} onClick={() => setFilterType(type)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  filterType === type ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
                }`}
              >
                {type === 'all' ? 'All' : type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Merchant</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                      <span className="text-sm text-slate-500">Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <Search className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                    <span className="text-sm text-slate-500 block">No transactions found</span>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap tabular-nums">
                      {format(new Date(tx.date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          tx.type === 'Credit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {tx.type === 'Credit' ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                            {tx.merchantName || 'Unknown'}
                          </p>
                          <p className="text-[11px] text-slate-600 truncate max-w-[260px]" title={tx.description}>
                            {tx.description?.slice(0, 60)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2" style={{ minWidth: '170px' }}>
                      <Select
                        value={categoryOptions.find(o => o.value === tx.category?._id) || null}
                        options={categoryOptions}
                        onChange={(opt) => handleCategoryChange(tx._id, opt)}
                        styles={tableSelectStyles}
                        placeholder="Select..."
                        components={{ Option: CategoryOption, SingleValue: CategoryValue }}
                        menuPlacement="auto"
                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                        isSearchable={true}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-semibold tabular-nums ${
                        tx.type === 'Credit' ? 'text-emerald-400' : 'text-slate-300'
                      }`}>
                        {tx.type === 'Credit' ? '+' : '-'}₹{tx.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-500 tabular-nums">
                      ₹{tx.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page;
                if (totalPages <= 5) page = i + 1;
                else if (currentPage <= 3) page = i + 1;
                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                else page = currentPage - 2 + i;
                return (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                      currentPage === page ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 hover:bg-white/[0.06]'
                    }`}
                  >{page}</button>
                );
              })}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
