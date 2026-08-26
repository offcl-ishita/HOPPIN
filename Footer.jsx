import React from 'react';
import { Navigation, ShieldCheck, MapPin, ExternalLink, Sparkles, Heart } from 'lucide-react';
import logoImg from './hoppin_logo.png';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="hop-footer">
      <div className="hop-footer-container">
        
        <div className="hop-footer-top">
          
          {/* Brand Info */}
          <div className="hop-ft-brand">
            <div className="hop-logo-link">
              <img src={logoImg} alt="HOPPIN" className="hop-logo-img" />
            </div>
            
            <p className="hop-ft-desc">
              Live crowd telemetry and indoor corridor navigation. Helping students hop bottlenecks, skip elevator rushes, and reclaim their semester time.
            </p>
            
            <div className="hop-ft-privacy-badge">
              <ShieldCheck size={14} className="text-mint" />
              <span className="mono">100% Differential Privacy · Zero Individual Tracking</span>
            </div>
          </div>

          {/* Links Columns */}
          <div className="hop-ft-cols">
            
            <div className="hop-ft-col">
              <h4>Navigation Engine</h4>
              <a href="#un-departure-board">Live Status Board</a>
              <a href="#un-map-simulator">Bypass Cartography</a>
              <a href="#un-directory">7 Architecture Systems</a>
              <a href="#un-calculator">Time Reclaimed Calculator</a>
            </div>

            <div className="hop-ft-col">
              <h4>Pilots & Campus Leads</h4>
              <a href="#un-partners">On-Route Partner Kiosks</a>
              <a href="#un-waitlist">Student Ambassador Program</a>
              <a href="#un-waitlist">Campus Admin Deployment</a>
              <a href="#un-faq">FAQ & Privacy Specs</a>
            </div>

            <div className="hop-ft-col">
              <h4>Fall 2026 Campus Rollout</h4>
              <span className="campus-tag">📍 SRM IST Kattankulathur</span>
              <span className="campus-tag">📍 IIT Delhi (Hauz Khas)</span>
              <span className="campus-tag">📍 BITS Pilani (Main Campus)</span>
              <span className="campus-tag">📍 DU (North Campus)</span>
              <span className="campus-tag">📍 MIT Manipal</span>
            </div>

          </div>

        </div>

        {/* Bottom Bar */}
        <div className="hop-footer-bottom">
          <div className="hop-fb-left mono">
            © {new Date().getFullYear()} HOPPIN Technologies Inc. · <a href="https://hoppin.site" target="_blank" rel="noopener noreferrer">HOPPIN.SITE</a>. All rights reserved.
          </div>
          <div className="hop-fb-right mono">
            <span>ENGINEERED FOR MODERN CAMPUS MOBILITY</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
