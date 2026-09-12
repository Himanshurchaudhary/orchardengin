// src/components/UserFooter.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const featureBadges = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'Best Prices & Offers',
    sub: 'Orders ₹500 or more',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 5v4h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: 'Free Delivery',
    sub: '24/7 amazing services',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Great Daily Deal',
    sub: 'When you sign up',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
    title: 'Wide Assortment',
    sub: 'Mega Discounts',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
      </svg>
    ),
    title: 'Easy Returns',
    sub: '7 day return policy',
  },
];

const companyLinks = [
  { label: 'About Us', href: '/user/about' },
  { label: 'Privacy Policy', href: '/user/privacy' },
  { label: 'Terms & Conditions', href: '/user/termcondition' },
  { label: 'Contact Us', href: '/user/contect' },
  { label: 'Delete Account', href: '/user/deleteaccount' },
];

const accountLinks = [
  { label: 'Sign In', href: '/user/login' },
  { label: 'My Orders', href: '/user/orders' },
  { label: 'My Wishlist', href: '/user/wishlist' },
  { label: 'Track My Order', href: '/user/track' },
  { label: 'Help & Support', href: '/user/contect' },
];

const corporateLinks = [
  { label: 'Products', href: '/user/product' },
  { label: 'Blogs', href: '/user/blog' },
  { label: 'Become a Vendor', href: '/user/vendor' },
  { label: 'Affiliate Program', href: '/user/affiliate' },
  { label: 'Promotions', href: '/user/promotions' },
];

const PaymentIcons = () => (
  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
    {[
      { label: 'VISA', color: '#1a1f71', text: '#fff' },
      { label: 'MasterCard', color: '#fff', text: '#333', border: '1px solid #ddd' },
      { label: 'RuPay', color: '#fff', text: '#007cc3', border: '1px solid #ddd' },
      { label: 'UPI', color: '#fff', text: '#6b3fa0', border: '1px solid #ddd' },
    ].map(p => (
      <span key={p.label} style={{
        background: p.color,
        color: p.text,
        border: p.border || 'none',
        fontSize: 10,
        fontWeight: 700,
        padding: '3px 9px',
        borderRadius: 4,
        letterSpacing: 0.3,
      }}>{p.label}</span>
    ))}
  </div>
);

