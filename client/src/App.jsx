import React, { useState, useEffect } from 'react';
import { 
  checkSpringBackendHealth, 
  checkAiServiceHealth 
} from './services/api';
import DiseaseDetectionView from './pages/DiseaseDetection/DiseaseDetectionView';
import CropRecommendationView from './pages/CropRecommendation/CropRecommendationView';
import WeatherPanel from './components/WeatherPanel';
import AuthModal from './components/AuthModal';
import InstallModal from './components/InstallModal';

// Curated high-resolution agricultural image assets
const AGRI_IMAGES = {
  hero: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1200&auto=format&fit=crop",
  mandi: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=600&auto=format&fit=crop",
  stubble: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=600&auto=format&fit=crop",
  soil: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=600&auto=format&fit=crop"
};

// All Verified AgroSphere Real Modules (Strictly NO "5 Pillars" wording)
const AGROSPHERE_TOOLS = [
  {
    id: "tool-disease",
    title: "AI Crop Disease Vision Scanner",
    badge: "Vision AI · Active",
    badgeType: "ai",
    category: "Diagnostics & Crop Health",
    icon: "fas fa-camera",
    iconColor: "#B8D96A",
    desc: "Upload or photograph damaged crop leaves to diagnose 15+ foliar pathogens in under 2 seconds with ICAR-verified organic and chemical treatments.",
    metrics: "< 2.0s Inference · 98.2% Accuracy",
    actionLabel: "Launch Disease Scanner",
    route: "disease"
  },
  {
    id: "tool-crop",
    title: "AI Crop & Fertilizer Advisory",
    badge: "Nutrient AI · Active",
    badgeType: "ai",
    category: "Soil Science & Agronomy",
    icon: "fas fa-seedling",
    iconColor: "#4F8A52",
    desc: "Scientific soil-to-crop matching and precision N-P-K nutrient dosage calculated from soil chemistry, pH, temperature, and local rainfall.",
    metrics: "22 Crop Models · Precision NPK",
    actionLabel: "Open Crop Advisory",
    route: "crop"
  },
  {
    id: "tool-mandi",
    title: "Direct Farmer Mandi & Commerce",
    badge: "Zero Commission",
    badgeType: "trade",
    category: "Marketplace & Fair Trade",
    icon: "fas fa-store",
    iconColor: "#eab308",
    desc: "Connect directly with bulk wholesale buyers, institutional kitchens, and retail chains with guaranteed fair MSP pricing and 24-hr escrow payouts.",
    metrics: "0% Middlemen · ₹4.8Cr Transacted",
    actionLabel: "Explore Produce Mandi",
    route: "modal-mandi"
  },
  {
    id: "tool-biowaste",
    title: "Stubble Buyback & Bio-Waste Upcycling",
    badge: "Circular Economy",
    badgeType: "sustain",
    category: "Sustainability & Bio-Energy",
    icon: "fas fa-recycle",
    iconColor: "#84cc16",
    desc: "Eliminate stubble burning by scheduling farmgate pickup for paddy straw and crop residue at ₹2,600/ton for biofuel pellet conversion.",
    metrics: "₹2,600/Ton · Zero Burning",
    actionLabel: "Schedule Stubble Pickup",
    route: "modal-biowaste"
  },
  {
    id: "tool-ledger",
    title: "Farm Profit & Expense Ledger",
    badge: "Smart Accounting",
    badgeType: "trade",
    category: "Farm Management & P&L",
    icon: "fas fa-chart-line",
    iconColor: "#38bdf8",
    desc: "Track seed purchases, fertilizer dosages, diesel, irrigation, and labor expenses per acre to calculate exact seasonal net profit margins.",
    metrics: "P&L Analytics · +24% Avg Margin",
    actionLabel: "Open Profit Ledger",
    route: "modal-ledger"
  },
  {
    id: "tool-soiltest",
    title: "Certified Soil Health Testing & Lab Consultation",
    badge: "Accredited Lab",
    badgeType: "sustain",
    category: "Diagnostic Testing & Tele-Advisory",
    icon: "fas fa-flask",
    iconColor: "#A970FF",
    desc: "Order doorstep soil core sampling with cold-chain lab courier transit and receive a comprehensive 14-parameter soil fertility certificate.",
    metrics: "14 Parameters · ICAR Standards",
    actionLabel: "Book Soil Test",
    route: "modal-soiltest"
  }
];

// Concise 5-Step Real User Journey
const HOW_IT_WORKS_STEPS = [
  {
    num: "1",
    tag: "Step 1 · Explore Tools",
    title: "Open AgroSphere & Explore Farming Tools",
    desc: "Access our centralized digital ecosystem on web or mobile to discover tailored diagnostics, soil chemistry tools, and direct market channels."
  },
  {
    num: "2",
    tag: "Step 2 · Select Module",
    title: "Select Relevant Farming Module",
    desc: "Choose whether your immediate field priority is diagnosing a foliar plant disease, balancing crop fertilizer, listing produce, or booking stubble collection."
  },
  {
    num: "3",
    tag: "Step 3 · Provide Data or Image",
    title: "Provide Required Information or Leaf Image",
    desc: "Snap a photo of infected leaves using your mobile camera or enter field metrics such as Nitrogen, Phosphorus, Potassium, and soil pH."
  },
  {
    num: "4",
    tag: "Step 4 · Instant AI Analysis",
    title: "Review Real-Time AI Diagnostics & Insights",
    desc: "Our neural inference and agronomic models generate instant pathology diagnoses, suitability percentages, and actionable prescriptions in seconds."
  },
  {
    num: "5",
    tag: "Step 5 · Take Action",
    title: "Take Informed Action & Connect Directly",
    desc: "Apply certified organic remedies to salvage crop yield, dispatch produce directly to verified buyers with escrow, or monetize crop residue."
  }
];

