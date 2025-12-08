import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchComments,
  addComment,
  editComment,
  deleteComment,
} from "../store/commentSlice";
import {
  FaPaperPlane,
  FaEdit,
  FaTrash,
  FaTimes,
  FaCheck,
  FaUser,
} from "react-icons/fa";

const Comments = ({ ticketId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { commentsByTicket, loading } = useSelector((state) => state.comments);
  const comments = commentsByTicket[ticketId] || [];

  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (ticketId) {
      dispatch(fetchComments(ticketId));
    }
  }, [dispatch, ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await dispatch(addComment({ ticketId, content: newComment.trim() }));
    setNewComment("");
  };

  const handleEdit = (comment) => {
    setEditingId(comment._id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleSaveEdit = async (commentId) => {
    if (!editContent.trim()) return;

    await dispatch(
      editComment({ commentId, content: editContent.trim(), ticketId })
    );
    setEditingId(null);
    setEditContent("");
  };

  const handleDelete = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      await dispatch(deleteComment({ commentId, ticketId }));
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-700";
      case "ENGINEER":
        return "bg-blue-100 text-blue-700";
      case "RANGER":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const isOwnComment = (comment) => {
    return comment.author?._id === user?._id;
  };

  return (
    <div className="flex flex-col h-80 bg-gray-50 rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-4 py-2 bg-white border-b border-gray-200 rounded-t-lg">
        <h4 className="font-semibold text-gray-700">
          Comments ({comments.length})
        </h4>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && comments.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FaUser className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs">Start the conversation!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              className={`flex ${
                isOwnComment(comment) ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  isOwnComment(comment)
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-gray-200"
                }`}
              >
                {/* Author info */}
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-medium ${
                      isOwnComment(comment)
                        ? "text-indigo-200"
                        : "text-gray-600"
                    }`}
                  >
                    {comment.author?.name || "Unknown"}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      isOwnComment(comment)
                        ? "bg-indigo-500 text-indigo-100"
                        : getRoleBadgeColor(comment.author?.role)
                    }`}
                  >
                    {comment.author?.role}
                  </span>
                </div>

                {/* Content */}
                {editingId === comment._id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2 text-sm text-gray-800 bg-white border border-gray-300 rounded resize-none focus:ring-2 focus:ring-indigo-500"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(comment._id)}
                        className="p-1 text-green-600 hover:text-green-800"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    className={`text-sm ${
                      isOwnComment(comment) ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {comment.content}
                  </p>
                )}

                {/* Footer with time and actions */}
                <div className="flex items-center justify-between mt-2">
                  <span
                    className={`text-xs ${
                      isOwnComment(comment)
                        ? "text-indigo-200"
                        : "text-gray-400"
                    }`}
                  >
                    {formatTime(comment.createdAt)}
                    {comment.updatedAt !== comment.createdAt && " (edited)"}
                  </span>

                  {isOwnComment(comment) && editingId !== comment._id && (
                    <div className="flex gap-2 ml-2">
                      <button
                        onClick={() => handleEdit(comment)}
                        className={`p-1 rounded hover:bg-opacity-20 hover:bg-black ${
                          isOwnComment(comment)
                            ? "text-indigo-200"
                            : "text-gray-400"
                        }`}
                      >
                        <FaEdit size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(comment._id)}
                        className={`p-1 rounded hover:bg-opacity-20 hover:bg-black ${
                          isOwnComment(comment)
                            ? "text-indigo-200"
                            : "text-gray-400"
                        }`}
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-white border-t border-gray-200 rounded-b-lg"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || loading}
            className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaPaperPlane />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Comments;
