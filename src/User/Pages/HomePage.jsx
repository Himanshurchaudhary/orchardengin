import { useState, useEffect, useRef } from "react";
import FlashSalePage from "./FlashSalePage";
import { openLoginModal } from "../utils/authEvents";
import { addToCart, toggleWishlist, fetchWishlist } from "../utils/cartWishlist";
import { useNavigate } from "react-router-dom";
const API_BASEA = import.meta.env.VITE_API_URL;
import { Helmet } from "react-helmet-async"; // ✅ Yeh add karo



// ─── Responsive Hook ──────────────────────────────────────────────────────────
const useResponsive = () => {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return {
    isMobile: width < 600,
    isTablet: width >= 600 && width < 1024,
    isDesktop: width >= 1024,
    width,
  };
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#e74c3c" : "none"} stroke={filled ? "#e74c3c" : "#bbb"} strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CartIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill={filled ? "#f39c12" : "#ddd"} stroke={filled ? "#f39c12" : "#ddd"} strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
);
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
);

const StarRating = ({ rating = 4 }) => (
  <span style={{ display: "flex", gap: 1 }}>
    {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} filled={i <= rating} />)}
  </span>
);

// ─── Cart Toast ───────────────────────────────────────────────────────────────
const CartToast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const id = Date.now() + Math.random();
      const { name, image } = e.detail || {};
      setToasts(prev => [...prev, { id, name, image, exiting: false }]);
      setTimeout(() => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      }, 2800);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3200);
    };
    window.addEventListener("cart:added", handler);
    return () => window.removeEventListener("cart:added", handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toastSlideIn { from { opacity: 0; transform: translateX(110%); } to { opacity: 1; transform: translateX(0); } }
        @keyframes toastSlideOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(110%); } }
        @keyframes toastProgress { from { width: 100%; } to { width: 0%; } }
      `}</style>
      <div style={{ position: "fixed", bottom: 24, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end", pointerEvents: "none" }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(45,158,45,0.10)",
            padding: "10px 16px 10px 10px", minWidth: 260, maxWidth: 320,
            border: "1.5px solid #e8f5e9", position: "relative", overflow: "hidden",
            animation: toast.exiting ? "toastSlideOut 0.38s cubic-bezier(0.4,0,1,1) forwards" : "toastSlideIn 0.38s cubic-bezier(0,0,0.2,1) forwards",
            pointerEvents: "auto",
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#f0f9f0", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e8f5e9" }}>
              {toast.image ? <img src={toast.image} alt={toast.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 24 }}>🛒</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#2d9e2d", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#2d9e2d" }}>Added to Cart!</span>
              </div>
              <div style={{ fontSize: 11, color: "#555", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{toast.name || "Product"}</div>
            </div>
            <div style={{ position: "absolute", bottom: 0, left: 0, height: 3, background: "#2d9e2d", borderRadius: "0 0 0 12px", animation: `toastProgress 3s linear forwards` }} />
          </div>
        ))}
      </div>
    </>
  );
};

// ─── Hero Banner (Slider only) ────────────────────────────────────────────────
const HeroBanner = ({ height }) => {
  const [slide, setSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/banner/list`);
        const data = await res.json();
        if (data.success) setSlides(data.data.filter(b => b.status === 'Active'));
      } catch (err) {
        console.error('Banner fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const goTo = (i) => {
    if (i === slide || isTransitioning || slides.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => { setSlide(i); setIsTransitioning(false); }, 300);
  };

  useEffect(() => {
    if (slides.length === 0) return;
    const t = setInterval(() => goTo((slide + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [slide, slides.length]);

  if (loading) return <div style={{ width: '100%', height, borderRadius: 12, background: '#e5e7eb' }} />;
  if (slides.length === 0) return null;

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
      <img
        key={slide}
        src={slides[slide].bannerImage}
        alt={slides[slide].title}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: isTransitioning ? 0 : 1, transition: 'opacity 0.4s ease' }}
      />
      {/* Dots */}
      <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end', padding: '0 20px 16px' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{ width: i === slide ? 22 : 8, height: 8, borderRadius: 4, background: i === slide ? '#fff' : 'rgba(255,255,255,0.45)', border: 'none', cursor: 'pointer', transition: 'width 0.3s', padding: 0 }} />
          ))}
        </div>
      </div>
      {/* Prev */}
      <button onClick={() => goTo((slide - 1 + slides.length) % slides.length)}
        style={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ChevronLeft />
      </button>
      {/* Next */}
      <button onClick={() => goTo((slide + 1) % slides.length)}
        style={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ChevronRight />
      </button>
    </div>
  );
};

