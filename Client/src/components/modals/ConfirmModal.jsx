import React from 'react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, isSaving, confirmText = "POTWIERDŹ", cancelText = "ANULUJ" }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="danger-text">{title}</h2>
        <p className="modal-desc">{message}</p>
        <div className="modal-btns">
          <button className="btn-delete" onClick={onConfirm} disabled={isSaving}>
            {isSaving ? "PRZETWARZANIE..." : confirmText}
          </button>
          <button className="btn-cancel" onClick={onCancel} disabled={isSaving}>
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
