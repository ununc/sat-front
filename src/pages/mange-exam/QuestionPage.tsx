import {
  CreateQuestionDto,
  Question,
  requestGetQuestions,
} from "@/apis/question";
import { QDetail } from "@/components/question/QDetail";
import { QEdit } from "@/components/question/QEdit";
import { QFilter } from "@/components/question/QFilter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import {
  AlertCircle,
  ArrowUpDown,
  ChevronLeft,
  Edit3Icon,
  EyeIcon,
  PlusCircle,
  Trash,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const [showDelete, setShowDelete] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState<
    "create" | "edit" | null
  >(null);
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

  const [alert, setAlert] = useState<AlertState>({
    show: false,
    missingFields: [],
  });
  const navigate = useNavigate();

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

  const handleBack = () => {
    navigate("/");
  };

  useEffect(() => {
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

  const handleDelete = (question: Question) => {
    setSelectedQuestion(question);
    setShowDelete(true);
    setShowDetailDialog(true);
  };

  const handleEdit = (question: Question) => {
    if (question.choices.length) {
      (question as CreateQuestionDto).includeChoices = true;
    }
    setNewQuestion(question as CreateQuestionDto);
    setShowCreateDialog("edit");
  };

  return (
    <div className="container mx-auto pt-4 pb-8 px-4">
      <Button
        variant="outline"
        size="sm"
        onClick={handleBack}
        className="flex items-center mb-4 gap-1 text-sm font-medium transition-colors hover:bg-secondary"
      >
        <ChevronLeft className="h-4 w-4" />
        뒤로가기
      </Button>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">문제 관리</h1>
          <p className="text-muted-foreground">
            문제를 생성하고 수정하며, 목록을 확인하고 검색하세요
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog("create")}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          문제 생성하기
        </Button>
      </div>
      {/* 검색 및 필터 영역 */}
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
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                        }
                        className="ml-1 h-5 w-5"
                      >
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="w-24 text-center">액션</TableHead>
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
                          className="mr-2"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetail(question)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          className="mr-2"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(question)}
                        >
                          <Edit3Icon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(question)}
                        >
                          <Trash className="h-4 w-4" />
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
      <QDetail
        selectedQuestion={selectedQuestion}
        showDetailDialog={showDetailDialog}
        setShowDetailDialog={setShowDetailDialog}
        showDelete={showDelete}
        setShowDelete={setShowDelete}
        questions={questions}
        setQuestions={setQuestions}
      />
      <QEdit
        newQuestion={newQuestion}
        setNewQuestion={setNewQuestion}
        setAlert={setAlert}
        setQuestions={setQuestions}
        showCreateDialog={showCreateDialog}
        setShowCreateDialog={setShowCreateDialog}
      />

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
