import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const { auth } = useAuthStore();
  const navigate = useNavigate();
  if (auth.userInfo.role === "student") {
    return (
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4">메인 페이지</h1>
        <p className="mb-4">{auth.userInfo.name} 님 안녕하세요!</p>
        <p className="mb-4">역학: {auth.userInfo.role}</p>
        <Button>시작하기</Button>
      </div>
    );
  }

  if (auth.userInfo.role === "admin") {
    return (
      <div className="p-6">
        <p className="text-3xl mb-4">
          <span className="text-4xl font-bold">{auth.userInfo.name}</span> 님
          안녕하세요!
        </p>
        <p className="mb-4">역학: {auth.userInfo.role}</p>
        <div className="mb-4">문제 관리하기</div>
        <div className="flex flex-nowrap gap-4 mb-4">
          <Button
            className="w-1/4 font-bold py-6 bg-blue-800 cursor-pointer"
            onClick={() => {
              navigate("/manage-exam/question");
            }}
          >
            문제 관리
          </Button>
          <Button
            className="w-1/4 font-bold py-6 bg-blue-800 cursor-pointer"
            onClick={() => {
              navigate("/manage-exam/module");
            }}
          >
            모듈 관리
          </Button>
          <Button
            className="w-1/4 font-bold py-6 bg-blue-800 cursor-pointer"
            onClick={() => {
              navigate("/manage-exam/test");
            }}
          >
            시험 관리
          </Button>
        </div>

        <div className="mb-4">선생님 관리하기</div>

        <div className="mb-4">학생 관리하기</div>
      </div>
    );
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
