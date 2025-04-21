import { useAuthStore } from "@/stores/auth";
import axios from "axios";
import { Order } from "../test";

export interface Exams {
  testId: string;
  count: number;
  title?: string;
  description?: string;
  level?: number;
  order?: Order[];
}

export interface Student {
  uid: string;
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  role: "student";
  exams: Exams[];
  createdAt: Date;
  updatedAt: Date;
}

// 새 학생 생성 DTO
export interface CreateStudentDto {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  password?: string;
  role: "student";
  exams: Exams[];
}

const student = axios.create({
  baseURL: "/api/user",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

student.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const requestGetStudents = async (): Promise<Student[]> => {
  const { data } = await student.get("", {
    params: {
      role: "student",
    },
  });
  return data;
};

export const requestCreateStudent = async (
  payload: CreateStudentDto
): Promise<Student> => {
  const newStudent = { ...payload };
  newStudent.password = "123456789";
  const { data } = await student.post("", newStudent);
  return data;
};

export const requestUpdateStudent = async (
  payload: CreateStudentDto
): Promise<Student> => {
  const uid = (payload as unknown as Student).uid;
  const { data } = await student.patch(`/${uid}`, payload);
  return data;
};

export const requestUpdateStudentExam = async (
  payload: Student
): Promise<Student> => {
  const uid = payload.uid;
  const { data } = await student.patch(`/${uid}`, payload);
  return data;
};

export const requestResetPasswordStudent = async (
  payload: CreateStudentDto
): Promise<Student> => {
  const uid = (payload as unknown as Student).uid;
  const { data } = await student.patch(`/${uid}/init-password`, {
    newPassword: "123456789",
  });
  return data;
};

export const requestDeleteStudent = async (uid: string): Promise<Student> => {
  const { data } = await student.delete(`/${uid}`);
  return data;
};

export const requestDecrementExamCount = async (
  userId: string,
  testId: string
): Promise<Student> => {
  const { data } = await student.put(`/${userId}/exams/${testId}/decrement`);
  return data.user;
};
