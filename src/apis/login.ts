import axios from "axios";

export interface LoginDto {
  id: string;
  password: string;
  keepLogin: boolean;
}

const auth = axios.create({
  baseURL: "/api/auth",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("accessToken");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

export const requestLogin = async (payload: LoginDto): Promise<Auth> => {
  const { data } = await auth.post("login", payload);
  return data;
};

export interface Auth {
  accessToken: string;
  userInfo: UserInfo;
}

type Role = "admin" | "teacher" | "student" | "user";

interface UserInfo {
  name: string;
  role: Role;
  startTime: string;
  endTime: string;
}
