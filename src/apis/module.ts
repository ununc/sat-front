import axios from "axios";
import type { Question } from "./question";
import { useAuthStore } from "@/stores/auth";

export interface Module {
  uid: string;
  title: string;
  description: string;
  section: string;
  level: number;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateModuleDto {
  title: string;
  description: string;
  section: string;
  level: number;
  questions: string[];
}

export interface ModuleFilter {
  section?: string;
  level?: number;
}

const module = axios.create({
  baseURL: "/api/exam-modules",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

module.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const requestGetModules = async (
  filter?: ModuleFilter
): Promise<Module[]> => {
  // 필터 파라미터가 있는 경우에만 쿼리 파라미터 추가
  const params: ModuleFilter = {};

  if (filter?.section) params.section = filter.section;
  if (filter?.level !== undefined) params.level = filter.level;

  const { data } = await module.get("", { params });
  return data;
};

export const requestCreateModule = async (
  payload: CreateModuleDto
): Promise<Module> => {
  const { data } = await module.post("", payload);
  return data;
};

export const requestUpdateModule = async (
  payload: CreateModuleDto
): Promise<Module> => {
  const uid = (payload as unknown as Module).uid;
  const { data } = await module.put(`/${uid}`, payload);
  return data;
};

export const requestDeleteModule = async (uid: string): Promise<Question> => {
  const { data } = await module.delete(`/${uid}`);
  return data;
};

export const requestExamModule = async (moduleUID: string): Promise<Module> => {
  const { data } = await module.get(`/${moduleUID}`);
  return data;
};
