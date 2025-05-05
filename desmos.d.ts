// desmos.d.ts
declare module "desmos" {
  const enabledFeatures: {
    Calculator3D: boolean;
    GeometryCalculator: boolean;
    GraphingCalculator: boolean;
    FourFunctionCalculator: boolean;
    ScientificCalculator: boolean;
  };

  const supportedLanguages: string[];

  const AxisArrowModes: {
    NONE: "NONE";
    POSITIVE: "POSITIVE";
    BOTH: "BOTH";
  };

  const Colors: {
    RED: "#c74440";
    BLUE: "#2d70b3";
    GREEN: "#388c46";
    PURPLE: "#6042a6";
    ORANGE: "#fa7e19";
    BLACK: "#000000";
  };

  const DragModes: {
    X: "X";
    Y: "Y";
    XY: "XY";
    NONE: "NONE";
    AUTO: "AUTO";
  };

  const FontSizes: {
    VERY_SMALL: 9;
    SMALL: 12;
    MEDIUM: 16;
    LARGE: 20;
    VERY_LARGE: 24;
  };

  const LabelOrientations: {
    ABOVE: "ABOVE";
    BELOW: "BELOW";
    LEFT: "LEFT";
    RIGHT: "RIGHT";
    DEFAULT: "DEFAULT";
  };

  const LabelSizes: {
    SMALL: "SMALL";
    MEDIUM: "MEDIUM";
    LARGE: "LARGE";
  };

  const Styles: {
    POINT: "POINT";
    OPEN: "OPEN";
    CROSS: "CROSS";
    SOLID: "SOLID";
    DASHED: "DASHED";
    DOTTED: "DOTTED";
  };

  function FourFunctionCalculator(
    element: HTMLElement,
    options?: {
      links?: boolean;
      additionalFunctions?:
        | ("exponent" | "percent" | "fraction" | "sqrt")
        | ReadonlyArray<"exponent" | "percent" | "fraction" | "sqrt">;
      fontSize?: number;
      invertedColors?: boolean;
      settingsMenu?: boolean;
      language?: string;
      brailleMode?: "nemeth" | "ueb" | "none";
      sixKeyInput?: boolean;
      projectorMode?: boolean;
      decimalToFraction?: boolean;
      capExpressionSize?: boolean;
    }
  ): BasicCalculator;

  function Calculator3D(
    element: HTMLElement,
    options?: GraphConfiguration & GraphSettings
  ): Calculator;

  function Geometry(
    element: HTMLElement,
    options?: GraphConfiguration & GraphSettings
  ): Calculator;

  function GraphingCalculator(
    element: HTMLElement,
    options?: GraphConfiguration & GraphSettings
  ): Calculator;

  function ScientificCalculator(
    element: HTMLElement,
    options?: {
      links?: boolean;
      qwertyKeyboard?: boolean;
      degreeMode?: boolean;
      fontSize?: number;
      invertedColors?: boolean;
      settingsMenu?: boolean;
      language?: string;
      brailleMode?: "nemeth" | "ueb" | "none";
      sixKeyInput?: boolean;
      brailleExpressionDownload?: boolean;
      projectorMode?: boolean;
      decimalToFraction?: boolean;
      capExpressionSize?: boolean;
      functionDefinition?: boolean;
      autosize?: boolean;
    }
  ): BasicCalculator;

  function imageFileToDataURL(
    file: File,
    cb: (err: Error, url: string) => void
  ): void;

  type GraphState = unknown;

  interface BasicCalculator
    extends Pick<
      Calculator,
      | "getState"
      | "setState"
      | "setBlank"
      | "undo"
      | "redo"
      | "clearHistory"
      | "resize"
      | "focusFirstExpression"
      | "observeEvent"
      | "unobserveEvent"
      | "destroy"
    > {
    updateSettings(
      settings:
        | Parameters<typeof FourFunctionCalculator>[1]
        | Parameters<typeof ScientificCalculator>[1]
    ): void;
  }

  interface Calculator {
    asyncScreenshot(
      opts: Parameters<Calculator["screenshot"]>[0] & {
        format?: "png" | "svg";
        mode?: "contain" | "stretch" | "preserveX" | "preserveY";
        mathBounds?: Parameters<Calculator["setMathBounds"]>[0];
        showLabels?: boolean;
      },
      callback: (dataUri: string) => void
    ): void;
    asyncScreenshot(callback: (dataUri: string) => void): void;

    clearHistory(): void;
    destroy(): void;
    focusFirstExpression(): void;
    getExpressions(): ExpressionState[];
    getState(): GraphState;
    isProjectionUniform(): boolean;
    mathToPixels<
      C extends { x: number } | { y: number } | { x: number; y: number }
    >(
      coords: C
    ): C;
    newRandomSeed(): void;
    observe(eventName: string, callback: () => void): void;
    observeEvent(eventName: string, callback: () => void): void;
    pixelsToMath<
      C extends { x: number } | { y: number } | { x: number; y: number }
    >(
      coords: C
    ): C;
    redo(): void;
    removeExpression(expression_state: { id: string }): void;
    removeExpressions(
      expression_states: ReadonlyArray<{
        id: string;
      }>
    ): void;
    removeSelected(): string;
    resize(): void;
    screenshot(opts?: {
      width?: number;
      height?: number;
      targetPixelRatio?: number;
      preserveAxisNumbers?: boolean;
    }): string;
    setBlank(options?: { allowUndo?: boolean }): void;
    setDefaultState(obj: GraphState): void;
    setExpression(expression: ExpressionState): void;
    setExpressions(expressions: readonly ExpressionState[]): void;
    setMathBounds(bounds: {
      left?: number;
      right?: number;
      bottom?: number;
      top?: number;
    }): void;
    setState(
      obj: GraphState,
      options?: {
        allowUndo?: boolean;
        remapColors?: boolean;
      }
    ): void;
    undo(): void;
    unobserve(eventName: string): void;
    unobserveEvent(eventName: string): void;
    updateSettings(settings: GraphConfiguration & GraphSettings): void;

