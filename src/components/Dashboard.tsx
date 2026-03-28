import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Expense, Category } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { formatCurrency, cn } from '../lib/utils';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp } from 'lucide-react';

interface DashboardProps {
  expenses: Expense[];
  monthlyBudget: number;
}

export default function Dashboard({ expenses, monthlyBudget }: DashboardProps) {
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = monthlyBudget - totalSpent;
  const budgetPercentage = Math.min((totalSpent / monthlyBudget) * 100, 100);

  const categoryData = Object.entries(
    expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<Category, number>)
  ).map(([name, value]) => ({ name, value }));

  // Last 7 days data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const amount = expenses
      .filter(exp => exp.date === dateStr)
      .reduce((sum, exp) => sum + exp.amount, 0);
    return {
      date: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      amount
    };
  }).reverse();

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Financial Overview</h2>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Track your spending patterns and manage your budget.</p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-wider">Current Month</p>
          <p className="text-base md:text-lg font-bold">March 2026</p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 md:p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Wallet size={20} className="md:w-6 md:h-6" />
            </div>
            <span className="text-[10px] md:text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Budget</span>
          </div>
          <p className="text-gray-500 text-xs md:text-sm font-medium">Total Budget</p>
          <p className="text-xl md:text-2xl font-bold mt-1">{formatCurrency(monthlyBudget)}</p>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 md:p-3 bg-red-50 text-red-600 rounded-2xl">
              <TrendingUp size={20} className="md:w-6 md:h-6" />
            </div>
            <div className="flex items-center gap-1 text-red-600 text-[10px] md:text-xs font-bold">
              <ArrowUpRight size={14} />
              <span>12% inc</span>
            </div>
          </div>
          <p className="text-gray-500 text-xs md:text-sm font-medium">Total Spent</p>
          <p className="text-xl md:text-2xl font-bold mt-1">{formatCurrency(totalSpent)}</p>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 md:p-3 bg-green-50 text-green-600 rounded-2xl">
              <ArrowDownRight size={20} className="md:w-6 md:h-6" />
            </div>
            <span className="text-[10px] md:text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Safe</span>
          </div>
          <p className="text-gray-500 text-xs md:text-sm font-medium">Remaining</p>
          <p className="text-xl md:text-2xl font-bold mt-1">{formatCurrency(remainingBudget)}</p>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h3 className="font-bold text-sm md:text-lg">Budget Utilization</h3>
          <span className="text-[10px] md:text-sm font-bold text-gray-500">{Math.round(budgetPercentage)}% used</span>
        </div>
        <div className="h-2.5 md:h-4 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-1000 ease-out",
              budgetPercentage > 90 ? "bg-red-500" : budgetPercentage > 70 ? "bg-yellow-500" : "bg-black"
            )}
            style={{ width: `${budgetPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-3 md:mt-4 text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-sm md:text-lg mb-6">Spending by Category</h3>
          <div className="h-[200px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="80%"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as Category]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-6">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2 py-1 border-b border-gray-50 sm:border-none">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[cat.name as Category] }} />
                <span className="text-[10px] md:text-xs font-medium text-gray-600 truncate">{cat.name}</span>
                <span className="text-[10px] md:text-xs font-bold ml-auto">{formatCurrency(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-sm md:text-lg mb-6">Daily Spending</h3>
          <div className="h-[200px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 500, fill: '#9CA3AF' }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#000000" 
                  radius={[4, 4, 0, 0]} 
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
