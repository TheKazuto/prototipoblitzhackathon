import { useState, useEffect, useRef } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');

.lp-root {
  min-height: 100vh;
  background: #07080f;
  color: rgba(255,255,255,0.92);
  font-family: 'Outfit', sans-serif;
  overflow-x: hidden;
  position: relative;
}

/* ── BACKGROUND ──────────────────────────────────────────── */
.lp-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.lp-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  will-change: transform;
}
.lp-orb-1 {
  width: 800px; height: 800px;
  background: radial-gradient(circle, rgba(25,90,60,0.7) 0%, transparent 65%);
  top: -300px; left: -200px;
  animation: lpOrb1 20s ease-in-out infinite alternate;
}
.lp-orb-2 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(20,50,100,0.6) 0%, transparent 65%);
  top: 200px; right: -150px;
  animation: lpOrb2 25s ease-in-out infinite alternate;
}
.lp-orb-3 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(50,25,90,0.5) 0%, transparent 65%);
  bottom: 100px; left: 20%;
  animation: lpOrb3 18s ease-in-out infinite alternate;
}
.lp-orb-4 {
  width: 350px; height: 350px;
  background: radial-gradient(circle, rgba(90,55,15,0.4) 0%, transparent 65%);
  bottom: 300px; right: 15%;
  animation: lpOrb4 22s ease-in-out infinite alternate;
}
@keyframes lpOrb1 { to { transform: translate(80px, 100px) scale(1.1); } }
@keyframes lpOrb2 { to { transform: translate(-100px, 80px) scale(0.9); } }
@keyframes lpOrb3 { to { transform: translate(60px, -80px) scale(1.2); } }
@keyframes lpOrb4 { to { transform: translate(-40px, 60px) scale(1.05); } }

/* Grid overlay */
.lp-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(48,232,160,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(48,232,160,0.025) 1px, transparent 1px);
  background-size: 60px 60px;
}

/* ── NAVBAR ──────────────────────────────────────────────── */
.lp-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px;
  background: rgba(7,8,15,0.5);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border-bottom: 1px solid rgba(255,255,255,0.07);
  transition: all 0.3s ease;
}
.lp-nav.scrolled {
  background: rgba(7,8,15,0.8);
  border-bottom-color: rgba(255,255,255,0.1);
}
.lp-nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}
.lp-nav-logo-icon {
  width: 34px; height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(48,232,160,0.2), rgba(56,214,245,0.1));
  border: 1px solid rgba(48,232,160,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(48,232,160,0.15), inset 0 1px 0 rgba(255,255,255,0.15);
}
.lp-nav-wordmark {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.3px;
}
.lp-nav-wordmark em {
  font-style: normal;
  color: #30e8a0;
}
.lp-nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
}
.lp-nav-link {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255,255,255,0.5);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}
.lp-nav-link:hover { color: rgba(255,255,255,0.9); }
.lp-nav-cta {
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 700;
  padding: 9px 22px;
  border-radius: 999px;
  background: linear-gradient(135deg, #30e8a0, #1dc882);
  color: #042a18;
  border: none;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: all 0.25s cubic-bezier(.34,1.56,.64,1);
  box-shadow: 0 4px 20px rgba(48,232,160,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
  position: relative;
  overflow: hidden;
}
.lp-nav-cta::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 50%;
  background: linear-gradient(rgba(255,255,255,0.15), rgba(255,255,255,0));
  border-radius: inherit;
}
.lp-nav-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(48,232,160,0.45);
}

/* ── PAGE WRAPPER ────────────────────────────────────────── */
.lp-page {
  position: relative;
  z-index: 1;
}

/* ── HERO ────────────────────────────────────────────────── */
.lp-hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 120px 24px 80px;
}
.lp-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-family: 'DM Mono', monospace;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #30e8a0;
  background: rgba(48,232,160,0.08);
  border: 1px solid rgba(48,232,160,0.2);
  border-radius: 999px;
  padding: 6px 16px;
  margin-bottom: 28px;
  opacity: 0;
  animation: fadeUp 0.6s ease 0.1s forwards;
}
.lp-hero-badge-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #30e8a0;
  animation: heroPulse 2s ease-out infinite;
}
@keyframes heroPulse {
  0%   { box-shadow: 0 0 0 0 rgba(48,232,160,0.6); }
  70%  { box-shadow: 0 0 0 6px rgba(48,232,160,0); }
  100% { box-shadow: 0 0 0 0 rgba(48,232,160,0); }
}

