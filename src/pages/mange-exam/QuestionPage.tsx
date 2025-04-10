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
import { ArrowUpDown, EyeIcon, Search } from "lucide-react";
import { useState } from "react";

interface Choice {
  content: string;
  seq: "a" | "b" | "c" | "d";
}

interface Question {
  uid: string;
  manageTitle: string;
  section: string;
  type: string;
  level: number;
  paragraph: string;
  question: string;
  choices: Choice[];
  answer: string;
  explanation: string;
  createdAt: Date;
  updatedAt: Date;
}

const mockQuestions: Question[] = [
  {
    uid: "1",
    manageTitle: "수학 함수 문제 1",
    section: "수학",
    type: "객관식",
    level: 3,
    paragraph: "<p>다음 함수에 대해 생각해보세요.</p>",
    question: "<p>함수 $f(x) = 2x^2 + 3x - 5$의 최솟값은?</p>",
    choices: [
      { content: "<p>$-5$</p>", seq: "a" },
      { content: "<p>$-6$</p>", seq: "b" },
      { content: "<p>$-7.25$</p>", seq: "c" },
      { content: "<p>$-8.5$</p>", seq: "d" },
    ],
    answer: "c",
    explanation:
      "<p>$f(x) = 2x^2 + 3x - 5$에서 $f'(x) = 4x + 3$이므로, $f'(x) = 0$일 때 $x = -\\frac{3}{4}$입니다. 이 값을 원래 함수에 대입하면 $f(-\\frac{3}{4}) = 2(-\\frac{3}{4})^2 + 3(-\\frac{3}{4}) - 5 = 2\\cdot\\frac{9}{16} - \\frac{9}{4} - 5 = \\frac{18}{16} - \\frac{36}{16} - 5 = -\\frac{18}{16} - 5 = -\\frac{18}{16} - \\frac{80}{16} = -\\frac{98}{16} = -7.25$</p>",
    createdAt: new Date("2023-05-15"),
    updatedAt: new Date("2023-06-10"),
  },
  {
    uid: "2",
    manageTitle: "영어 어휘 문제",
    section: "영어",
    type: "객관식",
    level: 2,
    paragraph:
      "<p>다음 지문을 읽고 물음에 답하세요.</p><p>The scientist conducted numerous experiments to validate her hypothesis about cellular regeneration.</p>",
    question: "<p>'numerous'와 가장 유사한 의미의 단어는?</p>",
    choices: [
      { content: "<p>few</p>", seq: "a" },
      { content: "<p>many</p>", seq: "b" },
      { content: "<p>significant</p>", seq: "c" },
      { content: "<p>special</p>", seq: "d" },
    ],
    answer: "b",
    explanation:
      "<p>'numerous'는 '많은, 다수의'라는 의미로, 'many'와 가장 유사합니다.</p>",
    createdAt: new Date("2023-07-23"),
    updatedAt: new Date("2023-07-25"),
  },
  {
    uid: "3",
    manageTitle: "과학 물리 문제",
    section: "과학",
    type: "객관식",
    level: 4,
    paragraph: "",
    question:
      "<p>질량이 2kg인 물체에 10N의 힘을 가했을 때 물체의 가속도는?</p>",
    choices: [
      { content: "<p>2 m/s²</p>", seq: "a" },
      { content: "<p>5 m/s²</p>", seq: "b" },
      { content: "<p>8 m/s²</p>", seq: "c" },
      { content: "<p>10 m/s²</p>", seq: "d" },
    ],
    answer: "b",
    explanation:
      "<p>뉴턴의 제2법칙에 따르면 F = ma이므로, a = F/m = 10N/2kg = 5 m/s²</p>",
    createdAt: new Date("2023-08-05"),
    updatedAt: new Date("2023-08-15"),
  },
  {
    uid: "4",
    manageTitle: "국어 문법 문제",
    section: "국어",
    type: "객관식",
    level: 2,
    paragraph: "",
    question: "<p>다음 중 문장 성분의 생략이 잘못된 것은?</p>",
    choices: [
      { content: "<p>나는 학교에 갔다.</p>", seq: "a" },
      { content: "<p>비가 내린다.</p>", seq: "b" },
      { content: "<p>책을 읽었다.</p>", seq: "c" },
      { content: "<p>어제 만났다.</p>", seq: "d" },
    ],
    answer: "d",
    explanation:
      "<p>'어제 만났다'는 주어와 목적어가 모두 생략되어 문맥 없이는 이해하기 어렵습니다.</p>",
    createdAt: new Date("2023-09-10"),
    updatedAt: new Date("2023-09-12"),
  },
  {
    uid: "q2",
    manageTitle: "주관식 질문 예시",
    section: "수학",
    type: "새로운",
    level: 4,
    paragraph: "",
    question: "다음 방정식을 풀어보세요: 2x + 5 = 15",
    choices: [],
    answer: "x = 5",
    explanation: "2x + 5 = 15<br>2x = 10<br>x = 5",
    createdAt: new Date(2023, 7, 20),
    updatedAt: new Date(2023, 7, 20),
  },
];

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

  const filteredAndSortedQuestions = mockQuestions
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
        return a.createdAt.getTime() - b.createdAt.getTime();
      } else {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

  // 문제 상세 보기
  const handleViewDetail = (question: Question) => {
    setSelectedQuestion(question);
    setShowDetailDialog(true);
  };

  // 고유 섹션 목록
  const uniqueSections = Array.from(
    new Set(mockQuestions.map((q) => q.section))
  );

  // 고유 타입 목록
  const uniqueTypes = Array.from(new Set(mockQuestions.map((q) => q.type)));

  // 객관식 문제인지 확인하는 함수
  const isMultipleChoice = (question: Question) => {
    return question.type === "객관식" && question.choices.length > 0;
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
              <div
                className="flex-1"
                dangerouslySetInnerHTML={{ __html: answerChoice.content }}
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
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">문제 관리</h1>
        <p className="text-muted-foreground">
          문제를 생성하고 수정하며, 목록을 확인하고 검색하세요
        </p>
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
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="searchTitle"
                    checked={searchInTitle}
                    onCheckedChange={() => setSearchInTitle(!searchInTitle)}
                  />
                  <Label htmlFor="searchTitle">제목</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="searchParagraph"
                    checked={searchInParagraph}
                    onCheckedChange={() =>
                      setSearchInParagraph(!searchInParagraph)
                    }
                  />
                  <Label htmlFor="searchParagraph">지문</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="searchQuestion"
                    checked={searchInQuestion}
                    onCheckedChange={() =>
                      setSearchInQuestion(!searchInQuestion)
                    }
                  />
                  <Label htmlFor="searchQuestion">문제</Label>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="검색어 입력..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* 필터 및 정렬 영역 */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="sectionFilter" className="mb-2 block text-sm">
                  섹션
                </Label>
                <Select value={filterSection} onValueChange={setFilterSection}>
                  <SelectTrigger id="sectionFilter">
                    <SelectValue placeholder="섹션 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 섹션</SelectItem>
                    {uniqueSections.map((section) => (
                      <SelectItem key={section} value={section}>
                        {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="typeFilter" className="mb-2 block text-sm">
                  유형
                </Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger id="typeFilter">
                    <SelectValue placeholder="유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 유형</SelectItem>
                    {uniqueTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="levelFilter" className="mb-2 block text-sm">
                  난이도
                </Label>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger id="levelFilter">
                    <SelectValue placeholder="난이도 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 난이도</SelectItem>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        {level} / 5
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sortOrder" className="mb-2 block text-sm">
                  생성일 정렬
                </Label>
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
                        {question.createdAt.toLocaleDateString()}
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
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedQuestion.manageTitle}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
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
              {selectedQuestion.paragraph && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">지문</h3>
                  <div
                    className="p-4 bg-muted/50 rounded-md"
                    dangerouslySetInnerHTML={{
                      __html: selectedQuestion.paragraph,
                    }}
                  />
                </div>
              )}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">문제</h3>
                <div
                  className="p-4 bg-muted/50 rounded-md"
                  dangerouslySetInnerHTML={{
                    __html: selectedQuestion.question,
                  }}
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
                        <div
                          className="flex-1"
                          dangerouslySetInnerHTML={{ __html: choice.content }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 정답 표시 부분 - 수정된 부분 */}
              {renderAnswer(selectedQuestion)}

              <div className="space-y-2">
                <h3 className="text-lg font-medium">해설</h3>
                <div
                  className="p-4 bg-muted/50 rounded-md"
                  dangerouslySetInnerHTML={{
                    __html: selectedQuestion.explanation,
                  }}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