// ─── Promo Banner Item ─────────────────────────────────────────────────────────
const PromoBannerItem = ({ item, height, borderRadius = 10 }) => {
  const fallbacks = [
    { bg: "#1a1a1a", emoji: "🥬", tag: "Fresh & healthy", label: "For home delivery", badge: "20% off", color: "#4caf50" },
    { bg: "#e67e22", emoji: "🛒", tag: "GROCERY", label: "SALE", sub: "BEST VEGETABLE ONLINE", badge: "SAVE 50%", color: "#fff" },
    { bg: "linear-gradient(135deg,#1a6b1a,#4caf50)", emoji: "🍅", tag: "Limited", label: "Fresh", sub: "Daily", badge: "50%", color: "#ffe600" },
  ];

  if (item?.image) {
    return (
      <div style={{ borderRadius, overflow: 'hidden', cursor: 'pointer', position: 'relative', boxShadow: '0 2px 10px rgba(0,0,0,0.12)', transition: 'transform 0.2s', background: '#111', height }}
        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
        <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,0.65))', padding: '18px 12px 10px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', textAlign: 'center' }}>{item.title}</div>
        </div>
      </div>
    );
  }

  const fb = item || fallbacks[0];
  return (
    <div style={{ background: fb.bg, borderRadius, padding: '18px 16px', height, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', overflow: 'hidden', position: 'relative', transition: 'transform 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.12)' }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
      <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 52, opacity: 0.2 }}>{fb.emoji}</div>
      <div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>{fb.tag}</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>{fb.label}</div>
        {fb.sub && <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', opacity: 0.85 }}>{fb.sub}</div>}
      </div>
      <div style={{ display: 'inline-block', background: fb.color, color: fb.color === '#fff' ? '#e67e22' : '#000', fontWeight: 800, fontSize: 12, padding: '3px 10px', borderRadius: 4, alignSelf: 'flex-start' }}>{fb.badge}</div>
    </div>
  );
};

