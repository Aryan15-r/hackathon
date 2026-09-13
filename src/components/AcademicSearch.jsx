import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Download, Star, ExternalLink, History, Tag, Sparkles } from 'lucide-react';
import { SkeletonCard } from './ui/Skeleton';

export default function AcademicSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', 'Textbook PDF', 'Lecture Notes', 'Cheat Sheet PDF', 'Lab Manual'];

  const performSearch = async (searchTerm) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        if (data.history) setSearchHistory(data.history);
      }
    } catch (e) {
      console.warn('Search API offline, using cached results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch('');
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(query);
  };

  const filteredResults = results.filter(item =>
    activeCategory === 'all' || item.type === activeCategory
  );

  return (
    <div className="search-page animate-fade-in">
      {/* Search Engine Header */}
      <div className="search-header-box glass-card">
        <div className="search-title-section">
          <h2>Smart Academic Search Engine</h2>
          <p>Curated search engine for free open-access textbooks, lecture slides, past exams & research papers.</p>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSearchSubmit} className="search-input-form glass-card">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search by topic, book title, author, or course code (e.g. 'Operating Systems', 'Calculus', 'Dijkstra')..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="main-search-input"
          />
          <button type="submit" className="gradient-button">
            <span>Search</span>
          </button>
        </form>

        {/* Category Pills */}
        <div className="search-categories-row">
          {categories.map(cat => (
            <button
              key={cat}
              className={`search-cat-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="search-workspace">
        {/* Search Results Column */}
        <div className="results-column">
          <h3 className="results-title">
            Academic Resources Found ({filteredResults.length})
          </h3>

          <div className="results-list">
            {loading ? (
              <SkeletonCard count={3} />
            ) : filteredResults.length === 0 ? (
              <div className="empty-results glass-card">
                <BookOpen size={40} className="empty-icon" />
                <p>No resources found for "{query}". Try searching "Operating Systems" or "Calculus".</p>
              </div>
            ) : (
              filteredResults.map(res => (
                <div key={res.id} className="resource-card glass-card glass-card-interactive">
                  <div className="res-header">
                    <div className="res-titles">
                      <span className="res-type-badge">{res.type}</span>
                      <h4>{res.title}</h4>
                      <span className="res-author">By {res.author} • {res.category}</span>
                    </div>

                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="open-link-btn gradient-button"
                    >
                      <ExternalLink size={14} /> View
                    </a>
                  </div>

                  <p className="res-desc">{res.description}</p>

                  <div className="res-footer">
                    <div className="meta-item">
                      <Star size={14} className="star-icon" />
                      <span>{res.rating}</span>
                    </div>
                    <div className="meta-item">
                      <Download size={14} />
                      <span>{res.downloads} downloads</span>
                    </div>
                    <div className="meta-item size">
                      <span>Size: {res.size}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Search History Sidebar */}
        <div className="search-history-sidebar glass-card">
          <div className="history-header">
            <History size={16} className="hist-icon" />
            <h3>Recent Searches</h3>
          </div>

          <div className="history-tags-list">
            {searchHistory.map((item, idx) => (
              <button
                key={idx}
                className="history-tag-btn glass-card"
                onClick={() => {
                  setQuery(item);
                  performSearch(item);
                }}
              >
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Embedded Search Styles */}
      <style>{`
        .search-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .search-header-box {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .search-input-form {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 1rem;
          background: var(--input-bg);
        }

        .main-search-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
        }

        .main-search-input:focus { outline: none; }

        .search-categories-row {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .search-cat-pill {
          background: transparent;
          border: 1px solid var(--card-border);
          color: var(--text-muted);
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
        }

        .search-cat-pill.active {
          background: rgba(99, 102, 241, 0.2);
          border-color: var(--accent-primary);
          color: #a5b4fc;
        }

        .search-workspace {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 1.5rem;
        }

        .results-column {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .results-title {
          font-size: 1.1rem;
          color: var(--text-secondary);
        }

        .results-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .resource-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .res-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }

        .res-type-badge {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--accent-cyan);
          margin-bottom: 0.2rem;
          display: block;
        }

        .res-author {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .open-link-btn {
          padding: 0.45rem 0.95rem;
          font-size: 0.82rem;
        }

        .res-desc {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .res-footer {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .star-icon { color: #f59e0b; fill: #f59e0b; }

        .search-history-sidebar {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .history-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .hist-icon { color: var(--accent-primary); }

        .history-tags-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .history-tag-btn {
          padding: 0.6rem 0.85rem;
          text-align: left;
          font-size: 0.82rem;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .empty-results {
          padding: 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-muted);
        }

        @media (max-width: 900px) {
          .search-workspace { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
