import { useState } from 'react';
import { Send } from 'lucide-react';
import Button from '@/components/Shared/Buttons/Button/Button';
import './CommentInput.scss';

export default function CommentInput({ onSubmit, isSubmitting = false }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    onSubmit(text.trim()).then((res) => {
      if (res?.success !== false) {
        setText('');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="comment-input-form">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a comment to this task..."
        rows={2}
        className="comment-input-form__textarea"
      />
      <div className="comment-input-form__actions">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          icon={Send}
          loading={isSubmitting}
          disabled={!text.trim() || isSubmitting}
        >
          Comment
        </Button>
      </div>
    </form>
  );
}
