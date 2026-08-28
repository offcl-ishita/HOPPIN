import React, { useState, useEffect } from 'react';


import {
  Navigation, Compass, Radio, Clock, Flame,
  MapPin, Bell, Shield, ArrowRight, ArrowUpRight, CheckCircle2,
  Layers, Sliders, Coffee, BookOpen, Dumbbell,
  Utensils, ChevronRight, ChevronDown, ChevronUp, RotateCcw,
  Zap, Eye, Bookmark, Activity, Info, School, Check,
  Smartphone, Share2, Award, Search, Copy
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import logoImg from './hoppin_logo.png';
import CampusMap from './CampusMap';
import './App.css';

// ── Realistic Campus Facilities Telemetry Data ──
const liveDepartureRows = [
  { id: 1, loc: 'Central Library · 3rd Floor Quiet Hub', cat: 'study', status: 'BUSY', occ: 74, eta: '~6 min wait', free: '18 / 120 Seats', trend: 'Filling fast · Floor 4 open' },
  { id: 2, loc: 'Main Dining Hall · Food Court Line 1', cat: 'food', status: 'FULL', occ: 96, eta: '~14 min queue', free: 'Packed capacity', trend: 'Peak lunch rush · Kiosk 2 clear' },
  { id: 3, loc: 'Tech Park Atrium · Main Central Walkway', cat: 'corridor', status: 'BUSY', occ: 84, eta: '~5 min delay', free: 'Heavy footfall (340+)', trend: 'HOPPIN Garden Bypass advised' },
  { id: 4, loc: 'Garden Walkway · North Green Promenade', cat: 'corridor', status: 'CLEAR', occ: 18, eta: '2 min route', free: 'Wide open corridor', trend: 'Recommended fastest route' },
  { id: 5, loc: 'Indoor Sports Complex · Gym Floor 1', cat: 'fitness', status: 'BUSY', occ: 68, eta: '~4 min wait', free: '6 Benches open', trend: 'Cardio bay 80% full' },
  { id: 6, loc: 'Basic Engineering Lab (BEL) Skywalk', cat: 'academic', status: 'CLEAR', occ: 22, eta: '3 min route', free: 'Zero bottleneck', trend: 'Smooth transit' },
  { id: 7, loc: 'University Building · 9th Floor Elevator Bay', cat: 'academic', status: 'BUSY', occ: 88, eta: '~8 min elevator queue', free: 'Stairwell B recommended', trend: 'Class shift rush' },
  { id: 8, loc: 'Java Green Cafe · West Quad Courtyard', cat: 'food', status: 'CLEAR', occ: 32, eta: 'No line', free: 'Grab & go active', trend: '0 min detour on bypass' },
];

export default function App() {

  // State: User Feedback Section
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  // State: Interactive Departure Board
  const [boardCategory, setBoardCategory] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [isRushHour, setIsRushHour] = useState(true);
  const [pinnedRows, setPinnedRows] = useState([1, 4]);
  const [boardTime, setBoardTime] = useState('');

  // State: ROI Calculator
  const [dailyTrips, setDailyTrips] = useState(6);
  const [campusScale, setCampusScale] = useState('mega'); // 'compact' | 'mega'

  // State: Waitlist form
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('SRM Institute of Science & Technology (KTR)');
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // State: FAQ Accordion
  const [openFaqIdx, setOpenFaqIdx] = useState(0);

  // Live Clock Tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setBoardTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Occasional random pulse in telemetry values
  const [dynamicRows, setDynamicRows] = useState(liveDepartureRows);
  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setDynamicRows((prev) => {
        const next = [...prev];
        const randomIdx = Math.floor(Math.random() * next.length);
        const current = next[randomIdx];
        if (current.status === 'CLEAR') {
          next[randomIdx] = { ...current, status: 'BUSY', occ: Math.min(86, current.occ + 20), eta: '~5 min wait', trend: 'Traffic picking up' };
        } else if (current.status === 'BUSY') {
          next[randomIdx] = { ...current, status: 'FULL', occ: 95, eta: '~12 min wait', trend: 'Peak class shift' };
        } else {
          next[randomIdx] = { ...current, status: 'CLEAR', occ: 20, eta: '2 min route', trend: 'Corridor fully clear' };
        }
        return next;
      });
    }, 3800);
    return () => clearInterval(cycleInterval);
  }, []);

  const togglePin = (id) => {
    setPinnedRows((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredBoardRows = dynamicRows.filter((r) => {
    const matchesCategory = boardCategory === 'all' 
      ? true 
      : boardCategory === 'pinned' 
        ? pinnedRows.includes(r.id) 
        : r.cat === boardCategory;
        
    const matchesSearch = searchFilter.trim() === '' 
      || r.loc.toLowerCase().includes(searchFilter.toLowerCase())
      || r.trend.toLowerCase().includes(searchFilter.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  //for the toggle added to live telemetry board 
  const [isBoardExpanded, setIsBoardExpanded] = useState(false);


  // Calculate student savings
  const minSavedPerTrip = campusScale === 'mega' ? 4.5 : 3.0;
  const weeklyHoursSaved = ((dailyTrips * minSavedPerTrip * 5) / 60).toFixed(1);
  const semesterDaysSaved = ((weeklyHoursSaved * 16) / 24).toFixed(1);
  const semesterStepsSaved = Math.round(dailyTrips * 480 * 16 * 5).toLocaleString();

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    setWaitlistSuccess(true);
  };

  const handleCopyInvite = () => {
    const inviteUrl = `https://hoppin.site/join?ref=${encodeURIComponent(waitlistEmail.split('@')[0] || 'student')}`;
    navigator.clipboard?.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2400);
  };

  return (
    <div className="hop-app-root">
      <Navbar />

      {/* ============================================================
          SECTION 1: BESPOKE HERO SECTION
          ============================================================ */}
      <section className="hop-hero">
        <div className="hop-hero-mesh-glow" />
        <div className="hop-hero-grid-pattern" />

        <div className="hop-container">
          <div className="hop-hero-layout">
            
            {/* Left Content */}
            <div className="hop-hero-main">
              
              {/* Telemetry Pill */}
              <div className="hop-badge-pill">
                <span className="hop-badge-label mono">CAMPUS CROWD TELEMETRY & INDOOR NAVIGATION</span>
              </div>

              {/* Main Headline */}
              <h1 className="hop-hero-title">
                Stop walking into <span className="hop-text-gradient">the crowd.</span>
              </h1>

              {/* Subtitle */}
              <p className="hop-hero-sub">
                HOPPIN reads live hallway foot-traffic, elevator bottlenecks, and dining hall queues across your university — automatically calculating clear alternate routes before you hit the delay.
              </p>

              {/* Action Buttons */}
              <div className="hop-hero-cta-group">
                <a href="#un-waitlist" className="hop-btn-primary">
                  <span>Join Campus Waitlist</span>
                  <ArrowRight size={16} />
                </a>
                <a href="#un-departure-board" className="hop-btn-secondary">
                  <Compass size={16} className="text-mint" />
                  <span>Explore Live Telemetry Board</span>
                </a>
              </div>

              {/* Verified Trust & Rollout Bar */}
              <div className="hop-hero-trust-bar">
                <div className="hop-trust-item">
                  <Shield size={14} className="text-mint" />
                  <span>100% Differential Privacy · Zero Individual Tracking</span>
                </div>
                <div className="hop-trust-dot">•</div>
                <div className="hop-trust-item">
                  <span className="mono text-cyan">FALL 2026</span>
                  <span>Top Engineering & Medical Campuses</span>
                </div>
              </div>

            </div>

            {/* Right: Live Interactive HUD Preview Card */}
            <div className="hop-hero-preview-col">
              <div className="hop-hero-hud-card">
                <div className="hop-hud-glass-header">
                  <div className="hop-hh-left">
                    <img src={logoImg} alt="HOPPIN" className="hop-hh-brand-img" />
                    <span className="mono hop-hh-title">AMBIENT RADAR</span>
                  </div>
                  <span className="hop-hh-time mono">{boardTime || '08:52:14 AM'}</span>
                </div>

                <div className="hop-hud-card-body">
                  <div className="hop-hud-route-banner">
                    <div className="hop-hrb-icon">
                      <Zap size={18} className="text-mint" />
                    </div>
                    <div className="hop-hrb-info">
                      <div className="hop-hrb-top">
                        <strong>Smart Garden Bypass Activated</strong>
                        <span className="hop-hrb-pill mono">-7.5 MINS</span>
                      </div>
                      <p>Avoids 340+ packed crowd at Tech Park Atrium.</p>
                    </div>
                  </div>

                  <div className="hop-hud-waypoints-mini">
                    <div className="hop-hwm-step completed">
                      <div className="hop-hwm-node" />
                      <div className="hop-hwm-text">
                        <span>Gate 1 Main Quad</span>
                        <small className="mono">08:50 AM · Cleared</small>
                      </div>
                    </div>
                    <div className="hop-hwm-connector active" />
                    <div className="hop-hwm-step current">
                      <div className="hop-hwm-node pulse" />
                      <div className="hop-hwm-text">
                        <strong className="text-mint">Garden Walkway Promenade</strong>
                        <small className="mono text-cyan">Current Route · 18% Friction</small>
                      </div>
                    </div>
                    <div className="hop-hwm-connector" />
                    <div className="hop-hwm-step">
                      <div className="hop-hwm-node" />
                      <div className="hop-hwm-text">
                        <span>University Building Room 905</span>
                        <small className="mono">ETA: 08:54 AM (On-Time)</small>
                      </div>
                    </div>
                  </div>

                  <div className="hop-hud-perk-inline">
                    <div className="hop-hpi-icon">☕</div>
                    <div className="hop-hpi-content">
                      <div className="hop-hpi-top">
                        <span>Java Green Cafe on your path</span>
                        <span className="mono hop-hpi-tag">0 MIN DETOUR</span>
                      </div>
                      <p>Grab cold brew while walking past.</p>
                    </div>
                  </div>
                </div>

                <div className="hop-hud-card-footer">
                  <div className="hop-hcf-metric">
                    <span className="label">Transition Speed</span>
                    <strong className="val text-mint">10m → 2.5m</strong>
                  </div>
                  <div className="hop-hcf-divider" />
                  <div className="hop-hcf-metric">
                    <span className="label">Recalculation</span>
                    <strong className="val text-cyan">&lt; 1.8s</strong>
                  </div>
                  <div className="hop-hcf-divider" />
                  <div className="hop-hcf-metric">
                    <span className="label">Student Pricing</span>
                    <strong className="val text-mint">100% Free</strong>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Quick Metrics Bar */}
          <div className="hop-stat-strip">
            <div className="hop-stat-card">
              <div className="hop-sc-num">10m → 2.5m</div>
              <div className="hop-sc-label">Class Transition Speed</div>
              <div className="hop-sc-sub">Never sprint across packed quads</div>
            </div>
            <div className="hop-stat-card">
              <div className="hop-sc-num">85%</div>
              <div className="hop-sc-label">Bottlenecks Bypassed</div>
              <div className="hop-sc-sub">Automated quiet path selection</div>
            </div>
            <div className="hop-stat-card">
              <div className="hop-sc-num">&lt; 1.8s</div>
              <div className="hop-sc-label">Telemetry Reroute Latency</div>
              <div className="hop-sc-sub">Sub-second corridor recalculated</div>
            </div>
            <div className="hop-stat-card">
              <div className="hop-sc-num">100% Free</div>
              <div className="hop-sc-label">For College Students</div>
              <div className="hop-sc-sub">Direct access at HOPPIN.SITE</div>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================
          SECTION 2: REAL-TIME FLIGHT BOARD TELEMETRY STATION
          ============================================================ */}
      <section className="hop-section hop-board-section" id="un-departure-board">
        <div className="hop-container">
          
          <div className="hop-section-head">
            <div className="hop-section-pill">
              <Radio size={13} className="text-mint" />
              <span>LIVE CAMPUS TELEMETRY STATION</span>
            </div>
            <h2 className="hop-section-title">
              Like a high-speed airport flight board, <span className="hop-text-gradient">for your campus.</span>
            </h2>
            <p className="hop-section-desc">
              Get an instant ambient pulse on hallway crowds, library desk seats, food court queues, and gym capacity before you step out of your hostel or lecture hall.
            </p>
          </div>

          {/* Flight Board Terminal */}
          <div className="hop-terminal-panel">
            
            {/* Top Command Bar */}
            <div className="hop-term-bar">
              <div className="hop-tb-left">
                <div className="hop-tb-brand">
                  <img src={logoImg} alt="HOPPIN" className="hop-tb-brand-img" />
                  <span className="hop-tb-name mono">TELEMETRY BOARD</span>
                  <span className="hop-tb-time mono">{boardTime || '08:52:14 AM'}</span>
                </div>
              </div>

              <div className="hop-tb-right">
                <div className="hop-mode-switch">
                  <button 
                    className={`hop-mode-btn ${isRushHour ? 'active' : ''}`}
                    onClick={() => setIsRushHour(true)}
                  >
                    <Flame size={13} />
                    <span>08:50 AM Peak Rush</span>
                  </button>
                  <button 
                    className={`hop-mode-btn ${!isRushHour ? 'active' : ''}`}
                    onClick={() => setIsRushHour(false)}
                  >
                    <Clock size={13} />
                    <span>11:30 AM Off-Peak</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Chips & Live Search Bar */}
            <div className="hop-term-controls">
              <div className="hop-filter-scroll">
                {[
                  { id: 'all', label: 'All Campus Spaces', icon: Layers },
                  { id: 'corridor', label: 'Corridors & Skywalks', icon: Navigation },
                  { id: 'study', label: 'Libraries & Quiet Study', icon: BookOpen },
                  { id: 'food', label: 'Dining & Cafes', icon: Utensils },
                  { id: 'fitness', label: 'Gym & Sports Complex', icon: Dumbbell },
                  { id: 'pinned', label: `Pinned Favourites (${pinnedRows.length})`, icon: Bookmark },
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      className={`hop-chip ${boardCategory === tab.id ? 'active' : ''}`}
                      onClick={() => {
                        setBoardCategory(tab.id);
                        setIsBoardExpanded(false); // Reset expand state on tab change
                      }}
                    >
                      <TabIcon size={13} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="hop-search-box">
                <Search size={14} className="hop-search-icon" />
                <input 
                  type="text"
                  placeholder="Filter facility or corridor..."
                  value={searchFilter}
                  onChange={(e) => {
                    setSearchFilter(e.target.value);
                    setIsBoardExpanded(true); // Auto-expand when searching
                  }}
                  className="hop-search-input mono"
                />
              </div>
            </div>

            {/* --- DISPLAY LOGIC FOR EXPAND/COLLAPSE --- */}
            {(() => {
              const INITIAL_ROW_COUNT = 2;
              const displayedBoardRows = isBoardExpanded ? filteredBoardRows : filteredBoardRows.slice(0, INITIAL_ROW_COUNT);
              const showExpandButton = filteredBoardRows.length > INITIAL_ROW_COUNT;

              return (
                <>
                  {/* Desktop Table View */}
                  <div className="hop-table-container hide-on-mobile">
                    <div className="hop-table-head">
                      <div className="th-loc">CAMPUS FACILITY / CORRIDOR</div>
                      <div className="th-status text-center">CROWD STATUS</div>
                      <div className="th-occ">LIVE OCCUPANCY & SEATS</div>
                      <div className="th-eta text-right">PREDICTED WAIT</div>
                      <div className="th-pin text-right">PIN</div>
                    </div>

                    <div className="hop-table-rows">
                      {displayedBoardRows.length === 0 ? (
                        <div className="hop-no-results mono">
                          No facilities found matching "{searchFilter}".
                        </div>
                      ) : (
                        displayedBoardRows.map((row) => {
                          const isPinned = pinnedRows.includes(row.id);
                          const isCrowded = isRushHour ? row.occ > 50 : row.occ > 80;
                          const statusLabel = isCrowded ? (row.occ > 85 ? 'FULL' : 'BUSY') : 'CLEAR';
                          const statusCls = statusLabel === 'FULL' ? 'status-full' : statusLabel === 'BUSY' ? 'status-busy' : 'status-clear';
                          const occPct = isRushHour ? Math.min(100, row.occ + 8) : Math.max(15, row.occ - 25);

                          return (
                            <div key={row.id} className="hop-table-row">
                              
                              <div className="tr-loc">
                                <div className="tr-loc-name">{row.loc}</div>
                                <div className="tr-loc-sub">{row.trend}</div>
                              </div>

                              <div className="tr-status text-center">
                                <span className={`hop-status-badge ${statusCls} mono`}>
                                  <span className="status-indicator" />
                                  {statusLabel}
                                </span>
                              </div>

                              <div className="tr-occ">
                                <div className="hop-bar-track">
                                  <div 
                                    className={`hop-bar-fill ${statusCls}`} 
                                    style={{ width: `${occPct}%` }} 
                                  />
                                </div>
                                <div className="hop-occ-meta mono">
                                  <span>{occPct}% Capacity</span>
                                  <span className="text-mint">{row.free}</span>
                                </div>
                              </div>

                              <div className="tr-eta text-right mono">
                                <span className="eta-badge">{isRushHour ? row.eta : 'No delay'}</span>
                              </div>

                              <div className="tr-pin text-right">
                                <button 
                                  className={`hop-pin-btn ${isPinned ? 'is-pinned' : ''}`}
                                  onClick={() => togglePin(row.id)}
                                  title={isPinned ? 'Remove bookmark' : 'Pin to favourites'}
                                >
                                  <Bookmark size={15} />
                                </button>
                              </div>

                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/*  Mobile Cards View 
                  <div className="hop-mobile-board-list show-on-mobile">
                    {displayedBoardRows.map((row) => {
                      const isPinned = pinnedRows.includes(row.id);
                      const isCrowded = isRushHour ? row.occ > 50 : row.occ > 80;
                      const statusLabel = isCrowded ? (row.occ > 85 ? 'FULL' : 'BUSY') : 'CLEAR';
                      const statusCls = statusLabel === 'FULL' ? 'status-full' : statusLabel === 'BUSY' ? 'status-busy' : 'status-clear';
                      const occPct = isRushHour ? Math.min(100, row.occ + 8) : Math.max(15, row.occ - 25);

                      return (
                        <div key={row.id} className="hop-mobile-card">
                          <div className="hmc-header">
                            <div className="hmc-loc">
                              <div className="hmc-title">{row.loc}</div>
                              <div className="hmc-sub">{row.trend}</div>
                            </div>
                            <span className={`hop-status-badge ${statusCls} mono`}>
                              {statusLabel}
                            </span>
                          </div>

                          <div className="hmc-occ-box">
                            <div className="hop-bar-track">
                              <div className={`hop-bar-fill ${statusCls}`} style={{ width: `${occPct}%` }} />
                            </div>
                            <div className="hmc-occ-labels mono">
                              <span>{occPct}% Capacity</span>
                              <span className="text-mint">{row.free}</span>
                            </div>
                          </div>

                          <div className="hmc-footer">
                            <div className="hmc-eta mono">
                              <Clock size={12} />
                              <span>{isRushHour ? row.eta : 'No delay'}</span>
                            </div>
                            <button 
                              className={`hop-pin-btn-mobile ${isPinned ? 'is-pinned' : ''}`}
                              onClick={() => togglePin(row.id)}
                            >
                              <Bookmark size={14} />
                              <span>{isPinned ? 'Saved' : 'Pin'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  */}
                  {/* Expand / Collapse Button */}
                  {showExpandButton && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0', borderTop: '1px solid rgba(148,163,184,0.08)' }}>
                      <button
                        onClick={() => setIsBoardExpanded(!isBoardExpanded)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 20px',
                          background: 'rgba(2,11,14,0.6)',
                          border: '1px solid rgba(16,231,157,0.3)',
                          borderRadius: '999px',
                          color: '#10E79D',
                          fontFamily: 'monospace',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.25s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(16,231,157,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(2,11,14,0.6)';
                        }}
                      >
                        {isBoardExpanded ? (
                          <>SHOW LESS <ChevronUp size={14} /></>
                        ) : (
                          <>SHOW ALL {filteredBoardRows.length} LOCATIONS <ChevronDown size={14} /></>
                        )}
                      </button>
                    </div>
                  )}
                </>
              );
            })()}

            {/* Terminal Live Sync Ticker */}
            <div className="hop-term-ticker">
              <span className="ticker-label mono">TELEMETRY SYNC:</span>
              <span className="ticker-val">⚡ 64 Campus Bluetooth & Wi-Fi Gateways Active</span>
              <span className="ticker-sep">•</span>
              <span className="ticker-val">🔄 3rd Floor quiet seats refreshed 10s ago</span>
              <span className="ticker-sep">•</span>
              <span className="ticker-val">📍 Food Court queue velocity calculated</span>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: INTERACTIVE 2D VECTOR CAMPUS MAP & REROUTE ENGINE
          ============================================================ */}
      <section className="hop-section hop-map-section" id="un-map-simulator">
        <div className="hop-container">

          <div className="hop-section-head">
            <div className="hop-section-pill">
              <Navigation size={13} className="text-mint" />
              <span>LIVE CAMPUS MAP</span>
            </div>
            <h2 className="hop-section-title">
              The real SRM KTR map, <span className="hop-text-gradient">reading live crowd density.</span>
            </h2>
            <p className="hop-section-desc">
              Pick a start and end point below to get a route across campus. Marker color shows
              current crowd density at each venue.
            </p>
          </div>

          <div className="hop-map-grid">

            {/* Left: Live Leaflet Map */}
            <div className="hop-map-panel">

              {/* Map Floating Status Bar */}
              <div className="hop-map-bar">
                <div className="hop-mb-left">
                  <span className="hop-live-pulse" />
                  <span className="mono">LIVE · SRM KTR CAMPUS</span>
                </div>
              </div>

              <CampusMap />

            </div>

            {/* Right: Legend & How-it-works Panel */}
            <div className="hop-hud-card-side">

              <div className="hop-hcs-header">
                <span className="hop-hcs-badge">
                  <Radio size={12} />
                  <span>CROWD DENSITY LEGEND</span>
                </span>
              </div>

              <div className="hop-hcs-metrics">
                <div className="hop-hcs-metric-box">
                  <span className="label">Below 50%</span>
                  <span className="val text-mint">Quiet</span>
                </div>
                <div className="hop-hcs-metric-box">
                  <span className="label">50&ndash;80%</span>
                  <span className="val" style={{ color: '#F59E0B' }}>Moderate</span>
                </div>
                <div className="hop-hcs-metric-box">
                  <span className="label">Above 80%</span>
                  <span className="val" style={{ color: '#EF4444' }}>High Queue</span>
                </div>
                <div className="hop-hcs-metric-box">
                  <span className="label">No reading yet</span>
                  <span className="val" style={{ color: 'var(--hop-text-muted)' }}>Grey</span>
                </div>
              </div>

              <div className="hop-hcs-step-instruction">
                <div className="step-bar">
                  <span className="step-dot active" />
                  <div className="step-line" />
                  <span className="step-dot active" />
                </div>
                <div className="step-detail">
                  <div className="step-title">
                    <strong>How routing works</strong>
                  </div>
                  <p>Routes are computed live by OSRM's public routing network and drawn as the purple
                    line, with estimated distance and travel time shown below the map controls.</p>
                </div>
              </div>

              <div className="hop-hcs-dest">
                <div className="hop-hcs-icon">
                  <Info size={18} />
                </div>
                <div className="hop-hcs-text">
                  <h4>Crowd data updates every 20s</h4>
                  <p>Backed by the HOPPIN map service — FastAPI + PostGIS on Supabase.</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ============================================================
          UPCOMING EVENTS RADAR
          ============================================================ */}
      <section id="un-events">
        <HoppinEvents />
      </section>

      {/* ============================================================
          ON-CAMPUS DINING DIRECTORY 
          ============================================================ */}
      <section id="un-eateries">
        <HoppinEateries />
      </section>
      {/* SECTION 4.5: UPCOMING EVENTS & RSVP*/}
      <section id="un-events">
        <HoppinEvents />
      </section>

      {/* ============================================================
          SECTION 4: STUDENT SEMESTER TIME-SAVINGS CALCULATOR
          ============================================================ */}
      <section className="hop-section hop-calc-section" id="un-calculator">
        <div className="hop-container">
          
          <div className="hop-calc-card">
            
            <div className="hop-calc-left">
              <div className="hop-section-pill">
                <Sliders size={13} className="text-mint" />
                <span>STUDENT PRODUCTIVITY CALCULATOR</span>
              </div>
              
              <h2 className="hop-calc-title">
                Calculate your semester <span className="hop-text-gradient">time reclaimed.</span>
              </h2>
              
              <p className="hop-calc-desc">
                How many hours do you waste standing in slow-moving corridors, elevator queues, and packed cafeteria lines every semester?
              </p>

              {/* Slider: Daily Class & Food Trips */}
              <div className="hop-slider-box">
                <div className="hop-slider-top">
                  <span className="hop-sl-title">Daily Transitions / Day</span>
                  <span className="hop-sl-val mono">{dailyTrips} Transitions</span>
                </div>
                
                <input 
                  type="range" 
                  min="2" 
                  max="12" 
                  value={dailyTrips}
                  onChange={(e) => setDailyTrips(Number(e.target.value))}
                  className="hop-range-input" 
                />
                
                <div className="hop-slider-ticks">
                  <button onClick={() => setDailyTrips(2)} className={dailyTrips === 2 ? 'active' : ''}>2 (Light Day)</button>
                  <button onClick={() => setDailyTrips(6)} className={dailyTrips === 6 ? 'active' : ''}>6 (Standard)</button>
                  <button onClick={() => setDailyTrips(10)} className={dailyTrips === 10 ? 'active' : ''}>10 (Heavy Labs)</button>
                </div>
              </div>

              {/* Campus Footprint Switcher */}
              <div className="hop-scale-switcher">
                <span className="hop-ss-title">Campus Physical Footprint</span>
                <div className="hop-ss-buttons">
                  <button 
                    className={`hop-ss-btn ${campusScale === 'compact' ? 'active' : ''}`}
                    onClick={() => setCampusScale('compact')}
                  >
                    <span>Compact Campus (15–30 Acres)</span>
                  </button>
                  <button 
                    className={`hop-ss-btn ${campusScale === 'mega' ? 'active' : ''}`}
                    onClick={() => setCampusScale('mega')}
                  >
                    <span>Mega Multiblock Campus (50+ Acres)</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right: Calculated Savings Output */}
            <div className="hop-calc-right">
              
              <div className="hop-savings-banner">
                <span className="hop-sb-label mono">TOTAL TIME RECLAIMED PER SEMESTER</span>
                <div className="hop-sb-number mono">
                  {Math.round(weeklyHoursSaved * 16)} <span className="hop-sb-unit">Hours</span>
                </div>
                <p className="hop-sb-sub">
                  That's <strong>{semesterDaysSaved} full days</strong> reclaimed from hallway congestion and slow elevator lines.
                </p>
              </div>

              <div className="hop-savings-list">
                <div className="hop-sl-item">
                  <div className="hop-sl-icon"><Clock size={16} className="text-mint" /></div>
                  <div className="hop-sl-text">
                    <strong>{weeklyHoursSaved} Hours Every Week</strong>
                    <span>Saved from corridor congestion</span>
                  </div>
                </div>

                <div className="hop-sl-item">
                  <div className="hop-sl-icon"><Activity size={16} className="text-cyan" /></div>
                  <div className="hop-sl-text">
                    <strong>{semesterStepsSaved} Unnecessary Steps Saved</strong>
                    <span>Zero dead-end corridor detours</span>
                  </div>
                </div>

                <div className="hop-sl-item">
                  <div className="hop-sl-icon"><CheckCircle2 size={16} className="text-mint" /></div>
                  <div className="hop-sl-text">
                    <strong>100% On-Time Attendance</strong>
                    <span>Never marked late due to elevator rush</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>
           
      {/* ============================================================
          SECTION 6: CAMPUS PARTNERS & ON-ROUTE MONETIZATION
          ============================================================ */}
      <section className="hop-section hop-partners-section" id="un-partners">
        <div className="hop-container">
          
          <div className="hop-partners-card">
            
            <div className="hop-pc-left">
              <div className="hop-section-pill">
                <Coffee size={13} className="text-mint" />
                <span>ETHICAL ON-ROUTE MONETIZATION</span>
              </div>

              <h2 className="hop-pc-title">
                100% free for students. <span className="hop-text-gradient">Zero spam or detour ads.</span>
              </h2>

              <p className="hop-pc-desc">
                HOPPIN is funded by campus-approved student services and franchises. Recommendations appear strictly when a student's optimal bypass route already passes their doorstep — never creating artificial detours.
              </p>

              <div className="hop-pc-features">
                <div className="hop-pcf-item">
                  <CheckCircle2 size={16} className="text-mint" />
                  <span>Campus coffee kiosks, printers, bookstore counters & grab-and-go points</span>
                </div>
                <div className="hop-pcf-item">
                  <CheckCircle2 size={16} className="text-mint" />
                  <span>Zero battery drain with passive low-power Bluetooth triangulation</span>
                </div>
                <div className="hop-pcf-item">
                  <CheckCircle2 size={16} className="text-mint" />
                  <span>Never sells student movement profiles or individual tracking records</span>
                </div>
              </div>
            </div>

            {/* Right: Phone Frame Preview */}
            <div className="hop-pc-right">
              <div className="hop-phone-frame">
                <div className="hop-phone-notch" />
                
                <div className="hop-phone-status-bar mono">
                  <span>08:51 AM</span>
                  <span>📶 5G · 98%</span>
                </div>

                <div className="hop-phone-alert">
                  <div className="hpa-head">
                    <div className="hpa-brand-row">
                      <img src={logoImg} alt="HOPPIN" className="hpa-logo-img" />
                      <span className="mono hpa-app">AMBIENT HUD</span>
                    </div>
                    <span className="hpa-time">JUST NOW</span>
                  </div>
                  <h4>Bypass Activated · Garden Walkway</h4>
                  <p>Tech Park bottleneck avoided. Reclaim 7.5 minutes.</p>
                </div>

                <div className="hop-phone-kiosk">
                  <div className="hpk-left">
                    <div className="hpk-icon">☕</div>
                    <div>
                      <strong>Blue Tokai Coffee (UB Kiosk)</strong>
                      <p>Doorstep on your bypass · 0 min detour</p>
                    </div>
                  </div>
                  <span className="hpk-btn mono">TAP TO PRE-ORDER</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ============================================================
          SECTION 7: CAMPUS WAITLIST & AMBASSADOR ONBOARDING
          ============================================================ */}
      <section className="hop-section hop-waitlist-section" id="un-waitlist">
        <div className="hop-container">
          
          <div className="hop-waitlist-card">
            <div className="hop-wl-mesh" />
            
            <div className="hop-wl-body">
              <div className="hop-section-pill">
                <School size={13} className="text-mint" />
                <span>FALL 2026 CAMPUS ROLLOUT</span>
              </div>

              <h2 className="hop-wl-title">
                Be the first to bring HOPPIN <span className="hop-text-gradient">to your university.</span>
              </h2>

              <p className="hop-wl-desc">
                Rolling out across major universities in Fall 2026. Join the student priority waitlist or apply as a student campus lead at HOPPIN.SITE.
              </p>

              {!waitlistSuccess ? (
                <form className="hop-wl-form" onSubmit={handleWaitlistSubmit}>
                  <div className="hop-form-grid">
                    
                    <div className="hop-input-container">
                      <input 
                        type="email" 
                        required 
                        placeholder="yourname@university.edu"
                        value={waitlistEmail}
                        onChange={(e) => setWaitlistEmail(e.target.value)}
                        className="hop-text-input"
                      />
                    </div>
                    
                    <div className="hop-select-container">
                      <select 
                        value={selectedCampus}
                        onChange={(e) => setSelectedCampus(e.target.value)}
                        className="hop-select-input"
                      >
                        <option value="SRM Institute of Science & Technology (KTR)">SRM IST (Kattankulathur Campus)</option>
                        <option value="IIT Delhi">IIT Delhi (Hauz Khas)</option>
                        <option value="BITS Pilani">BITS Pilani (Main Campus)</option>
                        <option value="Delhi University">Delhi University (North Campus)</option>
                        <option value="MIT Manipal">MIT Manipal</option>
                        <option value="VIT Vellore">VIT Vellore</option>
                        <option value="Other University">Other College / University</option>
                      </select>
                    </div>

                    <button type="submit" className="hop-btn-submit">
                      <span>Join Priority List</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>

                  <p className="hop-form-hint mono">
                    🔒 NO SPAM · VERIFIED UNIVERSITY DOMAINS ONLY · HOSTED ON HOPPIN.SITE
                  </p>
                </form>
              ) : (
                <div className="hop-success-card">
                  <div className="hop-sc-icon">
                    <CheckCircle2 size={40} className="text-mint" />
                  </div>
                  <h3>You're #342 on the {selectedCampus} Priority Queue!</h3>
                  <p>
                    We've registered <strong>{waitlistEmail}</strong>. You'll receive early access test credentials when HOPPIN boots on your campus.
                  </p>

                  <div className="hop-referral-box">
                    <div className="hop-ref-info mono">
                      <span>YOUR INVITE LINK:</span>
                      <strong>https://hoppin.site/join?ref={encodeURIComponent(waitlistEmail.split('@')[0])}</strong>
                    </div>
                    <button className="hop-copy-btn" onClick={handleCopyInvite}>
                      {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* ============================================================
          SECTION 8: FAQ SECTION
          ============================================================ 
      <section className="hop-section hop-faq-section" id="un-faq">
        <div className="hop-container">
          
          <div className="hop-section-head">
            <div className="hop-section-pill">
              <Info size={13} className="text-mint" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="hop-section-title">Everything you need to know about HOPPIN.</h2>
          </div>

          <div className="hop-faq-list">
            {[
              {
                q: 'How does HOPPIN calculate crowd density without tracking student phones?',
                a: 'HOPPIN uses differential signal volume analysis from passive campus Wi-Fi access points and low-energy BLE gateways. No personal device MAC addresses, IP addresses, or student identities are ever inspected, transmitted, or stored on our servers.'
              },
              {
                q: 'Does HOPPIN work inside multistory buildings where GPS fails?',
                a: 'Yes. Standard satellite GPS cannot penetrate thick reinforced concrete. HOPPIN employs dead-reckoning sensor fusion, indoor Bluetooth micro-beacons, and 3D floor geometry to guide students through stairs, connecting skywalks, and corridors seamlessly.'
              },
              {
                q: 'Is HOPPIN really 100% free for college students?',
                a: '100% free forever for students. We monetize ethically by collaborating with approved campus food kiosks, bookstores, and print shops for zero-detour grab-and-go recommendations right along your existing walking path.'
              },
              {
                q: 'Can our college administration deploy HOPPIN on our campus?',
                a: 'Yes. Our university deployment team imports campus CAD / GIS geometry, connects with existing Wi-Fi infrastructure, and synchronizes lecture timetables in under 48 hours.'
              }
            ].map((faq, fIdx) => (
              <div 
                key={fIdx} 
                className={`hop-faq-card ${openFaqIdx === fIdx ? 'is-open' : ''}`}
                onClick={() => setOpenFaqIdx(openFaqIdx === fIdx ? -1 : fIdx)}
              >
                <div className="hfc-question">
                  <h4>{faq.q}</h4>
                  <span className="hfc-chevron">
                    {openFaqIdx === fIdx ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </span>
                </div>
                {openFaqIdx === fIdx && (
                  <div className="hfc-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>
*/}
      {/* ============================================================
          SECTION: GEN-Z USER FEEDBACK & VIBE CHECK
          ============================================================ */}
      <section className="hop-section hop-feedback-section" id="un-feedback">
        <div className="hop-container">
          <div className="hop-feedback-card">
            <div className="hop-section-pill">
              <Sparkles size={13} className="text-mint" />
              <span>COMMUNITY VIBE CHECK</span>
            </div>

            <h2 className="hop-section-title">
              How’s the <span className="hop-text-gradient">telemetry flow?</span>
            </h2>
            <p className="hop-section-desc">
              Drop a rating or slide your concerns straight to the dev team. No cap, we read everything.
            </p>

            {!feedbackSubmitted ? (
              <form 
                className="hop-feedback-form" 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (feedbackRating > 0) setFeedbackSubmitted(true);
                }}
              >
                {/* Interactive Star Rating */}
                <div className="hop-star-container">
                  <div className="hop-stars-row">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = (hoverRating || feedbackRating) >= star;
                      return (
                        <button
                          type="button"
                          key={star}
                          className={`hop-star-btn ${active ? 'active' : ''}`}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setFeedbackRating(star)}
                        >
                          ★
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Gen-Z Hover / Selection Text Indicator */}
                  <div className="hop-star-tagline mono">
                    {(() => {
                      const current = hoverRating || feedbackRating;
                      if (current === 1) return "💀 Aww no... what's cooking (wrong)?";
                      if (current === 2) return "📉 Mid. Needs major fixing.";
                      if (current === 3) return "👀 Decent, but room for growth.";
                      if (current === 4) return "🔥 Valid. Clean telemetry!";
                      if (current === 5) return "⚡ Superb!! Absolute W interface.";
                      return "Tap a star to rate the vibe";
                    })()}
                  </div>
                </div>

                {/* Text Area for Dev Feedback */}
                <div className="hop-feedback-input-group">
                  <textarea
                    rows="3"
                    placeholder="Drop your bugs, feature requests, or compliments here..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="hop-feedback-textarea mono"
                  />
                  <button 
                    type="submit" 
                    className="hop-btn-primary hop-feedback-submit"
                    disabled={feedbackRating === 0}
                  >
                    <span>Send to Devs</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            ) : (
              <div className="hop-feedback-success">
                <div className="hop-sc-icon">
                  <CheckCircle2 size={40} className="text-mint" />
                </div>
                <h3>Feedback Delivered Successfully! 🚀</h3>
                <p>Thanks for keeping HOPPIN sharp. The developers got your ping.</p>
                <button 
                  type="button" 
                  className="hop-btn-secondary"
                  onClick={() => {
                    setFeedbackSubmitted(false);
                    setFeedbackRating(0);
                    setFeedbackText('');
                  }}
                  style={{ marginTop: '16px' }}
                >
                  Send Another Vibe Check
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

/* ============================================================
   HOPPIN EVENTS — INTERACTIVE EVENT RADAR
   ============================================================ */

export function HoppinEvents() {
  const [events, setEvents] = useState([
    {
      id: 'e1',
      code: 'EVT-01',
      category: 'Fest',
      title: 'Milan — Annual Cultural Fest',
      date: 'Oct 12, 2026',
      time: '10:00 AM – 10:00 PM',
      location: 'TP Ganesan Auditorium',
      desc: 'The flagship annual cultural festival featuring mega stage concerts, celebrity performances, food stalls, celebrity performances and thousands of students.',
      capacity: 87,
      expected: 'HIGH',
      isRSVP: false,
      live: false,
      specs: [
        'Mega Crowd Expected',
        'Bypass Route Active',
        'Live Stage Telemetry'
      ]
    },
    {
      id: 'e2',
      code: 'EVT-02',
      category: 'Hackathon',
      title: 'ACM SIGAI Hackathon',
      date: 'Oct 15, 2026',
      time: '08:00 AM – 08:00 PM',
      location: 'Tech Park · 4th Floor',
      desc: '12-hour intensive coding marathon focused on spatial AI algorithms, automated routing and campus telemetry systems.',
      capacity: 64,
      expected: 'MODERATE',
      isRSVP: false,
      live: false,
      specs: [
        'High Speed Wi-Fi Hub',
        'Power Stations Available',
        'Sub-2s Latency Tracking'
      ]
    },
    {
      id: 'e3',
      code: 'EVT-03',
      category: 'Workshop',
      title: 'Robotics Club Recruitment',
      date: 'Oct 18, 2026',
      time: '04:30 PM – 06:30 PM',
      location: 'University Building · UB',
      desc: 'Introductory hardware showcase and member orientation for autonomous pathfinding and ground-drone navigation.',
      capacity: 38,
      expected: 'LOW',
      isRSVP: false,
      live: false,
      specs: [
        'Live Demonstration',
        'Stairwell B Access',
        'Open to All Years'
      ]
    },
    {
      id: 'e4',
      code: 'EVT-04',
      category: 'Seminar',
      title: 'AI & Future Mobility Summit',
      date: 'Oct 21, 2026',
      time: '11:00 AM – 03:00 PM',
      location: 'Dr. T. P. Ganesan Auditorium',
      desc: 'Industry experts discuss autonomous navigation, smart campuses and the future of AI-powered mobility.',
      capacity: 72,
      expected: 'MODERATE',
      isRSVP: false,
      live: false,
      specs: [
        'Industry Speakers',
        'Auditorium Seating',
        'Live Q&A'
      ]
    }
  ]);

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchEvent, setSearchEvent] = useState('');
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [showReminders, setShowReminders] = useState(false);

  /* RSVP / Reminder toggle */
  const toggleRSVP = (id) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id
          ? { ...event, isRSVP: !event.isRSVP }
          : event
      )
    );
  };

  /* Filter + Search */
  const visibleEvents = events.filter((event) => {
    const matchesFilter =
      activeFilter === 'ALL'
        ? true
        : activeFilter === 'REMINDERS'
        ? event.isRSVP
        : event.category.toUpperCase() === activeFilter;

    const search = searchEvent.toLowerCase();

    const matchesSearch =
      event.title.toLowerCase().includes(search) ||
      event.location.toLowerCase().includes(search) ||
      event.category.toLowerCase().includes(search);

    return matchesFilter && matchesSearch;
  });

  const reminderCount = events.filter((event) => event.isRSVP).length;

  return (
    <section
      className="hop-section hop-events-section"
      id="hoppin-events"
      style={{
        background:
          'radial-gradient(circle at 85% 10%, rgba(16,231,157,0.07), transparent 28%), #02090d',
        padding: '90px 0'
      }}
    >
      <div className="hop-container">

        {/* =====================================================
            HEADER
            ===================================================== */}

        <div className="hop-section-head">

          <div
            className="hop-section-pill"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#10E79D',
                boxShadow: '0 0 12px #10E79D',
                animation: 'pulse 1.5s infinite'
              }}
            />

            <span>LIVE CAMPUS EVENT RADAR</span>
          </div>

          <h2 className="hop-section-title">
            Never miss what's happening at{' '}
            <span className="hop-text-gradient">
              SRM KTR.
            </span>
          </h2>

          <p className="hop-section-desc">
            Discover upcoming fests, hackathons, seminars and club
            activities — while HOPPIN monitors crowd levels and
            recommends smarter routes around busy venues.
          </p>

        </div>


        {/* =====================================================
            EVENT COMMAND BAR
            ===================================================== */}

        <div
          style={{
            background: 'rgba(8,17,23,0.9)',
            border: '1px solid rgba(148,163,184,0.12)',
            borderRadius: '18px',
            padding: '14px',
            marginBottom: '28px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            justifyContent: 'space-between',
            backdropFilter: 'blur(12px)'
          }}
        >

          {/* Filters */}

          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}
          >

            {[
              ['ALL', 'All Events'],
              ['FEST', 'Fests'],
              ['HACKATHON', 'Hackathons'],
              ['WORKSHOP', 'Workshops'],
              ['SEMINAR', 'Seminars'],
              ['REMINDERS', `My Reminders (${reminderCount})`]
            ].map(([value, label]) => (

              <button
                key={value}
                onClick={() => setActiveFilter(value)}
                style={{
                  border:
                    activeFilter === value
                      ? '1px solid #10E79D'
                      : '1px solid rgba(148,163,184,0.15)',

                  background:
                    activeFilter === value
                      ? 'rgba(16,231,157,0.12)'
                      : 'rgba(2,11,14,0.7)',

                  color:
                    activeFilter === value
                      ? '#10E79D'
                      : '#94A3B8',

                  padding: '9px 14px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                {label}
              </button>

            ))}

          </div>


          {/* Search */}

          <div
            style={{
              position: 'relative',
              minWidth: '220px',
              flex: '0 1 280px'
            }}
          >

            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748B'
              }}
            />

            <input
              type="text"
              placeholder="Search events..."
              value={searchEvent}
              onChange={(e) => setSearchEvent(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: '#020B0E',
                border: '1px solid rgba(148,163,184,0.15)',
                borderRadius: '10px',
                padding: '10px 12px 10px 36px',
                color: '#E2E8F0',
                outline: 'none',
                fontFamily: 'monospace',
                fontSize: '11px'
              }}
            />

          </div>

        </div>


        {/* =====================================================
            EVENT GRID
            ===================================================== */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '18px'
          }}
        >

          {visibleEvents.length === 0 ? (

            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '60px 20px',
                background: '#081117',
                border: '1px solid rgba(148,163,184,0.12)',
                borderRadius: '20px'
              }}
            >
              <CalendarDays
                size={30}
                style={{
                  color: '#475569',
                  marginBottom: '12px'
                }}
              />

              <h3
                style={{
                  color: '#CBD5E1',
                  margin: '0 0 6px'
                }}
              >
                No events found
              </h3>

              <p
                style={{
                  color: '#64748B',
                  fontSize: '13px',
                  margin: 0
                }}
              >
                Try another category or search term.
              </p>

            </div>

          ) : (

            visibleEvents.map((event) => {

              const isExpanded = expandedEvent === event.id;

              const capacityColor =
                event.capacity >= 80
                  ? '#EF4444'
                  : event.capacity >= 60
                  ? '#F59E0B'
                  : '#10E79D';

              return (

                <div
                  key={event.id}
                  style={{
                    background:
                      'linear-gradient(145deg, rgba(8,17,23,0.98), rgba(2,11,14,0.98))',
                    border: event.isRSVP
                      ? '1px solid rgba(16,231,157,0.45)'
                      : '1px solid rgba(148,163,184,0.12)',
                    borderRadius: '20px',
                    padding: '22px',
                    position: 'relative',
                    overflow: 'hidden',
                    transition:
                      'transform 0.25s ease, border 0.25s ease, box-shadow 0.25s ease',
                    boxShadow: event.isRSVP
                      ? '0 0 25px rgba(16,231,157,0.08)'
                      : 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      'translateY(-5px)';
                    e.currentTarget.style.borderColor =
                      'rgba(16,231,157,0.45)';
                    e.currentTarget.style.boxShadow =
                      '0 15px 35px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform =
                      'translateY(0)';
                    e.currentTarget.style.borderColor =
                      event.isRSVP
                        ? 'rgba(16,231,157,0.45)'
                        : 'rgba(148,163,184,0.12)';
                    e.currentTarget.style.boxShadow =
                      event.isRSVP
                        ? '0 0 25px rgba(16,231,157,0.08)'
                        : 'none';
                  }}
                >

                  {/* Decorative glow */}

                  <div
                    style={{
                      position: 'absolute',
                      width: '130px',
                      height: '130px',
                      borderRadius: '50%',
                      background:
                        'rgba(16,231,157,0.04)',
                      filter: 'blur(35px)',
                      top: '-60px',
                      right: '-40px',
                      pointerEvents: 'none'
                    }}
                  />


                  {/* Event Code */}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}
                  >

                    <span
                      style={{
                        color: '#10E79D',
                        background: 'rgba(16,231,157,0.08)',
                        border: '1px solid rgba(16,231,157,0.2)',
                        padding: '5px 9px',
                        borderRadius: '999px',
                        fontSize: '9px',
                        fontFamily: 'monospace',
                        fontWeight: 700
                      }}
                    >
                      {event.code} · {event.category.toUpperCase()}
                    </span>

                    {event.isRSVP && (
                      <span
                        style={{
                          color: '#10E79D',
                          fontSize: '9px',
                          fontFamily: 'monospace'
                        }}
                      >
                        ● SAVED
                      </span>
                    )}

                  </div>


                  {/* Title */}

                  <h3
                    style={{
                      color: '#F8FAFC',
                      fontSize: '19px',
                      margin: '0 0 10px',
                      lineHeight: 1.25
                    }}
                  >
                    {event.title}
                  </h3>


                  {/* Date */}

                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      color: '#38BDF8',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      marginBottom: '8px'
                    }}
                  >
                    <Clock size={13} />
                    {event.date} · {event.time}
                  </div>


                  {/* Location */}

                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      color: '#94A3B8',
                      fontSize: '11px',
                      marginBottom: '16px'
                    }}
                  >
                    <MapPin size={13} />
                    {event.location}
                  </div>


                  {/* Description */}

                  <p
                    style={{
                      color: '#94A3B8',
                      fontSize: '12px',
                      lineHeight: 1.7,
                      margin: '0 0 18px'
                    }}
                  >
                    {event.desc}
                  </p>


                  {/* Crowd Meter */}

                  <div
                    style={{
                      background: '#020B0E',
                      border:
                        '1px solid rgba(148,163,184,0.1)',
                      borderRadius: '12px',
                      padding: '12px',
                      marginBottom: '16px'
                    }}
                  >

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                        fontFamily: 'monospace',
                        fontSize: '9px'
                      }}
                    >

                      <span style={{ color: '#64748B' }}>
                        EXPECTED CROWD
                      </span>

                      <span style={{ color: capacityColor }}>
                        {event.expected} · {event.capacity}%
                      </span>

                    </div>

                    <div
                      style={{
                        height: '5px',
                        background: '#17232A',
                        borderRadius: '99px',
                        overflow: 'hidden'
                      }}
                    >

                      <div
                        style={{
                          width: `${event.capacity}%`,
                          height: '100%',
                          background: capacityColor,
                          borderRadius: '99px',
                          boxShadow: `0 0 10px ${capacityColor}`
                        }}
                      />

                    </div>

                  </div>


                  {/* Expanded Details */}

                  {isExpanded && (

                    <div
                      style={{
                        borderTop:
                          '1px solid rgba(148,163,184,0.1)',
                        paddingTop: '15px',
                        marginBottom: '15px'
                      }}
                    >

                      <div
                        style={{
                          color: '#64748B',
                          fontFamily: 'monospace',
                          fontSize: '9px',
                          marginBottom: '10px'
                        }}
                      >
                        HOPPIN EVENT INTELLIGENCE
                      </div>

                      {event.specs.map((spec, index) => (

                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#CBD5E1',
                            fontSize: '11px',
                            marginBottom: '7px'
                          }}
                        >
                          <CheckCircle2
                            size={12}
                            color="#10E79D"
                          />

                          {spec}
                        </div>

                      ))}

                    </div>

                  )}


                  {/* Actions */}

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '8px'
                    }}
                  >

                    <button
                      onClick={() => toggleRSVP(event.id)}
                      style={{
                        border: event.isRSVP
                          ? '1px solid rgba(16,231,157,0.6)'
                          : '1px solid rgba(148,163,184,0.2)',
                        background: event.isRSVP
                          ? 'rgba(16,231,157,0.12)'
                          : 'rgba(255,255,255,0.03)',
                        color: event.isRSVP
                          ? '#10E79D'
                          : '#CBD5E1',
                        padding: '11px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontFamily: 'monospace',
                        fontSize: '10px',
                        fontWeight: 700,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Bell
                        size={13}
                        style={{
                          verticalAlign: 'middle',
                          marginRight: '6px'
                        }}
                      />

                      {event.isRSVP
                        ? 'REMINDER ACTIVE'
                        : 'SET REMINDER'}
                    </button>


                    <button
                      onClick={() =>
                        setExpandedEvent(
                          isExpanded ? null : event.id
                        )
                      }
                      style={{
                        width: '44px',
                        border:
                          '1px solid rgba(148,163,184,0.2)',
                        background: 'rgba(255,255,255,0.03)',
                        color: '#94A3B8',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      title="View event details"
                    >
                      {isExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>

                  </div>

                </div>

              );
            })

          )}

        </div>


        {/* =====================================================
            FOOTER STATUS
            ===================================================== */}

        <div
          style={{
            marginTop: '22px',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            padding: '13px 16px',
            background: 'rgba(8,17,23,0.65)',
            border:
              '1px solid rgba(148,163,184,0.1)',
            borderRadius: '12px',
            fontFamily: 'monospace',
            fontSize: '9px',
            color: '#64748B'
          }}
        >

          <span>
            <span
              style={{
                color: '#10E79D',
                marginRight: '6px'
              }}
            >
              ●
            </span>

            EVENT RADAR ONLINE
          </span>

          <span>
            {events.length} CAMPUS EVENTS INDEXED
          </span>

          <span>
            CROWD DATA SYNC · EVERY 20 SEC
          </span>

        </div>

      </div>
    </section>
  );
}


