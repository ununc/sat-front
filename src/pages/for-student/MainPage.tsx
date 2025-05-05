import { requestDecrementExamCount } from "@/apis/admin-menu/students";
import { Examss } from "@/apis/login";
import { Order } from "@/apis/test";
import { CompleteResult, requestGetUserTestResults } from "@/apis/testResult";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/stores/auth";
import { useExamFlowStore } from "@/stores/exam";
import { useResultStore } from "@/stores/result";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  UserCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const MainPage = () => {
  const {
    auth: { userInfo },
    setNewExams,
  } = useAuthStore();

  const [activeTab, setActiveTab] = useState("start");
  const [completeTests, setCompleteTests] = useState<CompleteResult[]>([]);
  const [onGoingTests, setonGoingTests] = useState<CompleteResult[]>([]);
  const { setExamFlow } = useExamFlowStore();
  const { setResultInfo } = useResultStore();
  const navigate = useNavigate();

  const timeToSeconds = (timeStr: string) => {
    const [minutes, seconds] = timeStr.split(":").map(Number);
    return minutes * 60 + seconds;
  };

  const secondsToTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const calculateTimeInfo = (order: Order[]) => {
    let moduleSeconds = 0;
    let breakSeconds = 0;

    order.forEach((item) => {
      const seconds = timeToSeconds(item.time);
      if (item.kind === "module") {
        moduleSeconds += seconds;
      } else if (item.kind === "break") {
        breakSeconds += seconds;
      }
    });

    return {
      moduleTime: secondsToTime(moduleSeconds),
      breakTime: secondsToTime(breakSeconds),
    };
  };

  const startTest = async (test: Examss) => {
    setExamFlow({
      test: test.testId,
      isNew: true,
    });
    await requestDecrementExamCount(userInfo.uid, test.testId);
    if (test.count === 1) {
      setNewExams(userInfo.exams.filter((exam) => exam.testId !== test.testId));
    }
    navigate("/exam");
  };

  const resumeStart = async (test: string) => {
    setExamFlow({
      test,
      isNew: false,
    });
    navigate("/exam");
  };

  const checkResultDetail = async (test: CompleteResult) => {
    setResultInfo({
      testTitle: test.examInfo.title,
      testDescription: test.examInfo.description,
      testLevel: test.examInfo.level,
    });
    navigate(`/result/${test.uid}`);
  };

  useEffect(() => {
    (async () => {
      try {
        const { onGoing, completed } = await requestGetUserTestResults(
          userInfo.uid
        );
        setonGoingTests(onGoing);
        setCompleteTests(completed);
      } catch (error) {
        console.error("질문을 가져오는 중 오류 발생:", error);
      }
    })();
  }, [userInfo]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarFallback className="bg-primary/10 text-primary">
                {userInfo.name.slice(1)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                {userInfo.name}님 안녕하세요
              </h1>
              <p className="text-muted-foreground flex items-center gap-1">
                <UserCircle className="h-4 w-4" />
                학생 ID: {userInfo.id}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Badge
              variant="outline"
              className="flex items-center gap-1 py-1.5 px-3"
            >
              <Calendar className="h-4 w-4" />
              <span>{new Date().toLocaleDateString("ko-KR")}</span>
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center gap-1 py-1.5 px-3"
            >
              <Clock className="h-4 w-4" />
              <span>
                이용 가능 시간: {userInfo.startTime.slice(0, -3)} -{" "}
                {userInfo.endTime.slice(0, -3)}
              </span>
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">할당된 시험</p>
                  <h3 className="text-3xl font-bold">
                    {userInfo.exams.length}
                  </h3>
                </div>
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">할당된 총 시험 횟수</p>
                  <h3 className="text-3xl font-bold">
                    {userInfo.exams?.reduce(
                      (total, exam) => total + exam.count,
                      0
                    )}
                  </h3>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">완료된 시험</p>
                  <h3 className="text-3xl font-bold">{completeTests.length}</h3>
                </div>
                <Award className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="start">시작 가능한 시험</TabsTrigger>
            <TabsTrigger value="ongoing">진행 중인 시험</TabsTrigger>
            <TabsTrigger value="completed">완료된 시험</TabsTrigger>
          </TabsList>

          <TabsContent value="start">
            <Card>
              <CardHeader>
                <CardTitle>{userInfo.name} 학생에게 할당된 시험</CardTitle>
                <CardDescription>
                  현재 {userInfo.exams.length}개의 시험이 할당되었습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userInfo.exams.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>제목</TableHead>
                          <TableHead>설명</TableHead>
                          <TableHead className="w-24">난이도</TableHead>
                          <TableHead className="w-24 text-center">
                            모든 모듈 시간
                          </TableHead>
                          <TableHead className="w-24 text-center">
                            쉬는 시간
                          </TableHead>
                          <TableHead className="w-24 text-center">
                            남은 횟수
                          </TableHead>
                          <TableHead className="w-24"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userInfo.exams.map((exam) => {
                          const { moduleTime, breakTime } = calculateTimeInfo(
                            exam.order
                          );
                          return (
                            <TableRow key={exam.testId}>
                              <TableCell className="font-medium">
                                {exam.title}
                              </TableCell>
                              <TableCell>{exam.description}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span
                                      key={i}
                                      className={`w-2 h-2 rounded-full mr-1 ${
                                        i < exam.level
                                          ? "bg-primary"
                                          : "bg-muted"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                {moduleTime}
                              </TableCell>
                              <TableCell className="text-center">
                                {breakTime}
                              </TableCell>
                              <TableCell className="text-center">
                                {exam.count}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  className="mr-2 w-full"
                                  variant="default"
                                  size="icon"
                                  onClick={() => startTest(exam)}
                                >
                                  시험 시작
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BookOpen className="h-12 w-12 text-muted mb-4" />
                    <h3 className="font-medium text-lg">
                      할당된 시험이 없습니다
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      현재 할당된 시험이 없습니다. 곧 새로운 시험이 등록될
                      예정입니다.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ongoing">
            <Card>
              <CardHeader>
                <CardTitle>{userInfo.name} 학생에게 할당된 시험</CardTitle>
                <CardDescription>
                  현재 {onGoingTests?.length}개의 시험이 할당되었습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {onGoingTests.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>제목</TableHead>
                          <TableHead>설명</TableHead>
                          <TableHead className="w-24">난이도</TableHead>
                          <TableHead className="w-24 text-center">
                            모든 모듈 시간
                          </TableHead>
                          <TableHead className="w-24 text-center">
                            쉬는 시간
                          </TableHead>
                          <TableHead className="w-24"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {onGoingTests.map((test) => {
                          const { moduleTime, breakTime } = calculateTimeInfo(
                            test.examInfo.order
                          );
                          return (
                            <TableRow key={test.uid + test.startAt}>
                              <TableCell className="font-medium">
                                {test.examInfo.title}
                              </TableCell>
                              <TableCell>{test.examInfo.description}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span
                                      key={i}
                                      className={`w-2 h-2 rounded-full mr-1 ${
                                        i < test.examInfo.level
                                          ? "bg-primary"
                                          : "bg-muted"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                {moduleTime}
                              </TableCell>
                              <TableCell className="text-center">
                                {breakTime}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  className="mr-2 w-full"
                                  variant="default"
                                  size="icon"
                                  onClick={() => resumeStart(test.uid)}
                                >
                                  이어서 시작
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BookOpen className="h-12 w-12 text-muted mb-4" />
                    <h3 className="font-medium text-lg">
                      할당된 시험이 없습니다
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      현재 할당된 시험이 없습니다. 곧 새로운 시험이 등록될
                      예정입니다.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>완료된 시험 결과</CardTitle>
                <CardDescription>
                  총 {completeTests.length}개의 시험을 완료했습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {completeTests.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>시험 제목</TableHead>
                          <TableHead>설명</TableHead>
                          <TableHead>난이도</TableHead>
                          <TableHead>시작일</TableHead>
                          <TableHead>완료일</TableHead>
                          <TableHead>정답 / 문제수</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {completeTests.map((test) => {
                          return (
                            <TableRow key={test.uid + test.endAt}>
                              <TableCell className="font-medium">
                                {test.examInfo.title}
                              </TableCell>
                              <TableCell>{test.examInfo.description}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span
                                      key={i}
                                      className={`w-2 h-2 rounded-full mr-1 ${
                                        i < test.examInfo.level
                                          ? "bg-primary"
                                          : "bg-muted"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                {new Date(test.startAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  test.endAt as Date
                                ).toLocaleDateString()}
                              </TableCell>

                              <TableCell>추후 개발 예정</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  className="mr-2 w-full"
                                  variant="default"
                                  size="icon"
                                  onClick={() => checkResultDetail(test)}
                                >
                                  결과 확인
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Award className="h-12 w-12 text-muted mb-4" />
                    <h3 className="font-medium text-lg">
                      완료된 시험이 없습니다
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      완료된 시험이 없습니다. 시험을 완료하면 여기에 결과가
                      표시됩니다.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
