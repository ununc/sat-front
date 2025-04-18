import { Dialog, DialogContent, DialogTitle, DialogHeader } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
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
import {
  Module,
  requestCreateModule,
  requestUpdateModule,
  type CreateModuleDto,
} from "@/apis/module";
import {
  ArrowUpDown,
  Check,
  CircleX,
  EyeIcon,
  Plus,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { QFilter } from "../question/QFilter";
import { requestGetQuestions, type Question } from "@/apis/question";
import { RichTextViewer } from "../common/RichTextViewer";
import { MSelectedPreview } from "./MSelectedPreview";

interface AlertState {
  show: boolean;
  missingFields: string[];
}

interface IProps {
  newModule: CreateModuleDto;
  setNewModule: React.Dispatch<React.SetStateAction<CreateModuleDto>>;
  setAlert: React.Dispatch<React.SetStateAction<AlertState>>;
  setModules: React.Dispatch<React.SetStateAction<Module[]>>;
  showCreateDialog: "create" | "edit" | null;
  setShowCreateDialog: React.Dispatch<
    React.SetStateAction<"create" | "edit" | null>
  >;
}

export const MEdit = ({
  newModule,
  setNewModule,
  setAlert,
  setModules,
  showCreateDialog,
  setShowCreateDialog,
}: IProps) => {
  const [currentQ, setCurrentQ] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchInTitle, setSearchInTitle] = useState(true);
  const [searchInParagraph, setSearchInParagraph] = useState(false);
  const [searchInQuestion, setSearchInQuestion] = useState(false);
  const [filterSection, setFilterSection] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [questions, setQuestions] = useState<Question[]>([]);

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleNewModuleChange = (field: string, value: string | number) => {
    setNewModule({
      ...newModule,
      [field]: value,
    });
  };

  const validateForm = () => {
    const requiredFields = ["title", "section", "level"];
    const missingFields = requiredFields.filter(
      (field) => !newModule[field as keyof typeof newModule]
    );
    const uniqueQuestions = new Set(newModule.questions);
    const hasDuplicates = uniqueQuestions.size !== newModule.questions.length;
    const hasEmptySlots = newModule.questions.some((uid) => !uid);
    return {
      missingFields,
      hasDuplicates,
      hasEmptySlots,
    };
  };

  const handleCreateQuestion = async () => {
    const { missingFields, hasDuplicates, hasEmptySlots } = validateForm();

    if (missingFields.length > 0 || hasDuplicates || hasEmptySlots) {
      const alertMessage = [];

      if (missingFields.length > 0) {
        alertMessage.push(...missingFields);
      }

      if (hasDuplicates) {
        alertMessage.push("중복된 문제가 있습니다.");
      }

      if (hasEmptySlots) {
        alertMessage.push("문제가 설정되지 않은 문제 슬롯이 있습니다.");
      }

      setAlert({
        show: true,
        missingFields: alertMessage,
      });

      setTimeout(() => {
        setAlert({ show: false, missingFields: [] });
      }, 5000);
      return;
    }

    try {
      if (showCreateDialog === "create") {
        const data = await requestCreateModule(newModule);
        setModules((prevModules) => [...prevModules, data]);
      } else {
        const data = await requestUpdateModule(newModule);
        setModules((prevModules) =>
          prevModules.map((module) => (module.uid === data.uid ? data : module))
        );
      }
      initCreateModule();
    } catch {
      console.error("모듈 생성 실패");
    }
  };

  const initCreateModule = () => {
    setShowCreateDialog(null);
    setNewModule({
      title: "",
      description: "",
      section: "",
      level: 3,
      questions: [],
    });
  };

  const handleSlotSelect = (index: number) => {
    if (index === 9999) {
      setNewModule({
        ...newModule,
        questions: [...newModule.questions, ""],
      });

      setCurrentQ(newModule.questions.length);
      return;
    }
    setCurrentQ(index);
  };

  const handleDeleteQ = (index: number) => {
    const updatedQuestions = [...newModule.questions];
    updatedQuestions.splice(index, 1);
    setNewModule({
      ...newModule,
      questions: updatedQuestions,
    });
    setCurrentQ(null);
  };

  const handleSelectQuestion = (uid: string) => {
    const updatedQuestions = [...newModule.questions];
    if (currentQ === null) return;
    updatedQuestions[currentQ] = uid;
    setNewModule({
      ...newModule,
      questions: updatedQuestions,
    });
  };

  // 툴팁 열기 함수
  const handleTooltipOpen = (question: Question) => {
    setSelectedQuestion(question);
    setTooltipOpen(true);
  };

  // 툴팁 닫기 함수
  const handleTooltipClose = () => {
    setTooltipOpen(false);
  };

  const isMultipleChoice = (question: Question) => {
    return question.choices.length > 0;
  };

  const renderAnswer = (question: Question) => {
    if (isMultipleChoice(question)) {
      // 객관식 문제인 경우 해당 선택지 표시
      const answerChoice = question.choices.find(
        (choice) => choice.seq === question.answer
      );
      return (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">정답</h3>
          <div className="flex items-start p-2 rounded-md bg-primary/10">
            <div className="w-8 h-8 flex items-center justify-center rounded-full mr-2 bg-primary text-primary-foreground">
              {question.answer.toUpperCase()}
            </div>
            {answerChoice && (
              <RichTextViewer
                className="flex-1"
                content={answerChoice.content}
              />
            )}
          </div>
        </div>
      );
    } else {
      // 주관식 문제인 경우 answer 자체를 표시
      return (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">정답</h3>
          <div className="p-4 bg-primary/10 rounded-md">{question.answer}</div>
        </div>
      );
    }
  };

  useEffect(() => {
    if (showCreateDialog === null) return;
    (async () => {
      try {
        const questionData = await requestGetQuestions();
        setQuestions(questionData);
      } catch (error) {
        console.error("질문을 가져오는 중 오류 발생:", error);
      }
    })();
  }, [showCreateDialog]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setTooltipOpen(false);
      }
    }

    if (tooltipOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [tooltipOpen]);

  const filteredAndSortedQuestions = questions
    .filter((question) => {
      // 선택된 문제는 필터링
      const isAlreadySelected = newModule.questions.includes(question.uid);
      if (isAlreadySelected) return false;

      // 검색어 필터링
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch =
        (searchInTitle &&
          question.manageTitle.toLowerCase().includes(searchTermLower)) ||
        (searchInParagraph &&
          question.paragraph.toLowerCase().includes(searchTermLower)) ||
        (searchInQuestion &&
          question.question.toLowerCase().includes(searchTermLower));

      // 섹션 필터링
      const matchesSection =
        filterSection === "all" ? true : question.section === filterSection;

      // 유형 필터링
      const matchesType =
        filterType === "all" ? true : question.type === filterType;

      // 난이도 필터링
      const matchesLevel =
        filterLevel === "all" ? true : question.level === parseInt(filterLevel);

      return matchesSearch && matchesSection && matchesType && matchesLevel;
    })
    .sort((a, b) => {
      // 생성일 기준 정렬
      if (sortOrder === "asc") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      } else {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    });
  return (
    <Dialog open={Boolean(showCreateDialog)} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>
            {showCreateDialog === "create" ? "새 모듈 생성" : "모듈 수정"}
          </DialogTitle>
          <div>
            <Button
              className="mr-2"
              variant="outline"
              onClick={initCreateModule}
            >
              취소
            </Button>
            <Button onClick={handleCreateQuestion}>
              모듈 {showCreateDialog === "create" ? "생성" : "수정"}
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-6 mt-4 max-h-[70vh] p-1 overflow-y-auto">
          {/* 문제 기본 정보 */}
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              value={newModule.title}
              onChange={(e) => handleNewModuleChange("title", e.target.value)}
              placeholder="모듈 제목"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Input
              id="description"
              value={newModule.description}
              onChange={(e) =>
                handleNewModuleChange("description", e.target.value)
              }
              placeholder="모듈 설명"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="section">섹션 *</Label>
              <Input
                id="section"
                value={newModule.section}
                onChange={(e) =>
                  handleNewModuleChange("section", e.target.value)
                }
                placeholder="예: 수학, 과학, 국어 등"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">난이도 *</Label>
              <Select
                value={newModule.level.toString()}
                onValueChange={(value) =>
                  handleNewModuleChange("level", parseInt(value))
                }
              >
                <SelectTrigger id="level">
                  <SelectValue placeholder="난이도 선택" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      {level} / 5
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">문제 슬롯 선택</h3>
            <p className="text-sm text-muted-foreground mb-4">
              슬롯 번호를 선택하고 아래에서 문제를 선택하세요.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {newModule.questions.map((uid, index) => (
                <Button
                  key={uid + index}
                  variant={currentQ === index ? "default" : "outline"}
                  className="w-10 h-10 p-0 relative"
                  onClick={() => handleSlotSelect(index)}
                >
                  {index + 1}
                  {uid && (
                    <div className="absolute bottom-1 right-0 w-5 h-1 border-2 border-green-500 rounded-full flex items-center justify-center"></div>
                  )}
                  <Button
                    variant="ghost"
                    className="absolute -top-1 -right-2.5 w-3 h-3 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteQ(index);
                    }}
                  >
                    <CircleX className="text-gray-400" />
                  </Button>
                </Button>
              ))}

              <Button
                key={"plus"}
                variant="outline"
                className="w-10 h-10 p-0 relative"
                onClick={() => handleSlotSelect(9999)}
              >
                <Plus />
              </Button>
            </div>
            <div>
              {currentQ !== null ? (
                <MSelectedPreview
                  question={questions.find(
                    (q) => q.uid === newModule.questions[currentQ]
                  )}
                />
              ) : (
                ""
              )}
            </div>
          </div>
          {currentQ !== null && (
            <>
              <QFilter
                setSearchTerm={setSearchTerm}
                setSearchInTitle={setSearchInTitle}
                setSearchInParagraph={setSearchInParagraph}
                setSearchInQuestion={setSearchInQuestion}
                setFilterSection={setFilterSection}
                setFilterType={setFilterType}
                setFilterLevel={setFilterLevel}
                setSortOrder={setSortOrder}
                questions={questions}
                searchTerm={searchTerm}
                searchInTitle={searchInTitle}
                searchInParagraph={searchInParagraph}
                searchInQuestion={searchInQuestion}
                filterSection={filterSection}
                filterType={filterType}
                filterLevel={filterLevel}
                sortOrder={sortOrder}
              />
              <Card>
                <CardHeader>
                  <CardTitle>문제 목록</CardTitle>
                  <CardDescription>
                    총 {filteredAndSortedQuestions.length}개의 문제가 있습니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-24">섹션</TableHead>
                          <TableHead>제목</TableHead>
                          <TableHead>유형</TableHead>
                          <TableHead className="w-28">난이도</TableHead>
                          <TableHead className="w-28">
                            <div className="flex items-center">
                              생성일
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setSortOrder(
                                    sortOrder === "asc" ? "desc" : "asc"
                                  )
                                }
                                className="ml-1 h-5 w-5"
                              >
                                <ArrowUpDown className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableHead>
                          <TableHead className="w-20 text-center">
                            액션
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAndSortedQuestions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              검색 결과가 없습니다.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredAndSortedQuestions.map((question) => (
                            <TableRow key={question.uid}>
                              <TableCell className="font-medium">
                                {question.manageTitle}
                              </TableCell>
                              <TableCell>{question.section}</TableCell>
                              <TableCell>{question.type}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span
                                      key={i}
                                      className={`w-2 h-2 rounded-full mr-1 ${
                                        i < question.level
                                          ? "bg-primary"
                                          : "bg-muted"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  question.createdAt
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  className="mr-2"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleTooltipOpen(question)}
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleSelectQuestion(question.uid)
                                  }
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {tooltipOpen && selectedQuestion && (
                <div
                  ref={tooltipRef}
                  className="absolute z-50 bg-card border border-border rounded-lg shadow-lg p-4 w-[700px] max-w-[90vw] max-h-[80vh] overflow-y-auto"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="">
                    <h3 className="text-lg font-semibold">
                      {selectedQuestion.manageTitle}
                    </h3>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="px-3 py-1 bg-primary/10 rounded-full">
                        섹션: {selectedQuestion.section}
                      </div>
                      <div className="px-3 py-1 bg-primary/10 rounded-full">
                        유형: {selectedQuestion.type}
                      </div>
                      <div className="px-3 py-1 bg-primary/10 rounded-full">
                        난이도: {selectedQuestion.level}/5
                      </div>
                    </div>
                    <div className="space-y-6 mt-4">
                      {selectedQuestion.paragraph && (
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">지문</h3>
                          <RichTextViewer
                            className="p-4 bg-muted/50 rounded-md"
                            content={selectedQuestion.paragraph}
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">문제</h3>
                        <RichTextViewer
                          className="p-4 bg-muted/50 rounded-md"
                          content={selectedQuestion.question}
                        />
                      </div>
                      {isMultipleChoice(selectedQuestion) && (
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">선택지</h3>
                          <div className="space-y-2">
                            {selectedQuestion.choices.map((choice, index) => (
                              <div
                                key={index}
                                className="flex items-start p-2 rounded-md"
                              >
                                <div
                                  className={`w-8 h-8 flex items-center justify-center rounded-full mr-2 ${
                                    selectedQuestion.answer === choice.seq
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted"
                                  }`}
                                >
                                  {choice.seq.toUpperCase()}
                                </div>
                                <RichTextViewer
                                  className="flex-1"
                                  content={choice.content}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 정답 표시 부분 */}
                      {renderAnswer(selectedQuestion)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-8 w-8"
                      onClick={handleTooltipClose}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
