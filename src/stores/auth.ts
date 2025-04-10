import type { Auth } from "@/apis/auth/login";
import { create } from "zustand";

interface CounterState {
  auth: Auth;
  setAuth: (auth: Auth) => void;
  clearAuth: () => void;
}

const initialAuth: Auth = {
  accessToken: "",
  userInfo: {
    name: "",
    role: "user",
    startTime: "",
    endTime: "",
  },
};

export const useAuthStore = create<CounterState>((set) => ({
  auth: initialAuth,
  setAuth: (auth: Auth) => set({ auth }),
  clearAuth: () => set({ auth: initialAuth }),
}));