const UserFooter = () => {
  const navigate = useNavigate();

  return (
    <footer style={{ background: '#fff', color: '#374151', width: '100%', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", borderTop: '1px solid #e5e7eb' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        /* ── Feature Bar ── */
        .uf-feature-bar {
          display: flex;
          flex-wrap: wrap;
          border-bottom: 1px solid #e5e7eb;
          background: #fff;
        }
        .uf-feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 24px;
          flex: 1 1 160px;
          border-right: 1px solid #e5e7eb;
        }
        .uf-feature-item:last-child { border-right: none; }
        @media (max-width: 640px) {
          .uf-feature-item { border-right: none; border-bottom: 1px solid #e5e7eb; flex: 1 1 45%; }
        }

        /* ── Main body ── */
        .uf-dark { background: #111827; }

        .uf-main-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr 1fr 1.4fr;
          gap: 32px;
          padding: 40px 48px 32px;
        }
        @media (max-width: 1100px) {
          .uf-main-grid {
            grid-template-columns: 1fr 1fr 1fr;
            padding: 32px 32px 24px;
          }
          .uf-col-about { grid-column: 1 / -1; }
          .uf-col-install { grid-column: 1 / -1; }
        }
        @media (max-width: 640px) {
          .uf-main-grid {
            grid-template-columns: 1fr 1fr;
            padding: 24px 16px 20px;
            gap: 24px;
          }
          .uf-col-about { grid-column: 1 / -1; }
          .uf-col-install { grid-column: 1 / -1; }
        }

        .uf-col-title {
          color: #fff;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          margin: 0 0 18px;
        }

        .uf-link {
          color: #9ca3af;
          text-decoration: none;
          font-size: 13px;
          font-weight: 400;
          line-height: 1.5;
          transition: color 0.15s;
        }
        .uf-link:hover { color: #f9fafb; }

        .uf-store-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #1f2937;
          border: 1px solid #374151;
          border-radius: 10px;
          padding: 9px 16px;
          text-decoration: none;
          transition: border-color 0.2s, background 0.2s;
          width: 100%;
          box-sizing: border-box;
        }
        .uf-store-btn:hover { border-color: #6b7280; background: #273244; }

        .uf-social-btn {
          width: 36px; height: 36px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.2s, transform 0.2s;
          text-decoration: none;
          flex-shrink: 0;
        }
        .uf-social-btn:hover { opacity: 0.85; transform: translateY(-2px); }

        /* ── Bottom bar ── */
        .uf-bottom {
          border-top: 1px solid #1f2937;
          background: #0d1117;
          padding: 16px 48px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        @media (max-width: 768px) {
          .uf-bottom { padding: 16px; flex-direction: column; align-items: center; text-align: center; }
        }

        .uf-bottom-phones {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .uf-bottom-social {
          display: flex;
          align-items: center;
          gap: 10px;
        }
      `}</style>

      {/* ══════════════════════════════════════
          FEATURE BAR
      ══════════════════════════════════════ */}
      <div className="uf-feature-bar">
        {featureBadges.map((b) => (
          <div className="uf-feature-item" key={b.title}>
            {b.icon}
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#111827', lineHeight: 1.3 }}>{b.title}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{b.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════
          DARK MAIN SECTION
      ══════════════════════════════════════ */}
      <div className="uf-dark">
        <div className="uf-main-grid">

          {/* ── Col 1: About + Contact ── */}
          <div className="uf-col-about">
            {/* Logo */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 16 }}
              onClick={() => navigate('/')}
            >
              <img src="/UserLogo.png" alt="Orchard Engine" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 10 }} />
              <div style={{ lineHeight: 1.1 }}>
                <span style={{ display: 'block', color: '#fff', fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px' }}>Orchard</span>
                <span style={{ display: 'block', color: '#22c55e', fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px' }}>Engine</span>
              </div>
            </div>

            <p style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.75, margin: '0 0 20px', maxWidth: 340 }}>
              Your trusted online shop for fresh groceries, perfumes, and daily essentials.
              We deliver quality products at the best prices—right to your doorstep.
            </p>

            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#9ca3af' }}>
                <MapPin size={15} color="#22c55e" style={{ flexShrink: 0, marginTop: 1 }} />
                2752-C-1 , Street no 4 nai basti, Bathinda Punjab , 151001 ,
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#9ca3af' }}>
                <Phone size={15} color="#22c55e" style={{ flexShrink: 0 }} />
                +91 94636 86829
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#9ca3af' }}>
                <Mail size={15} color="#22c55e" style={{ flexShrink: 0 }} />
                theorchardengine@gmail.com
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#9ca3af' }}>
                <Clock size={15} color="#22c55e" style={{ flexShrink: 0 }} />
                Hours 9:00 – 20:00, Mon – Sat
              </li>
            </ul>
          </div>

          {/* ── Col 2: Company ── */}
          <div>
            <h4 className="uf-col-title">Company</h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {companyLinks.map(l => (
                <li key={l.label}><Link to={l.href} className="uf-link">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Account ── */}
          <div>
            <h4 className="uf-col-title">Account</h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {accountLinks.map(l => (
                <li key={l.label}><Link to={l.href} className="uf-link">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* ── Col 4: Corporate ── */}
          <div>
            <h4 className="uf-col-title">Corporate</h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {corporateLinks.map(l => (
                <li key={l.label}><Link to={l.href} className="uf-link">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* ── Col 5: Install App + Payments ── */}
          <div className="uf-col-install">
            <h4 className="uf-col-title">Install App</h4>
            <p style={{ color: '#6b7280', fontSize: 12, margin: '0 0 12px' }}>From App Store or Google Play</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Google Play */}
              <a href="https://play.google.com/store/apps/details?id=com.kokok1.OrchardKartMobile" className="uf-store-btn" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, flexShrink: 0 }}>
                  <path d="M3.18 23.76a2 2 0 001.94-.21l11.81-6.82-3.36-3.36L3.18 23.76z" fill="#EA4335" />
                  <path d="M20.82 10.27L17.57 8.4l-3.73 3.73 3.73 3.73 3.27-1.89a2 2 0 000-3.7z" fill="#FBBC04" />
                  <path d="M1.22 1.5A2 2 0 001 2.46v19.08a2 2 0 00.22.96l.11.11 10.69-10.69v-.25L1.33 1.39l-.11.11z" fill="#4285F4" />
                  <path d="M13.57 13.57L3.12 24a2 2 0 001.94-.21l11.81-6.82-3.3-3.4z" fill="#34A853" />
                </svg>
                <div style={{ lineHeight: 1.25 }}>
                  <span style={{ display: 'block', color: '#9ca3af', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 }}>Get it on</span>
                  <span style={{ display: 'block', color: '#fff', fontSize: 13, fontWeight: 700 }}>Google Play</span>
                </div>
              </a>

              {/* App Store */}
              <a href="https://play.google.com/store/apps/details?id=com.kokok1.OrchardKartMobile" className="uf-store-btn" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="white" style={{ width: 22, height: 22, flexShrink: 0 }}>
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.18 1.27-2.16 3.8.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.37 2.78M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div style={{ lineHeight: 1.25 }}>
                  <span style={{ display: 'block', color: '#9ca3af', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 }}>Download on the</span>
                  <span style={{ display: 'block', color: '#fff', fontSize: 13, fontWeight: 700 }}>App Store</span>
                </div>
              </a>
            </div>

            {/* Payment Methods */}
            <div style={{ marginTop: 24 }}>
              <h4 className="uf-col-title" style={{ marginBottom: 10 }}>Secured Payments</h4>
              <PaymentIcons />
            </div>
          </div>

        </div>

        {/* ══════════════════════════════════════
            BOTTOM BAR
        ══════════════════════════════════════ */}
        <div className="uf-bottom">
          {/* Copyright */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontSize: 12, color: '#6b7280' }}>© 2026 All rights reserved</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#4b5563', display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#d1d5db' }}>OrchardEngine</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#4b5563', display: 'inline-block' }} />
            {/* <span style={{ fontSize: 12, color: '#6b7280' }}>Design & Development by Hexile Services</span> */}
          </div>

          {/* Phone Numbers */}
          <div className="uf-bottom-phones">
            {[
              { label: 'Working 9:00 – 20:00', num: '+91 94636 86829' },
              { label: '24/7 Support Center', num: '+91 94636 86829' },
            ].map((p) => (
              <div key={p.num + p.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={15} color="#22c55e" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>{p.num}</div>
                  <div style={{ fontSize: 10, color: '#6b7280' }}>{p.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Follow us + social */}
          <div className="uf-bottom-social">
            <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, marginRight: 4 }}>Follow Us</span>

            {/* Facebook */}
            <a href="https://www.facebook.com/people/Orchard-Engine/61593679281358/" target="_blank" rel="noopener noreferrer" className="uf-social-btn" style={{ background: '#1877f2', width: 32, height: 32 }}>
              <svg viewBox="0 0 24 24" fill="white" width="15" height="15">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </a>

            {/* Twitter/X — HIDDEN */}
            {/* <a href="#" className="uf-social-btn" style={{ background: '#1d9bf0', width: 32, height: 32 }}>
    <svg viewBox="0 0 24 24" fill="white" width="15" height="15">
      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
    </svg>
  </a> */}

            {/* Instagram */}
            <a href="https://instagram.com/theorchardengine" target="_blank" rel="noopener noreferrer" className="uf-social-btn" style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', width: 32, height: 32 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="white" stroke="none" />
              </svg>
            </a>

            {/* WhatsApp */}
            <a href="https://wa.me/919463686829" target="_blank" rel="noopener noreferrer" className="uf-social-btn" style={{ background: '#25d366', width: 32, height: 32 }}>
              <svg viewBox="0 0 24 24" fill="white" width="15" height="15">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.122 1.532 5.855L.057 23.535a.75.75 0 00.916.918l5.803-1.46A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.7-.498-5.253-1.37l-.376-.214-3.898.981.998-3.792-.234-.389A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default UserFooter;