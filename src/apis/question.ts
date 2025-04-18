import { useAuthStore } from "@/stores/auth";
import axios from "axios";

export interface Choice {
  content: string;
  seq: "a" | "b" | "c" | "d";
}

export interface Question {
  uid: string;
  manageTitle: string;
  section: string;
  type: string;
  level: number;
  paragraph: string;
  question: string;
  choices: Choice[];
  answer: string;
  explanation: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionDto {
  manageTitle: string;
  section: string;
  type: string;
  level: number;
  paragraph: string;
  includeChoices?: boolean;
  question: string;
  choices: Choice[];
  answer: string;
  explanation: string;
}

const question = axios.create({
  baseURL: "/api/questions",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

question.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const requestCreateQuestion = async (
  payload: CreateQuestionDto
): Promise<Question> => {
  const newPayload = { ...payload };
  delete newPayload.includeChoices;
  const { data } = await question.post("", newPayload);
  return data;
};

export interface QuestionFilter {
  section?: string;
  type?: string;
  level?: number;
}

export const requestGetQuestions = async (
  filter?: QuestionFilter
): Promise<Question[]> => {
  // 필터 파라미터가 있는 경우에만 쿼리 파라미터 추가
  const params: QuestionFilter = {};

  if (filter?.section) params.section = filter.section;
  if (filter?.type) params.type = filter.type;
  if (filter?.level !== undefined) params.level = filter.level;

  const { data } = await question.get("", { params });
  return data;
};

export const requestUpdateQuestion = async (
  payload: CreateQuestionDto
): Promise<Question> => {
  const newPayload = { ...payload };
  delete newPayload.includeChoices;
  const { data } = await question.put(
    `/${(payload as Question).uid}`,
    newPayload
  );
  return data;
};

export const requestDeleteQuestion = async (uid: string): Promise<Question> => {
  const { data } = await question.delete(`/${uid}`);
  return data;
};
