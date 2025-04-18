import { Question } from "@/apis/question";
import { RichTextViewer } from "../common/RichTextViewer";

interface IProps {
  question?: Question;
}

export const MSelectedPreview = ({ question }: IProps) => {
  if (!question) return;
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-2">선택된 문제의 제목</p>
      <div>{question.manageTitle}</div>

      {question.paragraph && (
        <RichTextViewer
          className="p-2 bg-muted/50 rounded-md"
          content={question.paragraph}
        />
      )}

      <RichTextViewer
        className="p-2 bg-muted/50 rounded-md"
        content={question.question}
      />
    </div>
  );
};
