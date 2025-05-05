import type { Auth, Examss } from "@/apis/login";
import { create } from "zustand";

interface CounterState {
  auth: Auth;
  setAuth: (auth: Auth) => void;
  setNewExams: (exams: Examss[]) => void;
  clearAuth: () => void;
}

const initialAuth: Auth = {
  accessToken: "",
  userInfo: {
    uid: "",
    id: "",
    name: "",
    role: "user",
    startTime: "",
    endTime: "",
    exams: [],
    createdAt: "",
    updatedAt: "",
  },
};

export const useAuthStore = create<CounterState>((set) => ({
  auth: initialAuth,
  setAuth: (auth: Auth) => set({ auth }),
  setNewExams: (exams: Examss[]) =>
    set((state) => ({
      auth: {
        ...state.auth,
        userInfo: {
          ...state.auth.userInfo,
          exams: exams,
        },
      },
    })),
  clearAuth: () => set({ auth: initialAuth }),
}));
