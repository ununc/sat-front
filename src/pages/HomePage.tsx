import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth";
import {
  BookOpen,
  FileText,
  Layers,
  LayoutDashboard,
  Users,
  UserCheck,
} from "lucide-react";
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
      <div className="container mx-auto py-6 px-4 md:px-6">
        {/* 헤더 섹션 */}
        <div className="bg-card rounded-lg shadow-sm p-6 mb-8 border border-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                관리자 대시보드
              </h1>
              <p className="text-muted-foreground mt-1">
                시험 관련 콘텐츠를 관리할 수 있는 관리자 페이지입니다.
              </p>
            </div>
          </div>
        </div>

        {/* 주요 관리 기능 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 문제 관리 카드 */}
          <Card className="overflow-hidden pt-0 transition-all hover:shadow-md border-border hover:border-primary/20">
            <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-950 dark:to-blue-900 rounded-t-lg py-8 -mx-[1px] -mt-[1px] w-[calc(100%+2px)]">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">문제 관리</CardTitle>
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardDescription>개별 문제 생성 및 관리</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                다양한 유형의 문제를 생성하고 관리할 수 있습니다. 생성된 문제는
                모듈에 포함하여 활용할 수 있습니다.
              </p>
            </CardContent>
            <CardFooter className="border-t border-border bg-muted/30 flex justify-end">
              <Button
                className="w-full"
                onClick={() => navigate("/manage/question")}
              >
                문제 관리 바로가기
              </Button>
            </CardFooter>
          </Card>

          {/* 모듈 관리 카드 */}
          <Card className="overflow-hidden pt-0 transition-all hover:shadow-md border-border hover:border-primary/20">
            <CardHeader className="bg-gradient-to-r from-green-100 to-green-50 dark:from-green-950 dark:to-green-900 rounded-t-lg py-8 -mx-[1px] -mt-[1px] w-[calc(100%+2px)]">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">모듈 관리</CardTitle>
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <CardDescription>문제 모듈 구성 및 관리</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                여러 문제를 하나의 모듈로 구성하여 체계적으로 관리할 수
                있습니다. 모듈은 시험 생성 시 활용됩니다.
              </p>
            </CardContent>
            <CardFooter className="border-t border-border bg-muted/30 flex justify-end">
              <Button
                className="w-full"
                onClick={() => navigate("/manage/module")}
              >
                모듈 관리 바로가기
              </Button>
            </CardFooter>
          </Card>

          {/* 시험 관리 카드 */}
          <Card className="overflow-hidden pt-0 transition-all hover:shadow-md border-border hover:border-primary/20">
            <CardHeader className="bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-950 dark:to-purple-900 rounded-t-lg py-8 -mx-[1px] -mt-[1px] w-[calc(100%+2px)]">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">시험 관리</CardTitle>
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardDescription>모듈을 선택하여 시험 만들기</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                여러 모듈을 조합하여 하나의 시험을 구성할 수 있습니다. 다양한
                설정으로 맞춤형 시험을 생성하세요.
              </p>
            </CardContent>
            <CardFooter className="border-t border-border bg-muted/30 flex justify-end">
              <Button
                className="w-full"
                onClick={() => navigate("/manage/test")}
              >
                시험 관리 바로가기
              </Button>
            </CardFooter>
          </Card>

          {/* 선생님 관리 카드 */}
          <Card className="overflow-hidden pt-0 transition-all hover:shadow-md border border-border hover:border-primary/20">
            <CardHeader className="bg-gradient-to-r from-indigo-100 to-indigo-50 dark:from-indigo-950 dark:to-indigo-900 rounded-t-lg py-8 -mx-[1px] -mt-[1px] w-[calc(100%+2px)]">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">선생님 관리</CardTitle>
                <UserCheck className="h-6 w-6 text-primary" />
              </div>
              <CardDescription>
                선생님 정보를 체계적으로 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                선생님 등록, 수정, 삭제를 통해 교육 인프라를 효율적으로
                운영하세요.
              </p>
            </CardContent>
            <CardFooter className="border-t border-border bg-muted/30 flex justify-end">
              <Button className="w-full" onClick={() => navigate("/")}>
                선생님 관리 바로가기
              </Button>
            </CardFooter>
          </Card>

          {/* 학생 관리 카드 */}
          <Card className="overflow-hidden pt-0 transition-all hover:shadow-md border border-border hover:border-primary/20">
            <CardHeader className="bg-gradient-to-r from-teal-100 to-teal-50 dark:from-teal-950 dark:to-teal-900 rounded-t-lg py-8 -mx-[1px] -mt-[1px] w-[calc(100%+2px)]">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">학생 관리</CardTitle>
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardDescription>학생 정보를 한눈에 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                학생 등록, 수정, 삭제 및 검색 기능을 통해 학생 데이터를
                효과적으로 관리하세요.
              </p>
            </CardContent>
            <CardFooter className="border-t border-border bg-muted/30 flex justify-end">
              <Button
                className="w-full"
                onClick={() => navigate("/manage/student")}
              >
                학생 관리 바로가기
              </Button>
            </CardFooter>
          </Card>

          {/* 대시보드 카드 */}
          <Card className="overflow-hidden pt-0 transition-all hover:shadow-md border border-border hover:border-primary/20">
            <CardHeader className="bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-950 dark:to-amber-900 rounded-t-lg py-8 -mx-[1px] -mt-[1px] w-[calc(100%+2px)]">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">대시보드</CardTitle>
                <LayoutDashboard className="h-6 w-6 text-primary" />
              </div>
              <CardDescription>전체 통계 및 활동 내역 확인</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                관리자용 통계와 최신 활동 내역을 한눈에 확인하여 빠른 의사결정을
                지원합니다.
              </p>
            </CardContent>
            <CardFooter className="border-t border-border bg-muted/30 flex justify-end">
              <Button className="w-full" onClick={() => navigate("/")}>
                대시보드 바로가기
              </Button>
            </CardFooter>
          </Card>
        </div>
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
