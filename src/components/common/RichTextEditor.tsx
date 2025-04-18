import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { FunctionSquare, ImageIcon, TableIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import "katex/dist/katex.min.css"; // KaTeX CSS 임포트
import katex from "katex";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor = ({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [showLatexDialog, setShowLatexDialog] = useState(false);
  const [latexFormula, setLatexFormula] = useState("");
  const [latexPreview, setLatexPreview] = useState<string>("");
  const [base64Image, setBase64Image] = useState("");
  const [tableConfig, setTableConfig] = useState({ rows: 2, cols: 2 });
  const [editingLatexId, setEditingLatexId] = useState<string | null>(null);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current) {
      if (value && !editorRef.current.innerHTML) {
        editorRef.current.innerHTML = value;
      }

      // LaTeX 수식 렌더링
      renderLatexFormulas();

      // LaTeX 수식 편집 이벤트 설정
      setupLatexEditListeners();
    }
  }, [value, editorRef]);

  // LaTeX 수식 렌더링 함수
  const renderLatexFormulas = () => {
    if (!editorRef.current) return;

    // 에디터 내의 모든 LaTeX 수식 요소 찾기
    const latexElements = editorRef.current.querySelectorAll(".latex-formula");

    latexElements.forEach((element) => {
      try {
        const formula = element.getAttribute("data-formula");
        if (formula) {
          // 기존 내용 비우기
          element.innerHTML = "";
          // KaTeX로 렌더링
          katex.render(formula, element as HTMLElement, {
            throwOnError: false,
            displayMode: formula.includes("\\displaystyle"),
          });
        }
      } catch (error) {
        console.error("LaTeX 렌더링 에러:", error);
      }
    });
  };

  // LaTeX 수식 편집 리스너 설정
  const setupLatexEditListeners = () => {
    if (!editorRef.current) return;

    // 텍스트에서 $...$ 패턴 찾기
    const paragraphs = editorRef.current.querySelectorAll("p");

    paragraphs.forEach((p) => {
      const text = p.textContent || "";
      // $ 기호로 둘러싸인 텍스트가 있는지 확인
      if (text.startsWith("$") && text.endsWith("$") && text.length > 2) {
        // 이미 리스너가 설정되어 있는지 확인
        if (!p.getAttribute("data-has-listener")) {
          p.addEventListener("click", (e) => {
            // 편집 중일 때는 클릭 이벤트 무시
            if (document.activeElement === editorRef.current) return;

            // $ 기호 제거하고 실제 수식만 추출
            const formula = text.substring(1, text.length - 1);
            // 고유 ID 생성 (없으면)
            const id = p.id || `latex-${Date.now()}`;
            p.id = id; // ID 설정 (편집을 위해 필요)

            e.preventDefault();
            e.stopPropagation();
            setLatexFormula(formula);
            setEditingLatexId(id);
            renderLatexPreview(formula);
            setShowLatexDialog(true);
          });

          // DOM에 표시되지 않는 속성으로 리스너 설정 표시
          p.setAttribute("data-has-listener", "true");

          // 스타일 속성은 CSS 파일에서 설정하도록 함
          // 여기서는 클래스만 추가
          p.classList.add("latex-formula-text");
        }
      }
    });
  };

  // LaTeX 미리보기 렌더링
  const renderLatexPreview = (formula: string) => {
    try {
      const container = document.createElement("div");
      katex.render(formula, container, {
        throwOnError: false,
        displayMode: formula.includes("\\displaystyle"),
      });
      setLatexPreview(container.innerHTML);
    } catch (error) {
      console.error("LaTeX 미리보기 에러:", error);
      setLatexPreview("<span style='color:red'>오류: 잘못된 LaTeX 구문</span>");
    }
  };

  // LaTeX 수식 입력 시 미리보기 업데이트
  useEffect(() => {
    if (latexFormula) {
      renderLatexPreview(latexFormula);
    } else {
      setLatexPreview("");
    }
  }, [latexFormula]);

  // Handle image file selection and base64 conversion
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Insert image at cursor position
  const insertImage = () => {
    if (!editorRef.current || !base64Image) return;

    // Create image element
    const imgTag = document.createElement("img");
    imgTag.src = base64Image;
    imgTag.alt = "Question Image";
    imgTag.style.maxWidth = "100%";
    imgTag.style.margin = "10px 0";

    // Focus the editor to ensure we can get/set a selection
    editorRef.current.focus();

    // Try to get current selection
    const selection = window.getSelection();

    // Insert at current position or end
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      // Only use the range if it's inside our editor
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        range.insertNode(imgTag);

        // Move cursor after the image
        range.setStartAfter(imgTag);
        range.setEndAfter(imgTag);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // Fallback: append to the end
        editorRef.current.appendChild(imgTag);
      }
    } else {
      // Fallback: append to the end
      editorRef.current.appendChild(imgTag);
    }

    // Update the content
    handleContentChange();
    setShowImageDialog(false);
    setBase64Image("");
  };

  // Insert or update LaTeX at cursor position
  const insertLatex = () => {
    if (!editorRef.current || !latexFormula) return;

    // 새 수식 텍스트 만들기 ($ 기호로 둘러싸기)
    const formulaText = `$${latexFormula}$`;

    if (editingLatexId) {
      // 기존 수식 업데이트
      const existingElement = editorRef.current.querySelector(
        `#${editingLatexId}`
      );
      if (existingElement) {
        // 기존 요소의 텍스트만 업데이트
        existingElement.textContent = formulaText;
        // ID는 유지하고 다른 속성들은 제거
        existingElement.removeAttribute("data-has-listener");
        existingElement.removeAttribute("style");
      }
      setEditingLatexId(null);
    } else {
      // 에디터 포커스
      editorRef.current.focus();

      // 현재 선택 영역 가져오기
      const selection = window.getSelection();
      const p = document.createElement("p");
      p.textContent = formulaText;

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        // 선택 영역이 에디터 내부인지 확인
        if (editorRef.current.contains(range.commonAncestorContainer)) {
          // 현재 커서 위치가 빈 단락 내부인지 확인
          const parentElement = range.startContainer.parentNode as Element;

          if (
            parentElement &&
            parentElement.nodeName === "P" &&
            parentElement.textContent &&
            parentElement.textContent.trim() === "" &&
            parentElement.parentNode === editorRef.current
          ) {
            // 빈 단락을 새 단락으로 교체 (HTMLElement에는 replaceWith가 있음)
            if (parentElement instanceof HTMLElement) {
              parentElement.replaceWith(p);
            } else {
              // 대체 방법: 부모 노드에서 교체
              if (parentElement.parentNode) {
                parentElement.parentNode.replaceChild(p, parentElement);
              } else {
                range.insertNode(p);
              }
            }
          } else {
            // 새 단락 삽입
            range.insertNode(p);
          }

          // 커서를 수식 뒤로 이동
          range.setStartAfter(p);
          range.setEndAfter(p);
          selection.removeAllRanges();
          selection.addRange(range);
        } else {
          // 에디터 끝에 추가
          editorRef.current.appendChild(p);
        }
      } else {
        // 에디터 끝에 추가
        editorRef.current.appendChild(p);
      }
    }

    // 콘텐츠 업데이트
    handleContentChange();
    setShowLatexDialog(false);
    setLatexFormula("");
    setLatexPreview("");
  };
  // Insert table at cursor position
  const insertTable = () => {
    if (!editorRef.current) return;

    const { rows, cols } = tableConfig;

    // Create table HTML string (instead of DOM manipulation)
    let tableHTML = `
      <table style="width:100%; border-collapse:collapse; margin:10px 0;">
        <thead>
          <tr>
    `;

    // Add headers
    for (let i = 0; i < cols; i++) {
      tableHTML += `<th style="border:1px solid #ddd; padding:8px; text-align:left;">Header ${
        i + 1
      }</th>`;
    }

    tableHTML += `
          </tr>
        </thead>
        <tbody>
    `;

    // Add rows
    for (let i = 0; i < rows - 1; i++) {
      tableHTML += `<tr>`;

      // Add cells
      for (let j = 0; j < cols; j++) {
        tableHTML += `<td style="border:1px solid #ddd; padding:8px;">Cell ${
          i + 1
        }-${j + 1}</td>`;
      }

      tableHTML += `</tr>`;
    }

    tableHTML += `
        </tbody>
      </table>
    `;

    // Focus the editor to ensure we can get/set a selection
    editorRef.current.focus();

    // Try to get current selection
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      // Only use the range if it's inside our editor
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        // Insert at current position using execCommand
        document.execCommand("insertHTML", false, tableHTML);
      } else {
        // Fallback: append to the end
        editorRef.current.innerHTML += tableHTML;
      }
    } else {
      // Fallback: append to the end
      editorRef.current.innerHTML += tableHTML;
    }

    // Update the content
    handleContentChange();
    setShowTableDialog(false);
    setTableConfig({ rows: 2, cols: 2 });
  };

  // Handle content changes
  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      // LaTeX 수식 렌더링
      renderLatexFormulas();
      // LaTeX 수식 편집 이벤트 설정
      setupLatexEditListeners();
    }
  };

  // LaTeX 샘플 수식 삽입
  const insertSampleLatex = (formula: string) => {
    setLatexFormula(formula);
  };

  return (
    <div className="rich-text-editor border rounded-md flex-1">
      {/* Editor toolbar */}
      <div className="flex items-center p-2 border-b bg-muted/30">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mr-2"
          onClick={() => setShowImageDialog(true)}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          이미지
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mr-2"
          onClick={() => setShowTableDialog(true)}
        >
          <TableIcon className="h-4 w-4 mr-2" />
          테이블
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setEditingLatexId(null);
            setLatexFormula("");
            setLatexPreview("");
            setShowLatexDialog(true);
          }}
        >
          <FunctionSquare className="h-4 w-4 mr-2" />
          수식
        </Button>
      </div>

      {/* Visual editor */}
      <div
        ref={editorRef}
        className="min-h-[150px] p-4 outline-none content-editable-div"
        contentEditable
        data-placeholder={placeholder}
        onInput={handleContentChange}
        onBlur={handleContentChange}
      />

      {/* Image dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>이미지 추가</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="image-upload">이미지 선택</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            {base64Image && (
              <div className="mt-4">
                <Label>미리보기</Label>
                <div className="mt-2 border rounded p-2">
                  <img
                    src={base64Image}
                    alt="Preview"
                    className="max-h-[200px] max-w-full"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageDialog(false)}>
              취소
            </Button>
            <Button onClick={insertImage} disabled={!base64Image}>
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table dialog */}
      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>테이블 추가</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="table-rows">행 수</Label>
                <Input
                  id="table-rows"
                  type="number"
                  min="1"
                  max="10"
                  value={tableConfig.rows}
                  onChange={(e) =>
                    setTableConfig({
                      ...tableConfig,
                      rows: parseInt(e.target.value) || 2,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="table-cols">열 수</Label>
                <Input
                  id="table-cols"
                  type="number"
                  min="1"
                  max="10"
                  value={tableConfig.cols}
                  onChange={(e) =>
                    setTableConfig({
                      ...tableConfig,
                      cols: parseInt(e.target.value) || 2,
                    })
                  }
                />
              </div>
            </div>

            <div className="mt-2">
              <Label>테이블 미리보기</Label>
              <div className="overflow-auto max-h-[200px] mt-2 border rounded p-2">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {Array(tableConfig.cols)
                        .fill(0)
                        .map((_, i) => (
                          <th
                            key={i}
                            className="border border-gray-300 bg-muted p-2 text-sm"
                          >
                            Header {i + 1}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array(tableConfig.rows - 1)
                      .fill(0)
                      .map((_, i) => (
                        <tr key={i}>
                          {Array(tableConfig.cols)
                            .fill(0)
                            .map((_, j) => (
                              <td
                                key={j}
                                className="border border-gray-300 p-2 text-sm"
                              >
                                Cell {i + 1}-{j + 1}
                              </td>
                            ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTableDialog(false)}>
              취소
            </Button>
            <Button onClick={insertTable}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* LaTeX dialog */}
      <Dialog open={showLatexDialog} onOpenChange={setShowLatexDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {editingLatexId ? "LaTeX 수식 편집" : "LaTeX 수식 추가"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="latex-formula">LaTeX 수식</Label>
              <Textarea
                id="latex-formula"
                placeholder="예: \frac{-b \pm \sqrt{b^2-4ac}}{2a}"
                value={latexFormula}
                onChange={(e) => setLatexFormula(e.target.value)}
                className="min-h-[100px] font-mono"
              />
            </div>

            {/* 자주 사용하는 수식 샘플 */}
            <div className="space-y-2">
              <Label>자주 사용하는 수식</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertSampleLatex("\\frac{a}{b}")}
                >
                  분수
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertSampleLatex("\\sqrt{x}")}
                >
                  제곱근
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertSampleLatex("x^2")}
                >
                  제곱
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertSampleLatex("\\sum_{i=1}^{n} x_i")}
                >
                  시그마
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    insertSampleLatex("\\displaystyle \\int_{a}^{b} f(x) dx")
                  }
                >
                  적분
                </Button>
              </div>
            </div>

            {/* LaTeX 미리보기 */}
            {latexPreview && (
              <div className="mt-4">
                <Label>미리보기</Label>
                <div
                  className="mt-2 border rounded p-4 flex justify-center items-center bg-white dark:bg-gray-800"
                  dangerouslySetInnerHTML={{ __html: latexPreview }}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLatexDialog(false)}>
              취소
            </Button>
            <Button onClick={insertLatex} disabled={!latexFormula}>
              {editingLatexId ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
