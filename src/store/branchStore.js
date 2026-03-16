import { create } from "zustand";

const useBranchStore = create((set) => ({
  branches: [],
  setBranches: (branches) => set({ branches: branches ?? [] }),
  clearBranches: () => set({ branches: [] }),
}));

export default useBranchStore;
