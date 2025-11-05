// components/CommentsSection.tsx
"use client";

import React, {useState} from "react";

interface CommentsSectionProps {
  comments: any[];
  submissionId: number;
  onCommentAdded: (newComment: any) => void;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  submissionId,
  onCommentAdded,
}) => {
  const [newComment, setNewComment] = useState("");

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment) return;
    const newCom = {
      id: Date.now(), // Mock ID
      author: {username: "teacher1"}, // Mock teacher
      author_role: "teacher",
      message: newComment,
      created_at: new Date().toISOString(),
    };
    onCommentAdded(newCom);
    setNewComment("");
  };

  return (
    <div className="mt-4">
      <h3 className="font-bold">Comments:</h3>
      {comments.map((comment) => (
        <div key={comment.id} className="border-b py-2">
          <p>
            <strong>
              {comment.author.username} ({comment.author_role})
            </strong>{" "}
            - {comment.created_at}
          </p>
          <p>{comment.message}</p>
        </div>
      ))}
      <form onSubmit={handleAddComment} className="mt-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="border p-2 w-full mb-2"
          placeholder="Add a comment..."
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          Post Comment
        </button>
      </form>
    </div>
  );
};

export default CommentsSection;
