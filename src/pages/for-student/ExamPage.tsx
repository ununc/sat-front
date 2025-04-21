import { Module, requestExamModule } from "@/apis/module";
import {
  requestCreateTestResult,
  requestGetUserExamTestResult,
  requestUpdateTestResult,
  TestResult,
} from "@/apis/testResult";
import { RichTextViewer } from "@/components/common/RichTextViewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth";
import { useExamFlowStore } from "@/stores/exam";
import { ChevronRight, Bookmark, Menu, MapPin, Timer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export const ExamPage = () => {
  const { examFlow } = useExamFlowStore();
  const { auth } = useAuthStore();

  const [testPaper, setTestPaper] = useState<TestResult | null>(null);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [showTimer, setShowTimer] = useState(true);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const navigate = useNavigate();
  const maxQuestionIndex = useMemo(() => {
    return currentModule?.questions?.length || 0;
  }, [currentModule]);

  const targetQuestion = useMemo(() => {
    if (!currentModule) return null;
    return testPaper?.moduleResults[testPaper.currentIndex].answers[
      currentQuestion
    ];
  }, [testPaper, currentModule, currentQuestion]);

  const targetExamQuestion = useMemo(() => {
    if (!currentModule) return null;
    return currentModule.questions?.[currentQuestion];
  }, [currentModule, currentQuestion]);

  const handleChangeAnswer = (answer: string) => {
    if (!targetQuestion || !testPaper) return;
    const updatedTestPaper = { ...testPaper };
    const moduleResult =
      updatedTestPaper.moduleResults[updatedTestPaper.currentIndex];
    const answerToUpdate = moduleResult.answers[currentQuestion];
    if (answerToUpdate) {
      answerToUpdate.studentAnswer = answer;
      setTestPaper(updatedTestPaper);
    }
  };

  const markQuestion = () => {
    if (!targetQuestion || !testPaper) return;
    const updatedTestPaper = { ...testPaper };
    const moduleResult =
      updatedTestPaper.moduleResults[updatedTestPaper.currentIndex];
    const answerToUpdate = moduleResult.answers[currentQuestion];
    if (answerToUpdate) {
      answerToUpdate.isMarked = !answerToUpdate.isMarked;
      setTestPaper(updatedTestPaper);
    }
  };

  const callModuleQuestions = async (testPaper: TestResult) => {
    if (!testPaper) return;

    const moduleUID = testPaper.moduleResults[testPaper.currentIndex].moduleId;

    if (moduleUID) {
      const module = await requestExamModule(moduleUID);
      setIsBreakTime(false);
      setCurrentModule(module);
    } else {
      setIsBreakTime(true);
      setCurrentModule(null);
    }
  };

  const checkExist = async () => {
    if (!examFlow.test) return;
    let data;
    if (examFlow.isNew) {
      data = await requestCreateTestResult({
        userId: auth.userInfo.uid,
        examUid: examFlow.test,
      });
    } else {
      data = await requestGetUserExamTestResult(
        auth.userInfo.uid,
        examFlow.test || ""
      );
    }
    setTestPaper(data);
    callModuleQuestions(data);
  };

  const saveAndGetNextModule = async () => {
    if (!testPaper) return;

    const nextIndex = testPaper.currentIndex + 1;

    if (testPaper.moduleResults.length <= nextIndex) {
      const timestamp = new Date().getTime();
      testPaper.endAt = new Date(timestamp);
      await requestUpdateTestResult(testPaper.uid, testPaper);
      navigate("/");
      return;
    }
    testPaper.currentIndex = nextIndex;

    const newTestPaper = await requestUpdateTestResult(
      testPaper.uid,
      testPaper
    );
    setCurrentQuestion(0);
    callModuleQuestions(newTestPaper);
  };

  const handleClickNext = () => {
    if (maxQuestionIndex <= currentQuestion) {
      saveAndGetNextModule();
    } else {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const formatTimeFromSeconds = (seconds: number | undefined) => {
    if (typeof seconds !== "number" || isNaN(seconds)) {
      return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      await checkExist();
    };
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!testPaper) return;

      const updatedTestPaper = { ...testPaper };
      const moduleResult =
        updatedTestPaper.moduleResults[updatedTestPaper.currentIndex];

      if (moduleResult.remainTime > 0) {
        moduleResult.remainTime -= 1;
      }

      const answerToUpdate = moduleResult.answers[currentQuestion];
      if (answerToUpdate) {
        answerToUpdate.spendTime = (answerToUpdate.spendTime || 0) + 1;
      }

      setTestPaper(updatedTestPaper);
    }, 1000);

    return () => clearInterval(timer);
  }, [testPaper, currentQuestion, currentModule]);

  if (isBreakTime) {
    return (
      <div className="flex h-screen w-full bg-background text-foreground">
        {/* 왼쪽 부분 - 타이머 및 재개 버튼 */}
        <div className="flex w-1/2 flex-col items-center justify-center bg-black text-white p-6">
          <div className="flex flex-col items-center space-y-8">
            <h2 className="text-2xl font-semibold mb-4">Break Time</h2>

            <div className="text-7xl font-bold">
              {formatTimeFromSeconds(
                testPaper?.moduleResults[testPaper.currentIndex].remainTime
              )}
            </div>

            <Button
              onClick={saveAndGetNextModule}
              className="bg-white hover:bg-green-200  text-zinc-950 px-10 py-6 rounded-full mt-10"
            >
              Resume Test
            </Button>
          </div>
        </div>

        {/* 오른쪽 부분 - 안내 텍스트 */}
        <div className="w-1/2 bg-black text-white p-10 overflow-y-auto">
          <Card className="bg-black border-0 text-white">
            <CardContent className="p-0 space-y-6">
              <h1 className="text-3xl font-bold">Practice Test Chill Time</h1>

              <p className="text-lg">
                Just gonna park this practice test right here for a sec. We'll
                get back to it when you're all set and good to go. On the actual
                test day, you'll need to wait for the timer to tick down. Here's
                how it goes:
              </p>

              <p className="text-lg font-medium">Time to stretch your legs</p>

              <p className="text-lg">
                Feel free to wander around a bit, but please don't stir up a
                ruckus for the others still grinding away at their tests.
              </p>

              <p className="text-lg">
                Keep the app open and your device awake.
              </p>

              <p className="text-lg">
                We won't jump-start without you, promise!
              </p>

              <p className="text-lg font-medium mt-4">
                Here are a couple of break-time don'ts:
              </p>

              <ol className="list-decimal pl-6 space-y-2 text-lg">
                <li>
                  Keep your phone, fancy wrist gadgets, textbooks, scribbles, or
                  cyber world at bay.
                </li>
                <li>
                  Save the munchies and sips for later, not in the test room,
                  okay?
                </li>
                <li>
                  Shhh... let's keep the room as quiet as a library. Once you
                  step outside, no chit-chat about the exam, deal?
                </li>
              </ol>

              <p className="text-lg mt-6">
                Take a breather and we'll dive back in when you're ready!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!currentModule) {
    return <div>로딩중</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="flex justify-between items-center px-10 pt-4 pb-2 border-b">
        <h1 className="font-medium text-xl w-1/3">
          {currentModule.section} : {currentModule.title}
        </h1>

        <div className="w-1/3 flex flex-col items-center">
          {showTimer ? (
            <div className="text-2xl font-bold">
              {formatTimeFromSeconds(
                testPaper?.moduleResults[testPaper.currentIndex].remainTime
              )}
            </div>
          ) : (
            <div className="h-8">
              <Timer />
            </div>
          )}

          <Button
            variant="outline"
            className="rounded-full mt-1"
            onClick={() => setShowTimer((prev) => !prev)}
          >
            {showTimer ? "Hide" : "Show"}
          </Button>
        </div>
        <div className="flex w-1/3 justify-end items-center gap-4">
          {/* <div className="flex items-center gap-2">
            <Edit size={18} />
            <span className="text-sm text-muted-foreground">Annotate</span>
          </div> */}

          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Menu size={24} />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-blue-300 via-purple-300 to-blue-300"></div>

      {/* Main content */}
      {maxQuestionIndex <= currentQuestion ? (
        <div className="flex flex-col flex-1 justify-center items-center">
          <h2 className="font-bold text-3xl mb-2">Check Your Work</h2>
          <div>
            On test day, you won't be able to move on to the next module until
            time expires.
          </div>
          <div>
            For these practice questions, you can click{" "}
            <span className="font-bold">Next</span> When your're ready to move
            on.
          </div>
          <Card className="mt-12">
            <CardContent>
              <div className="w-[634px]">
                <h1 className="font-medium text-center text-lg">
                  {currentModule.section} : {currentModule.title}
                </h1>
                <div className=" h-0.5 bg-primary my-3"></div>

                <div className="w-full flex flex-wrap gap-2">
                  {currentModule.questions?.map((q, index) => {
                    return (
                      <div key={q.uid} className=" relative">
                        <Button
                          className="w-14 h-14 p-0 text-xl"
                          variant={
                            testPaper?.moduleResults[testPaper.currentIndex]
                              .answers?.[index]?.studentAnswer
                              ? "default"
                              : "outline"
                          }
                          onClick={() => {
                            setCurrentQuestion(index);
                          }}
                        >
                          {index + 1}
                        </Button>
                        {testPaper?.moduleResults[testPaper.currentIndex]
                          .answers[index].isMarked && (
                          <Bookmark
                            size={20}
                            className="fill-red-400 text-red-400 absolute -top-1 -right-1"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-1 justify-center">
          {targetExamQuestion?.paragraph && (
            <Card className="w-1/2 pt-2 rounded-none shadow-none border-r border-t-0 border-l-0 border-b-0">
              <CardContent className="p-6 h-full overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                  <RichTextViewer content={targetExamQuestion.paragraph} />
                </div>
              </CardContent>
            </Card>
          )}
          <Card className="w-1/2 pt-2 rounded-none shadow-none border-none">
            <CardContent className="p-6 h-full overflow-y-auto">
              <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-5">
                  <div className="bg-primary text-primary-foreground rounded-md px-3 py-1">
                    {currentQuestion + 1}
                  </div>

                  <Button
                    variant="ghost"
                    className="flex items-center gap-1 text-muted-foreground"
                    onClick={markQuestion}
                  >
                    <span>Mark for Review</span>
                    <Bookmark
                      className={`${
                        targetQuestion?.isMarked
                          ? "fill-red-400 text-red-400"
                          : ""
                      }`}
                      size={18}
                    />
                  </Button>
                </div>

                <div className="mb-6">
                  <RichTextViewer
                    content={targetExamQuestion?.question || ""}
                  />
                </div>
                {targetExamQuestion?.choices?.length ? (
                  <div key={currentQuestion} className="space-y-4">
                    {targetExamQuestion.choices.map((choice) => {
                      return (
                        <Card
                          key={choice.content}
                          className={`overflow-hidden border rounded-lg p-0 transition-all cursor-pointer ${
                            targetQuestion?.studentAnswer === choice.seq
                              ? "bg-primary text-white"
                              : ""
                          }`}
                          onClick={() => handleChangeAnswer(choice.seq)}
                        >
                          <CardContent className="p-0">
                            <div className="flex items-start p-4">
                              <div className="flex-shrink-0 bg-background border mr-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                                <span className="font-medium text-black">
                                  {choice.seq.toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1">
                                <RichTextViewer content={choice.content} />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Input
                    value={targetQuestion?.studentAnswer}
                    onChange={(e) => handleChangeAnswer(e.target.value)}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer */}
      <Separator />
      <div className="h-0.5 w-full bg-gradient-to-r from-blue-300 via-purple-300 to-blue-300"></div>
      <Separator />

      {/* Navigation */}
      <div className="flex justify-between items-center py-4 px-10">
        <div className="font-medium w-1/3">{auth.userInfo.name}</div>

        <div className="w-1/3 flex justify-center">
          {maxQuestionIndex > currentQuestion && (
            <Popover>
              <PopoverTrigger className="flex items-center gap-2 bg-primary pl-4 pr-3 py-2 rounded-lg text-white">
                <span>
                  Question {currentQuestion + 1} of {maxQuestionIndex}
                </span>
                <ChevronRight size={20} />
              </PopoverTrigger>
              <PopoverContent className="w-[444px]">
                <h1 className="font-medium text-center text-lg">
                  {currentModule.section} : {currentModule.title}
                </h1>
                <div className=" h-0.5 bg-primary my-3"></div>

                <div className="w-full flex flex-wrap  gap-2">
                  {currentModule.questions?.map((q, index) => {
                    return (
                      <div key={q.uid} className=" relative">
                        <Button
                          className="w-8 h-8 p-0"
                          variant={
                            testPaper?.moduleResults[testPaper.currentIndex]
                              .answers?.[index]?.studentAnswer
                              ? "default"
                              : "outline"
                          }
                          onClick={() => {
                            setCurrentQuestion(index);
                          }}
                        >
                          {index + 1}
                        </Button>
                        {currentQuestion === index && (
                          <MapPin
                            size={14}
                            className=" absolute -top-1 -left-1"
                          />
                        )}

                        {testPaper?.moduleResults[testPaper.currentIndex]
                          .answers[index].isMarked && (
                          <Bookmark
                            size={14}
                            className="fill-red-400 text-red-400 absolute -top-1 -right-1"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="w-full flex justify-center mt-4">
                  <Button
                    variant="outline"
                    className="border-zinc-800 rounded-2xl"
                    onClick={() => {
                      setCurrentQuestion(maxQuestionIndex);
                    }}
                  >
                    Go to Review Page
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        <div className="flex gap-3 justify-end  w-1/3">
          <Button
            variant="default"
            className="rounded-full px-8"
            disabled={currentQuestion <= 0}
            onClick={() => {
              setCurrentQuestion((prev) => prev - 1);
            }}
          >
            Back
          </Button>
          <Button
            variant="default"
            className="rounded-full px-8"
            onClick={handleClickNext}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
