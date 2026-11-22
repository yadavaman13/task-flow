import { useState } from 'react';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { formatInitials, formatRelativeTime } from '@/utils/formatters';
import Spinner from '@/components/Shared/Feedback/Spinner/Spinner';
import Button from '@/components/Shared/Buttons/Button/Button';
import './CommentList.scss';

export default function CommentList({
  comments = [],
  currentUserId,
  onUpdateComment,
  onDeleteComment,
  loading = false,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const startEdit = (c) => {
    setEditingId(c.id || c._id);
    setEditText(c.comment || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = async (commentId) => {
    if (!editText.trim()) return;
    await onUpdateComment(commentId, editText.trim());
    setEditingId(null);
  };

  if (loading && comments.length === 0) {
    return (
      <div className="comment-list-loading">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="comment-list">
      {comments.length === 0 ? (
        <p className="comment-list__empty">No comments yet. Start the conversation!</p>
      ) : (
        comments.map((c) => {
          const cId = c.id || c._id;
          const isOwner = c.user_id === currentUserId || c.userId === currentUserId;
          const isEditing = editingId === cId;
          const authorName = c.user_name || c.user?.name || 'User';

          return (
            <div key={cId} className="comment-item">
              <div className="comment-item__avatar">
                {formatInitials(authorName)}
              </div>

              <div className="comment-item__body">
                <div className="comment-item__header">
                  <div className="comment-item__meta">
                    <span className="comment-item__author">{authorName}</span>
                    <span className="comment-item__time">
                      {formatRelativeTime(c.created_at)}
                    </span>
                  </div>

                  {isOwner && !isEditing && (
                    <div className="comment-item__actions">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Edit2}
                        onClick={() => startEdit(c)}
                        title="Edit comment"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => onDeleteComment(cId)}
                        title="Delete comment"
                        className="comment-delete-btn"
                      />
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="comment-edit-box">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="comment-edit-textarea"
                      rows={2}
                    />
                    <div className="comment-edit-actions">
                      <Button variant="ghost" size="sm" icon={X} onClick={cancelEdit}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Check}
                        onClick={() => saveEdit(cId)}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="comment-item__text">{c.comment}</p>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
