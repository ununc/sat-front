import React, { useState, useEffect, useRef } from "react";
import { Calculator } from "lucide-react";
import Desmos from "desmos";

interface ExpressionState {
  id?: string;
  type?: "expression" | "text";
  latex?: string;
  color?: string;
  label?: string;
  showLabel?: boolean;
  secret?: boolean;
  hidden?: boolean;
  [key: string]: unknown;
}

interface DesmosCalculator {
  resize: () => void;
  destroy: () => void;
  setExpression: (options: ExpressionState) => void;
  getExpressions?: () => ExpressionState[];
  removeExpression?: (options: { id: string }) => void;
}

interface FormulaTemplate {
  id: string;
  name: string;
  category: string;
  expressions: Array<{
    key: string;
    latex: string;
    isPoint?: boolean;
    color?: string;
    label?: string;
    showLabel?: boolean;
    secret?: boolean;
    hidden?: boolean;
  }>;
  defaultValues?: Record<string, number>;
}

interface IProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const formulaTemplates: FormulaTemplate[] = [
  {
    id: "line-slope-intercept",
    name: "기울기와 절편으로 나타내는 방정식",
    category: "선",
    expressions: [
      { key: "graph", latex: "y=m*x+b" },
      { key: "m", latex: "m=${m}" },
      { key: "b", latex: "b=${b}" },
    ],
    defaultValues: {
      m: 1,
      b: 0,
    },
  },
  {
    id: "line-point-slope",
    name: "한 점과 기울기를 이용하는 방정식",
    category: "선",
    expressions: [
      { key: "graph", latex: "y-y_1=m(x-x_1)" },
      { key: "point", latex: "(x_1,y_1)", isPoint: true, showLabel: true },
      { key: "x1", latex: "x_1=${x1}" },
      { key: "y1", latex: "y_1=${y1}" },
      { key: "m", latex: "m=${m}" },
    ],
    defaultValues: {
      x1: 1,
      y1: 1,
      m: 1,
    },
  },
  {
    id: "line-two-points",
    name: "두 점을 지나는 직선의 방정식",
    category: "선",
    expressions: [
      { key: "graph", latex: "y-y_1=m(x-x_1)" },
      { key: "slope", latex: "m=\\frac{y_2-y_1}{x_2-x_1}" },
      // Define the variables first
      { key: "x1", latex: "x_1=${x1}" },
      { key: "y1", latex: "y_1=${y1}" },
      // This point will show its evaluation in the expression list
      { key: "point1", latex: "(x_1,y_1)" },
      // Define the second point variables
      { key: "x2", latex: "x_2=${x2}" },
      { key: "y2", latex: "y_2=${y2}" },
      // This point will also show its evaluation in the expression list
      { key: "point2", latex: "(x_2,y_2)" },
    ],
    defaultValues: {
      x1: -1,
      y1: 1,
      x2: 3,
      y2: 2,
    },
  },
  {
    id: "parabola-standard",
    name: "표준형",
    category: "포물선",
    expressions: [
      { key: "graph", latex: "y=a*x^2+b*x+c" },
      { key: "a", latex: "a=${a}" },
      { key: "b", latex: "b=${b}" },
      { key: "c", latex: "c=${c}" },
    ],
    defaultValues: {
      a: 1,
      b: 0,
      c: 0,
    },
  },
  {
    id: "parabola-vertex",
    name: "꼭지점 형식",
    category: "포물선",
    expressions: [
      { key: "graph", latex: "y=a(x-h)^2+k" },
      { key: "a", latex: "a=${a}" },
      { key: "h", latex: "h=${h}" },
      { key: "k", latex: "k=${k}" },
      { key: "vertex", latex: "(h,k)", isPoint: true, showLabel: true },
    ],
    defaultValues: {
      a: 1,
      h: 0,
      k: 0,
    },
  },
  {
    id: "parabola-with-tangent",
    name: "표준형과 탄젠트",
    category: "포물선",
    expressions: [
      { key: "graph", latex: "y \\geq a*x^2+b*x+c" },
      { key: "a", latex: "a=${a}" },
      { key: "b", latex: "b=${b}" },
      { key: "c", latex: "c=${c}" },
      { key: "tangent", latex: "y=2*a*${tangentX}*x+b-a*${tangentX}^2" },
    ],
    defaultValues: {
      a: 1,
      b: 0,
      c: 0,
      tangentX: 1,
    },
  },
];

