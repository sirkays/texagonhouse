import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/", // Adjust to your Django API URL
  headers: {
    "Content-Type": "application/json",
    // Add auth: 'Authorization': `Bearer ${token}`,
  },
});

export const getSubmissions = async () => {
  const response = await api.get("submissions/");
  return response.data;
};

export const getSubmission = async (id: string) => {
  const response = await api.get(`submissions/${id}/`);
  return response.data;
};

export const gradeSubmission = async (
  id: string,
  data: {
    score: number;
    feedback: string;
    correction_code: string;
  }
) => {
  const response = await api.patch(`submissions/${id}/`, {
    ...data,
    status: "graded",
    // graded_by and graded_at handled backend-side
  });
  return response.data;
};

export const getComments = async (submissionId: string) => {
  const response = await api.get(`submissions/${submissionId}/comments/`);
  return response.data;
};

export const addComment = async (submissionId: string, message: string) => {
  const response = await api.post(`submissions/${submissionId}/comments/`, {
    message,
    author_role: "teacher", // Assuming backend sets author
  });
  return response.data;
};
