import {
  CreateQuestionDto,
  Question,
  requestCreateQuestion,
  requestGetQuestions,
} from "@/apis/question";
import { RichTextEditor } from "@/components/common/RichTextEditor";
import { RichTextViewer } from "@/components/common/RichTextViewer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  ArrowUpDown,
  EyeIcon,
  PlusCircle,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface AlertState {
  show: boolean;
  missingFields: string[];
}

export const QuestionPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInTitle, setSearchInTitle] = useState(true);
  const [searchInParagraph, setSearchInParagraph] = useState(false);
  const [searchInQuestion, setSearchInQuestion] = useState(false);
  const [filterSection, setFilterSection] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newQuestion, setNewQuestion] = useState<CreateQuestionDto>({
    manageTitle: "",
    section: "",
    type: "",
    level: 3,
    paragraph: "",
    question: "",
    includeChoices: true,
    choices: [
      { content: "", seq: "a" },
      { content: "", seq: "b" },
      { content: "", seq: "c" },
      { content: "", seq: "d" },
    ],
    answer: "",
    explanation: "",
  });
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleIncludeChoicesChange = (checked: boolean) => {
    setNewQuestion({
      ...newQuestion,
      includeChoices: checked,
      choices: checked
        ? [
            { content: "", seq: "a" },
            { content: "", seq: "b" },
            { content: "", seq: "c" },
            { content: "", seq: "d" },
          ]
        : [],
      answer: "",
    });
  };

  const handleNewQuestionChange = (field: string, value: string | number) => {
    setNewQuestion({
      ...newQuestion,
      [field]: value,
    });
  };

  const [alert, setAlert] = useState<AlertState>({
    show: false,
    missingFields: [],
  });

  const handleChoiceChange = (index: number, value: string) => {
    const updatedChoices = [...newQuestion.choices];
    updatedChoices[index] = { ...updatedChoices[index], content: value };

    setNewQuestion({
      ...newQuestion,
      choices: updatedChoices,
    });
  };

  const validateForm = () => {
    const requiredFields = [
      "manageTitle",
      "section",
      "type",
      "level",
      "question",
      "answer",
      "explanation",
    ];

    const missingFields = requiredFields.filter(
      (field) => !newQuestion[field as keyof typeof newQuestion]
    );

    return missingFields;
  };

  const getFieldDisplayName = (field: string) => {
    const fieldMap: Record<string, string> = {
      manageTitle: "제목",
      section: "섹션",
      type: "유형",
      level: "레벨",
      question: "질문",
      answer: "답변",
      explanation: "설명",
    };

    return fieldMap[field] || field;
  };

  // 질문 생성 제출 핸들러
  const handleCreateQuestion = async () => {
    const missingFields = validateForm();

    if (missingFields.length > 0) {
      setAlert({
        show: true,
        missingFields,
      });

      // 5초 후 알림 자동 닫기
      setTimeout(() => {
        setAlert({ show: false, missingFields: [] });
      }, 5000);

      return;
    }

    try {
      await requestCreateQuestion(newQuestion);
      // 다이얼로그 닫기 및 폼 초기화
      initCreateQuestion();
    } catch {
      console.error("문제 생성 실패");
    }
  };

  const initCreateQuestion = () => {
    setShowCreateDialog(false);
    setNewQuestion({
      manageTitle: "",
      section: "",
      type: "",
      level: 3,
      paragraph: "",
      question: "",
      includeChoices: true,
      choices: [
        { content: "", seq: "a" },
        { content: "", seq: "b" },
        { content: "", seq: "c" },
        { content: "", seq: "d" },
      ],
      answer: "",
      explanation: "",
    });
  };

  useEffect(() => {
    // IIFE(즉시 실행 함수)를 사용하여 async 함수를 정의하고 바로 실행
    (async () => {
      try {
        const questionData = await requestGetQuestions();
        setQuestions(questionData);
      } catch (error) {
        console.error("질문을 가져오는 중 오류 발생:", error);
      }
    })();
  }, []);

  const filteredAndSortedQuestions = questions
    .filter((question) => {
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

  // 문제 상세 보기
  const handleViewDetail = (question: Question) => {
    setSelectedQuestion(question);
    setShowDetailDialog(true);
  };

  // 고유 섹션 목록
  const uniqueSections = Array.from(new Set(questions.map((q) => q.section)));

  // 고유 타입 목록
  const uniqueTypes = Array.from(new Set(questions.map((q) => q.type)));

  // 객관식 문제인지 확인하는 함수
  const isMultipleChoice = (question: Question) => {
    return question.choices.length > 0;
  };

  // 정답 표시를 위한 함수 - 객관식과 주관식 모두 처리
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">문제 관리</h1>
          <p className="text-muted-foreground">
            문제를 생성하고 수정하며, 목록을 확인하고 검색하세요
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          문제 생성하기
        </Button>
      </div>
      {/* 검색 및 필터 영역 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 검색 영역 */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="검색어를 입력하세요"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="searchTitle"
                    checked={searchInTitle}
                    onCheckedChange={() => setSearchInTitle(!searchInTitle)}
                  />
                  <Label htmlFor="searchTitle">제목에서 검색</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="searchParagraph"
                    checked={searchInParagraph}
                    onCheckedChange={() =>
                      setSearchInParagraph(!searchInParagraph)
                    }
                  />
                  <Label htmlFor="searchParagraph">지문에서 검색</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="searchQuestion"
                    checked={searchInQuestion}
                    onCheckedChange={() =>
                      setSearchInQuestion(!searchInQuestion)
                    }
                  />
                  <Label htmlFor="searchQuestion">문제에서 검색</Label>
                </div>
              </div>
            </div>

            {/* 필터 및 정렬 영역 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filterSection">섹션별 필터</Label>
                <Select value={filterSection} onValueChange={setFilterSection}>
                  <SelectTrigger id="filterSection">
                    <SelectValue placeholder="모든 섹션" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 섹션</SelectItem>
                    {uniqueSections.map((section) => (
                      <SelectItem key={section} value={section}>
                        {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterType">유형별 필터</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger id="filterType">
                    <SelectValue placeholder="모든 유형" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 유형</SelectItem>
                    {uniqueTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filterLevel">난이도별 필터</Label>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger id="filterLevel">
                    <SelectValue placeholder="모든 난이도" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 난이도</SelectItem>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        {level} / 5
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder">정렬 방식</Label>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger id="sortOrder">
                    <SelectValue placeholder="정렬 방식" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">최신순 (내림차순)</SelectItem>
                    <SelectItem value="asc">오래된순 (오름차순)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSearchInTitle(true);
                    setSearchInParagraph(false);
                    setSearchInQuestion(false);
                    setFilterSection("all");
                    setFilterType("all");
                    setFilterLevel("all");
                    setSortOrder("desc");
                  }}
                  className="w-full"
                >
                  필터 초기화
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* 질문 목록 테이블 */}
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
                  <TableHead className="w-12">번호</TableHead>
                  <TableHead>제목</TableHead>
                  <TableHead>섹션</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead className="w-26">난이도</TableHead>
                  <TableHead className="w-26">
                    <div className="flex items-center">
                      생성일
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }
                        className="ml-1 h-5 w-5"
                      >
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="w-12">자세히</TableHead>
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
                  filteredAndSortedQuestions.map((question, index) => (
                    <TableRow key={question.uid}>
                      <TableCell>{index + 1}</TableCell>
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
                                i < question.level ? "bg-primary" : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(question.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetail(question)}
                        >
                          <EyeIcon className="h-4 w-4" />
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
      {/* 상세 보기 다이얼로그 */}
      {selectedQuestion && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedQuestion.manageTitle}</DialogTitle>
            </DialogHeader>
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
            <div className="space-y-6 mt-4 max-h-[70vh] overflow-y-auto">
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

              <div className="space-y-2">
                <h3 className="text-lg font-medium">해설</h3>
                <RichTextViewer
                  className="p-4 bg-muted/50 rounded-md"
                  content={selectedQuestion.explanation}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={showCreateDialog} onOpenChange={() => {}}>
        <DialogContent className="max-w-4xl [&>button]:hidden">
          <DialogHeader>
            <DialogTitle>새 문제 생성</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4 max-h-[70vh] p-1 overflow-y-auto">
            {/* 문제 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manageTitle">제목 *</Label>
                <Input
                  id="manageTitle"
                  value={newQuestion.manageTitle}
                  onChange={(e) =>
                    handleNewQuestionChange("manageTitle", e.target.value)
                  }
                  placeholder="문제 관리용 제목"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section">섹션 *</Label>
                <Input
                  id="section"
                  value={newQuestion.section}
                  onChange={(e) =>
                    handleNewQuestionChange("section", e.target.value)
                  }
                  placeholder="예: 수학, 과학, 국어 등"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">유형 *</Label>
                <Input
                  id="type"
                  value={newQuestion.type}
                  onChange={(e) =>
                    handleNewQuestionChange("type", e.target.value)
                  }
                  placeholder="예: 독해, 문법 등"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">난이도 *</Label>
                <Select
                  value={newQuestion.level.toString()}
                  onValueChange={(value) =>
                    handleNewQuestionChange("level", parseInt(value))
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

            {/* 지문 */}
            <div className="space-y-2">
              <Label htmlFor="paragraph">지문</Label>
              <RichTextEditor
                value={newQuestion.paragraph}
                onChange={(value) =>
                  handleNewQuestionChange("paragraph", value)
                }
                placeholder="문제 지문을 입력하세요 (선택사항)"
              />
            </div>

            {/* 문제 */}
            <div className="space-y-2">
              <Label htmlFor="question">문제 *</Label>
              <RichTextEditor
                value={newQuestion.question}
                onChange={(value) => handleNewQuestionChange("question", value)}
                placeholder="문제 텍스트를 입력하세요"
              />
            </div>

            {/* 객관식 설정 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeChoices"
                  checked={newQuestion.includeChoices}
                  onCheckedChange={handleIncludeChoicesChange}
                />
                <Label htmlFor="includeChoices">객관식 선택지 포함</Label>
              </div>

              {/* 선택지 (객관식인 경우만 표시) */}
              {newQuestion.includeChoices && (
                <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                  <h3 className="font-medium">선택지</h3>
                  {newQuestion.choices.map((choice, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-muted">
                        {choice.seq.toUpperCase()}
                      </div>

                      <RichTextEditor
                        value={choice.content}
                        onChange={(value) => handleChoiceChange(index, value)}
                        placeholder={`선택지 ${choice.seq.toUpperCase()} 내용`}
                      />
                    </div>
                  ))}

                  <div className="space-y-2">
                    <Label htmlFor="answer">정답 선택 *</Label>
                    <Select
                      value={newQuestion.answer}
                      onValueChange={(value) =>
                        handleNewQuestionChange("answer", value)
                      }
                    >
                      <SelectTrigger id="answer">
                        <SelectValue placeholder="정답 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {newQuestion.choices.map((choice) => (
                          <SelectItem key={choice.seq} value={choice.seq}>
                            {choice.seq.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* 주관식 정답 (주관식인 경우만 표시) */}
              {!newQuestion.includeChoices && (
                <div className="space-y-2 pl-6 border-l-2 border-primary/20">
                  <Label htmlFor="subjective-answer">주관식 정답 *</Label>
                  <Input
                    id="subjective-answer"
                    value={newQuestion.answer}
                    onChange={(e) =>
                      handleNewQuestionChange("answer", e.target.value)
                    }
                    placeholder="정답을 입력하세요"
                    required
                  />
                </div>
              )}
            </div>

            {/* 해설 */}
            <div className="space-y-2">
              <Label htmlFor="explanation">해설 *</Label>
              <RichTextEditor
                value={newQuestion.explanation}
                onChange={(value) =>
                  handleNewQuestionChange("explanation", value)
                }
                placeholder="문제 해설을 입력하세요"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={initCreateQuestion}>
              취소
            </Button>
            <Button onClick={handleCreateQuestion}>문제 생성</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {alert.show && (
        <div className="fixed top-4 right-4 z-[100] w-80 shadow-lg">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <div className="flex items-start justify-between w-full">
              <div>
                <AlertTitle className="text-destructive">입력 오류</AlertTitle>
                <AlertDescription>
                  다음 필수 필드를 입력해주세요:
                  <ul className="mt-2 list-disc list-inside">
                    {alert.missingFields.map((field) => (
                      <li key={field}>{getFieldDisplayName(field)}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded-full"
                onClick={() => setAlert({ show: false, missingFields: [] })}
              >
                <X size={16} />
              </Button>
            </div>
          </Alert>
        </div>
      )}
    </div>
  );
};
