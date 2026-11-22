import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useCommentContext } from '../context/comment.context';
import {
  addComment,
  fetchTaskComments,
  updateComment,
  deleteComment,
} from '../services/comment.api';

export function useComment() {
  const { comments, setComments, loading, setLoading, setError } = useCommentContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTaskComments = useCallback(
    async (taskId) => {
      setLoading(true);
      try {
        const res = await fetchTaskComments(taskId);
        const list = res.data || [];
        setComments(list);
        return { success: true, data: list };
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load comments';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setComments, setError]
  );

  const handleAddComment = async (taskId, commentText) => {
    if (!commentText.trim()) return { success: false };
    setIsSubmitting(true);
    try {
      const res = await addComment(taskId, commentText);
      const newComment = res.data || res;
      setComments((prev) => [...prev, newComment]);
      toast.success(res.message || 'Comment posted');
      return { success: true, data: newComment };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to post comment';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId, commentText) => {
    try {
      const res = await updateComment(commentId, commentText);
      const updated = res.data || res;
      setComments((prev) =>
        prev.map((c) => (c.id === commentId || c._id === commentId ? { ...c, comment: commentText } : c))
      );
      toast.success(res.message || 'Comment updated');
      return { success: true, data: updated };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update comment';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId && c._id !== commentId));
      toast.success(res.message || 'Comment deleted');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete comment';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  return {
    comments,
    loading,
    isSubmitting,
    loadTaskComments,
    handleAddComment,
    handleUpdateComment,
    handleDeleteComment,
  };
}