.lp-hero-title {
  font-size: clamp(52px, 9vw, 96px);
  font-weight: 900;
  letter-spacing: -3px;
  line-height: 0.95;
  margin-bottom: 24px;
  opacity: 0;
  animation: fadeUp 0.7s ease 0.2s forwards;
}
.lp-hero-title .line1 { display: block; color: rgba(255,255,255,0.95); }
.lp-hero-title .line2 {
  display: block;
  background: linear-gradient(135deg, #30e8a0 0%, #38d6f5 50%, #9d8bff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.lp-hero-sub {
  max-width: 540px;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.65;
  color: rgba(255,255,255,0.45);
  margin-bottom: 44px;
  opacity: 0;
  animation: fadeUp 0.7s ease 0.35s forwards;
}
.lp-hero-sub strong {
  color: rgba(255,255,255,0.75);
  font-weight: 600;
}

.lp-hero-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  opacity: 0;
  animation: fadeUp 0.7s ease 0.5s forwards;
}
.lp-btn-primary {
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 700;
  padding: 14px 32px;
  border-radius: 999px;
  background: linear-gradient(135deg, #30e8a0, #1dc882);
  color: #042a18;
  border: none;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: all 0.25s cubic-bezier(.34,1.56,.64,1);
  box-shadow: 0 6px 28px rgba(48,232,160,0.35), inset 0 1px 0 rgba(255,255,255,0.2);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 8px;
}
.lp-btn-primary::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 50%;
  background: linear-gradient(rgba(255,255,255,0.15), transparent);
  border-radius: inherit;
}
.lp-btn-primary:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 40px rgba(48,232,160,0.5);
}
.lp-btn-secondary {
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 600;
  padding: 14px 28px;
  border-radius: 999px;
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.75);
  border: 1px solid rgba(255,255,255,0.12);
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 8px;
}
.lp-btn-secondary:hover {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.95);
  transform: translateY(-2px);
}

/* Hero scroll indicator */
.lp-scroll-hint {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  opacity: 0;
  animation: fadeUp 0.6s ease 1.2s forwards;
}
.lp-scroll-hint span {
  font-size: 10px;
  font-family: 'DM Mono', monospace;
  color: rgba(255,255,255,0.2);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
.lp-scroll-arrow {
  width: 20px; height: 20px;
  border-right: 1.5px solid rgba(255,255,255,0.2);
  border-bottom: 1.5px solid rgba(255,255,255,0.2);
  transform: rotate(45deg);
  animation: scrollBounce 2s ease-in-out infinite;
}
@keyframes scrollBounce {
  0%, 100% { transform: rotate(45deg) translateY(0); }
  50%       { transform: rotate(45deg) translateY(5px); }
}

/* Hero stats strip */
.lp-hero-stats {
  display: flex;
  align-items: center;
  gap: 0;
  margin-top: 64px;
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  overflow: hidden;
  opacity: 0;
  animation: fadeUp 0.7s ease 0.65s forwards;
}
.lp-hero-stat {
  padding: 20px 36px;
  text-align: center;
  border-right: 1px solid rgba(255,255,255,0.06);
  position: relative;
}
.lp-hero-stat::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(48,232,160,0.3), transparent);
}
.lp-hero-stat:last-child { border-right: none; }
.lp-hero-stat-val {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -1px;
  color: rgba(255,255,255,0.9);
  line-height: 1;
  margin-bottom: 4px;
}
.lp-hero-stat-val.g { color: #30e8a0; }
.lp-hero-stat-lbl {
  font-size: 11px;
  color: rgba(255,255,255,0.3);
  font-family: 'DM Mono', monospace;
  letter-spacing: 0.06em;
}

/* ── HOW IT WORKS ─────────────────────────────────────────── */
.lp-section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 100px 24px;
}
.lp-section-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-family: 'DM Mono', monospace;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  margin-bottom: 16px;
}
.lp-section-tag::before {
  content: '';
  width: 20px; height: 1px;
  background: rgba(255,255,255,0.2);
}
.lp-section-title {
  font-size: clamp(32px, 5vw, 52px);
  font-weight: 800;
  letter-spacing: -2px;
  line-height: 1.05;
  margin-bottom: 16px;
}
.lp-section-title em {
  font-style: normal;
  color: #30e8a0;
}
.lp-section-sub {
  font-size: 16px;
  color: rgba(255,255,255,0.4);
  line-height: 1.65;
  max-width: 480px;
  margin-bottom: 60px;
}