/* ============================================================
   HOPPIN EATERIES — ON-CAMPUS DINING DIRECTORY WITH EXPAND TOGGLE
   ============================================================ */

export function HoppinEateries() {
  const [eateries, setEateries] = useState([
    { id: 'et1', name: "Goldie's Grill and Shawarma", location: "UB Ground Floor", zone: "UB", contact: "9884562815", type: "Grill & Fast Food", isSaved: false },
    { id: 'et2', name: "Seema's Cafe", location: "UB First Floor", zone: "UB", contact: "9940304021", type: "Cafe & Snacks", isSaved: false },
    { id: 'et3', name: "Mr. Burger", location: "UB First Floor", zone: "UB", contact: "9566172442", type: "Fast Food", isSaved: false },
    { id: 'et4', name: "Fritesphere", location: "UB First Floor", zone: "UB", contact: "7200790233", type: "Fries & Quick Bites", isSaved: false },
    { id: 'et5', name: "Chaat Addaa", location: "UB First Floor", zone: "UB", contact: "9884988331", type: "Street Food & Chaat", isSaved: false },
    { id: 'et6', name: "SRM Evergreen", location: "UB First Floor", zone: "UB", contact: "N/A", type: "Meals & Snacks", isSaved: false },
    { id: 'et7', name: "Java (Food Court)", location: "Near Clock Tower", zone: "Java", contact: "8637674853", type: "Main Food Court", isSaved: false },
    { id: 'et8', name: "Queen's Court", location: "Java Food Court", zone: "Java", contact: "N/A", type: "Multi-Cuisine", isSaved: false },
    { id: 'et9', name: "Subway", location: "Java Food Court", zone: "Java", contact: "N/A", type: "Submarines & Salads", isSaved: false },
    { id: 'et10', name: "Loaded Fries", location: "Java Food Court", zone: "Java", contact: "N/A", type: "Snacks", isSaved: false },
    { id: 'et11', name: "Shakes and Desserts", location: "Java Food Court", zone: "Java", contact: "N/A", type: "Beverages & Desserts", isSaved: false },
    { id: 'et12', name: "Classic Biryani", location: "Java Food Court", zone: "Java", contact: "N/A", type: "Biryani & Rice", isSaved: false },
    { id: 'et13', name: "Genz Beta Cafe", location: "Near Hotel Management Block", zone: "Other", contact: "7397777942", type: "Modern Cafe", isSaved: false },
    { id: 'et14', name: "Domino's Pizza", location: "Vendhar Square", zone: "Vendhar", contact: "18002081234", type: "Pizza & Italian", isSaved: false },
    { id: 'et15', name: "Zinger", location: "Vendhar Square", zone: "Vendhar", contact: "N/A", type: "Fast Food", isSaved: false },
    { id: 'et16', name: "Triangle Social Cafe", location: "Vendhar Square", zone: "Vendhar", contact: "N/A", type: "Social Cafe", isSaved: false },
    { id: 'et17', name: "Slice Of Life", location: "Beside SRM Medical College", zone: "Medical", contact: "9786535984", type: "Cafe & Beverages", isSaved: false },
  ]);

  const [activeZone, setActiveZone] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // NEW STATE: Tracks if the list is expanded or collapsed
  const [isExpanded, setIsExpanded] = useState(false);

  /* Save / Bookmark Toggle */
  const toggleSaveEatery = (id) => {
    setEateries((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isSaved: !item.isSaved } : item
      )
    );
  };

  const filteredEateries = eateries.filter((item) => {
    const matchesZone =
      activeZone === 'ALL'
        ? true
        : activeZone === 'SAVED'
        ? item.isSaved
        : item.zone.toUpperCase() === activeZone;

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesZone && matchesSearch;
  });

  const savedCount = eateries.filter((item) => item.isSaved).length;

  // LOGIC: Show only 3 items initially (one row), or all if expanded
  const INITIAL_ROW_COUNT = 3; 
  const displayedEateries = isExpanded ? filteredEateries : filteredEateries.slice(0, INITIAL_ROW_COUNT);
  const showExpandButton = filteredEateries.length > INITIAL_ROW_COUNT;

  return (
    <section
      className="hop-section hop-eateries-section"
      id="un-eateries"
      style={{
        background: 'radial-gradient(circle at 15% 90%, rgba(56,189,248,0.06), transparent 30%), #02090d',
        padding: '90px 0'
      }}
    >
      <div className="hop-container">
        
        {/* Section Header */}
        <div className="hop-section-head">
          <div className="hop-section-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10E79D', boxShadow: '0 0 12px #10E79D', animation: 'pulse 1.5s infinite' }} />
            <span>ON-ROUTE CAMPUS DINING DIRECTORY</span>
          </div>
          <h2 className="hop-section-title">
            Fuel your day with zero detour, <span className="hop-text-gradient">on-campus spots.</span>
          </h2>
          <p className="hop-section-desc">
            Explore verified food outlets, cafes, and food courts across SRM KTR — tracked live by HOPPIN to help you find quick bites on your route.
          </p>
        </div>

        {/* Command Bar / Filter Tabs */}
        <div style={{
          background: 'rgba(8,17,23,0.9)',
          border: '1px solid rgba(148,163,184,0.12)',
          borderRadius: '18px',
          padding: '14px',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(12px)'
        }}>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              ['ALL', 'All Spots'],
              ['UB', 'UB Building'],
              ['JAVA', 'Java Food Court'],
              ['VENDHAR', 'Vendhar Square'],
              ['MEDICAL', 'Medical Block'],
              ['SAVED', `My Saved (${savedCount})`]
            ].map(([val, label]) => (
              <button
                key={val}
                onClick={() => {
                  setActiveZone(val);
                  setIsExpanded(false); // Reset to collapsed when changing tabs
                }}
                style={{
                  border: activeZone === val ? '1px solid #10E79D' : '1px solid rgba(148,163,184,0.15)',
                  background: activeZone === val ? 'rgba(16,231,157,0.12)' : 'rgba(2,11,14,0.7)',
                  color: activeZone === val ? '#10E79D' : '#94A3B8',
                  padding: '9px 14px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', minWidth: '220px', flex: '0 1 280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
            <input
              type="text"
              placeholder="Search eatery or location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsExpanded(true); // Auto-expand when user searches so they see all results
              }}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: '#020B0E',
                border: '1px solid rgba(148,163,184,0.15)',
                borderRadius: '10px',
                padding: '10px 12px 10px 36px',
                color: '#E2E8F0',
                outline: 'none',
                fontFamily: 'monospace',
                fontSize: '11px'
              }}
            />
          </div>
        </div>

        {/* Eateries Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          {displayedEateries.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: '#081117', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '20px' }}>
              <Bookmark size={30} style={{ color: '#475569', marginBottom: '12px' }} />
              <h3 style={{ color: '#CBD5E1', margin: '0 0 6px' }}>No saved eateries found</h3>
              <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>Click the bookmark button on any eatery card to save it here.</p>
            </div>
          ) : (
            displayedEateries.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'linear-gradient(145deg, rgba(8,17,23,0.98), rgba(2,11,14,0.98))',
                  border: item.isSaved ? '1px solid rgba(16,231,157,0.45)' : '1px solid rgba(148,163,184,0.12)',
                  borderRadius: '20px',
                  padding: '22px',
                  position: 'relative',
                  transition: 'all 0.25s ease',
                  boxShadow: item.isSaved ? '0 0 25px rgba(16,231,157,0.08)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{
                    color: '#38BDF8',
                    background: 'rgba(56,189,248,0.08)',
                    border: '1px solid rgba(56,189,248,0.2)',
                    padding: '4px 8px',
                    borderRadius: '999px',
                    fontSize: '9px',
                    fontFamily: 'monospace',
                    fontWeight: 700
                  }}>
                    {item.type}
                  </span>
                  
                  {item.isSaved ? (
                    <span style={{ color: '#10E79D', fontSize: '9px', fontFamily: 'monospace' }}>● SAVED SPOT</span>
                  ) : (
                    <span style={{ color: '#64748B', fontSize: '9px', fontFamily: 'monospace' }}>ON-CAMPUS</span>
                  )}
                </div>

                <h3 style={{ color: '#F8FAFC', fontSize: '18px', margin: '0 0 8px', lineHeight: 1.25 }}>
                  {item.name}
                </h3>

                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', color: '#94A3B8', fontSize: '11px', marginBottom: '16px' }}>
                  <MapPin size={13} className="text-mint" />
                  <span>{item.location}</span>
                </div>

                <div style={{
                  background: '#020B0E',
                  border: '1px solid rgba(148,163,184,0.1)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: 'monospace',
                  fontSize: '10px',
                  marginBottom: '14px'
                }}>
                  <span style={{ color: '#64748B' }}>DIRECT CONTACT</span>
                  <span style={{ color: '#CBD5E1' }}>{item.contact}</span>
                </div>

                {/* Save / Bookmark Button */}
                <button
                  onClick={() => toggleSaveEatery(item.id)}
                  style={{
                    width: '100%',
                    border: item.isSaved ? '1px solid rgba(16,231,157,0.6)' : '1px solid rgba(148,163,184,0.2)',
                    background: item.isSaved ? 'rgba(16,231,157,0.12)' : 'rgba(255,255,255,0.03)',
                    color: item.isSaved ? '#10E79D' : '#CBD5E1',
                    padding: '10px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    fontSize: '10px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Bookmark size={13} />
                  {item.isSaved ? 'SAVED TO FAVOURITES' : 'SAVE SPOT'}
                </button>

              </div>
            ))
          )}
        </div>

        {/* Expand / Collapse Button */}
        {showExpandButton && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                background: 'rgba(2,11,14,0.8)',
                border: '1px solid rgba(16,231,157,0.4)',
                borderRadius: '999px',
                color: '#10E79D',
                fontFamily: 'monospace',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: '0 0 15px rgba(16,231,157,0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(16,231,157,0.1)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(16,231,157,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(2,11,14,0.8)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(16,231,157,0.05)';
              }}
            >
              {isExpanded ? (
                <>SHOW LESS <ChevronUp size={16} /></>
              ) : (
                <>SHOW ALL {filteredEateries.length} SPOTS <ChevronDown size={16} /></>
              )}
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
