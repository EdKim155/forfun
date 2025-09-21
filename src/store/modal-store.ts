import { create } from 'zustand';

interface SaveModalState {
  templateId?: string;
  prompt?: string;
  toolSlug?: string;
  categorySlug?: string;
  brief?: string;
}

interface SendModalState {
  toolSlug?: string;
  prompt?: string;
}

interface ModalState {
  saveModal: SaveModalState;
  sendModal: SendModalState;
  openSaveModal: (payload: SaveModalState) => void;
  closeSaveModal: () => void;
  openSendModal: (payload: SendModalState) => void;
  closeSendModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  saveModal: {},
  sendModal: {},
  openSaveModal: (payload) => set({ saveModal: payload }),
  closeSaveModal: () => set({ saveModal: {} }),
  openSendModal: (payload) => set({ sendModal: payload }),
  closeSendModal: () => set({ sendModal: {} })
}));
