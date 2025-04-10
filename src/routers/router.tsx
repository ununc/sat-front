import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./protectedRoute";
import ErrorPage from "@/pages/ErrorPage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import { QuestionPage } from "@/pages/mange-exam/QuestionPage";
import { ModulePage } from "@/pages/mange-exam/ModulePage";
import { TestPage } from "@/pages/mange-exam/TestPage";

export const router = createBrowserRouter([
  {
    // 로그인 경로
    path: "/login",
    element: <LoginPage />,
  },
  {
    // 보호된 라우트를 적용하기 위한 Wrapper
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        index: true,
        element: <HomePage />,
      },
      {
        path: "manage-exam",
        children: [
          {
            path: "question",
            index: true,
            element: <QuestionPage />,
          },
          {
            path: "module",
            index: true,
            element: <ModulePage />,
          },
          {
            path: "test",
            index: true,
            element: <TestPage />,
          },
        ],
      },
    ],
  },
]);
