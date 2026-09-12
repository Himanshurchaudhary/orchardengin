// src/components/UserNavbar.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { MapPin, Search, Heart, ShoppingCart, User, LogOut, X, Menu, ChevronDown, Globe } from 'lucide-react';
import AuthModal from '../Pages/UserLogin';
import { fetchCart, fetchWishlist } from "../utils/cartWishlist";
import CartDrawer from "../Components/Cartdrawer";
const API_BASEA = import.meta.env.VITE_API_URL;


const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Categories', to: '/', scrollTo: 'feature-categories' },
  { label: 'Products', to: '/user/product' },
  { label: 'Most Popular', to: '/', scrollTo: 'popular-product' },
  { label: 'Contact', to: '/user/contect' },
  { label: 'Blogs', to: '/user/blog' },
];

// ─── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Highlight matching text ──────────────────────────────────────────────────
const Highlight = ({ text = '', query = '' }) => {
  if (!query.trim()) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <span style={{ background: 'rgba(45,158,45,0.15)', color: '#1a6b1a', fontWeight: 800, borderRadius: 2, padding: '0 1px' }}>
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </span>
  );
};

// ─── Search Bar with Suggestions ─────────────────────────────────────────────
const SearchBar = ({ isMobile = false, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dropRef = useRef(null);
  const wrapRef = useRef(null);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 280);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q) {
      setSuggestions(prev =>
        prev.products.length === 0 && prev.categories.length === 0
          ? prev
          : { products: [], categories: [] }
      );
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const fetchSuggestions = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`${API_BASEA}/api/Products/allFree?search=${encodeURIComponent(q)}&limit=5`),
          fetch(`${API_BASEA}/api/Category/all`),
        ]);
        if (cancelled) return;
        const prodData = await prodRes.json();
        const catData = await catRes.json();
        const products = (prodData.products || prodData.data || []).slice(0, 5);
        const allCats = Array.isArray(catData) ? catData : catData.categories || catData.data || [];
        const categories = allCats
          .filter(c => c.isActive !== false && c.name.toLowerCase().includes(q.toLowerCase()))
          .slice(0, 3);
        if (!cancelled) {
          setSuggestions({ products, categories });
          setLoading(false);
          setActiveIndex(-1);
        }
      } catch {
        if (!cancelled) {
          setSuggestions({ products: [], categories: [] });
          setLoading(false);
        }
      }
    };

    fetchSuggestions();
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  useEffect(() => {
    const handle = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const allSuggestions = [
    ...suggestions.categories.map(c => ({ type: 'category', item: c })),
    ...suggestions.products.map(p => ({ type: 'product', item: p })),
  ];

  const hasResults = suggestions.categories.length > 0 || suggestions.products.length > 0;
  const showDrop = open && query.trim().length > 0 && (loading || hasResults);

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, allSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && allSuggestions[activeIndex]) {
        selectSuggestion(allSuggestions[activeIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const selectSuggestion = useCallback(({ type, item }) => {
    setOpen(false);
    setActiveIndex(-1);
    if (type === 'category') {
      setQuery(item.name);
      navigate(`/user/product?categories=${item.id}`);
    } else {
      const name = item.name || '';
      setQuery(name);
      navigate(`/user/product?search=${encodeURIComponent(name)}`);
    }
    if (isMobile && onClose) onClose();
  }, [navigate, isMobile, onClose]);

  const handleSearch = useCallback((e) => {
    e?.preventDefault();
    const q = query.trim();
    setOpen(false);
    setActiveIndex(-1);
    if (q) {
      navigate(`/user/product?search=${encodeURIComponent(q)}`);
      if (isMobile && onClose) onClose();
    }
  }, [query, navigate, isMobile, onClose]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim()) {
      setOpen(true);
    } else {
      setOpen(false);
      setSuggestions({ products: [], categories: [] });
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions({ products: [], categories: [] });
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  let flatIdx = -1;

  if (isMobile) {
    return (
      <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
        <form onSubmit={handleSearch} className="flex items-center w-full">
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => { if (query.trim() && hasResults) setOpen(true); }}
              onKeyDown={handleKeyDown}
              placeholder="Search products or categories…"
              autoComplete="off"
              className="border border-gray-200 rounded-l-lg px-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white w-full"
              style={{ paddingRight: query ? 32 : 14 }}
            />
            {query && (
              <button type="button" onClick={handleClear}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#bbb', display: 'flex', alignItems: 'center' }}>
                <X size={13} />
              </button>
            )}
          </div>
          <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r-lg transition flex items-center gap-1 flex-shrink-0">
            <Search size={16} />
          </button>
        </form>
        {showDrop && (
          <div ref={dropRef} style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.13)', zIndex: 9999, overflow: 'hidden' }}>
            <SuggestionDropdown loading={loading} hasResults={hasResults} query={query} suggestions={suggestions} allSuggestions={allSuggestions} activeIndex={activeIndex} setActiveIndex={setActiveIndex} selectSuggestion={selectSuggestion} handleSearch={handleSearch} flatIdx={flatIdx} />
          </div>
        )}
      </div>
    );
  }

  // Desktop: just an icon button that opens the suggestion panel
  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <style>{`
        @keyframes navSearchSlide {
          from { opacity: 0; transform: translateX(10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      {!open ? (
        <button
          onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
          className="w-10 h-10 rounded-full border border-green-500 flex items-center justify-center text-green-600 hover:bg-green-50 transition"
        >
          <Search size={18} />
        </button>
      ) : (
        <div style={{ animation: 'navSearchSlide 0.2s ease', display: 'flex', alignItems: 'center', gap: 0 }}>
          <div style={{ position: 'relative' }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => { if (query.trim() && hasResults) setOpen(true); }}
              onKeyDown={handleKeyDown}
              placeholder="Search products or categories…"
              autoComplete="off"
              className="border border-gray-200 rounded-l-lg px-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              style={{ width: 280, paddingRight: query ? 32 : 14 }}
            />
            {query && (
              <button type="button" onClick={handleClear}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#bbb', display: 'flex', alignItems: 'center' }}>
                <X size={13} />
              </button>
            )}
          </div>
          <button onClick={handleSearch} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r-lg transition flex items-center gap-1 flex-shrink-0">
            <Search size={16} />
          </button>
          <button onClick={() => { setOpen(false); setQuery(''); setSuggestions({ products: [], categories: [] }); }} className="ml-2 p-1 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
      )}

      {showDrop && open && (
        <div ref={dropRef} style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 380, background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.13)', zIndex: 9999, overflow: 'hidden' }}>
          <SuggestionDropdown loading={loading} hasResults={hasResults} query={query} suggestions={suggestions} allSuggestions={allSuggestions} activeIndex={activeIndex} setActiveIndex={setActiveIndex} selectSuggestion={selectSuggestion} handleSearch={handleSearch} flatIdx={flatIdx} />
        </div>
      )}
    </div>
  );
};

// ─── Suggestion Dropdown Content ─────────────────────────────────────────────
const SuggestionDropdown = ({ loading, hasResults, query, suggestions, allSuggestions, activeIndex, setActiveIndex, selectSuggestion, handleSearch }) => {
  let flatIdx = -1;
  return (
    <>
      <style>{`
        @keyframes navSgFadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .sg-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 14px; cursor: pointer; transition: background 0.12s; border: none; background: transparent; width: 100%; text-align: left; font-family: inherit; }
        .sg-nav-item:hover, .sg-nav-item.active { background: #f4faf4; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      {loading && (
        <div style={{ padding: '16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#bbb', fontSize: 13 }}>
          <div style={{ width: 16, height: 16, border: '2px solid #e0e0e0', borderTopColor: '#2d9e2d', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          Searching…
        </div>
      )}
      {!loading && !hasResults && (
        <div style={{ padding: '20px 14px', textAlign: 'center', fontSize: 13, color: '#bbb' }}>
          No results for <strong>"{query}"</strong>
        </div>
      )}
      {!loading && hasResults && (
        <>
          {suggestions.categories.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#bbb', padding: '10px 14px 5px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                Categories
              </div>
              {suggestions.categories.map(cat => {
                flatIdx++;
                const fi = flatIdx;
                return (
                  <button key={cat.id} className={`sg-nav-item${activeIndex === fi ? ' active' : ''}`}
                    onMouseDown={() => selectSuggestion({ type: 'category', item: cat })}
                    onMouseEnter={() => setActiveIndex(fi)}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {cat.thumbnail ? <img src={cat.thumbnail} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2d9e2d" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><Highlight text={cat.name} query={query} /></div>
                      <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>Browse category</div>
                    </div>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                );
              })}
            </>
          )}
          {suggestions.categories.length > 0 && suggestions.products.length > 0 && <div style={{ height: 1, background: '#f0f0f0', margin: '4px 0' }} />}
          {suggestions.products.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#bbb', padding: '10px 14px 5px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>
                Products
              </div>
              {suggestions.products.map(prod => {
                flatIdx++;
                const fi = flatIdx;
                const price = Number(prod.sellingPrice || prod.buyingPrice || 0);
                const image = prod.thumbnail || prod.additionalImages?.[0];
                const cat = typeof prod.category === 'object' ? prod.category?.name : '';
                return (
                  <button key={prod.id} className={`sg-nav-item${activeIndex === fi ? ' active' : ''}`}
                    onMouseDown={() => selectSuggestion({ type: 'product', item: prod })}
                    onMouseEnter={() => setActiveIndex(fi)}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {image ? <img src={image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><Highlight text={prod.name || ''} query={query} /></div>
                      {cat && <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>{cat}</div>}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#2d9e2d', flexShrink: 0 }}>₹{price.toFixed(2)}</div>
                  </button>
                );
              })}
            </>
          )}
          <div style={{ padding: '10px 14px', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: '#bbb' }}>↑↓ navigate · Enter · Esc</span>
            <button onMouseDown={handleSearch} style={{ fontSize: 12, fontWeight: 700, color: '#2d9e2d', background: '#f0faf0', border: '1px solid #c8e6c9', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Search size={12} /> See all results
            </button>
          </div>
        </>
      )}
    </>
  );
};

// ─── Main Navbar ──────────────────────────────────────────────────────────────
const UserNavbar = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('userToken'));
  const [cartOpen, setCartOpen] = useState(false);
  const [catDropOpen, setCatDropOpen] = useState(false);

  // Mobile states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!isLoggedIn) {
      hasFetchedRef.current = false;
      setCartCount(0);
      setWishlistCount(0);
      return;
    }
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    fetchCart().then(data => {
      const total = (data?.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0);
      setCartCount(total);
    }).catch(() => setCartCount(0));

    fetchWishlist().then(data => {
      setWishlistCount((data?.products || []).length);
    }).catch(() => setWishlistCount(0));
  }, [isLoggedIn]);

  const onCartUpdate = useCallback((e) => {
    const total = (e.detail?.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0);
    setCartCount(total);
  }, []);

  const onWishlistUpdate = useCallback((e) => {
    setWishlistCount((e.detail?.products || []).length);
  }, []);

  useEffect(() => {
    window.addEventListener("cart-updated", onCartUpdate);
    window.addEventListener("wishlist-updated", onWishlistUpdate);
    return () => {
      window.removeEventListener("cart-updated", onCartUpdate);
      window.removeEventListener("wishlist-updated", onWishlistUpdate);
    };
  }, [onCartUpdate, onWishlistUpdate]);

  useEffect(() => {
    const handler = () => { setAuthMode('login'); setShowAuth(true); };
    window.addEventListener("open-login-modal", handler);
    return () => window.removeEventListener("open-login-modal", handler);
  }, []);

  const user = { name: 'John Doe', avatar: null };

  const openLogin = () => { setAuthMode('login'); setShowAuth(true); };

  const handleLoginSuccess = useCallback((token) => {
    localStorage.setItem('userToken', token);
    setIsLoggedIn(true);
    setShowAuth(false);
    navigate('/');
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('userToken');
    setIsLoggedIn(false);
    setShowDropdown(false);
    setMobileMenuOpen(false);
    setCartCount(0);
    setWishlistCount(0);
    navigate('/');
  }, [navigate]);

  const handleNavClick = useCallback((link) => {
    setMobileMenuOpen(false);
    if (!link.scrollTo) { navigate(link.to); return; }
    const scrollToSection = () => {
      const el = document.getElementById(link.scrollTo);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    if (location.pathname === link.to) {
      scrollToSection();
    } else {
      navigate(link.to);
      setTimeout(scrollToSection, 300);
    }
  }, [navigate, location.pathname]);

  return (
    <>
      <style>{`
        .rg-navbar { font-family: 'Inter', 'Segoe UI', sans-serif; }
        .rg-row1 { background: #fff; border-bottom: 1px solid #efefef; }
        .rg-row2 { background: #fff; border-bottom: 2px solid #1a9e3f; }
        .rg-lang-btn {
          display: flex; align-items: center; gap: 5px;
          border: 1px solid #e2e8f0; border-radius: 6px;
          padding: 5px 10px; font-size: 13px; font-weight: 500;
          color: #374151; background: #fff; cursor: pointer;
          transition: border-color 0.15s;
        }
        .rg-lang-btn:hover { border-color: #16a34a; color: #16a34a; }
        .rg-cat-btn {
          display: flex; align-items: center; gap: 8px;
          border: 1.5px solid #1a9e3f; border-radius: 8px;
          padding: 8px 16px; font-size: 14px; font-weight: 600;
          color: #1a9e3f; background: #fff; cursor: pointer;
          white-space: nowrap; transition: background 0.15s;
          min-width: 170px;
        }
        .rg-cat-btn:hover { background: #f0faf4; }
        .rg-navlink {
          font-size: 14px; font-weight: 500; color: #374151;
          text-decoration: none; padding: 4px 2px;
          border-bottom: 2px solid transparent;
          transition: color 0.15s, border-color 0.15s;
          white-space: nowrap; background: none; border-top: none;
          border-left: none; border-right: none; cursor: pointer;
        }
        .rg-navlink:hover, .rg-navlink.active { color: #1a9e3f; border-bottom-color: #1a9e3f; }
        .rg-icon-btn {
          display: flex; align-items: center; gap: 6px;
          color: #374151; background: none; border: none;
          cursor: pointer; font-size: 14px; font-weight: 500;
          padding: 4px 6px; border-radius: 6px;
          transition: color 0.15s, background 0.15s;
        }
        .rg-icon-btn:hover { color: #1a9e3f; background: #f0faf4; }
        .rg-login-btn {
          border: 1.5px solid #1a9e3f; border-radius: 8px;
          padding: 8px 22px; font-size: 14px; font-weight: 600;
          color: #1a9e3f; background: #fff; cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .rg-login-btn:hover { background: #1a9e3f; color: #fff; }
        .rg-badge {
          position: absolute; top: -6px; right: -6px;
          background: #1a9e3f; color: #fff; font-size: 10px;
          font-weight: 700; min-width: 18px; height: 18px;
          border-radius: 9px; display: flex; align-items: center;
          justify-content: center; padding: 0 3px;
        }
        @keyframes mobileMenuSlideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>

      <header className="rg-navbar w-full bg-white sticky top-0 z-40" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>

        {/* ═══════════════ DESKTOP ═══════════════ */}

        {/* Row 1: Logo | (spacer) | Lang · Currency · Wishlist · Cart · Login */}
        <div className="rg-row1 hidden md:flex items-center justify-between px-8 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => navigate('/')}>
            <img src="/UserLogo.png" alt="Logo" className="h-12 w-auto object-contain" />
            <div className="leading-tight">
              <span className="block text-green-600 font-extrabold text-lg tracking-tight">Orchard</span>
              <span className="block text-orange-400 font-extrabold text-lg tracking-tight -mt-1">Engine</span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language selector */}
            <button className="rg-lang-btn">
              <span style={{ fontSize: 18, lineHeight: 1 }}>🇮🇳</span>
              <span>EN</span>
              <ChevronDown size={13} />
            </button>

            {/* Currency selector */}
            <button className="rg-lang-btn">
              <span style={{ fontSize: 13 }}>₹</span>
              <span>INR</span>
              <ChevronDown size={13} />
            </button>

            <div style={{ width: 1, height: 28, background: '#e5e7eb', margin: '0 4px' }} />

            {/* Wishlist */}
            <button className="rg-icon-btn" onClick={() => navigate('/user/wishlist')}>
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <Heart size={20} />
                {wishlistCount > 0 && <span className="rg-badge">{wishlistCount}</span>}
              </div>
              <span>Wishlist</span>
            </button>

            {/* Cart */}
            <button className="rg-icon-btn" onClick={() => setCartOpen(true)}>
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <ShoppingCart size={20} />
                {cartCount > 0 && <span className="rg-badge">{cartCount}</span>}
              </div>
              <span>My Cart</span>
            </button>

            <div style={{ width: 1, height: 28, background: '#e5e7eb', margin: '0 4px' }} />

            {/* Auth */}
            {isLoggedIn ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDropdown(p => !p)}
                  className="w-10 h-10 rounded-full border-2 border-green-500 overflow-hidden flex items-center justify-center bg-gray-100 hover:border-green-600 transition"
                >
                  {user.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : <User size={20} className="text-gray-500" />}
                </button>
                {showDropdown && (
                  <div className="absolute right-0 top-12 bg-white border border-gray-100 rounded-xl shadow-lg w-44 py-2 z-50">
                    <button onClick={() => { navigate('/user/userDashboard'); setShowDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition flex items-center gap-2">
                      <User size={15} /> Dashboard
                    </button>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition flex items-center gap-2">
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={openLogin} className="rg-login-btn">Login</button>
            )}
          </div>
        </div>

        {/* Row 2: [All Categories] | Nav Links | SearchIcon */}
        <div className="rg-row2 hidden md:flex items-center gap-4 px-8 py-2">
          {/* All Categories dropdown button */}
          <div style={{ position: 'relative' }}>
            <button
              className="rg-cat-btn"
              onClick={() => setCatDropOpen(p => !p)}
            >
              {/* Grid icon */}
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
              All Categories
              <ChevronDown size={15} style={{ marginLeft: 'auto' }} />
            </button>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 28, background: '#d1fae5', flexShrink: 0 }} />

          {/* Nav Links */}
          <nav className="flex items-center gap-5 flex-1">
            {NAV_LINKS.map((link) => {
              if (link.scrollTo) {
                return (
                  <button key={link.label} onClick={() => handleNavClick(link)} className="rg-navlink">
                    {link.label}
                  </button>
                );
              }
              return (
                <NavLink key={link.to} to={link.to}
                  className={({ isActive }) => `rg-navlink${isActive ? ' active' : ''}`}>
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Search icon (right) */}
          <SearchBar />
        </div>

        {/* ═══════════════ MOBILE HEADER ═══════════════ */}
        <div className="flex md:hidden items-center justify-between px-4 py-3">
          <button
            onClick={() => { setMobileMenuOpen(p => !p); setMobileSearchOpen(false); }}
            className="p-1 text-gray-700 hover:text-green-600 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/UserLogo.png" alt="Logo" className="h-9 w-auto object-contain" />
            <div className="leading-tight">
              <span className="block text-green-600 font-extrabold text-sm tracking-tight">Orchard</span>
              <span className="block text-orange-400 font-extrabold text-sm tracking-tight -mt-0.5">Engine</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={() => { setMobileSearchOpen(p => !p); setMobileMenuOpen(false); }} className="p-1.5 text-gray-700 hover:text-green-600 transition" aria-label="Search">
              {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
            {isLoggedIn ? (
              <>
                <button onClick={() => navigate('/user/wishlist')} className="p-1.5 text-gray-700 hover:text-green-600 transition relative" aria-label="Wishlist">
                  <Heart size={20} />
                  {wishlistCount > 0 && <span style={{ position: 'absolute', top: 0, right: 0, background: '#1a9e3f', color: '#fff', fontSize: 9, fontWeight: 700, width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{wishlistCount}</span>}
                </button>
                <button onClick={() => setCartOpen(true)} className="p-1.5 text-gray-700 hover:text-green-600 transition relative" aria-label="Cart">
                  <ShoppingCart size={20} />
                  {cartCount > 0 && <span style={{ position: 'absolute', top: 0, right: 0, background: '#1a9e3f', color: '#fff', fontSize: 9, fontWeight: 700, width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>}
                </button>
                <button onClick={() => setShowDropdown(p => !p)} className="w-8 h-8 rounded-full border-2 border-green-500 overflow-hidden flex items-center justify-center bg-gray-100">
                  {user.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : <User size={16} className="text-gray-500" />}
                </button>
              </>
            ) : (
              <button onClick={openLogin} className="rg-login-btn" style={{ padding: '5px 12px', fontSize: 13 }}>Login</button>
            )}
          </div>
        </div>

        {/* Mobile Search expand */}
        {mobileSearchOpen && (
          <div className="md:hidden px-4 pb-3 bg-white border-t border-gray-100">
            <SearchBar isMobile={true} onClose={() => setMobileSearchOpen(false)} />
          </div>
        )}

        {/* Mobile user dropdown */}
        {showDropdown && isLoggedIn && (
          <div className="md:hidden absolute right-4 top-[60px] bg-white border border-gray-100 rounded-xl shadow-lg w-44 py-2 z-[200]">
            <button onClick={() => { navigate('/user/userDashboard'); setShowDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition flex items-center gap-2">
              <User size={15} /> Dashboard
            </button>
            <hr className="my-1 border-gray-100" />
            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition flex items-center gap-2">
              <LogOut size={15} /> Logout
            </button>
          </div>
        )}
      </header>

      {/* ═══════════════ MOBILE SLIDE-IN DRAWER ═══════════════ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] md:hidden" style={{ top: 0 }}>
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col" style={{ animation: 'mobileMenuSlideIn 0.25s ease' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-green-50">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" stroke="white" strokeWidth="2" />
                    <path d="M16 10a4 4 0 01-8 0" fill="none" stroke="white" strokeWidth="2" />
                  </svg>
                </div>
                <span className="text-green-600 font-extrabold text-sm">Orchard Engine</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>

            <nav className="flex flex-col py-3 flex-1 overflow-y-auto">
              {NAV_LINKS.map((link) => {
                if (link.scrollTo) {
                  return (
                    <button key={link.label} onClick={() => handleNavClick(link)} className="text-left px-5 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 transition border-none bg-transparent">
                      {link.label}
                    </button>
                  );
                }
                return (
                  <NavLink key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => `px-5 py-3 text-sm font-medium transition ${isActive ? 'text-green-600 font-semibold bg-green-50' : 'text-gray-700 hover:bg-green-50 hover:text-green-600'}`}>
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>

            <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
              {isLoggedIn ? (
                <div className="flex flex-col gap-2">
                  <button onClick={() => { navigate('/user/userDashboard'); setMobileMenuOpen(false); }} className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-600 py-2 transition">
                    <User size={16} /> Dashboard
                  </button>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 py-2 transition">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              ) : (
                <button onClick={() => { openLogin(); setMobileMenuOpen(false); }} className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg py-2.5 transition flex items-center justify-center gap-2">
                  <User size={16} /> Login / Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showAuth && (
        <AuthModal mode={authMode} onClose={() => setShowAuth(false)} onLoginSuccess={handleLoginSuccess} />
      )}

      {showDropdown && (
        <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)} />
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default UserNavbar;