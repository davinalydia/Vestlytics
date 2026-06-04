import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import './Modal.css';

export const Modal = ({ isOpen, onClose, title, children, className }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.style.overflowY = 'hidden';
      }
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.style.overflowY = '';
      }
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.style.overflowY = '';
      }
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`modal-backdrop ${className ? className + '-backdrop' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`modal-container ${className || ''}`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">{title}</h2>
              <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            <div className="modal-content">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
