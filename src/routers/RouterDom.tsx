import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "@/pages/ErrorPage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import { QuestionPage } from "@/pages/mange-exam/QuestionPage";
import { ModulePage } from "@/pages/mange-exam/ModulePage";
import { TestPage } from "@/pages/mange-exam/TestPage";
import { StudentPage } from "@/pages/StudentPage";
import { ProtectAdminRoute } from "./ProtectAdminRoute";
import { ExamPage } from "@/pages/for-student/ExamPage";
import { ResultPage } from "@/pages/for-student/ResultPage";
import { ProTEctAccess } from "@/routers/ProtectAccess";

export const RouterDom = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <ProTEctAccess />,
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
      {
        path: "exam",
        element: <ExamPage />,
      },
      {
        path: "result/:resultId", // 여기에 동적 매개변수 추가
        element: <ResultPage />,
      },
    ],
  },
]);
