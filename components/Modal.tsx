
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // ESC 키로 닫기 기능 추가
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all animate-in fade-in"
      onClick={onClose} // 배경 클릭 시 닫기
    >
      <div 
        className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20"
        onClick={(e) => e.stopPropagation()} // 내부 클릭 시 이벤트 전파 차단
      >
        <div className="flex justify-between items-center p-8 pb-4">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-2 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-full transition-all group"
            title="닫기 (ESC)"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>
        <div className="p-8 pt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
