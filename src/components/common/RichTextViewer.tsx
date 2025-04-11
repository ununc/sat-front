import React, { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface RichTextViewerProps {
  content: string;
  className?: string;
}

export const RichTextViewer: React.FC<RichTextViewerProps> = ({
  content,
  className = "",
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewerRef.current && content) {
      // 뷰어에 내용 설정
      viewerRef.current.innerHTML = content;

      // 1. 이미 설정된 latex-formula 클래스를 가진 요소 렌더링
      renderExistingLatexFormulas();

      // 2. 인라인 $...$ 형식의 수식 탐지 및 렌더링
      renderInlineLatex();
    }
  }, [content]);

  // 이미 마크업된 LaTeX 수식 렌더링
  const renderExistingLatexFormulas = (): void => {
    if (!viewerRef.current) return;

    const latexElements = viewerRef.current.querySelectorAll(".latex-formula");
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

  // 일반 텍스트 노드에서 $...$ 패턴 찾아 렌더링
  const renderInlineLatex = (): void => {
    if (!viewerRef.current) return;

    // 모든 텍스트 요소 찾기 (p, span, div 등)
    const textContainers = viewerRef.current.querySelectorAll(
      "p, span, div, td, th, li, h1, h2, h3, h4, h5, h6"
    );

    textContainers.forEach((container) => {
      // DOM요소를 이용해 각 노드를 직접 처리
      processNodeForLatex(container);
    });
  };

  // 노드를 직접 순회하며 수식 처리
  const processNodeForLatex = (parentNode: Node): boolean => {
    const childNodes = Array.from(parentNode.childNodes);
    let changes = false;

    for (let i = 0; i < childNodes.length; i++) {
      const node = childNodes[i];

      // 텍스트 노드만 처리
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";

        // 텍스트에 $ 구분자가 있는지 확인
        if (text.includes("$")) {
          changes = true;

          // 텍스트를 $ 기준으로 분할하고 수식 파싱
          const fragment = document.createDocumentFragment();
          let currentPos = 0;
          let startPos = text.indexOf("$", currentPos);

          while (startPos !== -1) {
            // $ 앞의 일반 텍스트 처리
            if (startPos > currentPos) {
              fragment.appendChild(
                document.createTextNode(text.substring(currentPos, startPos))
              );
            }

            // 닫는 $ 찾기
            const endPos = text.indexOf("$", startPos + 1);
            if (endPos === -1) {
              // 닫는 $ 없으면 나머지 텍스트 처리 후 종료
              fragment.appendChild(
                document.createTextNode(text.substring(currentPos))
              );
              break;
            }

            // 수식 추출
            const formula = text.substring(startPos + 1, endPos);

            try {
              // 수식을 담을 요소 생성
              const span = document.createElement("span");
              span.className = "katex-inline";

              // KaTeX 렌더링
              katex.render(formula, span, {
                throwOnError: false,
                displayMode: false,
                strict: false,
              });

              fragment.appendChild(span);
            } catch (error) {
              console.error("수식 렌더링 에러:", error, formula);
              // 오류 시 원본 텍스트 추가 ($ 포함)
              fragment.appendChild(
                document.createTextNode("$" + formula + "$")
              );
            }

            // 다음 시작 위치 업데이트
            currentPos = endPos + 1;
            startPos = text.indexOf("$", currentPos);
          }

          // 남은 텍스트 처리
          if (currentPos < text.length) {
            fragment.appendChild(
              document.createTextNode(text.substring(currentPos))
            );
          }

          // 원본 노드를 새로운 내용으로 교체
          if (parentNode.contains(node)) {
            parentNode.replaceChild(fragment, node);
            i--; // 새로 추가된 노드들을 다시 검사하기 위해 인덱스 조정
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // 요소 노드는 재귀적으로 처리 (이미 처리된 katex 요소 제외)
        const element = node as Element;
        if (
          !element.classList.contains("katex") &&
          !element.classList.contains("katex-inline") &&
          !element.classList.contains("latex-formula")
        ) {
          const childChanges = processNodeForLatex(node);
          changes = changes || childChanges;
        }
      }
    }

    return changes;
  };

  return (
    <div
      ref={viewerRef}
      className={`rich-text-viewer p-1 rounded-md ${className}`}
    />
  );
};
