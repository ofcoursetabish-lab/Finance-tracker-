import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Expense, Category } from '../types';
import { CATEGORIES } from '../constants';
import { X } from 'lucide-react';

const expenseSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  category: z.string().min(1, 'Please select a category'),
  description: z.string().min(1, 'Description is required').max(50),
  date: z.string().min(1, 'Date is required'),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  onSubmit: (data: Omit<Expense, 'id'>) => void;
  onClose: () => void;
  initialData?: Expense;
}

export default function ExpenseForm({ onSubmit, onClose, initialData }: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: initialData ? {
      amount: initialData.amount,
      category: initialData.category,
      description: initialData.description,
      date: initialData.date,
    } : {
      date: new Date().toISOString().split('T')[0],
    },
  });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
              {initialData ? 'Edit Expense' : 'New Expense'}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                placeholder="0.00"
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1 font-medium">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
              <select
                {...register('category')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-black/5 transition-all appearance-none"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1 font-medium">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
              <input
                type="text"
                {...register('description')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                placeholder="What was this for?"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1 font-medium">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Date</label>
              <input
                type="date"
                {...register('date')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              />
              {errors.date && <p className="text-red-500 text-xs mt-1 font-medium">{errors.date.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold shadow-xl hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100 mt-4"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Expense' : 'Add Expense'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