// ─── Combined Hero Section ─────────────────────────────────────────────────────
// Layout matches reference: [Big Slider (2/3)] [Top Promo (1/3)]
//                           [Bottom Promo 1]   [Bottom Promo 2]  [Stats Grid]
const HeroSection = () => {
  const { isMobile, isTablet } = useResponsive();
  const [ads, setAds] = useState([]);

  useEffect(() => {
    fetch(`${API_BASEA}/api/ad/`)
      .then(r => r.json())
      .then(data => setAds((data.ads || []).filter(a => a.isActive)))
      .catch(() => { });
  }, []);

  const fallbackAds = [
    { bg: "#1a1a2e", emoji: "🥦", tag: "Fresh & Healthy", label: "Free Home Delivery", badge: "20% OFF", color: "#4caf50" },
    { bg: "linear-gradient(135deg,#f7971e,#ffd200)", emoji: "🛒", tag: "GROCERY SALE", label: "Shopping Sale", sub: "UP TO 50% OFF", badge: "SAVE 50%", color: "#fff" },
    { bg: "linear-gradient(135deg,#f8f8f0,#fff8e1)", emoji: "🍅", tag: "Super Delicious", label: "Healthy Food", sub: "Best deals daily", badge: "50% OFF", color: "#e67e22" },
  ];

  const promoItems = ads.length > 0 ? ads : fallbackAds;

  const statsItems = [
    { emoji: "🔒", stat: "48+", label: "Secure Payment Gateways" },
    { emoji: "🤝", stat: "200+", label: "Verified & Trusted Vendors" },
    { emoji: "👥", stat: "90%", label: "User Positive Feedback" },
    { emoji: "🎧", stat: "48+", label: "Online Customer Support" },
  ];

  // Mobile: stacked layout
  if (isMobile) {
    return (
      <div style={{ marginBottom: 32 }}>
        <HeroBanner height={200} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
          {promoItems.slice(0, 2).map((item, i) => (
            <PromoBannerItem key={i} item={item} height={130} />
          ))}
        </div>
        {/* Mobile Stats: 2x2 grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
          {statsItems.map((s, i) => (
            <div key={i} style={{ background: '#f4f9f4', borderRadius: 10, padding: '12px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, border: '1px solid #e8f5e9' }}>
              <span style={{ fontSize: 22 }}>{s.emoji}</span>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#2d9e2d' }}>{s.stat}</div>
              <div style={{ fontSize: 10, color: '#666', textAlign: 'center', lineHeight: 1.3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Tablet: slider full width, then 2 promos + stats row
  if (isTablet) {
    return (
      <div style={{ marginBottom: 48 }}>
        <HeroBanner height={320} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12 }}>
          {promoItems.slice(0, 2).map((item, i) => (
            <PromoBannerItem key={i} item={item} height={160} />
          ))}
          {/* Stats as 3rd column card */}
          <div style={{ background: '#f4f9f4', borderRadius: 10, border: '1px solid #e8f5e9', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, overflow: 'hidden' }}>
            {statsItems.map((s, i) => (
              <div key={i} style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, borderRight: i % 2 === 0 ? '1px solid #e8f5e9' : 'none', borderBottom: i < 2 ? '1px solid #e8f5e9' : 'none' }}>
                <span style={{ fontSize: 20 }}>{s.emoji}</span>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#2d9e2d' }}>{s.stat}</div>
                <div style={{ fontSize: 9, color: '#666', textAlign: 'center', lineHeight: 1.3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Desktop: reference layout
  // Row 1: [Slider 2/3] | [Top promo 1/3]  — both tall
  // Row 2: [Promo 2]    | [Promo 3]        | [Stats 2x2]
  const HERO_H = 380;
  const BOTTOM_H = 200;

  return (
    <div style={{ marginBottom: 98 }}>
      {/* Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
        <HeroBanner height={HERO_H} />
        <PromoBannerItem item={promoItems[0]} height={HERO_H} borderRadius={12} />
      </div>

      {/* Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        {/* Promo 2 */}
        <PromoBannerItem item={promoItems[1]} height={BOTTOM_H} borderRadius={10} />

        {/* Promo 3 */}
        <PromoBannerItem item={promoItems[2]} height={BOTTOM_H} borderRadius={10} />

        {/* Stats 2x2 grid */}
        <div style={{
          background: '#f4f9f4',
          borderRadius: 10,
          border: '1px solid #e0f0e0',
          overflow: 'hidden',
          height: BOTTOM_H,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
        }}>
          {statsItems.map((s, i) => (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              justifyContent: 'center', gap: 4,
              padding: '14px 16px',
              borderRight: i % 2 === 0 ? '1px solid #e0f0e0' : 'none',
              borderBottom: i < 2 ? '1px solid #e0f0e0' : 'none',
              background: i % 2 === 0 ? '#f4f9f4' : '#edf7ed',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 26, lineHeight: 1 }}>{s.emoji}</span>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#2d9e2d', lineHeight: 1 }}>{s.stat}</div>
              </div>
              <div style={{ fontSize: 11, color: '#555', lineHeight: 1.35, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Mobile Flash Sale Banner ─────────────────────────────────────────────────
// Sirf mobile pe dikhe, FeatureCategories ke upar
const MobileFlashSaleBanner = ({ onFlashSaleClick }) => {
  const [sales, setSales] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch(`${API_BASEA}/api/flash/all?target=mobile`)
      .then(r => r.json())
      .then(data => {
        const all = data.sales || [];
        setSales(all.filter(s => s.isActive));
      })
      .catch(() => { });
  }, []);

  // Auto-slide agar multiple sales hain
  useEffect(() => {
    if (sales.length <= 1) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % sales.length), 3500);
    return () => clearInterval(t);
  }, [sales.length]);

  if (sales.length === 0) return null;

  const sale = sales[current];

  return (
    <div style={{ marginBottom: 20 }}>
      <style>{`
        @keyframes mfs-pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes mfs-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>

      {/* Section label */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>⚡</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#1a1a1a" }}>Flash Sales</span>
        </div>
        <span style={{ fontSize: 12, color: "#2d9e2d", fontWeight: 600, cursor: "pointer" }}
          onClick={() => onFlashSaleClick(sale.id)}>
          View All →
        </span>
      </div>

      {/* Banner card */}
      <div
        onClick={() => onFlashSaleClick(sale.id)}
        style={{
          position: "relative",
          borderRadius: 16,
          overflow: "hidden",
          height: 140,
          background: "#0d4d0d",
          boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
          cursor: "pointer",
        }}
      >
        {/* Background image */}
        {sale.thumbnail && (
          <img
            src={sale.thumbnail}
            alt={sale.name}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}

        {/* Dark overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.28) 60%, transparent 100%)"
        }} />

        {/* Shimmer effect */}
        <div style={{
          position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none"
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, width: "40%", height: "100%",
            background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)",
            animation: "mfs-shimmer 2.5s ease-in-out infinite",
          }} />
        </div>

        {/* Content */}
        <div style={{
          position: "absolute", inset: 0, padding: "14px 16px",
          display: "flex", flexDirection: "column", justifyContent: "space-between", zIndex: 2
        }}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            {/* Discount badge */}
            {sale.minDiscount && (
              <div style={{
                background: "#ffe600", color: "#111",
                fontWeight: 900, fontSize: 11,
                padding: "3px 10px", borderRadius: 99,
                letterSpacing: 0.3,
              }}>
                🏷 {sale.minDiscount}% OFF
              </div>
            )}
            {/* TAP badge */}
            <div style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 6, padding: "3px 8px",
              fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: 0.5
            }}>TAP →</div>
          </div>

          {/* Bottom: name + ends */}
          <div>
            <div style={{
              fontSize: 20, fontWeight: 900, color: "#fff",
              lineHeight: 1.15, marginBottom: 4,
              textShadow: "0 2px 8px rgba(0,0,0,0.5)"
            }}>
              ⚡ {sale.name}
            </div>
            {sale.endDate && (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
                Ends: {new Date(sale.endDate).toLocaleDateString()}
                {sale.endTime ? ` at ${sale.endTime}` : ""}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dot indicators — multiple sales ke liye */}
      {sales.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 8 }}>
          {sales.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? 20 : 7,
                height: 7,
                borderRadius: 99,
                border: "none",
                padding: 0,
                cursor: "pointer",
                background: i === current
                  ? "linear-gradient(90deg,#2d9e2d,#52cc52)"
                  : "#ddd",
                transition: "width 0.3s, background 0.3s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, onPrev, onNext }) => {
  const { isMobile } = useResponsive();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <h2 style={{ fontSize: isMobile ? 15 : 18, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>{title}</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#2d9e2d", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>View All</span>
        {onPrev && (
          <>
            <button onClick={onPrev} style={navBtnStyle}><ChevronLeft /></button>
            <button onClick={onNext} style={navBtnStyle}><ChevronRight /></button>
          </>
        )}
      </div>
    </div>
  );
};

const navBtnStyle = {
  width: 26, height: 26, borderRadius: 4, border: "1px solid #ddd",
  background: "#fff", cursor: "pointer", display: "flex",
  alignItems: "center", justifyContent: "center", padding: 0
};

const categoryEmojis = ["🥦", "🐟", "🍎", "🥩", "🧀", "🍞", "🌶️", "🫒", "🥚"];

// ─── Feature Categories ───────────────────────────────────────────────────────
const FeatureCategories = ({ categories, loading, products }) => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  const [currentSlide, setCurrentSlide] = useState(0);

  const visibleCount = isMobile ? 2 : isTablet ? 3 : 5;
  const total = categories.length;
  const totalSlides = Math.max(0, total - visibleCount + 1);

  const handleCategoryClick = (catId) => navigate(`/user/product?categories=${catId}`);

  const goPrev = () => setCurrentSlide(s => Math.max(0, s - 1));
  const goNext = () => setCurrentSlide(s => Math.min(totalSlides - 1, s + 1));

  // Smaller card sizes
  const CARD_W = isMobile ? 120 : isTablet ? 160 : 190;
  const CARD_H = isMobile ? 110 : isTablet ? 150 : 170;
  const GAP = isMobile ? 10 : 16;

  return (
    <section
      id="feature-categories"
      style={{ marginBottom: isMobile ? 36 : isTablet ? 52 : 72, scrollMarginTop: 80 }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

        #feature-categories * { font-family: 'Inter', sans-serif; box-sizing: border-box; }

        @keyframes fc-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
        @keyframes fc-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }

        /* ── Card ── */
        .fc-card {
          flex-shrink: 0;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        /* ── Image wrapper ── */
        .fc-img-wrap {
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(145deg, #f9fdf9, #edf7ed);
          border: 2px solid rgba(45,158,45,0.12);
          transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.28s ease,
                      border-color 0.28s ease;
          box-shadow: 0 4px 16px rgba(0,0,0,0.07);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .fc-img-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 18px;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.55) 0%, transparent 70%);
          pointer-events: none;
        }
        .fc-img-wrap img {
          width: 76%;
          height: 76%;
          object-fit: contain;
          transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1);
          position: relative;
          z-index: 1;
        }

        /* ── Card hover ── */
        .fc-card:hover .fc-img-wrap {
          transform: translateY(-6px) scale(1.04);
          box-shadow: 0 14px 36px rgba(45,158,45,0.22), 0 4px 12px rgba(0,0,0,0.06);
          border-color: rgba(45,158,45,0.32);
        }
        .fc-card:hover .fc-img-wrap img {
          transform: scale(1.06);
        }
        .fc-card:hover .fc-label {
          color: #1e7b1e;
        }

        /* ── Label ── */
        .fc-label {
          font-size: 13px;
          font-weight: 700;
          color: #2a2a2a;
          text-align: center;
          letter-spacing: 0.08px;
          transition: color 0.2s;
          line-height: 1.3;
          padding: 0 4px;
        }

        /* ── Arrow buttons ── */
        .fc-arrow {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid rgba(45,158,45,0.25);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 12px rgba(45,158,45,0.18);
          transition: background 0.18s, border-color 0.18s,
                      transform 0.18s, box-shadow 0.18s;
          position: absolute;
          top: 45%;
          transform: translateY(-50%);
          z-index: 10;
          flex-shrink: 0;
        }
        .fc-arrow svg { transition: transform 0.18s; }
        .fc-arrow:hover {
          background: #2d9e2d;
          border-color: #2d9e2d;
          box-shadow: 0 4px 18px rgba(45,158,45,0.38);
        }
        .fc-arrow:hover svg { transform: scale(1.15); }
        .fc-arrow:hover svg polyline { stroke: #fff; }
        .fc-arrow:disabled {
          background: #f5f5f5;
          border-color: #e0e0e0;
          cursor: default;
          box-shadow: none;
          opacity: 0.55;
        }
        .fc-arrow:disabled svg polyline { stroke: #b0b0b0; }

        /* ── Dot nav ── */
        .fc-dot {
          width: 7px; height: 7px;
          border-radius: 999px;
          border: none; cursor: pointer; padding: 0;
          transition: background 0.22s, width 0.22s, transform 0.22s;
          background: #d5d5d5;
        }
        .fc-dot.active {
          background: linear-gradient(90deg, #2d9e2d, #52cc52);
          width: 22px;
          border-radius: 999px;
        }

        /* ── Skeleton shimmer ── */
        .fc-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e4e4e4 50%, #f0f0f0 75%);
          background-size: 800px 100%;
          animation: fc-shimmer 1.4s infinite linear;
          border-radius: 20px;
        }

        /* ── View All button ── */
        .fc-viewall {
          border: 2px solid #2d9e2d;
          border-radius: 99px;
          padding: 10px 52px;
          font-size: 14px;
          font-weight: 700;
          color: #2d9e2d;
          background: #fff;
          cursor: pointer;
          letter-spacing: 0.4px;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.15s;
          display: inline-block;
        }
        .fc-viewall:hover {
          background: linear-gradient(135deg, #2d9e2d, #3eb83e);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 6px 22px rgba(45,158,45,0.32);
          transform: translateY(-1px);
        }
      `}</style>

      {/* ── Heading ── */}
      <div style={{ textAlign: "center", marginBottom: isMobile ? 22 : 32 }}>
        <p style={{
          fontSize: isMobile ? 11 : 12,
          fontWeight: 700,
          letterSpacing: 2.5,
          textTransform: "uppercase",
          color: "#2d9e2d",
          margin: "0 0 8px",
        }}>
          Shop by Category
        </p>
        <h2 style={{
          fontSize: isMobile ? 20 : isTablet ? 26 : 30,
          fontWeight: 800,
          color: "#111",
          margin: "0 0 12px",
          lineHeight: 1.15,
        }}>
          Featured Categories
        </h2>
        <div style={{
          width: isMobile ? 56 : 80,
          height: 3,
          borderRadius: 99,
          background: "linear-gradient(90deg, #2d9e2d, #88e088)",
          margin: "0 auto",
        }} />
      </div>

      {/* ── Carousel ── */}
      {loading ? (
        <div style={{ display: "flex", gap: GAP, justifyContent: "center", padding: `0 ${isMobile ? 40 : 56}px`, overflow: "hidden" }}>
          {[...Array(visibleCount)].map((_, i) => (
            <div key={i} style={{ flexShrink: 0, width: CARD_W, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div className="fc-skeleton" style={{ width: CARD_W, height: CARD_H }} />
              <div className="fc-skeleton" style={{ width: 64, height: 12, borderRadius: 6 }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ position: "relative" }}>

          {/* Left Arrow */}
          <button
            className="fc-arrow"
            onClick={goPrev}
            disabled={currentSlide === 0}
            style={{ left: isMobile ? 0 : 4 }}
            aria-label="Previous"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2d9e2d" strokeWidth="2.8" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Slider viewport */}
          <div style={{ overflow: "hidden", margin: `0 ${isMobile ? 44 : 60}px` }}>
            <div style={{
              display: "flex",
              gap: GAP,
              transform: `translateX(-${currentSlide * (CARD_W + GAP)}px)`,
              transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
            }}>
              {categories.map((cat, i) => {
                const img = cat.thumbnail || cat.image;
                return (
                  <div
                    key={cat.id || i}
                    className="fc-card"
                    style={{ width: CARD_W }}
                    onClick={() => handleCategoryClick(cat.id)}
                  >
                    <div className="fc-img-wrap" style={{ width: CARD_W, height: CARD_H }}>
                      {img ? (
                        <img
                          src={img}
                          alt={cat.name}
                          onError={e => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <span style={{ fontSize: isMobile ? 36 : 52 }}>🛒</span>
                      )}
                    </div>
                    <span className="fc-label" style={{ fontSize: isMobile ? 12 : 13 }}>
                      {cat.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            className="fc-arrow"
            onClick={goNext}
            disabled={currentSlide >= totalSlides - 1}
            style={{ right: isMobile ? 0 : 4 }}
            aria-label="Next"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2d9e2d" strokeWidth="2.8" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Dots ── */}
      {!loading && totalSlides > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: isMobile ? 18 : 24 }}>
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              className={`fc-dot${currentSlide === i ? " active" : ""}`}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* ── View All ── */}
      <div style={{ textAlign: "center", marginTop: isMobile ? 18 : 26 }}>
        <button className="fc-viewall" onClick={() => navigate("/user/categories")}>
          View All Categories
        </button>
      </div>
    </section>
  );
};// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  const oldPrice = Number(product.price || product.buyingPrice || 0);
  const price = Number(product.oldPrice || product.sellingPrice);
  const name = product.name || product.title || "Product";
  const unit = product.unit || product.weight || "1 KG";
  const image = product.image || product.thumbnail || product.images?.[0];
  const stock = product.stockQuantity ?? 0;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 10;
  const discount = oldPrice && price ? Math.round((1 - price / oldPrice) * 100) : 0;

  const isLoggedIn = () => !!localStorage.getItem("userToken");

  useEffect(() => {
    if (!isLoggedIn()) return;
    fetchWishlist().then(data => {
      const ids = (data.products || []).map(p => p.id || p);
      setWished(ids.includes(product.id));
    }).catch(() => { });
  }, [product.id]);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn()) { openLoginModal(); return; }
    if (loading) return;
    setLoading(true);
    try {
      await addToCart(product.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
      window.dispatchEvent(new CustomEvent("cart:added", { detail: { name, image } }));
    } catch {
      alert("Failed to add to cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn()) { openLoginModal(); return; }
    try {
      await toggleWishlist(product.id, wished);
      setWished(w => !w);
    } catch {
      alert("Failed to update wishlist. Please try again.");
    }
  };

  const imgHeight = isMobile ? 130 : 175;
  const categoryName = typeof product.category === "object"
    ? (product.category?.name || "")
    : (product.category || "");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        @keyframes pc-pop {
          0%   { transform: scale(1); }
          45%  { transform: scale(1.28); }
          100% { transform: scale(1.18); }
        }
        @keyframes pc-checkpop {
          0%   { transform: scale(0.7); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pc-shimmer {
          0%   { left: -60%; }
          100% { left: 130%; }
        }
        @keyframes pc-ripple {
          0%   { transform: scale(0); opacity: 0.35; }
          100% { transform: scale(3.5); opacity: 0; }
        }

        .pc-root {
          font-family: 'Inter', sans-serif;
          background: #ffffff;
          border-radius: 18px;
          border: 1.5px solid #f0f0f0;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1), border-color 0.3s;
          position: relative;
        }
        .pc-root:hover {
          box-shadow: 0 16px 48px rgba(45,158,45,0.16), 0 4px 16px rgba(0,0,0,0.07);
          transform: translateY(-5px) scale(1.012);
          border-color: rgba(45,158,45,0.22);
        }

        /* Image zone */
        .pc-img-zone {
          position: relative;
          overflow: hidden;
          background: linear-gradient(145deg, #f6fdf6, #eef7ee);
          flex-shrink: 0;
        }
        .pc-img-zone::before {
          content: '';
          position: absolute;
          top: -10px; left: -60%;
          width: 40%; height: 200%;
          background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%);
          transform: skewX(-10deg);
          z-index: 2;
          pointer-events: none;
          animation: pc-shimmer 2.8s ease-in-out infinite;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .pc-root:hover .pc-img-zone::before { opacity: 1; }

        .pc-img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        .pc-root:hover .pc-img { transform: scale(1.07); }

        /* Discount badge */
        .pc-badge-discount {
          position: absolute;
          top: 10px; left: 10px;
          background: linear-gradient(135deg, #ff5722, #ff8a50);
          color: #fff;
          font-size: 9px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 99px;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(255,87,34,0.38);
          z-index: 3;
        }

        /* Wishlist button */
        .pc-wish-btn {
          position: absolute;
          top: 10px; right: 10px;
          background: rgba(255,255,255,0.92);
          border: none;
          border-radius: 50%;
          width: 32px; height: 32px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.12);
          transition: background 0.2s, transform 0.2s;
          z-index: 3;
          backdrop-filter: blur(6px);
        }
        .pc-wish-btn:hover { background: #fff; transform: scale(1.12); }
        .pc-wish-btn.active svg { animation: pc-pop 0.35s ease forwards; }

        /* Stock pill */
        .pc-stock-pill {
          position: absolute;
          bottom: 10px; left: 10px;
          font-size: 9px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 99px;
          letter-spacing: 0.3px;
          z-index: 3;
        }
        .pc-stock-pill.out  { background: rgba(231,76,60,0.12);  color: #c0392b; }
        .pc-stock-pill.low  { background: rgba(230,126,34,0.12); color: #d35400; }
        .pc-stock-pill.in   { background: rgba(45,158,45,0.10);  color: #1e7b1e; }

        /* Body */
        .pc-body {
          padding: 10px 11px 12px;
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 4px;
        }

        .pc-cat {
          font-size: 9.5px;
          font-weight: 700;
          color: #2d9e2d;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .pc-name {
          font-weight: 700;
          color: #111;
          line-height: 1.35;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        /* Stars */
        .pc-stars { display: flex; align-items: center; gap: 3px; }
        .pc-star { font-size: 11px; line-height: 1; }
        .pc-rating-count { font-size: 10px; color: #aaa; font-weight: 500; }

        /* Price row */
        .pc-price-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
          flex-wrap: wrap;
        }
        .pc-price-new {
          font-weight: 900;
          color: #1e7b1e;
          letter-spacing: -0.3px;
        }
        .pc-price-old {
          font-size: 11px;
          color: #c8c8c8;
          text-decoration: line-through;
          font-weight: 500;
        }
        .pc-unit {
          margin-left: auto;
          font-size: 10px;
          color: #bbb;
          font-weight: 500;
          white-space: nowrap;
        }

        /* Divider */
        .pc-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #f0f0f0 30%, #f0f0f0 70%, transparent);
          margin: 2px 0;
        }

        /* Add to cart */
        .pc-atc-btn {
          position: relative;
          overflow: hidden;
          width: 100%;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.3px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background 0.22s, box-shadow 0.22s, transform 0.15s;
          margin-top: auto;
        }
        .pc-atc-btn:not(:disabled):hover {
          box-shadow: 0 6px 20px rgba(45,158,45,0.38);
          transform: translateY(-1px);
        }
        .pc-atc-btn:not(:disabled):active { transform: scale(0.97); }
        .pc-atc-btn .pc-ripple {
          position: absolute;
          width: 60px; height: 60px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          transform: scale(0);
          pointer-events: none;
        }
        .pc-atc-btn:not(:disabled):active .pc-ripple {
          animation: pc-ripple 0.5s ease-out forwards;
        }
        .pc-check { animation: pc-checkpop 0.3s ease forwards; }
      `}</style>

      <div
        className="pc-root"
        onClick={() => product.slug && navigate(`/products/${product.slug}`)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* ── Image Zone ── */}
        <div className="pc-img-zone" style={{ height: imgHeight }}>
          {image
            ? <img className="pc-img" src={image} alt={name} onError={e => { e.target.style.display = "none"; }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? 42 : 54 }}>🛒</div>
          }

          {/* Discount badge */}
          {discount > 0 && (
            <span className="pc-badge-discount">🏷 {discount}% OFF</span>
          )}

          {/* Wishlist */}
          <button
            className={`pc-wish-btn${wished ? " active" : ""}`}
            onClick={handleWishlist}
            aria-label="Wishlist"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={wished ? "#e74c3c" : "none"} stroke={wished ? "#e74c3c" : "#888"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Stock pill */}
          <span className={`pc-stock-pill ${isOutOfStock ? "out" : isLowStock ? "low" : "in"}`}>
            {isOutOfStock ? "● Out of Stock" : isLowStock ? `● Only ${stock} left` : "● In Stock"}
          </span>
        </div>

        {/* ── Body ── */}
        <div className="pc-body">
          {/* Category */}
          {categoryName && <div className="pc-cat">{categoryName}</div>}

          {/* Name */}
          <div className="pc-name" style={{ fontSize: isMobile ? 12 : 13 }}>{name}</div>

          {/* Stars */}
          <div className="pc-stars">
            {[1, 2, 3, 4, 5].map(s => (
              <span key={s} className="pc-star">
                {s <= Math.round(product.rating || 4) ? "★" : "☆"}
              </span>
            ))}
            <span className="pc-rating-count">({product.reviewCount || product.rating || "4.0"})</span>
          </div>

          <div className="pc-divider" />

          {/* Price */}
          <div className="pc-price-row">
            <span className="pc-price-new" style={{ fontSize: isMobile ? 15 : 17 }}>
              ₹{price.toFixed(2)}
            </span>
            {oldPrice > 0 && (
              <span className="pc-price-old">₹{oldPrice.toFixed(2)}</span>
            )}
            <span className="pc-unit">{unit}</span>
          </div>

          {/* Add to Cart */}
          <button
            className="pc-atc-btn"
            onClick={handleAddToCart}
            disabled={isOutOfStock || loading}
            style={{
              padding: isMobile ? "8px 0" : "9px 0",
              fontSize: isMobile ? 11 : 12,
              background: isOutOfStock
                ? "#e8e8e8"
                : added
                  ? "linear-gradient(135deg, #1a7a1a, #28a428)"
                  : "linear-gradient(135deg, #2d9e2d, #3eb83e)",
              color: isOutOfStock ? "#aaa" : "#fff",
              marginTop: 8,
            }}
          >
            <span className="pc-ripple" />
            {isOutOfStock ? (
              "Out of Stock"
            ) : loading ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            ) : added ? (
              <>
                <svg className="pc-check" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Added!
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
// ─── Popular Products ─────────────────────────────────────────────────────────
const PopularProducts = ({ products, loading, onFlashSaleClick }) => {
  const { isMobile, isTablet } = useResponsive();
  const [activeTab, setActiveTab] = useState("All");
  const [categories, setCategories] = useState([]);
  const [flashSale, setFlashSale] = useState(null);

  useEffect(() => {
    fetch(`${API_BASEA}/api/Category/all`)
      .then(r => r.json())
      .then(data => {
        const cats = Array.isArray(data) ? data : data.categories || data.data || [];
        setCategories(cats.filter(c => c.isActive));
      }).catch(() => { });
  }, []);

  useEffect(() => {
    if (isMobile) return; // ✅ ye line add ki
    fetch(`${API_BASEA}/api/flash/all?target=web`)
      .then(r => r.json())
      .then(data => {
        const sales = data.sales || data.flashSales || data.data || [];
        const active = sales.find(s => s.isActive) || sales[0];
        if (active) setFlashSale(active);
      }).catch(() => { });
  }, [isMobile]);

  const tabLabels = ["All", ...categories.map(c => c.name)];

  const getProductCatId = (p) => {
    if (!p.category) return "";
    if (typeof p.category === "object") return p.category.id || "";
    return p.category;
  };

  const getDisplayedProducts = () => {
    if (activeTab === "All") {
      const result = [];
      categories.forEach(cat => {
        products.filter(p => getProductCatId(p) === cat.id).slice(0, 2).forEach(p => result.push(p));
      });
      return result.length > 0 ? result.slice(0, 8) : products.slice(0, 8);
    }
    const selectedCat = categories.find(c => c.name === activeTab);
    if (!selectedCat) return [];
    return products.filter(p => getProductCatId(p) === selectedCat.id).slice(0, 8);
  };

  const displayedProducts = getDisplayedProducts();
  const discountBadge = flashSale?.minDiscount;
  const productCols = isMobile ? "repeat(2, 1fr)" : isTablet ? "repeat(3, 1fr)" : "repeat(4, 1fr)";

  return (
    <section id="popular-product" style={{ marginBottom: isMobile ? 32 : 36 }}>
      <SectionHeader title="Popular Products" />
      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, flexWrap: "nowrap", overflowX: "auto", marginBottom: 16, paddingBottom: 2, scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
        {tabLabels.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0, cursor: "pointer", transition: "all 0.2s", border: "1px solid " + (activeTab === t ? "#2d9e2d" : "#ddd"), background: activeTab === t ? "#2d9e2d" : "#fff", color: activeTab === t ? "#fff" : "#555" }}
          >{t}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: productCols, gap: 10 }}>
          {[...Array(isMobile ? 4 : 5)].map((_, i) => (
            <div key={i} style={{ height: 280, background: "#f0f0f0", borderRadius: 8, animation: "pulse 1.4s ease-in-out infinite" }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr" : "290px 1fr", gap: 14, alignItems: "stretch" }}>
          {/* Flash Sale Card */}
          {!isMobile && (
            <div
              onClick={() => onFlashSaleClick(flashSale?.id || null)}
              style={{ borderRadius: 14, overflow: "hidden", position: "relative", background: "#1a5c1a", boxShadow: "0 4px 18px rgba(0,0,0,0.18)", cursor: "pointer", minHeight: isTablet ? 240 : 420, transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.015)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.28)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,0,0,0.18)"; }}
            >
              {(flashSale?.thumbnail || flashSale?.image) ? (
                <img src={flashSale.thumbnail || flashSale.image} alt={flashSale.name || "Flash Sale"} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }} />
              ) : (
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, #1a7a1a 0%, #0d4d0d 100%)" }} />
              )}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.70) 100%)" }} />
              {discountBadge && (
                <div style={{ position: "absolute", top: 16, left: 16, zIndex: 2, width: 66, height: 66, borderRadius: "50%", background: "#2d9e2d", border: "2.5px solid rgba(255,255,255,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{discountBadge}%</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.9)", lineHeight: 1.2 }}>OFF</span>
                </div>
              )}
              <div style={{ position: "absolute", top: 14, right: 14, zIndex: 2, background: "rgba(255,230,0,0.18)", border: "1px solid rgba(255,230,0,0.4)", borderRadius: 6, padding: "4px 10px", fontSize: 10, fontWeight: 700, color: "#ffe600", letterSpacing: 0.5 }}>TAP TO EXPLORE →</div>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "28px 20px 22px", zIndex: 2 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1.15, marginBottom: 6, letterSpacing: -0.5, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                  <span style={{ color: "#ffe600" }}>⚡</span> {flashSale?.name || "Flash Sale"}
                </div>
                {flashSale?.endDate && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginBottom: 14 }}>Ends: {new Date(flashSale.endDate).toLocaleDateString()}{flashSale.endTime ? ` at ${flashSale.endTime}` : ""}</div>}
                <button onClick={e => { e.stopPropagation(); onFlashSaleClick(flashSale?.id || null); }}
                  style={{ width: "100%", padding: "12px 0", background: "#ffe600", color: "#111", border: "none", borderRadius: 8, fontWeight: 900, fontSize: 14, cursor: "pointer", letterSpacing: 0.5, transition: "opacity 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >ORDER NOW ⚡</button>
                <div style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 10 }}>www.theorchardengine.com</div>
              </div>
            </div>
          )}
          {/* Product Grid */}
          <div style={{ display: "grid", gridTemplateColumns: productCols, gridAutoRows: "1fr", gap: 10 }}>
            {displayedProducts.length > 0
              ? displayedProducts.map((p, i) => <ProductCard key={p.id || i} product={p} />)
              : <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "#bbb", fontSize: 14 }}>No products found.</div>
            }
          </div>
        </div>
      )}
    </section>
  );
};

// ─── Just For You ─────────────────────────────────────────────────────────────
const JustForYou = ({ products, loading }) => {
  const { isMobile, isTablet } = useResponsive();
  const [page, setPage] = useState(0);
  const perPage = 12;
  const paginated = products.slice(page * perPage, (page + 1) * perPage);
  const cols = isMobile ? "repeat(2, 1fr)" : isTablet ? "repeat(3, 1fr)" : "repeat(6, 1fr)";

  return (
    <section style={{ marginBottom: 28 }}>
      <SectionHeader title="Just For You" />
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 10 }}>
          {[...Array(isMobile ? 4 : 12)].map((_, i) => (
            <div key={i} style={{ height: 240, background: "#f0f0f0", borderRadius: 8, animation: "pulse 1.4s ease-in-out infinite" }} />
          ))}
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: cols, gap: 10 }}>
            {paginated.map((p, i) => <ProductCard key={p.id || i} product={p} />)}
          </div>
          {products.length > perPage && (
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <button onClick={() => setPage(pg => pg + 1)}
                style={{ padding: "10px 40px", background: "#fff", border: "1px solid #2d9e2d", color: "#2d9e2d", borderRadius: 5, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#2d9e2d"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#2d9e2d"; }}
              >Load More Products</button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { isMobile } = useResponsive();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [prodLoading, setProdLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(null);
  const [flashSaleId, setFlashSaleId] = useState(null);

  useEffect(() => {
    if (window.location.hash === "#feature-categories") {
      const timer = setTimeout(() => {
        const el = document.getElementById("feature-categories");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    fetch(`${API_BASEA}/api/Category/all`)
      .then(r => r.json())
      .then(data => { setCategories(Array.isArray(data) ? data : data.categories || data.data || []); setCatLoading(false); })
      .catch(() => { setCatLoading(false); setError("Could not load categories."); });

    const fetchAllProducts = async () => {
      try {
        let allProducts = [], p = 1, totalPages = 1;
        do {
          const res = await fetch(`${API_BASEA}/api/Products/allFree?page=${p}&limit=100`);
          const data = await res.json();
          const batch = Array.isArray(data) ? data : data.products || data.data || [];
          allProducts = [...allProducts, ...batch];
          totalPages = data.totalPages || 1;
          p++;
        } while (p <= totalPages);
        setProducts(allProducts);
      } catch (err) {
        console.error(err);
      } finally {
        setProdLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  const handleFlashSaleClick = (id) => {
    setFlashSaleId(id);
    setPage("flash");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setPage(null);
    setFlashSaleId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (

    
    <>
    <Helmet>
      <title>Orchard Engine — Fresh Groceries Delivered to Your Door</title>
      <meta name="description" content="Order fresh fruits, vegetables, dairy, and daily essentials online at Orchard Engine. Fast delivery, best prices, and 100% freshness guaranteed. Shop now at theorchardengine.com." />
      <link rel="canonical" href="https://theorchardengine.com" />
    </Helmet>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        body { font-family: 'Nunito', sans-serif; }
        ::-webkit-scrollbar { display: none; }
        button { touch-action: manipulation; }
        img { max-width: 100%; }
      `}</style>

      <CartToast />

      {page === "flash" && (
        <FlashSalePage flashSaleId={flashSaleId} onBack={handleBack} />
      )}

      {page === null && (
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: isMobile ? "10px 10px 0" : "16px 16px 0" }}>
          {error && (
            <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 6, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#856404" }}>⚠️ {error}</div>
          )}

          {/* ✅ New combined HeroSection replaces HeroBanner + PromoBanners + StatsBar */}
          <HeroSection />
          {isMobile && (
            <MobileFlashSaleBanner onFlashSaleClick={handleFlashSaleClick} />
          )}

          <FeatureCategories categories={categories} loading={catLoading} products={products} />
          <PopularProducts products={products} loading={prodLoading} onFlashSaleClick={handleFlashSaleClick} />
          <JustForYou products={products} loading={prodLoading} />
        </div>
      )}
    </>
  );
}