    HelperExpression(expression: ExpressionState): {
      listValue: number[];
      numericValue: number;
      observe(
        eventName: "numericValue" | "listValue" | string,
        callback: () => void
      ): void;
    };

    colors: {
      [key: string]: string;
    };
    expressionAnalysis: {
      [id: string]: {
        isGraphable: boolean;
        isError: boolean;
        errorMessage?: string;
        evaluationDisplayed?: boolean;
        evaluation?:
          | { type: "Number"; value: number }
          | { type: "ListOfNumber"; value: readonly number[] };
      };
    };

    graphpaperBounds: {
      mathCoordinates: {
        top: number;
        bottom: number;
        left: number;
        right: number;
        width: number;
        height: number;
      };
      pixelCoordinates: {
        top: number;
        bottom: number;
        left: number;
        right: number;
        width: number;
        height: number;
      };
    };

    isAnyExpressionSelected: boolean;
    selectedExpressionId: string;
    settings: GraphConfiguration &
      GraphSettings & {
        observe(
          eventName: keyof GraphConfiguration | keyof GraphSettings | string,
          callback: () => void
        ): void;
        unobserve(
          eventName: keyof GraphConfiguration | keyof GraphSettings | string
        ): void;
      };

    supportedLanguages: string[];
  }

  type ExpressionState =
    | {
        type?: "text";
        text?: string;
        id?: string;
      }
    | {
        type?: "expression";
        latex?: string;
        color?: string;
        lineStyle?: keyof typeof Styles;
        lineWidth?: number | string;
        lineOpacity?: number | string;
        pointStyle?: keyof typeof Styles;
        pointSize?: number | string;
        pointOpacity?: number | string;
        fillOpacity?: number | string;
        points?: boolean;
        lines?: boolean;
        fill?: boolean;
        hidden?: boolean;
        secret?: boolean;
        sliderBounds?: {
          min: number | string;
          max: number | string;
          step: number | string;
        };
        parametricDomain?: {
          min: number | string;
          max: number | string;
        };
        polarDomain?: {
          min: number | string;
          max: number | string;
        };
        id?: string;
        dragMode?: keyof typeof DragModes;
        label?: string;
        showLabel?: boolean;
        labelSize?: keyof typeof LabelSizes;
        labelOrientation?: keyof typeof LabelOrientations;
      }
    | {
        type: "table";
        columns: ReadonlyArray<{
          latex: string;
          values?: string[];
          color?: string;
          hidden?: boolean;
          points?: boolean;
          lines?: boolean;
          lineStyle?: keyof typeof Styles;
          lineWidth?: number | string;
          lineOpacity?: number | string;
          pointStyle?: keyof typeof Styles;
          pointSize?: number | string;
          pointOpacity?: number | string;
          dragMode?: keyof typeof DragModes;
        }>;
        id?: string;
      };

  interface GraphConfiguration {
    keypad?: boolean;
    graphpaper?: boolean;
    expressions?: boolean;
    settingsMenu?: boolean;
    zoomButtons?: boolean;
    showResetButtonOnGraphpaper?: boolean;
    expressionsTopbar?: boolean;
    pointsOfInterest?: boolean;
    trace?: boolean;
    border?: boolean;
    lockViewport?: boolean;
    expressionsCollapsed?: boolean;
    capExpressionSize?: boolean;
    administerSecretFolders?: boolean;
    images?: boolean;
    imageUploadCallback?(
      file: File,
      cb: (err: Error, url: string) => void
    ): void;
    folders?: boolean;
    notes?: boolean;
    sliders?: boolean;
    links?: boolean;
    qwertyKeyboard?: boolean;
    distributions?: boolean;
    restrictedFunctions?: boolean;
    forceEnableGeometryFunctions?: boolean;
    pasteGraphLink?: boolean;
    pasteTableData?: boolean;
    clearIntoDegreeMode?: boolean;
    colors?: { [key: string]: string };
    autosize?: boolean;
    plotInequalities?: boolean;
    plotImplicits?: boolean;
    plotSingleVariableImplicitEquations?: boolean;
    projectorMode?: boolean;
    decimalToFraction?: boolean;
    fontSize?: number;
    invertedColors?: boolean;
    language?: string;
    brailleMode?: "nemeth" | "ueb" | "none";
    sixKeyInput?: boolean;
    brailleControls?: boolean;
    zoomFit?: boolean;
    forceLogModeRegressions?: boolean;
  }

  interface GraphSettings {
    degreeMode?: boolean;
    showGrid?: boolean;
    polarMode?: boolean;
    showXAxis?: boolean;
    showYAxis?: boolean;
    xAxisNumbers?: boolean;
    yAxisNumbers?: boolean;
    polarNumbers?: boolean;
    xAxisStep?: number;
    yAxisStep?: number;
    xAxisMinorSubdivisions?: number;
    yAxisMinorSubdivisions?: number;
    xAxisArrowMode?: keyof typeof AxisArrowModes;
    yAxisArrowMode?: keyof typeof AxisArrowModes;
    xAxisLabel?: string;
    yAxisLabel?: string;
    randomSeed?: string;
  }
}
