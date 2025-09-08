import React, { useState, useCallback, useEffect } from 'react';

function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cards, setCards] = useState([]);
  
  // Your original cards data
  const originalCards = [
    // ... your cards data here
  ];
  
  // Initialize with all cards
  useEffect(() => {
    setCards(originalCards);
  }, []);
  
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (!query.trim()) {
        setCards(originalCards);
        return;
      }
      
      const lowerCaseQuery = query.toLowerCase();
      const results = originalCards.filter(card => {
        if (card.heading && card.heading.toLowerCase().includes(lowerCaseQuery)) {
          return true;
        }
        if (card.content && card.content.toLowerCase().includes(lowerCaseQuery)) {
          return true;
        }
        if (card.links) {
          return card.links.some(link => 
            link.text && link.text.toLowerCase().includes(lowerCaseQuery)
          );
        }
        return false;
      });
      
      setCards(results);
    }, 300),
    [originalCards]
  );
  
  // Trigger search when query changes
  useEffect(() => {
    debouncedSearch(searchQuery);
    
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);
  
  // Manual search trigger (for button)
  const handleSearch = () => {
    debouncedSearch(searchQuery);
  };
  
  return (
    <div className="your-component">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by heading or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      
      <div className="cards-container">
        {cards.map((card, index) => (
          <div key={index} className="card">
            <h3>{card.heading}</h3>
            <p>{card.content}</p>
            {card.links && (
              <div className="links">
                {card.links.map((link, linkIndex) => (
                  <a key={linkIndex} href={link.url}>{link.text}</a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Debounce helper
function debounce(func, wait) {
  let timeout;
  function debounced(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  }
  debounced.cancel = () => clearTimeout(timeout);
  return debounced;
}

export default Search;