// Modern AgriTech Vector Logo
function AgroSphereLogo({ size = 40, lightText = false }) {
  return (
    <div className="blogo">
      <div className="bico-wrap">
        <svg className="brand-logo-svg" width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#173D2B" />
              <stop offset="60%" stopColor="#2A683B" />
              <stop offset="100%" stopColor="#4F8A52" />
            </linearGradient>
            <linearGradient id="leafFillGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E2F4C7" />
            </linearGradient>
            <filter id="aiGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width="40" height="40" rx="10" fill="url(#logoBgGrad)" />
          <rect x="0.5" y="0.5" width="39" height="39" rx="9.5" stroke="rgba(184, 217, 106, 0.45)" strokeWidth="1" />
          <path d="M11 29C11 18.5 18.5 11 29 11C29 21.5 21.5 29 11 29Z" fill="url(#leafFillGrad)" fillOpacity="0.95" />
          <path d="M11 29C15.5 23.5 21 18 29 11" stroke="#173D2B" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M17 23L21 19H25" stroke="#B8D96A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="25" cy="19" r="1.8" fill="#B8D96A" filter="url(#aiGlow)" />
          <path d="M21 19L24 16V13.5" stroke="#B8D96A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="24" cy="13.5" r="1.8" fill="#B8D96A" filter="url(#aiGlow)" />
          <path d="M14.5 25.5L12.5 23.5" stroke="#B8D96A" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="12.5" cy="23.5" r="1.5" fill="#B8D96A" />
          <circle cx="17" cy="23" r="2.2" fill="#173D2B" stroke="#B8D96A" strokeWidth="1.2" />
        </svg>
      </div>
      <div>
        <div className="bname" style={lightText ? { color: '#FFFFFF' } : {}}>
          Agro<span>Sphere</span>
          <span className="bname-ai">AI</span>
        </div>
        <div className="bsub" style={lightText ? { color: '#B8D96A' } : {}}>
          Smart AgriTech Platform
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // Navigation State (hash-based routing: #home, #tools, #how-it-works, #disease, #crop)
  const [activeView, setActiveView] = useState(() => {
    if (typeof window !== 'undefined') {
      const h = window.location.hash;
      if (h === '#disease') return 'disease';
      if (h === '#crop') return 'crop';
      if (h === '#tools') return 'tools';
      if (h === '#how-it-works') return 'how-it-works';
      if (h === '#contact') return 'contact';
    }
    return 'home';
  });

  // Dual-Theme State: 'light' (default) or 'dark' (Deep Forest-Green)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('agrosphere_theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('agrosphere_theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#071810' : '#F7F6EF');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // 3D Interactive Hero Tilt & Depth Parallax
  const [heroTilt, setHeroTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [isHoveringHero, setIsHoveringHero] = useState(false);

  const handleHeroMouseMove = (e) => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setHeroTilt({
      rotateX: -y * 14,
      rotateY: x * 16
    });
    setIsHoveringHero(true);
  };

  const handleHeroMouseLeave = () => {
    setHeroTilt({ rotateX: 0, rotateY: 0 });
    setIsHoveringHero(false);
  };

  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [springStatus, setSpringStatus] = useState('Checking...');
  const [aiStatus, setAiStatus] = useState('Checking...');

  // User Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('agrosphere_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // PWA App Installation State
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Interactive Tools Dialog State (Mandi, Stubble, Ledger, Soil Test)
  const [activeToolModal, setActiveToolModal] = useState(null);
  const [stubbleForm, setStubbleForm] = useState({ acres: 5, crop: 'Paddy Straw', village: 'Ludhiana, Punjab' });
  const [ledgerInputs, setLedgerInputs] = useState({ seedCost: 6500, fertilizerCost: 12000, dieselIrrigation: 8500, expectedYieldQuintal: 40, expectedPricePerQuintal: 2350 });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Capture PWA beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // View navigation helper
  const navigateToView = (viewName) => {
    setActiveView(viewName);
    setMobileMenuOpen(false);
    if (viewName === 'home') {
      window.history.pushState(null, '', ' ');
    } else {
      window.location.hash = viewName;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#disease') setActiveView('disease');
      else if (hash === '#crop') setActiveView('crop');
      else if (hash === '#tools') setActiveView('tools');
      else if (hash === '#how-it-works') setActiveView('how-it-works');
      else if (hash === '#contact') setActiveView('contact');
      else setActiveView('home');
    };
    window.addEventListener('hashchange', handleHashChange);

    const handleScroll = () => {
      setNavScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);

    async function checkHealth() {
      const s = await checkSpringBackendHealth();
      setSpringStatus(s.status === 'UP' ? 'UP' : 'OFFLINE');
      const a = await checkAiServiceHealth();
      setAiStatus(a.status === 'UP' ? 'UP' : 'OFFLINE');
    }
    checkHealth();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleOpenToolModal = (tool) => {
    setActiveToolModal(tool);
  };

  return (
    <div>
      {/* ============================================================
          MAIN HEADER (Minimal, Professional Dark Glass Navigation)
          ============================================================ */}
      <nav id="nav" className={`header-glass ${navScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="navbar-inner">
            <a className="blogo-link" href="#hero" onClick={(e) => { e.preventDefault(); navigateToView('home'); }}>
              <AgroSphereLogo />
            </a>

            {/* Main Navigation - Minimal, strictly as requested */}
            <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
              <li>
                <a 
                  className={`nav-link ${activeView === 'home' ? 'active' : ''}`} 
                  href="#hero" 
                  onClick={(e) => { e.preventDefault(); navigateToView('home'); }}
                >
                  <i className="fas fa-home me-1"></i>
                  Home
                </a>
              </li>
              <li>
                <a 
                  className={`nav-link ${activeView === 'tools' ? 'active' : ''}`} 
                  href="#tools" 
                  onClick={(e) => { e.preventDefault(); navigateToView('tools'); }}
                >
                  <i className="fas fa-th-large me-1"></i>
                  Explore Tools
                </a>
              </li>
              <li>
                <a 
                  className={`nav-link ${activeView === 'how-it-works' ? 'active' : ''}`} 
                  href="#how-it-works" 
                  onClick={(e) => { e.preventDefault(); navigateToView('how-it-works'); }}
                >
                  <i className="fas fa-compass me-1"></i>
                  How It Works
                </a>
              </li>
              <li>
                <a 
                  className="nav-link" 
                  href="#contact-section" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    if (activeView !== 'home') {
                      navigateToView('home');
                      setTimeout(() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' }), 120);
                    } else {
                      document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <i className="fas fa-headset me-1"></i>
                  Contact
                </a>
              </li>
            </ul>

            {/* Header Actions: Theme Switch, Install App & Authentication Controls */}
            <div className="nav-actions">
              {/* Compact Glass Theme Toggle Switch */}
              <button 
                type="button"
                className="theme-toggle-btn"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'Dark Forest-Green' : 'Warm Light'} mode`}
                aria-label={`Toggle color theme, currently ${theme} mode`}
              >
                <div className="theme-toggle-track">
                  <i className="fas fa-sun theme-toggle-icon-hint" style={{ opacity: theme === 'light' ? 0.35 : 0.85 }}></i>
                  <i className="fas fa-moon theme-toggle-icon-hint" style={{ opacity: theme === 'dark' ? 0.35 : 0.85 }}></i>
                  <div className={`theme-toggle-thumb ${theme}`}>
                    <i className={`fas ${theme === 'light' ? 'fa-sun' : 'fa-moon'}`}></i>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setInstallModalOpen(true)}
                className="btn-glass-install"
                title="Install AgroSphere Progressive Web App"
              >
                <i className="fas fa-download"></i>
                <span className="d-none d-sm-inline">Install App</span>
              </button>

              {currentUser ? (
                <div className="position-relative">
                  <div 
                    className="user-profile-badge" 
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    title={`Logged in as ${currentUser.name}`}
                  >
                    <div className="user-avatar-circle">
                      {currentUser.name.charAt(0)}
                    </div>
                    <span>{currentUser.name.split(' ')[0]}</span>
                    <i className="fas fa-chevron-down ms-1" style={{ fontSize: '0.65rem' }}></i>
                  </div>

                  {userDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: '115%',
                      background: 'var(--bg-glass-modal)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '14px',
                      padding: '10px 14px',
                      boxShadow: 'var(--shadow-lg)',
                      minWidth: '180px',
                      zIndex: 1000,
                      backdropFilter: 'blur(16px)'
                    }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                        <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{currentUser.name}</strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--secondary)' }}>{currentUser.role}</span>
                      </div>
                      <button
                        onClick={() => {
                          localStorage.removeItem('agrosphere_user');
                          setCurrentUser(null);
                          setUserDropdownOpen(false);
                        }}
                        style={{ color: '#fca5a5', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', width: '100%', padding: '4px 0', cursor: 'pointer' }}
                      >
                        <i className="fas fa-sign-out-alt"></i> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <button 
                    onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                    className="btn-glass-login"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
                    className="btn-glass-signup"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              <button 
                className="mobile-nav-toggle" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                aria-label="Toggle Navigation"
              >
                <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ============================================================
          VIEW 1: CLEAN & PURPOSEFUL HOMEPAGE
          ============================================================ */}
      {activeView === 'home' && (
        <main id="main">
          {/* Hero Section with Refined Circular Treatment & Dual Ambient Glow */}
          <section id="hero" style={{ padding: '75px 0 60px', position: 'relative', overflow: 'hidden' }}>
            <div className="container">
              <div className="row align-items-center g-5" style={{ minHeight: '75vh' }}>
                <div className="col-lg-6">
                  <div className="hbadge" style={{ background: 'var(--bg-glass-card)', border: '1px solid var(--border-color)' }}>
                    <div className="hbi" style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
                      <i className="fas fa-sparkles" style={{ color: 'var(--accent)' }}></i>
                    </div>
                    <span style={{ color: 'var(--text-primary)' }}>AI-Powered Smart Farming Ecosystem</span>
                  </div>

                  <h1 className="htitle" style={{ color: 'var(--text-primary)' }}>
                    Intelligent Agriculture <br />
                    <span style={{ color: 'var(--secondary)' }}>Ecosystem for Modern Farmers</span>
                  </h1>

                  <p className="hdesc" style={{ color: 'var(--text-secondary)', fontSize: '1.02rem', lineHeight: 1.75 }}>
                    Diagnose crop foliage diseases in under 2 seconds, balance soil nutrients with precision AI recommendations, and trade produce directly with zero middlemen.
                  </p>

                  {/* Clean, Purposeful CTAs */}
                  <div className="d-flex flex-wrap gap-3 mb-4 align-items-center">
                    <button 
                      onClick={() => navigateToView('tools')}
                      className="btn-dark-glass-primary"
                    >
                      <i className="fas fa-th-large me-1"></i>
                      Explore Tools
                    </button>
                    <button 
                      onClick={() => navigateToView('how-it-works')}
                      className="btn-dark-glass-secondary"
                    >
                      <i className="fas fa-compass me-1"></i>
                      How It Works
                    </button>
                  </div>

                  {/* Real Platform Capabilities Summary */}
                  <div className="d-flex gap-4 flex-wrap pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '1.3rem', color: 'var(--text-primary)', fontFamily: 'Playfair Display' }}>15+</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Plant Diseases Diagnosed</span>
                    </div>
                    <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '1.3rem', color: 'var(--accent)', fontFamily: 'Playfair Display' }}>22</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AI Crop Models</span>
                    </div>
                    <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '1.3rem', color: 'var(--secondary)', fontFamily: 'Playfair Display' }}>0%</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Broker Commission</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: 3D Parallax Stage with Circular Farm Image & Biotech Scientific Lens */}
                <div className="col-lg-6">
                  <div 
                    className="hero-3d-wrapper"
                    onMouseMove={handleHeroMouseMove}
                    onMouseLeave={handleHeroMouseLeave}
                  >
                    <div 
                      className="hero-3d-stage"
                      style={{
                        transform: isHoveringHero
                          ? `perspective(1000px) rotateX(${heroTilt.rotateX}deg) rotateY(${heroTilt.rotateY}deg)`
                          : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
                        transition: isHoveringHero ? 'transform 0.08s ease-out' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    >
                      <div className="hero-circle-wrapper">
                        {/* Dual Ambient Aura Glow & Decorative Orbital Ring */}
                        <div className="hero-pulse-aura"></div>
                        <div className="hero-orbit-ring">
                          <div className="hero-orbit-dot"></div>
                        </div>

                        {/* Floating Status Pill */}
                        <div className="hero-live-pill">
                          <span className="pulse-dot-green"></span>
                          <span>Vision AI &amp; Fair Trade Active</span>
                        </div>

                        {/* Main Circular Farming Image */}
                        <div className="hcircle">
                          <img src={AGRI_IMAGES.hero} alt="Smart Agriculture Field" />
                        </div>

                        {/* Quadrant Floating Theme-Adaptive Glass Cards with 3D Depth */}
                        <div 
                          className="fcard fc1" 
                          onClick={() => navigateToView('disease')}
                          title="Open Instant Leaf Disease Scanner"
                        >
                          <div className="fcoi g"><i className="fas fa-camera"></i></div>
                          <div className="text-start">
                            <span className="fcnum">AI Leaf Vision</span>
                            <span className="fcsm">&lt; 2.0s · 15 Plant Diseases</span>
                          </div>
                        </div>

                        <div 
                          className="fcard fc2 fcard-mandi" 
                          onClick={() => handleOpenToolModal(AGROSPHERE_TOOLS[2])}
                          title="Explore Direct Produce Marketplace"
                        >
                          <div className="fcoi y"><i className="fas fa-store"></i></div>
                          <div className="text-start">
                            <span className="fcnum mandi-title">Direct Mandi</span>
                            <span className="fcsm mandi-sub">0% Cut · 24hr Escrow</span>
                          </div>
                        </div>

                        <div 
                          className="fcard fc3" 
                          onClick={() => handleOpenToolModal(AGROSPHERE_TOOLS[3])}
                          title="Monetize Stubble & Crop Residue"
                        >
                          <div className="fcoi l"><i className="fas fa-recycle"></i></div>
                          <div className="text-start">
                            <span className="fcnum">Stubble Buyback</span>
                            <span className="fcsm">₹2,600/Ton · Zero Burning</span>
                          </div>
                        </div>

                        <div 
                          className="fcard fc4" 
                          onClick={() => navigateToView('crop')}
                          title="Open AI Crop & Fertilizer Advisory"
                        >
                          <div className="fcoi b"><i className="fas fa-seedling"></i></div>
                          <div className="text-start">
                            <span className="fcnum">Crop Advisory</span>
                            <span className="fcsm">Precision NPK Nutrition</span>
                          </div>
                        </div>
                      </div>

                      {/* 3D Scientific Visual: Biotech Botanical Cellular Lens */}
                      <div className="biotech-leaf-lens">
                        <div className="biotech-lens-inner">
                          <div className="biotech-scanner-beam"></div>
                          <svg className="biotech-leaf-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M50 12C32 28 26 50 34 76C42 78 58 78 66 76C74 50 68 28 50 12Z" stroke="var(--accent)" strokeWidth="1.8" fill="rgba(79, 138, 82, 0.22)" />
                            <path d="M50 18V75" stroke="var(--accent)" strokeWidth="1.6" strokeDasharray="2 2" />
                            <path d="M50 32L38 42" stroke="var(--accent)" strokeWidth="1.2" />
                            <path d="M50 32L62 42" stroke="var(--accent)" strokeWidth="1.2" />
                            <path d="M50 48L36 58" stroke="var(--accent)" strokeWidth="1.2" />
                            <path d="M50 48L64 58" stroke="var(--accent)" strokeWidth="1.2" />
                            <circle cx="50" cy="32" r="2.5" fill="var(--accent)" />
                            <circle cx="38" cy="42" r="2" fill="var(--secondary)" />
                            <circle cx="62" cy="42" r="2" fill="var(--secondary)" />
                            <circle cx="50" cy="48" r="2.5" fill="var(--accent)" />
                          </svg>
                          <div className="biotech-lens-meta">
                            <div className="biotech-lens-tag">
                              <span className="biotech-pulse"></span>
                              <span>Foliar Bio-Metrics</span>
                            </div>
                            <div className="biotech-health-val">98.4% Health Index</div>
                            <div className="biotech-health-sub">Active Chlorophyll Dynamics</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Platform Capabilities Preview */}
          <section style={{ padding: '60px 0', borderTop: '1px solid var(--border-color)' }}>
            <div className="container">
              <div className="text-center mb-5">
                <span style={{ color: 'var(--secondary)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Platform Overview
                </span>
                <h2 className="stitle" style={{ color: 'var(--text-primary)', fontSize: '2.1rem' }}>
                  Intelligent Tools Built for <span>Field Success</span>
                </h2>
                <div className="sline"></div>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto', fontSize: '0.92rem' }}>
                  Access our full agritech suite from a unified control panel designed for simple field operation.
                </p>
              </div>

              <div className="row g-4">
                {AGROSPHERE_TOOLS.slice(0, 3).map((tool) => (
                  <div key={tool.id} className="col-lg-4 col-md-6">
                    <div className="tool-glass-card" style={{ height: '100%' }}>
                      <div>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="tool-icon-wrapper" style={{ color: tool.iconColor }}>
                            <i className={tool.icon}></i>
                          </div>
                          <span className={`tool-card-badge ${tool.badgeType}`}>
                            {tool.badge}
                          </span>
                        </div>
                        <h3 className="tool-card-title">{tool.title}</h3>
                        <p className="tool-card-desc">{tool.desc}</p>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                          <i className="fas fa-chart-line" style={{ color: 'var(--accent)' }}></i>
                          <span>{tool.metrics}</span>
                        </div>
                        <button 
                          className="tool-btn-open"
                          onClick={() => {
                            if (tool.route === 'disease') navigateToView('disease');
                            else if (tool.route === 'crop') navigateToView('crop');
                            else handleOpenToolModal(tool);
                          }}
                        >
                          <span>{tool.actionLabel}</span>
                          <i className="fas fa-arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-5">
                <button onClick={() => navigateToView('tools')} className="btn-dark-glass-secondary">
                  <i className="fas fa-th-large me-2"></i> View All Available Tools &amp; Live Weather
                </button>
              </div>
            </div>
          </section>

          {/* System Telemetry & Connectivity Banner */}
          <section style={{ padding: '30px 0', background: 'var(--bg-glass-card)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
            <div className="container">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div className="d-flex align-items-center gap-2">
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
                    System Architecture:
                  </span>
                  <span className="badge-connected" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '12px', background: 'rgba(184, 217, 106, 0.14)', color: 'var(--secondary)', fontSize: '0.76rem', fontWeight: 600 }}>
                    <span className="pulse-dot-green"></span> Spring Boot Backend: {springStatus}
                  </span>
                  <span className="badge-connected" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '12px', background: 'rgba(79, 138, 82, 0.16)', color: 'var(--secondary)', fontSize: '0.76rem', fontWeight: 600 }}>
                    <span className="pulse-dot-green"></span> FastAPI AI Engine: {aiStatus}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <i className="fas fa-shield-alt me-1" style={{ color: 'var(--secondary)' }}></i> ICAR Protocol Compliant
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact-section" style={{ padding: '70px 0' }}>
            <div className="container">
              <div className="row g-5 align-items-center">
                <div className="col-lg-5">
                  <span style={{ color: 'var(--secondary)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Kisan Helpline &amp; Advisory
                  </span>
                  <h2 className="stitle text-start" style={{ color: 'var(--text-primary)', fontSize: '2.2rem' }}>
                    Connect with <span>AgroSphere Support</span>
                  </h2>
                  <div className="sline lft"></div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '24px' }}>
                    Have questions regarding AI model predictions, produce listings, or doorstep stubble pickup? Our dedicated agronomy team is here to assist.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-glass-card)', padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(184, 217, 106, 0.14)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-phone-alt"></i>
                      </div>
                      <div>
                        <small style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Toll-Free Helpline</small>
                        <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.95rem' }}>1800-419-7000 (Mon-Sun 6AM-10PM)</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-glass-card)', padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(79, 138, 82, 0.14)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-envelope"></i>
                      </div>
                      <div>
                        <small style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Email Support</small>
                        <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.95rem' }}>kisan@agrosphere.io</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-7">
                  <div style={{ background: 'var(--bg-glass-card)', backdropFilter: 'blur(16px)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '36px', boxShadow: 'var(--shadow-lg)' }}>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Send Farm Advisory Query</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginBottom: '20px' }}>Our ICAR-certified specialists respond within 24 hours.</p>

                    <form onSubmit={(e) => { e.preventDefault(); alert('Query submitted! An agronomist will contact you shortly.'); }}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="glass-input-label">Farmer Name</label>
                          <input type="text" placeholder="Your Name" className="glass-input-field" required />
                        </div>
                        <div className="col-md-6">
                          <label className="glass-input-label">Contact Phone</label>
                          <input type="tel" placeholder="Mobile Number" className="glass-input-field" required />
                        </div>
                        <div className="col-12">
                          <label className="glass-input-label">Crop &amp; Inquiry Topic</label>
                          <select className="glass-input-field">
                            <option>Crop Foliage Disease Consultation</option>
                            <option>Direct Mandi Listing &amp; Buyer Match</option>
                            <option>Stubble &amp; Residue Farmgate Collection</option>
                            <option>Soil Nutrient Core Testing Report</option>
                          </select>
                        </div>
                        <div className="col-12">
                          <label className="glass-input-label">Message Details</label>
                          <textarea rows="3" placeholder="Describe your farm acreage, symptoms, or quantity..." className="glass-input-field"></textarea>
                        </div>
                        <div className="col-12 mt-3">
                          <button type="submit" className="glass-btn-submit">
                            Submit Advisory Request
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ============================================================
          VIEW 2: DEDICATED EXPLORE TOOLS PAGE (#tools)
          ============================================================ */}
      {activeView === 'tools' && (
        <main id="main" className="tools-view-container" style={{ padding: '30px 0 80px' }}>
          <div className="container">
            {/* Live Environmental & Weather Information Panel */}
            <WeatherPanel />

            {/* Page Header (Strictly NO "5 Pillars"!) */}
            <div className="tools-page-header">
              <div className="tools-title-badge">
                <i className="fas fa-th-large"></i>
                <span>Your Farming Toolkit</span>
              </div>
              <h2 className="stitle" style={{ color: 'var(--text-primary)' }}>
                Explore <span>AgroSphere</span>
              </h2>
              <div className="sline"></div>
              <p className="sdesc mx-auto" style={{ maxWidth: '640px', color: 'var(--text-secondary)' }}>
                Centralized access to real-time foliar pathology diagnostics, scientific soil nutrient matching, fair-trade produce commerce, and circular stubble upcycling.
              </p>
            </div>

            {/* Responsive Grid of All Verified Modules */}
            <div className="tools-grid">
              {AGROSPHERE_TOOLS.map((tool) => (
                <div key={tool.id} className="tool-glass-card">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="tool-icon-wrapper" style={{ color: tool.iconColor }}>
                        <i className={tool.icon}></i>
                      </div>
                      <span className={`tool-card-badge ${tool.badgeType}`}>
                        {tool.badge}
                      </span>
                    </div>
                    <h3 className="tool-card-title">{tool.title}</h3>
                    <p className="tool-card-desc">{tool.desc}</p>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#A8A9BB', marginBottom: '14px' }}>
                      <i className="fas fa-chart-line" style={{ color: '#B8D96A' }}></i>
                      <span>{tool.metrics}</span>
                    </div>
                    <button 
                      className="tool-btn-open"
                      onClick={() => {
                        if (tool.route === 'disease') navigateToView('disease');
                        else if (tool.route === 'crop') navigateToView('crop');
                        else handleOpenToolModal(tool);
                      }}
                    >
                      <span>{tool.actionLabel}</span>
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ============================================================
          VIEW 3: DEDICATED HOW IT WORKS PAGE (#how-it-works)
          ============================================================ */}
      {activeView === 'how-it-works' && (
        <main id="main" className="hiw-view-container" style={{ padding: '30px 0 80px' }}>
          <div className="container">
            <div className="tools-page-header">
              <div className="tools-title-badge">
                <i className="fas fa-compass"></i>
                <span>Transparent Platform Workflow</span>
              </div>
              <h2 className="stitle" style={{ color: 'var(--text-primary)' }}>
                How <span>AgroSphere</span> Works
              </h2>
              <div className="sline"></div>
              <p className="sdesc mx-auto" style={{ maxWidth: '620px', color: 'var(--text-secondary)' }}>
                A streamlined, 5-step journey designed to take farmers from initial leaf diagnosis and soil testing all the way to fair market sales and residue monetization.
              </p>
            </div>

            <div className="hiw-step-timeline">
              {HOW_IT_WORKS_STEPS.map((step) => (
                <div key={step.num} className="hiw-step-card">
                  <div className="hiw-step-num">
                    {step.num}
                  </div>
                  <div className="hiw-step-content">
                    <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#B8D96A', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                      {step.tag}
                    </span>
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-5">
              <button onClick={() => navigateToView('tools')} className="btn-dark-glass-primary">
                <i className="fas fa-th-large me-2"></i>
                Explore Available Tools Now
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ============================================================
          VIEW 4: AI DISEASE DETECTION SCANNER VIEW (#disease)
          ============================================================ */}
      {activeView === 'disease' && (
        <main id="main" className="disease-view-container" style={{ padding: '20px 0 80px' }}>
          <div className="container mb-3">
            <button 
              onClick={() => navigateToView('tools')} 
              className="btn-dark-glass-secondary"
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
            >
              <i className="fas fa-arrow-left me-1"></i> Back to All Tools
            </button>
          </div>
          <DiseaseDetectionView />
        </main>
      )}

      {/* ============================================================
          VIEW 5: AI CROP & FERTILIZER ADVISORY VIEW (#crop)
          (Handled by Teammate - Completely Untouched)
          ============================================================ */}
      {activeView === 'crop' && (
        <main id="main" className="crop-view-container" style={{ padding: '20px 0 80px' }}>
          <div className="container mb-3">
            <button 
              onClick={() => navigateToView('tools')} 
              className="btn-dark-glass-secondary"
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
            >
              <i className="fas fa-arrow-left me-1"></i> Back to All Tools
            </button>
          </div>
          <CropRecommendationView />
        </main>
      )}

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <footer style={{ background: 'var(--bg-surface-elevated)', borderTop: '1px solid var(--border-color)', padding: '60px 0 30px' }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-5">
              <a href="#hero" onClick={(e) => { e.preventDefault(); navigateToView('home'); }} style={{ textDecoration: 'none' }}>
                <AgroSphereLogo lightText={false} />
              </a>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, marginTop: '14px', maxWidth: '420px' }}>
                An integrated AI ecosystem connecting the complete agriculture cycle—soil prediction, leaf diagnostics, fair market sales, and circular biomass recycling.
              </p>
            </div>

            <div className="col-lg-3 col-md-6">
              <h5 style={{ color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '16px' }}>Quick Navigation</h5>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem' }}>
                <li><a href="#hero" onClick={(e) => { e.preventDefault(); navigateToView('home'); }} style={{ color: 'var(--text-secondary)' }}>Home</a></li>
                <li><a href="#tools" onClick={(e) => { e.preventDefault(); navigateToView('tools'); }} style={{ color: 'var(--text-secondary)' }}>Explore Tools</a></li>
                <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); navigateToView('how-it-works'); }} style={{ color: 'var(--text-secondary)' }}>How It Works</a></li>
                <li><a href="#disease" onClick={(e) => { e.preventDefault(); navigateToView('disease'); }} style={{ color: 'var(--text-secondary)' }}>AI Leaf Scanner</a></li>
                <li><a href="#crop" onClick={(e) => { e.preventDefault(); navigateToView('crop'); }} style={{ color: 'var(--text-secondary)' }}>Crop Advisory</a></li>
              </ul>
            </div>

            <div className="col-lg-4 col-md-6">
              <h5 style={{ color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '16px' }}>Kisan Weekly Advisory</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>Subscribe for timely weather forecasts, pest alerts, and mandi rate fluctuations.</p>
              {newsletterSubscribed ? (
                <div style={{ padding: '10px 14px', background: 'rgba(184, 217, 106, 0.15)', color: 'var(--secondary)', borderRadius: '10px', fontSize: '0.82rem' }}>
                  <i className="fas fa-check-circle me-1"></i> Subscribed! You will receive weekly SMS &amp; email advisories.
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); if (newsletterEmail) setNewsletterSubscribed(true); }} className="d-flex gap-2">
                  <input 
                    type="email" 
                    placeholder="kisan@agrosphere.io" 
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="glass-input-field" 
                    required 
                    style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                  />
                  <button type="submit" className="btn-dark-glass-primary" style={{ padding: '8px 16px', fontSize: '0.82rem', borderRadius: '12px', whiteSpace: 'nowrap' }}>
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '40px', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <span>© 2026 AgroSphere Platform. All rights reserved.</span>
            <span>Dedicated to the Growers of India 🇮🇳</span>
          </div>
        </div>
      </footer>

      {/* ============================================================
          MODALS
          ============================================================ */}
      <AuthModal 
        isOpen={authModal.isOpen} 
        initialMode={authModal.mode} 
        onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />

      <InstallModal 
        isOpen={installModalOpen}
        deferredPrompt={deferredPrompt}
        onClose={() => setInstallModalOpen(false)}
        onInstallTriggered={() => setDeferredPrompt(null)}
      />

      {/* Interactive Tool Modal (Mandi, Stubble, Ledger, Soil Test) */}
      {activeToolModal && (
        <div className="glass-modal-overlay" onClick={() => setActiveToolModal(null)}>
          <div className="glass-modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <button className="glass-modal-close" onClick={() => setActiveToolModal(null)}>
              <i className="fas fa-times"></i>
            </button>

            <div className="d-flex align-items-center gap-3 mb-3">
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: activeToolModal.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                <i className={activeToolModal.icon}></i>
              </div>
              <div>
                <h4 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.25rem' }}>{activeToolModal.title}</h4>
                <span style={{ fontSize: '0.74rem', color: 'var(--secondary)', fontWeight: 600 }}>{activeToolModal.metrics}</span>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.6, marginBottom: '20px' }}>
              {activeToolModal.desc}
            </p>

            {/* Direct Mandi Interactive Content */}
            {activeToolModal.route === 'modal-mandi' && (
              <div>
                <h5 style={{ color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: '10px' }}>Live Wholesale Mandi Lots Ready for Direct Payout:</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '10px 14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.86rem' }}>Sharbati Wheat (Grade A)</strong>
                      <small style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>50 Quintals · Ludhiana, PB</small>
                    </div>
                    <div className="text-end">
                      <span style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.92rem' }}>₹2,420/Q</span>
                      <small style={{ color: 'var(--accent-dark)', display: 'block', fontSize: '0.70rem' }}>MSP: ₹2,275 (+6.3%)</small>
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '10px 14px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.86rem' }}>Nashik Red Onions</strong>
                      <small style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>80 Quintals · Nashik, MH</small>
                    </div>
                    <div className="text-end">
                      <span style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.92rem' }}>₹1,850/Q</span>
                      <small style={{ color: 'var(--accent-dark)', display: 'block', fontSize: '0.70rem' }}>Direct Retail Buy</small>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => { alert('Connecting you to institutional mandi buyer collective via escrow protocol...'); setActiveToolModal(null); }}
                  className="glass-btn-submit"
                >
                  <i className="fas fa-handshake me-1"></i> Connect Directly with Mandi Buyer
                </button>
              </div>
            )}

            {/* Stubble Buyback Interactive Content */}
            {activeToolModal.route === 'modal-biowaste' && (
              <div>
                <div style={{ background: 'rgba(184, 217, 106, 0.1)', border: '1px solid var(--border-highlight)', borderRadius: '14px', padding: '14px', marginBottom: '16px' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>Fixed Buyback Guarantee Rate:</span>
                    <strong style={{ color: 'var(--secondary)', fontSize: '1.1rem' }}>₹2,600 / Ton</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Estimated Earnings (5 Acres):</span>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>₹26,000 Payout</strong>
                  </div>
                </div>
                <button 
                  onClick={() => { alert('Doorstep pickup scheduled! Baler fleet will reach your farm within 48 hours.'); setActiveToolModal(null); }}
                  className="glass-btn-submit"
                >
                  <i className="fas fa-truck me-1"></i> Book Farmgate Baler Pickup
                </button>
              </div>
            )}

            {/* Ledger Interactive Content */}
            {activeToolModal.route === 'modal-ledger' && (
              <div>
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
                  <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.84rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Total Field Inputs (Seeds + Fertilizer + Diesel):</span>
                    <strong style={{ color: 'var(--text-primary)' }}>₹27,000</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.84rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Projected Revenue (40 Quintals @ ₹2,350):</span>
                    <strong style={{ color: 'var(--secondary)' }}>₹94,000</strong>
                  </div>
                  <div className="d-flex justify-content-between pt-2" style={{ borderTop: '1px solid var(--border-color)', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Estimated Net Profit Margin:</span>
                    <strong style={{ color: 'var(--secondary)', fontWeight: 800 }}>+₹67,000 (+71.2%)</strong>
                  </div>
                </div>
                <button 
                  onClick={() => { alert('Farm ledger cycle saved to your offline profile.'); setActiveToolModal(null); }}
                  className="glass-btn-submit"
                >
                  <i className="fas fa-save me-1"></i> Export Seasonal Ledger Report
                </button>
              </div>
            )}

            {/* Soil Test Interactive Content */}
            {activeToolModal.route === 'modal-soiltest' && (
              <div>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                  A certified soil sampling officer will collect core samples from your land coordinates and provide a certified N-P-K-S-Zn laboratory report within 3 days.
                </p>
                <button 
                  onClick={() => { alert('Soil test request booked! Certified sampling officer will call you to confirm location.'); setActiveToolModal(null); }}
                  className="glass-btn-submit"
                >
                  <i className="fas fa-calendar-check me-1"></i> Confirm Doorstep Sample Collection
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
