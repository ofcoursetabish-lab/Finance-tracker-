import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}: ConfirmationDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100"
          >
            <div className="p-6 md:p-8 text-center">
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${
                variant === 'danger' ? 'bg-red-50 text-red-600' : 
                variant === 'warning' ? 'bg-yellow-50 text-yellow-600' : 
                'bg-blue-50 text-blue-600'
              }`}>
                <AlertTriangle size={32} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
              
              <div className="grid grid-cols-2 gap-3 mt-8">
                <button
                  onClick={onCancel}
                  className="py-3 px-4 bg-gray-50 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className={`py-3 px-4 text-white font-bold rounded-2xl shadow-lg transition-transform active:scale-95 ${
                    variant === 'danger' ? 'bg-red-600 shadow-red-200' : 
                    variant === 'warning' ? 'bg-yellow-600 shadow-yellow-200' : 
                    'bg-black shadow-gray-200'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
            
            <button 
              onClick={onCancel}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
