import React, { useState } from 'react';
import { LayoutDashboard, ReceiptText, IndianRupee, PieChart, Settings, PlusCircle, LogOut, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { User } from 'firebase/auth';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200",
      active 
        ? "bg-black text-white shadow-lg" 
        : "text-gray-500 hover:bg-gray-100 hover:text-black"
    )}
  >
    <Icon size={20} />
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const NavItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 flex-1 py-2 transition-all duration-200",
      active ? "text-black" : "text-gray-400"
    )}
  >
    <Icon size={20} className={cn(active && "scale-110")} />
    <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
  </button>
);

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddClick: () => void;
  user: User;
  onLogout: () => void;
}

export default function Layout({ children, activeTab, setActiveTab, onAddClick, user, onLogout }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-black font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-gray-200 p-6 flex-col gap-8 bg-white shrink-0">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
            <IndianRupee size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">RupeeWise</h1>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={ReceiptText} 
            label="Transactions" 
            active={activeTab === 'transactions'} 
            onClick={() => setActiveTab('transactions')} 
          />
          <SidebarItem 
            icon={PieChart} 
            label="Analytics" 
            active={activeTab === 'analytics'} 
            onClick={() => setActiveTab('analytics')} 
          />
          <SidebarItem 
            icon={Settings} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
        </nav>

        <div className="mt-auto flex flex-col gap-6">
          <button
            onClick={onAddClick}
            className="flex items-center justify-center gap-2 w-full py-3 bg-black text-white rounded-xl font-semibold shadow-xl hover:scale-[1.02] transition-transform active:scale-95"
          >
            <PlusCircle size={20} />
            Add Expense
          </button>
          
          <div className="pt-6 border-t border-gray-100 flex flex-col gap-4">
            <div className="flex items-center gap-3 px-2">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                alt={user.displayName || 'User'} 
                className="w-10 h-10 rounded-full border border-gray-200"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{user.displayName}</p>
                <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            
            <button 
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:text-red-500 transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
            <IndianRupee size={18} />
          </div>
          <span className="font-bold tracking-tight">RupeeWise</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onAddClick}
            className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          >
            <PlusCircle size={18} />
          </button>
          <img 
            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
            alt={user.displayName || 'User'} 
            className="w-8 h-8 rounded-full border border-gray-200"
            referrerPolicy="no-referrer"
            onClick={() => setIsMobileMenuOpen(true)}
          />
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200">
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white p-6 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold">Account</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-col items-center text-center gap-3 mb-8">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                alt={user.displayName || 'User'} 
                className="w-20 h-20 rounded-full border-4 border-gray-50 shadow-md"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="font-bold">{user.displayName}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100">
              <button 
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-red-500 font-bold"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-20 pb-24 md:pt-10 md:pb-10 px-4 md:px-10">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-100 flex items-center px-2 z-40 pb-safe">
        <NavItem 
          icon={LayoutDashboard} 
          label="Home" 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
        />
        <NavItem 
          icon={ReceiptText} 
          label="History" 
          active={activeTab === 'transactions'} 
          onClick={() => setActiveTab('transactions')} 
        />
        <NavItem 
          icon={PieChart} 
          label="Stats" 
          active={activeTab === 'analytics'} 
          onClick={() => setActiveTab('analytics')} 
        />
        <NavItem 
          icon={Settings} 
          label="Settings" 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')} 
        />
      </nav>
    </div>
  );
}