export const DesmosCalculator = ({ isOpen, setIsOpen }: IProps) => {
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 100,
    y: 100,
  });
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 600,
    height: 400,
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [initialSize, setInitialSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isTemplateOpen, setIsTemplateOpen] = useState<boolean>(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(
    null
  );
  const calculatorRef = useRef<HTMLDivElement | null>(null);
  const desmosInstanceRef = useRef<Desmos.Calculator | null>(null);

  const templateInstanceCounterRef = useRef<Record<string, number>>({});

  const MIN_WIDTH = 400;
  const MIN_HEIGHT = 300;
  const MAX_WIDTH = 1200;
  const MAX_HEIGHT = 800;

  useEffect(() => {
    if (isOpen && calculatorRef.current && !desmosInstanceRef.current) {
      try {
        const elt = calculatorRef.current;
        desmosInstanceRef.current = Desmos.GraphingCalculator(elt, {
          expressions: true,
          expressionsCollapsed: false,
          settingsMenu: false, // 필요한 경우에만 true로 설정
          zoomButtons: true,
          border: false,
          lockViewport: false,
          expressionsTopbar: true, // 표현식 도구모음 표시를 확인
          showGrid: true, // 그리드 표시 확인
        });
      } catch (error) {
        console.error("Error initializing Desmos:", error);
      }
    }

    return () => {
      if (!isOpen && desmosInstanceRef.current) {
        desmosInstanceRef.current.destroy();
        desmosInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && desmosInstanceRef.current) {
      setTimeout(() => {
        if (desmosInstanceRef.current) {
          desmosInstanceRef.current.resize();
        }
      }, 0);
    }
  }, [size, isOpen]);

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(
          0,
          Math.min(
            window.innerWidth - size.width,
            position.x + (e.clientX - dragStart.x)
          )
        );
        const newY = Math.max(
          0,
          Math.min(
            window.innerHeight - size.height,
            position.y + (e.clientY - dragStart.y)
          )
        );

        setPosition({ x: newX, y: newY });
        setDragStart({ x: e.clientX, y: e.clientY });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        const newWidth = Math.max(
          MIN_WIDTH,
          Math.min(MAX_WIDTH, initialSize.width + deltaX)
        );

        const newHeight = Math.max(
          MIN_HEIGHT,
          Math.min(MAX_HEIGHT, initialSize.height + deltaY)
        );

        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    isResizing,
    position,
    dragStart,
    size,
    initialSize,
    resizeStart,
  ]);

  const handleStartDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target && (e.target as HTMLElement).closest(".resize-handle")) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };

  const handleStartResize = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY });
    setInitialSize({ width: size.width, height: size.height });
    e.preventDefault();
    e.stopPropagation();
  };

  const toggleCalculator = () => {
    if (isOpen) {
      setIsOpen(false);
      setIsTemplateOpen(false);
      setCurrentTemplateId(null);
    } else {
      setIsOpen(true);
    }
  };

  const toggleTemplates = () => {
    setIsTemplateOpen(!isTemplateOpen);
  };

  const substituteVariables = (
    latex: string,
    values: Record<string, number>
  ): string => {
    return latex.replace(/\${([^}]+)}/g, (_match, key) => {
      return values[key]?.toString() || "0";
    });
  };

  const applyTemplate = (template: FormulaTemplate) => {
    if (!desmosInstanceRef.current) return;

    const instanceCount =
      (templateInstanceCounterRef.current[template.id] || 0) + 1;
    templateInstanceCounterRef.current[template.id] = instanceCount;

    const instanceId = `${template.id}_${instanceCount}`;

    setCurrentTemplateId(template.id);

    if (desmosInstanceRef.current.getExpressions) {
      const expressions = desmosInstanceRef.current.getExpressions();
      expressions.forEach((expr) => {
        if (desmosInstanceRef.current?.removeExpression && expr.id) {
          desmosInstanceRef.current.removeExpression({ id: expr.id });
        }
      });
    }

    const values = template.defaultValues || {};

    template.expressions.forEach((expr, index) => {
      const uniqueId = `${instanceId}_${expr.key}_${index}`;
      const latexWithValues = substituteVariables(expr.latex, values);

      const expressionConfig: ExpressionState = {
        id: uniqueId,
        latex: latexWithValues,
      };

      if (expr.isPoint) {
        expressionConfig.secret = false;
      }

      if (expr.color) expressionConfig.color = expr.color;
      if (expr.label) expressionConfig.label = expr.label;
      if (expr.hidden !== undefined) expressionConfig.hidden = expr.hidden;

      desmosInstanceRef.current?.setExpression(expressionConfig);
    });
  };

  const groupedTemplates = formulaTemplates.reduce<
    Record<string, FormulaTemplate[]>
  >((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {});

  return (
    <div className="desmos-calculator-container">
      <button
        className="cursor-pointer p-2 flex flex-col items-center justify-center"
        onClick={toggleCalculator}
        title="Toggle Desmos Calculator"
      >
        <Calculator size={24} />
        <div className="mt-1 text-sm">Calculator</div>
      </button>

      {isOpen && (
        <div
          className="calculator-popup fixed shadow-lg rounded-lg bg-white overflow-hidden"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: `${size.width}px`,
            height: `${size.height}px`,
            zIndex: 1000,
          }}
        >
          <div
            className="calculator-header bg-gray-200 p-2 flex justify-between items-center cursor-move"
            onMouseDown={handleStartDrag}
          >
            <div className="font-bold">Desmos Calculator</div>
            <div className="flex items-center">
              <button
                className="text-gray-600 hover:text-gray-800 mr-3 text-sm px-2 py-1 bg-gray-300 rounded"
                onClick={toggleTemplates}
              >
                {isTemplateOpen ? "템플릿 숨기기" : "템플릿 보기"}
              </button>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={toggleCalculator}
              >
                ✕
              </button>
            </div>
          </div>

          <div
            className="calculator-body flex"
            style={{ height: "calc(100% - 36px)" }}
          >
            {isTemplateOpen && (
              <div className="template-panel w-48 bg-gray-100 overflow-y-auto p-2 border-r border-gray-300">
                <h3 className="font-bold text-sm mb-2">수식 템플릿</h3>
                {Object.entries(groupedTemplates).map(
                  ([category, templates]) => (
                    <div key={category} className="mb-3">
                      <h4 className="font-semibold text-xs text-gray-700 mb-1">
                        {category}
                      </h4>
                      <ul>
                        {templates.map((template) => (
                          <li key={template.id}>
                            <button
                              className={`text-left w-full text-sm py-1 px-2 hover:bg-gray-200 rounded ${
                                currentTemplateId === template.id
                                  ? "bg-blue-100"
                                  : ""
                              }`}
                              onClick={() => applyTemplate(template)}
                            >
                              {template.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                )}
              </div>
            )}
            <div
              ref={calculatorRef}
              className="calculator-content"
              style={{
                width: isTemplateOpen ? "calc(100% - 12rem)" : "100%",
                height: "100%",
              }}
            />
          </div>

          <div
            className="resize-handle absolute bottom-0 right-0 w-6 h-6 cursor-se-resize"
            onMouseDown={handleStartResize}
            style={{
              backgroundImage:
                "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.2) 50%)",
            }}
          />
        </div>
      )}
    </div>
  );
};
