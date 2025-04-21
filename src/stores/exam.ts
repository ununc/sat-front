import { create } from "zustand";

interface CounterState {
  examFlow: IFlow;
  setExamFlow: (auth: IFlow) => void;
  clearAuth: () => void;
}

interface IFlow {
  test: string;
  isNew: boolean;
}

const examFlow: IFlow = {
  test: "",
  isNew: true,
};

export const useExamFlowStore = create<CounterState>((set) => ({
  examFlow,
  setExamFlow: (examFlow: IFlow) => set({ examFlow }),
  clearAuth: () => set({ examFlow: examFlow }),
}));
