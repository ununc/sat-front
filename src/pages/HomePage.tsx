import { Button } from "@/components/ui/button";

import { useAuthStore } from "@/stores/auth";

import { MainPage } from "./for-student/MainPage";
import { AdminPage } from "./admin/AdminPage";

export default function HomePage() {
  const { auth } = useAuthStore();

  if (auth.userInfo.role === "student") {
    return <MainPage />;
  }

  if (auth.userInfo.role === "admin") {
    return <AdminPage />;
  }

  if (auth.userInfo.role === "teacher") {
    return (
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4">메인 페이지</h1>
        <p className="mb-4">{auth.userInfo.name} 님 안녕하세요!</p>
        <p className="mb-4">역학: {auth.userInfo.role}</p>
        <Button>시작하기</Button>
      </div>
    );
  }

  if (auth.userInfo.role === "user") {
    return (
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4">메인 페이지</h1>
        <p className="mb-4">{auth.userInfo.name} 님 안녕하세요!</p>
        <p className="mb-4">역학: {auth.userInfo.role}</p>
        <Button>시작하기</Button>
      </div>
    );
  }
}
