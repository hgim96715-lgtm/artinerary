'use client';

export type AdminNoticeFormValues = {
  title: string;
  body: string;
  isPublished: boolean;
  isPinned: boolean;
};

type Props = {
  values: AdminNoticeFormValues;
  onChange: (values: AdminNoticeFormValues) => void;
  onSubmit: React.SubmitEventHandler<HTMLFormElement>;
  error: string;
  submitting: boolean;
  submitLabel: string;
  submittingLabel: string;
};

export const AdminNoticeForm = ({
  values,
  onChange,
  onSubmit,
  error,
  submitting,
  submitLabel,
  submittingLabel,
}: Props) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="notice-title" className="label-field">
          제목 <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          id="notice-title"
          name="title"
          value={values.title}
          onChange={(e) => onChange({ ...values, title: e.target.value })}
          maxLength={200}
          required
        />
      </div>

      <div>
        <label htmlFor="notice-body" className="label-field">
          본문 <span className="text-red-600">*</span>
        </label>
        <textarea
          id="notice-body"
          name="body"
          rows={12}
          placeholder="공지 내용을 입력해 주세요."
          value={values.body}
          onChange={(e) => onChange({ ...values, body: e.target.value })}
          required
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <label htmlFor="notice-published" className="label-check">
          <input
            type="checkbox"
            id="notice-published"
            name="isPublished"
            checked={values.isPublished}
            onChange={(e) =>
              onChange({ ...values, isPublished: e.target.checked })
            }
          />
          게시
        </label>

        <label htmlFor="notice-pinned" className="label-check">
          <input
            type="checkbox"
            id="notice-pinned"
            name="isPinned"
            checked={values.isPinned}
            onChange={(e) =>
              onChange({ ...values, isPinned: e.target.checked })
            }
          />
          상단 고정
        </label>
      </div>

      {error && <p className="text-error">{error}</p>}

      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
};
