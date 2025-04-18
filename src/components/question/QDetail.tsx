import { Dialog, DialogContent, DialogTitle, DialogHeader } from "../ui/dialog";
import { Button } from "../ui/button";
import { requestDeleteQuestion, type Question } from "@/apis/question";
import { RichTextViewer } from "../common/RichTextViewer";

interface IProps {
  selectedQuestion: Question | null;
  showDetailDialog: boolean;
  setShowDetailDialog: React.Dispatch<React.SetStateAction<boolean>>;
  showDelete: boolean;
  setShowDelete: React.Dispatch<React.SetStateAction<boolean>>;
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
}

export const QDetail = ({
  selectedQuestion,
  showDetailDialog,
  setShowDetailDialog,
  showDelete,
  setShowDelete,
  questions,
  setQuestions,
}: IProps) => {
  if (!selectedQuestion) return;

  const closeDetail = () => {
    setShowDetailDialog(false);
    setShowDelete(false);
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

  const handleDeleteQuestion = async () => {
    try {
      const uid = (selectedQuestion as Question).uid;
      await requestDeleteQuestion(uid);
      setQuestions(questions.filter((question) => question.uid !== uid));
      closeDetail();
    } catch {
      console.error("문제 삭제 실패");
    }
  };

  return (
    <Dialog open={showDetailDialog} onOpenChange={closeDetail}>
      <DialogContent
        className={"max-w-4xl" + (showDelete ? " [&>button]:hidden" : "")}
      >
        <DialogHeader>
          {showDelete && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeDetail}>
                취소
              </Button>
              <Button variant="destructive" onClick={handleDeleteQuestion}>
                즉시 삭제
              </Button>
            </div>
          )}
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
                  <div key={index} className="flex items-start p-2 rounded-md">
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
  );
};