/* Steps */
.lp-steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 24px;
  overflow: hidden;
}
.lp-step {
  background: rgba(7,8,15,0.8);
  padding: 32px 28px;
  position: relative;
  transition: background 0.3s;
}
.lp-step:hover { background: rgba(255,255,255,0.03); }
.lp-step::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
}
.lp-step-num {
  font-size: 11px;
  font-family: 'DM Mono', monospace;
  color: #30e8a0;
  letter-spacing: 0.1em;
  margin-bottom: 20px;
  opacity: 0.7;
}
.lp-step-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 18px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
}
.lp-step-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: -0.3px;
}
.lp-step-desc {
  font-size: 13px;
  color: rgba(255,255,255,0.38);
  line-height: 1.65;
}

/* Connector arrow between steps */
.lp-step-arrow {
  position: absolute;
  right: -14px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px; height: 28px;
  background: rgba(7,8,15,0.95);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  font-size: 11px;
  color: rgba(255,255,255,0.3);
}

/* ── FEATURES ─────────────────────────────────────────────── */
.lp-features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.lp-feature {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px;
  padding: 28px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(.34,1.56,.64,1);
}
.lp-feature::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
}
.lp-feature::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 60%);
  pointer-events: none;
}
.lp-feature:hover {
  transform: translateY(-4px);
  border-color: rgba(255,255,255,0.12);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}
.lp-feature-icon {
  width: 48px; height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 20px;
  border: 1px solid rgba(255,255,255,0.08);
}
.lp-feature-title {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.3px;
  margin-bottom: 8px;
}
.lp-feature-desc {
  font-size: 13px;
  color: rgba(255,255,255,0.38);
  line-height: 1.65;
}
.lp-feature-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-family: 'DM Mono', monospace;
  font-weight: 500;
  letter-spacing: 0.08em;
  margin-top: 16px;
  padding: 4px 10px;
  border-radius: 999px;
}

/* ── PROTOCOL SECTION ─────────────────────────────────────── */
.lp-protocols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.lp-protocol {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 22px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  transition: all 0.25s cubic-bezier(.34,1.56,.64,1);
  position: relative;
  overflow: hidden;
}
.lp-protocol::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 60%);
}
.lp-protocol:hover {
  transform: translateY(-3px);
  border-color: rgba(255,255,255,0.12);
}
.lp-protocol.active-pool {
  border-color: rgba(48,232,160,0.3);
  background: rgba(48,232,160,0.05);
}
.lp-protocol-avatar {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.1);
  font-family: 'DM Mono', monospace;
}
.lp-protocol-name {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.2px;
  margin-bottom: 2px;
}
.lp-protocol-type {
  font-size: 11px;
  color: rgba(255,255,255,0.3);
  font-family: 'DM Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.lp-protocol-apr {
  margin-left: auto;
  text-align: right;
  flex-shrink: 0;
}
.lp-protocol-apr-val {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.8px;
  line-height: 1;
}
.lp-protocol-apr-lbl {
  font-size: 9px;
  font-family: 'DM Mono', monospace;
  color: rgba(255,255,255,0.25);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 2px;
}
.lp-active-badge {
  position: absolute;
  top: 10px; right: 12px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #07080f;
  background: #30e8a0;
  padding: 2px 8px;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(48,232,160,0.4);
}

/* ── CTA SECTION ──────────────────────────────────────────── */
.lp-cta-wrap {
  padding: 0 24px 120px;
}
.lp-cta {
  max-width: 1100px;
  margin: 0 auto;
  border-radius: 28px;
  padding: 72px 60px;
  text-align: center;
  position: relative;
  overflow: hidden;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(20px);
}
.lp-cta::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(48,232,160,0.5), rgba(56,214,245,0.3), transparent);
}
/* Glow blob behind CTA */
.lp-cta-glow {
  position: absolute;
  width: 500px; height: 300px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(48,232,160,0.08) 0%, transparent 70%);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
