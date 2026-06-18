'use client';

import type { ReactNode } from 'react';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmClassName?: string;
  cancelClassName?: string;
  confirmingLabel?: string;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = '예',
  cancelLabel = '아니요',
  confirming = false,
  confirmingLabel,
  onConfirm,
  onCancel,
  confirmClassName = 'btn-danger',
  cancelClassName = 'btn-secondary',
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="dialog-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={() => !confirming && onCancel()}
    >
      <div className="dialog-panel" onClick={(e) => e.stopPropagation()}>
        <h2 id="confirm-dialog-title" className="text-lg font-semibold text-muted">
          {title}
        </h2>
        <div className="mt-2 text-sm text-gray-600">{description}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            disabled={confirming}
            onClick={onCancel}
            className={cancelClassName}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={confirming}
            onClick={onConfirm}
            className={confirmClassName}
          >
            {confirming ? (confirmingLabel ?? `${confirmLabel} 중…`) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
