import { create } from "zustand";

interface IResultState {
  resultInfo: IResult;
  setResultInfo: (result: IResult) => void;
  clearAuth: () => void;
}

interface IResult {
  testTitle: string;
  testDescription: string;
  testLevel: number;
}

const resultInfo: IResult = {
  testTitle: "",
  testDescription: "",
  testLevel: 1,
};

export const useResultStore = create<IResultState>((set) => ({
  resultInfo,
  setResultInfo: (resultInfo: IResult) => set({ resultInfo }),
  clearAuth: () => set({ resultInfo }),
}));