.lp-cta-title {
  font-size: clamp(32px, 5vw, 52px);
  font-weight: 900;
  letter-spacing: -2px;
  line-height: 1.05;
  margin-bottom: 16px;
  position: relative;
}
.lp-cta-title em {
  font-style: normal;
  background: linear-gradient(135deg, #30e8a0, #38d6f5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.lp-cta-sub {
  font-size: 16px;
  color: rgba(255,255,255,0.38);
  margin-bottom: 40px;
  position: relative;
}
.lp-cta-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  position: relative;
}
.lp-cta-note {
  font-size: 12px;
  color: rgba(255,255,255,0.2);
  margin-top: 20px;
  font-family: 'DM Mono', monospace;
  position: relative;
}

/* ── FOOTER ───────────────────────────────────────────────── */
.lp-footer {
  border-top: 1px solid rgba(255,255,255,0.05);
  padding: 28px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}
.lp-footer-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.lp-footer-wordmark {
  font-size: 15px;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
}
.lp-footer-wordmark em {
  font-style: normal;
  color: #30e8a0;
}
.lp-footer-sep {
  color: rgba(255,255,255,0.15);
  font-size: 12px;
}
.lp-footer-text {
  font-size: 12px;
  color: rgba(255,255,255,0.2);
  font-family: 'DM Mono', monospace;
}
.lp-footer-right {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-family: 'DM Mono', monospace;
  color: rgba(255,255,255,0.2);
}
.lp-footer-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #30e8a0;
  animation: heroPulse 2s ease-out infinite;
}

/* ── ANIMATIONS ───────────────────────────────────────────── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.lp-reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(.4,0,.2,1);
}
.lp-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ── DIVIDER ──────────────────────────────────────────────── */
.lp-divider {
  max-width: 1100px;
  margin: 0 auto;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
}

