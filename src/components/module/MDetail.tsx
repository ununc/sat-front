import { Module } from "@/apis/module";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { RichTextViewer } from "@/components/common/RichTextViewer";
import { useRef } from "react";
import { Question } from "@/apis/question";
import { Button } from "../ui/button";
import { Download } from "lucide-react";
import { Card, CardContent } from "../ui/card";

interface IProps {
  showDetailDialog: boolean;
  setShowDetailDialog: React.Dispatch<React.SetStateAction<boolean>>;
  currentModule: Module | null;
}

const MDetail = ({
  showDetailDialog,
  setShowDetailDialog,
  currentModule,
}: IProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const handleDownloadPDF = () => {
    if (!currentModule) return;

    const generateQuestionHTML = (questions: Question[]) => {
      return questions
        .map(
          (question, index) => `
      <div class="question-card">
        <div class="question-header">
          <span class="question-badge">${index + 1}번 문제</span>
        </div>
        
        ${
          question.paragraph
            ? `
          <div class="paragraph-section">
            ${question.paragraph}
          </div>
        `
            : ""
        }
        
        <div class="question-section">
          ${question.question}
        </div>
        
        ${
          question.choices.length > 0
            ? `
          <div class="choices-section">
            ${question.choices
              .map(
                (choice) => `
              <div class="choice-row">
                <span class="choice-label">${choice.seq}</span>
                <div class="choice-content">${choice.content}</div>
              </div>
            `
              )
              .join("")}
          </div>
        `
            : ""
        }
      </div>
    `
        )
        .join("");
    };

    // 새 창 열기
    const printWindow = window.open("", "_blank", "height=600,width=800");
    if (!printWindow) {
      return;
    }

    // PDF용 CSS 및 KaTeX 스타일 삽입
    const styles = `
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 40px;
        color: #333;
      }
      h1 {
        font-size: 24px;
        margin-bottom: 12px;
      }
      .question-card {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
        page-break-inside: avoid;
        page-break-after: always;
      }
      .question-card:last-child {
        page-break-after: auto;
      }
      .question-header {
        margin-bottom: 12px;
      }
      .question-badge {
        display: inline-block;
        padding: 4px 8px;
        background: rgba(0, 100, 255, 0.1);
        color: #0052cc;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
      }
      .paragraph-section, .question-section {
        background: #f7f7f7;
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 16px;
      }
      .choices-section {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .choice-row {
        display: flex;
        align-items: center;
        margin-bottom: 4px;
      }
      .choice-label {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        height: 28px;
        background: #f1f5f9;
        border-radius: 50%;
        margin-right: 12px;
        font-size: 14px;
        flex-shrink: 0;
      }
      .choice-content {
        flex: 1;
        display: inline-flex;
        align-items: center;
        min-height: 28px;
      }
      .katex {
        font-family: KaTeX_Main, Times New Roman, serif !important;
      }
      @page {
        margin: 0.5cm;
        size: auto;
      }
      @media print {
        body {
          padding: 0;
        }
        @page {
          margin: 0.5cm;
          size: auto;
        }
        html {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    </style>
  `;

    // PDF 콘텐츠 생성
    const pdfContent = `
    <!DOCTYPE html>
    <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <title>${currentModule.title}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
        ${styles}
      </head>
      <body>
        ${generateQuestionHTML(currentModule.questions)}
        
        <script>
          // KaTeX 자동 렌더링 실행
          document.addEventListener("DOMContentLoaded", function() {
            renderMathInElement(document.body, {
              delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false}
              ],
              throwOnError: false
            });
          });
          
          // DOMContentLoaded 이벤트가 이미 발생했을 경우를 대비
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
              renderMathInElement(document.body, {
                delimiters: [
                  {left: "$$", right: "$$", display: true},
                  {left: "$", right: "$", display: false}
                ],
                throwOnError: false
              });
            });
          } else {
            renderMathInElement(document.body, {
              delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false}
              ],
              throwOnError: false
            });
          }
        </script>
      </body>
    </html>
  `;

    // 새 창에 PDF 콘텐츠 작성
    printWindow.document.open();
    printWindow.document.write(pdfContent);
    printWindow.document.close();

    // 렌더링이 완료된 후 PDF를 인쇄
    setTimeout(() => {
      printWindow.focus();

      // 인쇄 시 헤더/푸터 제거 옵션 설정 (브라우저 지원 시)
      const mediaQueryList = printWindow.matchMedia("print");
      mediaQueryList.addListener(function (mql) {
        if (mql.matches) {
          console.log("인쇄 시작");
        }
      });

      printWindow.print();
    }, 2500); // 렌더링 시간 확보 (KaTeX 로딩 시간 고려)
  };
  if (!showDetailDialog || !currentModule) return;

  return (
    <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div>{currentModule.title}</div>
          </DialogTitle>
          <div className="flex justify-between items-center">
            <div className="text-muted-foreground text-sm">
              섹션: {currentModule.section} | 난이도: {currentModule.level}
              /5 | 총 {currentModule.questions.length}개의 문제
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              className=" mr-5"
            >
              <Download className="h-4 w-4" />
              PDF 다운로드
            </Button>
          </div>
        </DialogHeader>

        {currentModule.questions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            이 모듈에 등록된 문제가 없습니다.
          </div>
        ) : (
          <div ref={contentRef} className="space-y-4 py-1">
            {currentModule.questions.map((question, index) => (
              <Card key={question.uid} className="border border-border">
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary"
                    >
                      {index + 1}번 문제
                    </Badge>
                  </div>

                  {question.paragraph && (
                    <div className="mb-4">
                      <RichTextViewer
                        className="p-2 bg-muted/50 rounded-md"
                        content={question.paragraph}
                      />
                    </div>
                  )}

                  <div className="mb-4">
                    <RichTextViewer
                      className="p-2 bg-muted/50 rounded-md"
                      content={question.question}
                    />
                  </div>

                  {question.choices.length > 0 && (
                    <div>
                      <ul className="space-y-2">
                        {question.choices.map((choice) => (
                          <li
                            key={question.uid + choice.seq}
                            className="flex justify-start items-center gap-2"
                          >
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs">
                              {choice.seq}
                            </span>

                            <RichTextViewer
                              className="p-2 bg-muted/50 rounded-md"
                              content={choice.content}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MDetail;
