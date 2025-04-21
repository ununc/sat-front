import { useAuthStore } from "@/stores/auth";
import axios from "axios";

export interface Order {
  kind: string;
  time: string;
  moduleUid: string;
}

export interface Test {
  uid: string;
  title: string;
  description: string;
  level: number;
  order: Order[];
  examModules: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestDto {
  title: string;
  description: string;
  level: number;
  order: Order[];
  examModules: string[];
}

const test = axios.create({
  baseURL: "/api/exams",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

test.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface TestFilter {
  level?: number;
}

export const requestGetTests = async (filter?: TestFilter): Promise<Test[]> => {
  // 필터 파라미터가 있는 경우에만 쿼리 파라미터 추가
  const params: TestFilter = {};

  if (filter?.level !== undefined) params.level = filter.level;

  const { data } = await test.get("", { params });
  return data;
};

export const requestArrayTests = async (payload: string[]): Promise<Test[]> => {
  const { data } = await test.post("multiple", {
    uids: payload,
  });
  return data;
};

export const requestCreateTest = async (
  payload: CreateTestDto
): Promise<Test> => {
  const { data } = await test.post("", payload);
  return data;
};

export const requestUpdateTest = async (
  payload: CreateTestDto
): Promise<Test> => {
  const uid = (payload as unknown as Test).uid;
  const { data } = await test.put(`/${uid}`, payload);
  return data;
};

export const requestDeleteTest = async (uid: string): Promise<Test> => {
  const { data } = await test.delete(`/${uid}`);
  return data;
};