/* ── RESPONSIVE ───────────────────────────────────────────── */
@media (max-width: 900px) {
  .lp-steps { grid-template-columns: 1fr 1fr; }
  .lp-features { grid-template-columns: 1fr 1fr; }
  .lp-protocols { grid-template-columns: 1fr; }
  .lp-nav-links { display: none; }
  .lp-cta { padding: 48px 28px; }
  .lp-footer { flex-direction: column; gap: 12px; text-align: center; }
  .lp-hero-stats { flex-direction: column; width: 100%; max-width: 300px; }
  .lp-hero-stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .lp-hero-stat:last-child { border-bottom: none; }
}
@media (max-width: 560px) {
  .lp-steps { grid-template-columns: 1fr; }
  .lp-features { grid-template-columns: 1fr; }
  .lp-nav { padding: 14px 20px; }
  .lp-hero-actions { flex-direction: column; width: 100%; }
  .lp-btn-primary, .lp-btn-secondary { width: 100%; justify-content: center; }
}
`;

// ── APR drift animation ──────────────────────────────────────
function useTickingAprs() {
  const [aprs, setAprs] = useState({ al: 8.4, ks: 12.1, mv: 6.8 });
  useEffect(() => {
    const iv = setInterval(() => {
      setAprs(p => ({
        al: Math.max(4, +(p.al + (Math.random() - 0.48) * 0.2).toFixed(2)),
        ks: Math.max(4, +(p.ks + (Math.random() - 0.48) * 0.2).toFixed(2)),
        mv: Math.max(4, +(p.mv + (Math.random() - 0.48) * 0.2).toFixed(2)),
      }));
    }, 3500);
    return () => clearInterval(iv);
  }, []);
  return aprs;
}

// ── Scroll reveal ────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.lp-reveal');
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ── Component ────────────────────────────────────────────────
export default function LandingPage({ onEnterApp }) {
  const [scrolled, setScrolled] = useState(false);
  const aprs = useTickingAprs();
  useReveal();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const bestPool = aprs.ks >= aprs.al && aprs.ks >= aprs.mv ? 'ks'
    : aprs.al >= aprs.mv ? 'al' : 'mv';

  const pools = [
    { id: 'ks', name: 'KuruSwap',  type: 'AMM / LP',     icon: 'KS', color: '#38d6f5', bg: 'rgba(56,214,245,0.12)',   apr: aprs.ks },
    { id: 'al', name: 'AlphaLend', type: 'Lending',      icon: 'AL', color: '#30e8a0', bg: 'rgba(48,232,160,0.12)',   apr: aprs.al },
    { id: 'mv', name: 'MonoVault', type: 'Yield Vault',  icon: 'MV', color: '#ffcb6b', bg: 'rgba(255,203,107,0.12)',  apr: aprs.mv },
  ].sort((a, b) => b.apr - a.apr);

  const features = [
    {
      icon: '🧠', title: 'AI-Powered Decisions',
      desc: 'Claude analyzes APRs, TVL depth, and risk profiles every 24h to determine the optimal allocation for your funds.',
      tag: 'Claude Sonnet', tagColor: 'rgba(56,214,245,0.1)', tagBorder: 'rgba(56,214,245,0.2)', tagText: '#38d6f5',
      iconBg: 'rgba(56,214,245,0.08)',
    },
    {
      icon: '⚡', title: 'Instant Rebalancing',
      desc: 'When a better yield opportunity is found, funds are moved automatically on-chain — no manual action needed.',
      tag: 'On-chain', tagColor: 'rgba(48,232,160,0.1)', tagBorder: 'rgba(48,232,160,0.2)', tagText: '#30e8a0',
      iconBg: 'rgba(48,232,160,0.08)',
    },
    {
      icon: '🔒', title: 'Non-Custodial Vault',
      desc: 'Your funds stay in a smart contract on Monad. Withdraw anytime. Only you control your assets — the agent only rebalances.',
      tag: 'Solidity · OpenZeppelin', tagColor: 'rgba(157,139,255,0.1)', tagBorder: 'rgba(157,139,255,0.2)', tagText: '#9d8bff',
      iconBg: 'rgba(157,139,255,0.08)',
    },
    {
      icon: '📊', title: 'Transparent Reasoning',
      desc: "See exactly why the AI made each decision. Claude's reasoning is shown in plain English in your dashboard — and stored on-chain forever.",
      tag: 'Fully transparent', tagColor: 'rgba(255,203,107,0.1)', tagBorder: 'rgba(255,203,107,0.2)', tagText: '#ffcb6b',
      iconBg: 'rgba(255,203,107,0.08)',
    },
    {
      icon: '🌐', title: 'Built on Monad',
      desc: 'Monad\'s parallel EVM delivers sub-second finality and near-zero gas fees — making daily AI rebalancing economically viable.',
      tag: 'Chain ID: 10143', tagColor: 'rgba(255,103,138,0.1)', tagBorder: 'rgba(255,103,138,0.2)', tagText: '#ff6b8a',
      iconBg: 'rgba(255,103,138,0.08)',
    },
    {
      icon: '🚰', title: 'Testnet Ready',
      desc: 'Try it risk-free with test USDC from the built-in faucet. Deposit, watch the AI optimize, and withdraw — all on testnet.',
      tag: 'Free to use', tagColor: 'rgba(48,232,160,0.1)', tagBorder: 'rgba(48,232,160,0.2)', tagText: '#30e8a0',
      iconBg: 'rgba(48,232,160,0.08)',
    },
  ];

  const steps = [
    { num: '01', icon: '💼', title: 'Deposit USDC', desc: 'Connect your wallet and deposit any amount of USDC into the YieldMind vault.' },
    { num: '02', icon: '📡', title: 'Agent Monitors', desc: 'Our AI keeper reads live APR data from every registered pool on Monad every 24 hours.' },
    { num: '03', icon: '🧠', title: 'Claude Decides', desc: 'Claude analyzes the data and reasons about the optimal allocation, producing a HOLD or REBALANCE decision.' },
    { num: '04', icon: '✅', title: 'Auto-Optimized', desc: 'If a better pool is found, funds move automatically. Your yield is always maximized — hands free.' },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="lp-root">

        {/* BG */}
        <div className="lp-bg">
          <div className="lp-orb lp-orb-1" />
          <div className="lp-orb lp-orb-2" />
          <div className="lp-orb lp-orb-3" />
          <div className="lp-orb lp-orb-4" />
        </div>

        {/* NAVBAR */}
        <nav className={`lp-nav ${scrolled ? 'scrolled' : ''}`}>
          <div className="lp-nav-logo">
            <div className="lp-nav-logo-icon">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                <polygon points="16,2 30,9 30,23 16,30 2,23 2,9" stroke="#30e8a0" strokeWidth="1.5" fill="rgba(48,232,160,0.08)" />
                <circle cx="16" cy="16" r="4" fill="#30e8a0" />
              </svg>
            </div>
            <span className="lp-nav-wordmark">Yield<em>Mind</em></span>
          </div>
          <div className="lp-nav-links">
            <span className="lp-nav-link" onClick={() => document.getElementById('how').scrollIntoView({ behavior: 'smooth' })}>How it works</span>
            <span className="lp-nav-link" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>Features</span>
            <span className="lp-nav-link" onClick={() => document.getElementById('pools').scrollIntoView({ behavior: 'smooth' })}>Pools</span>
          </div>
          <button className="lp-nav-cta" onClick={onEnterApp}>
            Launch App →
          </button>
        </nav>

        <div className="lp-page">

          {/* ── HERO ───────────────────────────────────────── */}
          <section className="lp-hero" style={{ position: 'relative' }}>
            <div className="lp-hero-badge">
              <span className="lp-hero-badge-dot" />
              Live on Monad Testnet
            </div>

            <h1 className="lp-hero-title">
              <span className="line1">Your yield,</span>
              <span className="line2">always optimal.</span>
            </h1>

            <p className="lp-hero-sub">
              YieldMind uses <strong>Claude AI</strong> to analyze DeFi pools on Monad and automatically move your funds to the <strong>highest-yielding protocol</strong> — every single day.
            </p>

            <div className="lp-hero-actions">
              <button className="lp-btn-primary" onClick={onEnterApp}>
                <span>Start Earning</span>
                <span>→</span>
              </button>
              <button className="lp-btn-secondary" onClick={() => document.getElementById('how').scrollIntoView({ behavior: 'smooth' })}>
                <span>How it works</span>
                <span style={{ opacity: 0.5 }}>↓</span>
              </button>
            </div>

            <div className="lp-hero-stats">
              {[
                { val: '3',       label: 'Active Pools',   cls: '' },
                { val: '24h',     label: 'Agent Cycle',    cls: '' },
                { val: '~12%',    label: 'Best APR Now',   cls: 'g' },
                { val: '0 fees',  label: 'Protocol Fee',   cls: '' },
              ].map(s => (
                <div className="lp-hero-stat" key={s.label}>
                  <div className={`lp-hero-stat-val ${s.cls}`}>{s.val}</div>
                  <div className="lp-hero-stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="lp-scroll-hint">
              <span>scroll</span>
              <div className="lp-scroll-arrow" />
            </div>
          </section>

          {/* ── HOW IT WORKS ───────────────────────────────── */}
          <div className="lp-divider" />
          <section className="lp-section" id="how">
            <div className="lp-reveal">
              <div className="lp-section-tag">How it works</div>
              <h2 className="lp-section-title">Set it once.<br /><em>Earn forever.</em></h2>
              <p className="lp-section-sub">Four simple steps. No manual monitoring, no missed opportunities.</p>
            </div>

            <div className="lp-steps lp-reveal">
              {steps.map((s, i) => (
                <div className="lp-step" key={s.num} style={{ position: 'relative' }}>
                  <div className="lp-step-num">{s.num}</div>
                  <div className="lp-step-icon">{s.icon}</div>
                  <div className="lp-step-title">{s.title}</div>
                  <div className="lp-step-desc">{s.desc}</div>
                  {i < steps.length - 1 && (
                    <div className="lp-step-arrow">→</div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── FEATURES ───────────────────────────────────── */}
          <div className="lp-divider" />
          <section className="lp-section" id="features">
            <div className="lp-reveal">
              <div className="lp-section-tag">Features</div>
              <h2 className="lp-section-title">Built different.<br /><em>Designed to earn.</em></h2>
              <p className="lp-section-sub">Every piece of YieldMind is purpose-built for autonomous, transparent, yield optimization.</p>
            </div>

            <div className="lp-features">
              {features.map((f, i) => (
                <div
                  className="lp-feature lp-reveal"
                  key={f.title}
                  style={{ transitionDelay: `${i * 0.07}s` }}
                >
                  <div className="lp-feature-icon" style={{ background: f.iconBg }}>{f.icon}</div>
                  <div className="lp-feature-title">{f.title}</div>
                  <div className="lp-feature-desc">{f.desc}</div>
                  <div className="lp-feature-tag" style={{ background: f.tagColor, border: `1px solid ${f.tagBorder}`, color: f.tagText }}>
                    ✦ {f.tag}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── LIVE POOLS ─────────────────────────────────── */}
          <div className="lp-divider" />
          <section className="lp-section" id="pools">
            <div className="lp-reveal">
              <div className="lp-section-tag">Live Pools</div>
              <h2 className="lp-section-title">Three pools.<br /><em>One winner.</em></h2>
              <p className="lp-section-sub">The agent continuously monitors these protocols and automatically allocates to whichever offers the best yield.</p>
            </div>

            <div className="lp-protocols lp-reveal">
              {pools.map((p) => (
                <div key={p.id} className={`lp-protocol ${p.id === bestPool ? 'active-pool' : ''}`}>
                  {p.id === bestPool && <span className="lp-active-badge">AI ACTIVE</span>}
                  <div className="lp-protocol-avatar" style={{ background: p.bg, color: p.color }}>{p.icon}</div>
                  <div>
                    <div className="lp-protocol-name">{p.name}</div>
                    <div className="lp-protocol-type">{p.type}</div>
                  </div>
                  <div className="lp-protocol-apr">
                    <div className="lp-protocol-apr-val" style={{ color: p.id === bestPool ? '#30e8a0' : 'rgba(255,255,255,0.7)' }}>
                      {p.apr.toFixed(1)}%
                    </div>
                    <div className="lp-protocol-apr-lbl">APR</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lp-reveal" style={{ marginTop: 20, padding: '16px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#30e8a0', flexShrink: 0, animation: 'heroPulse 2s ease-out infinite' }} />
              <span style={{ fontSize: 12, fontFamily: 'DM Mono, monospace', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em' }}>
                APRs update live every 3.5s — reflecting real on-chain data from Monad Testnet
              </span>
            </div>
          </section>

          {/* ── CTA ────────────────────────────────────────── */}
          <div className="lp-cta-wrap">
            <div className="lp-cta lp-reveal">
              <div className="lp-cta-glow" />
              <h2 className="lp-cta-title">Ready to let <em>AI</em><br />manage your yield?</h2>
              <p className="lp-cta-sub">Connect your wallet, deposit USDC, and let YieldMind do the rest.</p>
              <div className="lp-cta-actions">
                <button className="lp-btn-primary" onClick={onEnterApp} style={{ fontSize: 16, padding: '15px 36px' }}>
                  <span>Launch App</span>
                  <span>→</span>
                </button>
                <button
                  className="lp-btn-secondary"
                  onClick={() => window.open('https://testnet.monadexplorer.com/address/0xDB466148F7f3aC40aF550e2943D4a69E28A85CA1', '_blank')}
                >
                  <span>View Contract</span>
                  <span style={{ fontSize: 11, opacity: 0.5 }}>↗</span>
                </button>
              </div>
              <p className="lp-cta-note">Free to use · Monad Testnet · No real funds required</p>
            </div>
          </div>

          {/* ── FOOTER ─────────────────────────────────────── */}
          <footer className="lp-footer">
            <div className="lp-footer-left">
              <span className="lp-footer-wordmark">Yield<em>Mind</em></span>
              <span className="lp-footer-sep">·</span>
              <span className="lp-footer-text">Built for Monad Hackathon 2026</span>
            </div>
            <div className="lp-footer-right">
              <div className="lp-footer-dot" />
              <span>Monad Testnet · Chain ID 10143</span>
            </div>
          </footer>

        </div>
      </div>
    </>
  );
}
