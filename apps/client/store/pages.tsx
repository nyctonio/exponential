import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// tabs in the main content area
export type PageStoreProps = {
  activePage: string;
  maxActive: number;
  activePages: {
    url: string;
    name: string;
    progress: boolean;
  }[];
  setProgress: (url: string, progress: boolean) => void;
  setActivePage: (url: string, name: string) => void;
  setCurrentPage: (url: string) => void;
  removeFromActivePages: (url: string) => void;
};

export const usePageStore = create<PageStoreProps>()(
  persist(
    (set) => ({
      activePage: '',
      maxActive: 8,
      activePages: [],
      setActivePage: (url: string, name: string) =>
        set((state) => {
          if (state.activePages.length >= state.maxActive) {
            state.activePages.shift();
          }
          // do not add the same page twice
          if (state.activePages.find((page) => page.url == url)) {
            return {
              activePages: [...state.activePages],
            };
          } else {
            return {
              activePages: [
                ...state.activePages,
                {
                  url,
                  name,
                  progress: false,
                },
              ],
            };
          }
        }),
      setProgress: (url: string, progress: boolean) =>
        set((state) => {
          return {
            activePages: state.activePages.map((page) => {
              if (page.url == url) {
                return {
                  url,
                  name: page.name,
                  progress,
                };
              }
              return page;
            }),
          };
        }),
      setCurrentPage: (page) => {
        set((state) => {
          return {
            activePage: page,
          };
        });
      },
      removeFromActivePages: (url: string) =>
        set((state) => {
          if (state.activePages.length != 1) {
            return {
              activePages: state.activePages.filter((page) => page.url != url),
            };
          } else {
            return {
              activePages: state.activePages,
            };
          }
        }),
    }),
    {
      name: 'page-store',
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
