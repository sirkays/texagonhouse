import React from "react";

interface Comment {
  id: number;
  author: string; // Or use user model
  author_role: "student" | "teacher";
  message: string;
  created_at: string;
}

interface CommentListProps {
  comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({comments}) => {
  return (
    <div>
      {comments.map((comment) => (
        <div key={comment.id} style={{marginBottom: "10px"}}>
          <strong>{comment.author_role}: </strong>
          <p>{comment.message}</p>
          <small>{new Date(comment.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
};

export default CommentList;
