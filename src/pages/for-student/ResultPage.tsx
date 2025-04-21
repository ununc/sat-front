import {
  ModuleResultDto,
  requestGetTestResult,
  TestResult,
} from "@/apis/testResult";
import { useResultStore } from "@/stores/result";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { CalendarDays, Clock, Clock3 } from "lucide-react";

export const ResultPage = () => {
  const { resultId } = useParams();
  const { resultInfo } = useResultStore();
  const [examData, setExamData] = useState<TestResult | null>(null);
  const [explanationOpen, setExplanationOpen] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await requestGetTestResult(resultId || "");
        data.moduleResults = data.moduleResults.filter(
          (module) => module.moduleId
        );
        setExamData(data);
      } catch (error) {
        console.error("시험 결과를 가져오는 중 오류 발생:", error);
      }
    };

    fetchData();
  }, [resultId]);

  if (!examData) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div>오류 발생</div>
        <div>시험 결과를 불러올 수 없습니다.</div>
      </div>
    );
  }

  const handleOpenExplanation = (uid: string) => {
    console.log(uid);
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (seconds: number): string => {
    if (!seconds && seconds !== 0) return "-";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds}초`;
    } else {
      return `${minutes}분 ${remainingSeconds}초`;
    }
  };

  const getModuleStats = (moduleResult: ModuleResultDto) => {
    const answers = moduleResult.answers;
    const totalQuestions = answers.length;
    const correctAnswers = answers.filter(
      (answer) => answer.studentAnswer === answer.questionAnswer
    );
    const correctCount = correctAnswers.length;
    const incorrectCount = totalQuestions - correctCount;
    const correctRate =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;

    return { totalQuestions, correctCount, incorrectCount, correctRate };
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* 결과 요약 카드 */}
      <Card className="mb-6 shadow-sm border border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl text-primary/90">
            {resultInfo.testTitle}
          </CardTitle>
          <CardDescription className="text-base">
            {resultInfo.testDescription}
          </CardDescription>

          {/* 난이도 표시 */}
          <div className="flex items-center mt-3 mb-1">
            <span className="text-sm text-muted-foreground mr-2">난이도:</span>
            <div className="flex space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${
                    i < resultInfo.testLevel ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* 시험 시간 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 mt-2 border-t border-border/30">
            <div className="flex items-center text-sm">
              <CalendarDays className="w-4 h-4 mr-2 text-primary/70" />
              <span className="font-medium mr-1">시작:</span>
              <span className="text-muted-foreground">
                {formatDate(examData.startAt)}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 mr-2 text-primary/70" />
              <span className="font-medium mr-1">종료:</span>
              <span className="text-muted-foreground">
                {formatDate(examData.endAt as Date)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 모듈 요약 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
        {examData.moduleResults.map((module, index) => {
          const stats = getModuleStats(module);
          return (
            <Card
              key={module.moduleId}
              className="overflow-hidden shadow-sm border border-border/40 hover:border-border transition-all duration-200"
            >
              <CardHeader className="pb-2 bg-card">
                <CardDescription className="text-sm font-medium">
                  모듈 {index + 1} - {stats.totalQuestions}문제
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-3 flex flex-col items-center justify-center shadow-sm">
                    <div className="text-xl font-bold text-green-600 dark:text-green-400">
                      {stats.correctCount}
                    </div>
                    <div className="text-xs text-muted-foreground">정답</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-md p-3 flex flex-col items-center justify-center shadow-sm">
                    <div className="text-xl font-bold text-red-600 dark:text-red-400">
                      {stats.incorrectCount}
                    </div>
                    <div className="text-xs text-muted-foreground">오답</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-3 flex flex-col items-center justify-center shadow-sm">
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.correctRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">정답률</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 세부 결과 아코디언 */}
      <div className="mb-6 space-y-4">
        {examData.moduleResults.map((module, index) => {
          const stats = getModuleStats(module);

          return (
            <div
              key={module.moduleId}
              className="rounded-lg overflow-hidden border border-border/40"
            >
              <div className="bg-muted/30 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center">
                  <span className="font-medium">모듈 {index + 1}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    ({stats.correctCount}/{module.answers.length} 정답)
                  </span>
                </div>
                <Badge variant="outline" className="bg-card">
                  정답률 {stats.correctRate}%
                </Badge>
              </div>

              <div className="p-4 space-y-3 bg-card/50">
                {module.answers.map((answer, answerIndex) => {
                  const isCorrect =
                    answer.studentAnswer === answer.questionAnswer;

                  return (
                    <div
                      key={answerIndex}
                      className={`p-4 rounded-lg border ${
                        isCorrect
                          ? "border-green-200 bg-green-50/80 dark:bg-green-900/5"
                          : "border-red-200 bg-red-50/80 dark:bg-red-900/5"
                      } transition-colors duration-200`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <span className="font-medium mr-2">
                            문제 {answerIndex + 1}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 px-2 ml-1"
                            onClick={() =>
                              handleOpenExplanation(answer.questionId)
                            }
                          >
                            해설 보기
                          </Button>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock3 className="w-3 h-3 mr-1" />
                            {formatTime(answer.spendTime)}
                          </div>
                          <Badge
                            variant={isCorrect ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {isCorrect ? "정답" : "오답"}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 rounded-md bg-background/80 border border-border/20">
                          <div className="text-xs text-muted-foreground mb-1">
                            제출한 답
                          </div>
                          <div className="font-medium break-all">
                            {!answer.studentAnswer
                              ? "(미응답)"
                              : answer.studentAnswer}
                          </div>
                        </div>
                        <div className="p-3 rounded-md bg-background/80 border border-border/20">
                          <div className="text-xs text-muted-foreground mb-1">
                            정답
                          </div>
                          <div className="font-medium break-all">
                            {answer.questionAnswer}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 해설 모달 */}
      <Dialog open={explanationOpen} onOpenChange={setExplanationOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <span className="mr-2">문제 해설</span>
              <Badge variant="outline" className="ml-2 text-xs"></Badge>
            </DialogTitle>
            <DialogDescription>
              이 문제에 대한 상세 설명입니다.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <div className="text-sm font-medium mb-2">해설</div>
            <div className="p-4 rounded-md bg-muted text-foreground">
              이 문제에 대한 해설 내용이 여기에 표시됩니다. 문제에 대한 이해를
              돕기 위한 설명과 해결 방법이 포함됩니다.
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <DialogClose asChild>
              <Button variant="outline">닫기</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
