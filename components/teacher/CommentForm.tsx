"use client";

import React, {useState} from "react";
import {addComment} from "@/lib/apis";

interface CommentFormProps {
  submissionId: string;
  onCommentAdded: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({
  submissionId,
  onCommentAdded,
}) => {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addComment(submissionId, message);
      setMessage("");
      onCommentAdded();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Add a comment"
      />
      <button type="submit">Post Comment</button>
    </form>
  );
};

export default CommentForm;
