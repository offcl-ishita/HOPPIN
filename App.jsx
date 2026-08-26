import React, { useState, useEffect } from 'react';


import { 
  Navigation, Compass, Radio, Users, Clock, Flame, 
  MapPin, Bell, Shield, ArrowRight, ArrowUpRight, CheckCircle2,
  Sparkles, Layers, Sliders, Coffee, BookOpen, Dumbbell,
  Utensils, ChevronRight, ChevronDown, RotateCcw,
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

const featureSystems = [
  {
    code: '01',
    acronym: 'SCN',
    title: 'Real-Time Corridor Scanner & Bypass Engine',
    tag: 'Core Telemetry',
    desc: 'Continuously monitors walking corridors 300 meters ahead. The split-second localized friction forms, HOPPIN computes instantaneous frictionless bypass paths.',
    highlight: '< 1.8s instant path recalculation latency',
    icon: Compass,
    color: '#10E79D',
    badge: 'Dynamic Reroute',
    metrics: ['Sub-2s Path Recalculation', '99.4% Multi-Building Accuracy', '3D Corridor Mesh']
  },
  {
    code: '02',
    acronym: 'NAV',
    title: 'Multi-Story Indoor & Skywalk Navigator',
    tag: '3D Mapping',
    desc: 'High-precision indoor walking guidance between multi-floor lecture blocks, stairwells, and connecting skywalks without requiring active GPS signals.',
    highlight: 'Floor-by-floor vertical stair & elevator routing',
    icon: Navigation,
    color: '#38BDF8',
    badge: 'Indoor 3D GIS',
    metrics: ['Multi-Level Floor Guidance', 'Stairs vs Elevator Speed Calc', 'Offline Mesh Fallback']
  },
  {
    code: '03',
    acronym: 'SEN',
    title: 'Differential Ambient Crowd Sensors',
    tag: 'Zero-PII Privacy',
    desc: 'Aggregates passive Wi-Fi differential packet density and low-energy BLE gateway signals without storing student identities, MAC addresses, or personal data.',
    highlight: '100% Privacy-safe differential telemetry',
    icon: Radio,
    color: '#A855F7',
    badge: 'Zero PII Tracked',
    metrics: ['Differential Privacy Math', 'Zero Personal Storage', 'Low-Energy Sensor Mesh']
  },
  {
    code: '04',
    acronym: 'CAP',
    title: 'Live Facility Capacity & Seat Availability',
    tag: 'Occupancy Live',
    desc: 'Check desk seats in the library, cardio stations in the gym, and table turnover in dining courts before walking across campus.',
    highlight: 'Real-time seat & bench availability meters',
    icon: Users,
    color: '#F59E0B',
    badge: 'Seat-Level Clarity',
    metrics: ['Real-Time Seat Counters', 'Queue Turn Velocity', 'Quiet Zone Heatmaps']
  },
  {
    code: '05',
    acronym: 'FAV',
    title: '1-Tap Daily Route & Spot Pinned Presets',
    tag: 'Student Routine',
    desc: 'Pin your daily routine spots — your favorite library desk, morning espresso kiosk, and semester timetable classrooms for instant morning glance.',
    highlight: 'Instant morning routine pulse on your phone',
    icon: Bookmark,
    color: '#EC4899',
    badge: '1-Tap Glance',
    metrics: ['Timetable Schedule Sync', 'Lock Screen Live Activity', 'Smart Shift Alerts']
  },
  {
    code: '06',
    acronym: 'ETA',
    title: 'Predictive Queue Duration Estimator',
    tag: 'Queue Intelligence',
    desc: 'Machine learning models predict queue velocity for cafeteria lines, bookstore checkouts, and student document verification counters.',
    highlight: 'Tells you whether to go now or wait 10 mins',
    icon: Clock,
    color: '#06B6D4',
    badge: 'Predictive ETA',
    metrics: ['Historical Rush Models', 'Queue Velocity Tracking', 'Optimal Arrival Windows']
  },
  {
    code: '07',
    acronym: 'EVT',
    title: 'Live Campus Events & Pop-Up Crowd Radar',
    tag: 'Campus Feed',
    desc: 'Correlates sudden hallway congestion with scheduled club seminars, hackathons, and guest symposiums before you hit an unexpected roadblock.',
    highlight: 'Instant context for unusual crowd spikes',
    icon: Sparkles,
    color: '#10E79D',
    badge: 'Event Intelligence',
    metrics: ['Symposium Radar Sync', 'Auditorium Rush Detection', 'Automated Campus Detours']
  }
];

export default function App() {
  // State: Interactive Departure Board
  const [boardCategory, setBoardCategory] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [isRushHour, setIsRushHour] = useState(true);
  const [pinnedRows, setPinnedRows] = useState([1, 4]);
  const [boardTime, setBoardTime] = useState('');

  // State: Interactive Architecture Directory
  const [activeSystemIdx, setActiveSystemIdx] = useState(0);
  const [expandedMobileIdx, setExpandedMobileIdx] = useState(0);

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

  const activeSystem = featureSystems[activeSystemIdx];

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
                      onClick={() => setBoardCategory(tab.id)}
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
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="hop-search-input mono"
                />
              </div>
            </div>

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
                {filteredBoardRows.length === 0 ? (
                  <div className="hop-no-results mono">
                    No facilities found matching "{searchFilter}".
                  </div>
                ) : (
                  filteredBoardRows.map((row) => {
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

            {/* Mobile Cards View */}
            <div className="hop-mobile-board-list show-on-mobile">
              {filteredBoardRows.map((row) => {
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
              Pick a start and end point below to get a route across campus — filtered for wheelchair
              accessibility if you need it. Marker color shows current crowd density at each venue.
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
                  <p>Matches your trip against SRM KTR's mapped walking paths, honoring the accessible-only
                    filter when you set it. Falls back to a direct line when no mapped path covers that
                    stretch yet.</p>
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
           
      {/* SECTION 3.5: UPCOMING EVENTS & RSVP*/}
      <section id="un-events">
        <HoppinEvents />
      </section>
      {/* ============================================================
          SECTION 5: THE 7 CORE ARCHITECTURAL SYSTEMS (THE DIRECTORY)
          ============================================================ */}
      <section className="hop-section hop-dir-section" id="un-directory">
        <div className="hop-container">
          
          <div className="hop-section-head">
            <div className="hop-section-pill">
              <Layers size={13} className="text-mint" />
              <span>THE 7-MODULE ARCHITECTURE</span>
            </div>
            <h2 className="hop-section-title">
              Everything HOPPIN does, <span className="hop-text-gradient">engineered like a precision board.</span>
            </h2>
            <p className="hop-section-desc">
              Seven synchronized telemetry layers collaborating in real-time from the moment you leave your hostel room to the second you take your seat.
            </p>
          </div>

          {/* Desktop Dual-Pane Architecture Console */}
          <div className="hop-dir-console hide-on-mobile">
            
            {/* Left: 7 Modules List */}
            <div className="hop-dir-nav">
              {featureSystems.map((item, idx) => {
                const IconComponent = item.icon;
                const isSelected = activeSystemIdx === idx;

                return (
                  <div
                    key={item.code}
                    className={`hop-dir-tab ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setActiveSystemIdx(idx)}
                  >
                    <div className="hdt-top">
                      <span className="hdt-code mono">{item.code} · {item.acronym}</span>
                      <span className="hdt-tag">{item.tag}</span>
                    </div>

                    <div className="hdt-title-row">
                      <div className="hdt-icon" style={{ color: item.color }}>
                        <IconComponent size={17} />
                      </div>
                      <h3>{item.title}</h3>
                    </div>

                    <p className="hdt-desc">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Right: Deep Dive Inspector Card */}
            <div className="hop-dir-inspector">
              <div className="hop-inspector-card">
                
                <div className="hic-head">
                  <span className="hic-badge mono">{activeSystem.code} · {activeSystem.badge}</span>
                  <span className="hic-status mono">MODULE ACTIVE</span>
                </div>

                <div className="hic-icon-box" style={{ background: `${activeSystem.color}15`, color: activeSystem.color }}>
                  {(() => {
                    const SystemIcon = activeSystem.icon;
                    return <SystemIcon size={36} />;
                  })()}
                </div>

                <h3 className="hic-title">{activeSystem.title}</h3>
                <div className="hic-highlight mono">{activeSystem.highlight}</div>
                <p className="hic-text">{activeSystem.desc}</p>

                <div className="hic-specs-box">
                  <span className="hic-specs-title mono">TECHNICAL SPECIFICATIONS</span>
                  <div className="hic-specs-list">
                    {activeSystem.metrics.map((m, mIdx) => (
                      <div key={mIdx} className="hic-spec-pill">
                        <CheckCircle2 size={13} color={activeSystem.color} />
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="hic-footer">
                  <a href="#un-waitlist" className="hic-btn">
                    <span>Test on your campus</span>
                    <ArrowRight size={14} />
                  </a>
                </div>

              </div>
            </div>

          </div>

          {/* Mobile Accordion View */}
          <div className="hop-dir-accordion show-on-mobile">
            {featureSystems.map((item, idx) => {
              const IconComponent = item.icon;
              const isExpanded = expandedMobileIdx === idx;

              return (
                <div 
                  key={item.code} 
                  className={`hop-accordion-card ${isExpanded ? 'is-expanded' : ''}`}
                >
                  <button 
                    className="hop-acc-header"
                    onClick={() => setExpandedMobileIdx(isExpanded ? -1 : idx)}
                  >
                    <div className="hacc-left">
                      <div className="hacc-icon" style={{ color: item.color }}>
                        <IconComponent size={18} />
                      </div>
                      <div className="hacc-title-group">
                        <div className="hacc-meta mono">
                          <span>{item.code} · {item.acronym}</span>
                          <span className="hacc-tag">{item.tag}</span>
                        </div>
                        <h4>{item.title}</h4>
                      </div>
                    </div>
                    <div className="hacc-chevron">
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="hop-acc-body">
                      <div className="hacc-highlight mono">{item.highlight}</div>
                      <p className="hacc-desc">{item.desc}</p>
                      
                      <div className="hacc-specs">
                        {item.metrics.map((m, mIdx) => (
                          <div key={mIdx} className="hacc-spec-pill">
                            <CheckCircle2 size={12} color={item.color} />
                            <span>{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
          ============================================================ */}
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

      <Footer />
    </div>
  );
}

      {/* --- HOPPIN EVENTS COMPONENT --- */}
export function HoppinEvents() {
  const [events, setEvents] = useState([
    {
      id: 'e1',
      code: 'EVT-01',
      category: 'Fest',
      title: 'Milan - Annual Cultural Fest',
      date: 'Oct 12, 2026',
      time: '10:00 AM - 10:00 PM',
      location: 'TP Ganesan Auditorium',
      desc: 'The flagship annual cultural festival featuring mega stage concerts, celebrity performances, and thousands of students.',
      is_rsvpd: false,
      specs: ['Mega Crowd Expected', 'Bypass Route Active', 'Live Stage Telemetry']
    },
    {
      id: 'e2',
      code: 'EVT-02',
      category: 'Hackathon',
      title: 'ACM SIGAI Hackathon',
      date: 'Oct 15, 2026',
      time: '08:00 AM - 08:00 PM',
      location: 'Tech Park, 4th Floor',
      desc: '12-hour intensive coding marathon focused on spatial AI algorithms, automated routing, and campus telemetry systems.',
      is_rsvpd: true,
      specs: ['High Speed Wi-Fi Hub', 'Power Stations Available', 'Sub-2s Latency Tracking']
    },
    {
      id: 'e3',
      code: 'EVT-03',
      category: 'Club Workshop',
      title: 'Robotics Club Recruitment',
      date: 'Oct 18, 2026',
      time: '04:30 PM - 06:30 PM',
      location: 'University Building (UB)',
      desc: 'Introductory hardware showcase and member orientation for autonomous pathfinding and ground drone navigation.',
      is_rsvpd: false,
      specs: ['Live Demonstration', 'Stairwell B Access', 'Open to All Years']
    }
  ]);

  const [activeTab, setActiveTab] = useState('ALL');

  const toggleRSVP = (id) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, is_rsvpd: !ev.is_rsvpd } : ev))
    );
  };

  const visibleEvents = activeTab === 'RSVP' ? events.filter((e) => e.is_rsvpd) : events;

  return (
    <section className="hop-section hop-calc-section my-16">
      <div className="hop-container max-w-6xl mx-auto px-4">
        <div className="hop-calc-card bg-[#081117] border border-slate-800/80 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          
          {/* Subtle background glow accent */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#10E79D]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="text-center mb-10 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#10E79D]/10 border border-[#10E79D]/25 text-[#10E79D] text-xs font-mono uppercase tracking-wider mb-3">
              <span>⚡ LIVE CAMPUS EVENT RADAR</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
              Never miss an event at <span className="text-[#10E79D] drop-shadow-[0_0_15px_rgba(16,231,157,0.3)]">SRM KTR.</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto font-sans">
              Automated real-time notifications for fests, hackathons, and club workshops happening across campus blocks.
            </p>
          </div>

          {/* Pill-shaped Interactive Tabs */}
          <div className="flex gap-3 mb-10 justify-center relative z-10">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-6 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 border ${
                activeTab === 'ALL' 
                  ? 'border-[#10E79D] text-[#10E79D] bg-[#10E79D]/15 font-bold shadow-[0_0_20px_rgba(16,231,157,0.25)] scale-105' 
                  : 'border-slate-800 text-slate-400 bg-[#020b0e]/60 hover:border-slate-700 hover:text-white'
              }`}
            >
              All Events ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('RSVP')}
              className={`px-6 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 border ${
                activeTab === 'RSVP' 
                  ? 'border-[#10E79D] text-[#10E79D] bg-[#10E79D]/15 font-bold shadow-[0_0_20px_rgba(16,231,157,0.25)] scale-105' 
                  : 'border-slate-800 text-slate-400 bg-[#020b0e]/60 hover:border-slate-700 hover:text-white'
              }`}
            >
              ★ My Reminders ({events.filter(e => e.is_rsvpd).length})
            </button>
          </div>

          {/* Separate Individual Event Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {visibleEvents.length === 0 ? (
              <div className="col-span-full text-center py-14 bg-[#020b0e]/60 rounded-2xl border border-slate-800/80">
                <p className="text-slate-400 text-sm font-mono">No reminders saved yet.</p>
                <p className="text-slate-600 text-xs mt-1">Click '+ Set Campus Reminder' on any card below.</p>
              </div>
            ) : (
              visibleEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="bg-[#020b0e]/80 border border-slate-800/90 p-6 rounded-2xl shadow-xl flex flex-col justify-between transition-all duration-300 hover:border-[#10E79D]/50 hover:-translate-y-1 hover:shadow-[0_4px_25px_rgba(16,231,157,0.12)] group"
                >
                  <div>
                    {/* Top Tag & Date Row */}
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-[#10E79D]/10 text-[#10E79D] border border-[#10E79D]/25 font-bold tracking-wider">
                        {event.code} · {event.category}
                      </span>
                      <span className="text-[#38BDF8] text-xs font-mono font-medium">{event.date}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#10E79D] transition-colors">{event.title}</h3>
                    <p className="text-xs font-mono text-[#38BDF8] mb-3">⏰ {event.time}</p>
                    <p className="text-slate-300 text-xs mb-5 line-clamp-3 leading-relaxed font-sans">{event.desc}</p>
                    
                    {/* Venue Metadata Box */}
                    <div className="bg-[#081117] border border-slate-800/80 p-3 rounded-xl mb-5 font-mono text-xs text-slate-300 flex items-center gap-2.5">
                      <span>📍</span>
                      <span className="truncate text-slate-300">{event.location}</span>
                    </div>
                  </div>

                  {/* Interactive Button */}
                  <button
                    onClick={() => toggleRSVP(event.id)}
                    className={`w-full py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all duration-300 active:scale-95 ${
                      event.is_rsvpd 
                        ? 'bg-[#10E79D]/20 text-[#10E79D] border border-[#10E79D]/60 shadow-[0_0_15px_rgba(16,231,157,0.2)]' 
                        : 'bg-white/5 text-slate-200 border border-slate-700/60 hover:bg-[#10E79D] hover:text-[#020b0e] hover:border-[#10E79D]'
                    }`}
                  >
                    {event.is_rsvpd ? '✓ Reminder Active' : '+ Set Campus Reminder'}
                  </button>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
