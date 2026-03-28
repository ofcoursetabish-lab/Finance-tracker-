/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import ConfirmationDialog from './components/ConfirmationDialog';
import { Expense, Category } from './types';
import { IndianRupee, LogIn, PieChart as PieChartIcon, TrendingUp, Calendar, ArrowRight, User as UserIcon, Shield, Bell, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import { CATEGORY_COLORS } from './constants';
import { formatCurrency } from './lib/utils';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState(50000);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Listeners
  useEffect(() => {
    if (!user) {
      setExpenses([]);
      return;
    }

    const expensesQuery = query(
      collection(db, 'expenses'),
      where('uid', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];
      setExpenses(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'expenses');
    });

    const budgetDoc = doc(db, 'budgets', user.uid);
    const unsubscribeBudget = onSnapshot(budgetDoc, (snapshot) => {
      if (snapshot.exists()) {
        setMonthlyBudget(snapshot.data().monthlyLimit);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `budgets/${user.uid}`);
    });

    return () => {
      unsubscribeExpenses();
      unsubscribeBudget();
    };
  }, [user]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAddExpense = async (data: Omit<Expense, 'id'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'expenses'), {
        ...data,
        uid: user.uid,
        createdAt: serverTimestamp(),
      });
      setIsFormOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'expenses');
    }
  };

  const handleUpdateExpense = async (data: Omit<Expense, 'id'>) => {
    if (!user || !editingExpense) return;
    try {
      const expenseDoc = doc(db, 'expenses', editingExpense.id);
      await updateDoc(expenseDoc, {
        ...data,
        uid: user.uid,
      });
      setEditingExpense(undefined);
      setIsFormOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `expenses/${editingExpense.id}`);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!user) return;
    setExpenseToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!user || !expenseToDelete) return;
    try {
      await deleteDoc(doc(db, 'expenses', expenseToDelete));
      setIsConfirmOpen(false);
      setExpenseToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `expenses/${expenseToDelete}`);
    }
  };

  const handleUpdateBudget = async (limit: number) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'budgets', user.uid), {
        monthlyLimit: limit,
        uid: user.uid
      });
      setMonthlyBudget(limit);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `budgets/${user.uid}`);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white animate-pulse">
            <IndianRupee size={28} />
          </div>
          <p className="text-gray-400 font-medium animate-pulse">Initializing RupeeWise...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F9FA] p-4 md:p-6">
        <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-[32px] md:rounded-[40px] shadow-2xl border border-gray-100 text-center space-y-6 md:space-y-8">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-[24px] md:rounded-[28px] flex items-center justify-center text-white mx-auto shadow-xl">
            <IndianRupee size={32} className="md:w-10 md:h-10" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome to RupeeWise</h1>
            <p className="text-sm md:text-base text-gray-500 mt-3">Smart expense tracking for the modern Indian user. Secure, fast, and insightful.</p>
          </div>
          <button
            onClick={handleLogin}
            className="w-full py-3.5 md:py-4 bg-black text-white rounded-2xl font-bold shadow-xl hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center gap-3"
          >
            <LogIn size={20} />
            Continue with Google
          </button>
          <p className="text-[10px] md:text-xs text-gray-400">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      onAddClick={() => {
        setEditingExpense(undefined);
        setIsFormOpen(true);
      }}
      user={user}
      onLogout={handleLogout}
    >
      {activeTab === 'dashboard' && (
        <Dashboard expenses={expenses} monthlyBudget={monthlyBudget} />
      )}
      
      {activeTab === 'transactions' && (
        <ExpenseList 
          expenses={expenses} 
          onDelete={handleDeleteExpense}
          onEdit={(exp) => {
            setEditingExpense(exp);
            setIsFormOpen(true);
          }}
        />
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <header>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Financial Insights</h2>
            <p className="text-gray-500 mt-1 text-sm md:text-base">Deeper analysis of your spending habits.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <TrendingUp size={20} />
                </div>
                <h3 className="font-bold text-lg">Spending Trend</h3>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={expenses.slice(0, 10).reverse()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#9CA3AF' }}
                      tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#000" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#000', strokeWidth: 0 }} 
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <PieChartIcon size={20} />
                </div>
                <h3 className="font-bold text-lg">Category Distribution</h3>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(
                        expenses.reduce((acc, exp) => {
                          acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
                          return acc;
                        }, {} as Record<Category, number>)
                      ).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="80%"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {Object.keys(CATEGORY_COLORS).map((cat, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[cat as Category]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-black text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Smart Saving Tip</h3>
              <p className="text-gray-400 max-w-md">Based on your spending, you could save ₹2,500 more this month by reducing "Entertainment" expenses by 15%.</p>
              <button className="mt-6 flex items-center gap-2 text-sm font-bold bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl transition-colors">
                View Full Report <ArrowRight size={16} />
              </button>
            </div>
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-8 animate-in fade-in duration-500">
          <header>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h2>
            <p className="text-gray-500 mt-1 text-sm md:text-base">Manage your account and app preferences.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gray-50 text-gray-600 rounded-xl">
                  <Wallet size={20} />
                </div>
                <h3 className="font-bold">Budget Settings</h3>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Monthly Limit (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-lg">₹</span>
                  <input 
                    type="number" 
                    value={monthlyBudget}
                    onChange={(e) => handleUpdateBudget(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xl font-bold focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gray-50 text-gray-600 rounded-xl">
                  <UserIcon size={20} />
                </div>
                <h3 className="font-bold">Profile</h3>
              </div>
              <div className="flex items-center gap-4">
                <img src={user.photoURL || ''} alt="" className="w-14 h-14 rounded-2xl object-cover" />
                <div>
                  <p className="font-bold">{user.displayName}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center gap-3">
              <Shield size={20} className="text-gray-400" />
              <h3 className="font-bold">Preferences</h3>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Bell size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Budget Alerts</p>
                    <p className="text-xs text-gray-400">Notify when 80% of budget is used</p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-black rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Weekly Reports</p>
                    <p className="text-xs text-gray-400">Receive summary every Sunday</p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <ExpenseForm 
          onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
          onClose={() => {
            setIsFormOpen(false);
            setEditingExpense(undefined);
          }}
          initialData={editingExpense}
        />
      )}

      <ConfirmationDialog 
        isOpen={isConfirmOpen}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
          setExpenseToDelete(null);
        }}
        confirmText="Delete"
        variant="danger"
      />
    </Layout>
  );
}


