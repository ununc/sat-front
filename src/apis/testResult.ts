import { useAuthStore } from "@/stores/auth";
import axios from "axios";
import { Test } from "./test";

export interface AnswerDto {
  questionId: string;
  questionAnswer?: string;
  studentAnswer: string;
  spendTime: number;
  isMarked?: boolean;
}

export interface ModuleResultDto {
  moduleId: string;
  remainTime: number;
  answers: AnswerDto[];
}

export interface CreateTestResultDto {
  userId: string;
  examUid: string;
  currentIndex: number;
  moduleResults: ModuleResultDto[];
  startAt: Date;
  endAt?: Date;
}

export interface UpdateTestResultDto {
  currentIndex?: number;
  moduleResults?: ModuleResultDto[];
  endAt?: Date;
}

export interface TestResult extends CreateTestResultDto {
  uid: string;
}

export interface CompleteResult extends TestResult {
  examInfo: Test;
  scoreline: {
    total: number;
    correct: number;
  }[];
}

// Create axios instance
const testResults = axios.create({
  baseURL: "/api/test-results",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Add auth token interceptor
testResults.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const requestCreateTestResult = async (payload: {
  userId: string;
  examUid: string;
}): Promise<TestResult> => {
  const { data } = await testResults.post("", payload);
  return data;
};

export const requestGetTestResult = async (
  uid: string
): Promise<TestResult> => {
  const { data } = await testResults.get(`/${uid}`);
  return data;
};

export const requestGetUserTestResults = async (
  userId: string
): Promise<{ onGoing: CompleteResult[]; completed: CompleteResult[] }> => {
  const { data } = await testResults.get(`/user/${userId}`);
  return data;
};

export const requestUpdateTestResult = async (
  uid: string,
  payload: UpdateTestResultDto
): Promise<TestResult> => {
  const { data } = await testResults.patch(`/${uid}`, payload);
  return data;
};

export const requestEndTest = async (uid: string): Promise<TestResult> => {
  const { data } = await testResults.patch(`/${uid}/end-test`);
  return data;
};

export const requestUpdateCurrentIndex = async (
  uid: string,
  currentIndex: number
): Promise<TestResult> => {
  const { data } = await testResults.patch(`/${uid}/current-index`, {
    currentIndex,
  });
  return data;
};

export const requestGetUserExamTestResult = async (
  userId: string,
  examUid: string
): Promise<TestResult> => {
  const { data } = await testResults.get(`/search`, {
    params: {
      userId,
      examUid,
    },
  });
  return data;
};

export const requestUpdateAnswer = async (
  uid: string,
  moduleId: string,
  questionId: string,
  studentAnswer: string,
  spendTime: number
): Promise<TestResult> => {
  const { data } = await testResults.patch(
    `/${uid}/module/${moduleId}/answer/${questionId}`,
    {
      studentAnswer,
      spendTime,
    }
  );
  return data;
};
