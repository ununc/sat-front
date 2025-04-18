import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "@/pages/ErrorPage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import { QuestionPage } from "@/pages/mange-exam/QuestionPage";
import { ModulePage } from "@/pages/mange-exam/ModulePage";
import { TestPage } from "@/pages/mange-exam/TestPage";
import { StudentPage } from "@/pages/StudentPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { ProtectAdminRoute } from "./ProtectAdminRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "manage",
        element: <ProtectAdminRoute />,
        children: [
          {
            path: "question",
            element: <QuestionPage />,
          },
          {
            path: "module",
            element: <ModulePage />,
          },
          {
            path: "test",
            element: <TestPage />,
          },
          {
            path: "student",
            element: <StudentPage />,
          },
        ],
      },
    ],
  },
]);
