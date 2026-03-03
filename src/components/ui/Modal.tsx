import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center backdrop-blur-[4px]" onClick={onClose}>
      <div className="bg-white rounded-lg w-[90%] max-w-[560px] max-h-[85vh] overflow-y-auto p-8 animate-modalIn" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="text-xl font-semibold">{title}</div>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
