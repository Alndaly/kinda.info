import { create } from 'zustand'
import { RefObject } from 'react'

interface AppState {
    navBar: RefObject<HTMLDivElement> | null
    setNavBar: (narBar: RefObject<HTMLDivElement>) => void
}

export const useAppStore = create<AppState>()((set) => ({
    navBar: null,
    setNavBar: (navBar: RefObject<HTMLDivElement>) => set(({ navBar })),
}))
