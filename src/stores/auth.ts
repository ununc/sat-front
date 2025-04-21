import type { Auth } from "@/apis/login";
import { create } from "zustand";

interface CounterState {
  auth: Auth;
  setAuth: (auth: Auth) => void;
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
  clearAuth: () => set({ auth: initialAuth }),
}));
