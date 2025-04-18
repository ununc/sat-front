import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "../ui/dialog";
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
import { RichTextEditor } from "../common/RichTextEditor";
import {
  type Question,
  requestCreateQuestion,
  requestUpdateQuestion,
  type CreateQuestionDto,
} from "@/apis/question";
import { Checkbox } from "../ui/checkbox";

interface AlertState {
  show: boolean;
  missingFields: string[];
}

interface IProps {
  newQuestion: CreateQuestionDto;
  setNewQuestion: React.Dispatch<React.SetStateAction<CreateQuestionDto>>;
  setAlert: React.Dispatch<React.SetStateAction<AlertState>>;
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  showCreateDialog: "create" | "edit" | null;
  setShowCreateDialog: React.Dispatch<
    React.SetStateAction<"create" | "edit" | null>
  >;
}

export const QEdit = ({
  newQuestion,
  setNewQuestion,
  setAlert,
  setQuestions,
  showCreateDialog,
  setShowCreateDialog,
}: IProps) => {
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
      if (showCreateDialog === "create") {
        const data = await requestCreateQuestion(newQuestion);
        setQuestions((prevQuestions) => [...prevQuestions, data]);
      } else {
        const data = await requestUpdateQuestion(newQuestion);
        setQuestions((prevQuestions) =>
          prevQuestions.map((question) =>
            question.uid === data.uid ? data : question
          )
        );
      }
      // 다이얼로그 닫기 및 폼 초기화
      initCreateQuestion();
    } catch {
      console.error("문제 생성 실패");
    }
  };

  const initCreateQuestion = () => {
    setShowCreateDialog(null);
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
  return (
    <Dialog open={Boolean(showCreateDialog)} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>
            {showCreateDialog === "create" ? "새 문제 생성" : "문제 수정"}
          </DialogTitle>
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
              onChange={(value) => handleNewQuestionChange("paragraph", value)}
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
          <Button onClick={handleCreateQuestion}>
            문제 {showCreateDialog === "create" ? "생성" : "수정"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
