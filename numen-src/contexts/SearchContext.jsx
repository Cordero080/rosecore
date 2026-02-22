// 🔵 PABLO - UI Architect
// SearchContext.jsx - Shared state for search modal
// 
// This context manages:
// - Search modal open/close state
// - Can be expanded later for search history, filters, etc.

import { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const openSearch = () => setIsSearchModalOpen(true);
  const closeSearch = () => setIsSearchModalOpen(false);
  const toggleSearch = () => setIsSearchModalOpen(prev => !prev);

  const value = {
    isSearchModalOpen,
    openSearch,
    closeSearch,
    toggleSearch,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}

export default SearchContext;
