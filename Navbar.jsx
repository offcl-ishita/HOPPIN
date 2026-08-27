import React, { useState, useEffect } from 'react';
import {
  ArrowRight, Menu, X, Radio, Navigation,
  Sliders, Coffee, Info, Sparkles
} from 'lucide-react';
import logoImg from './hoppin_logo.png';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar-wrapper ${scrolled ? 'is-scrolled' : ''}`}>
      <div className={`navbar-pill ${mobileOpen ? 'is-mobile-open' : ''}`}>

        {/* Top Header Row */}
        <div className="navbar-top-row">

          {/* Brand Logo */}
          <a href="#" className="nav-logo" onClick={() => setMobileOpen(false)} aria-label="HOPPIN Home">
            <img src={logoImg} alt="HOPPIN" className="nav-logo-img" />
          </a>

          {/* Desktop Nav Links */}
          <ul className="nav-links">
            <li>
              <a href="#un-departure-board" className="nav-link">
                Live Board
              </a>
            </li>
            <li>
              <a href="#un-map-simulator" className="nav-link">
                Bypass Map
              </a>
            </li>
            <li>
              <a href="#un-eateries" className="nav-link">
                Eateries
              </a>
            </li>
            <li>
              <a href="#hoppin-events" className="nav-link">
                Events
              </a>
            </li>
            <li>
              <a href="#un-calculator" className="nav-link">
                Time Reclaimed
              </a>
            </li>
            <li>
              <a href="#un-partners" className="nav-link">
                Campus Perks
              </a>
            </li>
            <li>
              <a href="#un-faq" className="nav-link">
                FAQ
              </a>
            </li>
          </ul>

          {/* Right Action & Mobile Toggle */}
          <div className="nav-actions-group">
            <a href="#un-waitlist" className="nav-cta-btn">
              <span>Join Waitlist</span>
              <ArrowRight size={14} />
            </a>

            <button
              className="nav-mobile-toggle-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Navigation"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileOpen && (
          <div className="nav-mobile-drawer">
            <div className="nav-mobile-links-list">

              <a
                href="#un-departure-board"
                className="nav-mob-item"
                onClick={() => setMobileOpen(false)}
              >
                <div className="nav-mob-icon" style={{ color: '#10E79D', background: 'rgba(16, 231, 157, 0.12)' }}>
                  <Radio size={16} />
                </div>
                <div>
                  <strong style={{ color: '#10E79D' }}>Live Status Board</strong>
                  <span>Hallway crowd status & seat availability</span>
                </div>
              </a>

              <a
                href="#un-map-simulator"
                className="nav-mob-item"
                onClick={() => setMobileOpen(false)}
              >
                <div className="nav-mob-icon" style={{ color: '#38BDF8', background: 'rgba(56, 189, 248, 0.12)' }}>
                  <Navigation size={16} />
                </div>
                <div>
                  <strong>Bypass Cartography</strong>
                  <span>Interactive 2D vector corridor simulator</span>
                </div>
              </a>

              <a
                href="#un-eateries"
                className="nav-mob-item"
                onClick={() => setMobileOpen(false)}
              >
                <div className="nav-mob-icon" style={{ color: '#EC4899', background: 'rgba(236, 72, 153, 0.12)' }}>
                  <Coffee size={16} />
                </div>
                <div>
                  <strong>On-Campus Eateries</strong>
                  <span>Verify food spots & quick bites on route</span>
                </div>
              </a>

              <a
                href="#hoppin-events"
                className="nav-mob-item"
                onClick={() => setMobileOpen(false)}
              >
                <div className="nav-mob-icon" style={{ color: '#10E79D', background: 'rgba(16, 231, 157, 0.12)' }}>
                  <Sparkles size={16} />
                </div>
                <div>
                  <strong>Campus Event Radar</strong>
                  <span>Fests, hackathons, seminars & RSVPs</span>
                </div>
              </a>

              <a
                href="#un-calculator"
                className="nav-mob-item"
                onClick={() => setMobileOpen(false)}
              >
                <div className="nav-mob-icon" style={{ color: '#F59E0B', background: 'rgba(245, 158, 11, 0.12)' }}>
                  <Sliders size={16} />
                </div>
                <div>
                  <strong>Time Reclaimed Calculator</strong>
                  <span>Interactive semester hours saved estimator</span>
                </div>
              </a>

              <a
                href="#un-partners"
                className="nav-mob-item"
                onClick={() => setMobileOpen(false)}
              >
                <div className="nav-mob-icon" style={{ color: '#EC4899', background: 'rgba(236, 72, 153, 0.12)' }}>
                  <Coffee size={16} />
                </div>
                <div>
                  <strong>Campus Perks</strong>
                  <span>0-min detour on-route cafe pre-orders</span>
                </div>
              </a>

              <a
                href="#un-faq"
                className="nav-mob-item"
                onClick={() => setMobileOpen(false)}
              >
                <div className="nav-mob-icon" style={{ color: '#38BDF8', background: 'rgba(56, 189, 248, 0.12)' }}>
                  <Info size={16} />
                </div>
                <div>
                  <strong>FAQ & Rollout</strong>
                  <span>Fall 2026 university deployment guide</span>
                </div>
              </a>

            </div>

            <div className="nav-mob-cta-box">
              <a
                href="#un-waitlist"
                className="nav-mob-cta-button"
                onClick={() => setMobileOpen(false)}
              >
                <span>Join Campus Priority Waitlist</span>
                <ArrowRight size={15} />
              </a>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
