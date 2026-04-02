import React, { useState, useEffect } from 'react';
import { ArrowDownRight, ArrowUpRight, Activity, TrendingUp, TrendingDown, Wallet, Download, Coffee, CreditCard, PiggyBank, PieChart as PieChartIcon, BarChart3, RefreshCcw } from 'lucide-react';
import { ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import api from '../lib/api-client';

ChartJS.register(ArcElement, ChartTooltip);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchAnalytics();
    fetchRecentTransactions();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/transactions/analytics');
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      setRecentTransactions(res.data.data.slice(0, 8));
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await api.get('/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'fintrack_categorized_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm("Are you sure you want to completely reset all your transactions? This cannot be undone.")) return;
    try {
      setLoading(true);
      await api.delete('/transactions/all');
      await fetchAnalytics();
      await fetchRecentTransactions();
    } catch (err) {
      console.error('Reset failed:', err);
      setLoading(false);
    }
  };

  const fmt = (amount) => `₹${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtShort = (amount) => `₹${Math.abs(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  // Removed custom PieTooltip as chartjs handles it elegantly

  // Custom tooltip for bar
  const BarTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
        <p className="text-xs text-slate-400 mb-2">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-slate-400">{p.name}:</span>
            <span className="font-semibold text-white">{fmtShort(p.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { insights } = data;

  const kpiCards = [
    { title: 'Total Spent', value: fmt(data.totalSpent), icon: TrendingUp, iconBg: 'bg-rose-500/15', iconColor: 'text-rose-400', borderColor: 'border-rose-500/20' },
    { title: 'Total Income', value: fmt(data.totalIncome), icon: TrendingDown, iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-400', borderColor: 'border-emerald-500/20' },
    { title: 'Current Balance', value: fmt(data.currentBalance), icon: Wallet, iconBg: 'bg-blue-500/15', iconColor: 'text-blue-400', borderColor: 'border-blue-500/20' },
    { title: 'Transactions', value: data.transactionCount.toLocaleString('en-IN'), icon: Activity, iconBg: 'bg-violet-500/15', iconColor: 'text-violet-400', borderColor: 'border-violet-500/20' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Financial Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Track your spending patterns and income</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleResetData} className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium transition-all w-fit">
            <RefreshCcw className="w-4 h-4" />
            Reset Data
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white rounded-xl text-sm font-medium transition-all hover:border-white/[0.15] w-fit">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className={`relative overflow-hidden rounded-2xl border ${card.borderColor} bg-white/[0.02] p-4 sm:p-5 transition-all hover:bg-white/[0.04] group`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">{card.title}</p>
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>
              <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-white tracking-tight tabular-nums">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Monthly Trend Bar Chart + Pie Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Bar chart - monthly income vs expense */}
        <div className="lg:col-span-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Monthly Trend
          </h3>
          <p className="text-xs text-slate-600 mb-4">Income vs Expenses over time</p>
          
          {insights.monthlyTrend.length > 0 ? (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={insights.monthlyTrend} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <RechartsTooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="spent" name="Spent" fill="#f87171" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[260px] flex flex-col items-center justify-center">
              <BarChart3 className="w-8 h-8 text-slate-700 mb-2" />
              <p className="text-sm text-slate-500">No data available</p>
            </div>
          )}
        </div>

        {/* Pie chart */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
            <PieChartIcon className="w-4 h-4 text-purple-400" />
            Expense Breakdown
          </h3>
          <p className="text-xs text-slate-600 mb-3">By category</p>

          {data.categoryBreakdown.filter(c => c.name !== 'Income').length > 0 ? (
            <>
              <div className="h-[180px] flex items-center justify-center relative">
                <Doughnut 
                  data={{
                    labels: data.categoryBreakdown.filter(c => c.name !== 'Income').map(c => c.name),
                    datasets: [{
                      data: data.categoryBreakdown.filter(c => c.name !== 'Income').map(c => c.value),
                      backgroundColor: data.categoryBreakdown.filter(c => c.name !== 'Income').map(c => c.fill),
                      borderWidth: 0,
                      hoverOffset: 4
                    }]
                  }}
                  options={{
                    cutout: '75%',
                    maintainAspectRatio: false,
                    plugins: {
                      tooltip: {
                        backgroundColor: '#0f172a',
                        titleColor: '#94a3b8',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                          label: (ctx) => ` ₹${ctx.raw.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                        }
                      }
                    }
                  }}
                />
              </div>
              {/* Legend */}
              <div className="grid grid-cols-2 gap-1.5 mt-4">
                {data.categoryBreakdown.filter(c => c.name !== 'Income').slice(0, 8).map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2 text-[11px]">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.fill }} />
                    <span className="text-slate-500 truncate">{cat.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center">
              <PieChartIcon className="w-8 h-8 text-slate-700 mb-2" />
              <p className="text-sm text-slate-500">No categorized data</p>
            </div>
          )}
        </div>
      </div>

      {/* Insights Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Coffee/Snack Factor */}
        <div className="rounded-2xl border border-amber-500/15 bg-white/[0.02] p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Coffee className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Snack Factor</p>
              <p className="text-[11px] text-slate-600">Small F&D hits (&lt;₹500)</p>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400">{insights.coffeeSnackFactor.count}</span>
            <span className="text-sm text-slate-500">transactions</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Totalling {fmtShort(insights.coffeeSnackFactor.totalSpent)}</p>
        </div>

        {/* Subscription Leaks */}
        <div className="rounded-2xl border border-purple-500/15 bg-white/[0.02] p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Subscriptions</p>
              <p className="text-[11px] text-slate-600">Recurring digital costs</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {Object.entries(insights.subscriptions).length > 0 ? (
              Object.entries(insights.subscriptions).slice(0, 4).map(([name, d]) => (
                <div key={name} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{name}</span>
                  <span className="text-white font-medium tabular-nums">{fmtShort(d.total)} ({d.count}x)</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-600">No subscriptions detected</p>
            )}
          </div>
        </div>

        {/* Investment Ratio */}
        <div className="rounded-2xl border border-emerald-500/15 bg-white/[0.02] p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <PiggyBank className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Investment Ratio</p>
              <p className="text-[11px] text-slate-600">vs total income</p>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">{insights.investmentRatio}%</span>
            <span className="text-sm text-slate-500">of income</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Total invested: {fmtShort(insights.investmentTotal)}</p>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(insights.investmentRatio, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Recent Activity + Top Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-400" />
              Recent Activity
            </h3>
            <span className="text-xs text-slate-600">{recentTransactions.length} latest</span>
          </div>
          <p className="text-xs text-slate-600 mb-3">Your most recent transactions</p>
          <div className="flex-1 space-y-0.5">
            {recentTransactions.length > 0 ? recentTransactions.map((tx) => (
              <div key={tx._id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/[0.03] transition-colors group">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${tx.type === 'Credit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {tx.type === 'Credit' ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-300 truncate group-hover:text-white transition-colors">
                      {tx.merchantName || tx.description?.slice(0, 40)}
                    </p>
                    <p className="text-[11px] text-slate-600">{new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold whitespace-nowrap ml-3 tabular-nums ${tx.type === 'Credit' ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {tx.type === 'Credit' ? '+' : '-'}{fmtShort(tx.amount)}
                </span>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Activity className="w-6 h-6 text-slate-600 mb-2" />
                <p className="text-sm text-slate-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Top spending categories */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Top Spending</h3>
          <p className="text-xs text-slate-600 mb-4">Excluding transfers & investments</p>
          <div className="space-y-3">
            {insights.topSpending.length > 0 ? insights.topSpending.map((cat, i) => {
              const maxVal = insights.topSpending[0].value;
              const pct = maxVal > 0 ? (cat.value / maxVal) * 100 : 0;
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.fill }} />
                      <span className="text-sm text-slate-400">{cat.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-white tabular-nums">{fmtShort(cat.value)}</span>
                  </div>
                  <div className="w-full bg-slate-800/50 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cat.fill }} />
                  </div>
                </div>
              );
            }) : (
              <p className="text-xs text-slate-600">Upload a statement to see spending</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
