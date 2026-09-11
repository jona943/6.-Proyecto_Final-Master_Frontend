import React, { useEffect } from 'react'
import './ConfirmActionModal.css'
import { IconAlertCircle, IconX } from '../../../../components/icons/Icons'

const ConfirmActionModal = ({
  isOpen,
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer.',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger', // 'danger' | 'warning'
  onConfirm,
  onClose
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div
        className="confirm-modal-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="confirm-modal-header">
          <div className={`confirm-icon-badge ${variant}`}>
            <IconAlertCircle size={22} />
          </div>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            title="Cerrar"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="confirm-modal-body">
          <h3 className="confirm-modal-title">{title}</h3>
          <p className="confirm-modal-desc">{message}</p>
        </div>

        <div className="confirm-modal-actions">
          <button
            type="button"
            className="btn-confirm-cancel"
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn-confirm-proceed ${variant}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmActionModal
