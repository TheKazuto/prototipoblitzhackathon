import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { parseUnits, formatUnits } from "viem";

import {
  useUserBalance,
  useTotalDeposited,
  useActivePool,
  useRegisteredPools,
  useUSDCBalance,
  useAllowance,
  useDeposit,
  useWithdraw,
  useApprove,
  useFaucet,
} from "../hooks/useVault";
import { usePools, MOCK_POOLS } from "../hooks/usePools";
import { ADDRESSES } from "../config/contracts";

// ─── GLOBAL CSS ──────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --font-ui:      'Outfit', sans-serif;
  --font-mono:    'DM Mono', monospace;

  /* Background layers */
  --bg-deep:      #07080f;
  --bg-mid:       #0d0f1c;

  /* Glass */
  --glass-bg:     rgba(255,255,255,0.055);
  --glass-bg-2:   rgba(255,255,255,0.08);
  --glass-border: rgba(255,255,255,0.12);
  --glass-shine:  rgba(255,255,255,0.18);
  --glass-blur:   blur(28px) saturate(180%);
  --glass-blur-sm:blur(14px) saturate(160%);

  /* Accents */
  --mint:         #30e8a0;
  --mint-dim:     #1db87a;
  --mint-glow:    rgba(48,232,160,0.35);
  --sky:          #38d6f5;
  --sky-glow:     rgba(56,214,245,0.25);
  --violet:       #9d8bff;
  --amber:        #ffcb6b;
  --rose:         #ff6b8a;

  /* Text */
  --text-primary:   rgba(255,255,255,0.95);
  --text-secondary: rgba(255,255,255,0.5);
  --text-tertiary:  rgba(255,255,255,0.28);

  /* Radii */
  --r-sm:   10px;
  --r-md:   16px;
  --r-lg:   22px;
  --r-xl:   30px;
  --r-pill: 999px;
}

html, body { min-height: 100vh; }

body {
  background: var(--bg-deep);
  color: var(--text-primary);
  font-family: var(--font-ui);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
input[type=number] { -moz-appearance: textfield; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 4px; }
`;

// ─── COMPONENT CSS ───────────────────────────────────────────────────────────
const CSS = `
/* ── PAGE ──────────────────────────────────────────────── */
.ym-app {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* ── BACKGROUND ORBS ───────────────────────────────────── */
.ym-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
.ym-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.55;
  will-change: transform;
}
.ym-orb-1 {
  width: 700px; height: 700px;
  background: radial-gradient(circle, #1a6b4a 0%, transparent 70%);
  top: -200px; left: -150px;
  animation: orbFloat1 18s ease-in-out infinite alternate;
}
.ym-orb-2 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, #1a3a6b 0%, transparent 70%);
  top: 100px; right: -100px;
  animation: orbFloat2 22s ease-in-out infinite alternate;
}
.ym-orb-3 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #3a2060 0%, transparent 70%);
  bottom: -100px; left: 30%;
  animation: orbFloat3 16s ease-in-out infinite alternate;
}
.ym-orb-4 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, #6b3a1a 0%, transparent 70%);
  bottom: 200px; right: 200px;
  animation: orbFloat4 20s ease-in-out infinite alternate;
  opacity: 0.3;
}
@keyframes orbFloat1 { to { transform: translate(60px, 80px) scale(1.1); } }
@keyframes orbFloat2 { to { transform: translate(-80px, 60px) scale(0.9); } }
@keyframes orbFloat3 { to { transform: translate(40px, -60px) scale(1.15); } }
@keyframes orbFloat4 { to { transform: translate(-50px, 40px) scale(1.05); } }

/* Fine noise texture over bg */
.ym-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  opacity: 0.4;
  pointer-events: none;
}

/* ── CONTENT ────────────────────────────────────────────── */
.ym-content {
  position: relative;
  z-index: 1;
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 20px 80px;
}

/* ── GLASS MIXIN ────────────────────────────────────────── */
.glass {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  position: relative;
  overflow: hidden;
}
/* Specular top shine */
.glass::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--glass-shine) 30%,
    var(--glass-shine) 70%,
    transparent 100%);
  pointer-events: none;
}

/* ── NAVBAR ─────────────────────────────────────────────── */
.ym-nav {
  position: sticky;
  top: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: rgba(7,8,15,0.6);
  backdrop-filter: blur(40px) saturate(200%);
  -webkit-backdrop-filter: blur(40px) saturate(200%);
  border-bottom: 1px solid var(--glass-border);
}
.ym-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ym-logo-icon {
  width: 34px; height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(48,232,160,0.2), rgba(56,214,245,0.1));
  border: 1px solid rgba(48,232,160,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 16px rgba(48,232,160,0.15), inset 0 1px 0 rgba(255,255,255,0.15);
}
.ym-logo-wordmark {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: var(--text-primary);
}
.ym-logo-wordmark em {
  font-style: normal;
  color: var(--mint);
}
.ym-nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ym-chip {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: var(--r-pill);
  background: rgba(56,214,245,0.08);
  border: 1px solid rgba(56,214,245,0.2);
  color: var(--sky);
  letter-spacing: 0.05em;
}


.ym-btn-back {
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 600;
  padding: 7px 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--r-pill);
  color: rgba(255,255,255,0.45);
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(8px);
}
.ym-btn-back:hover {
  color: rgba(255,255,255,0.85);
  border-color: rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.08);
}

/* ── HERO STATS ─────────────────────────────────────────── */
.ym-hero {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin: 28px 0 20px;
}
.ym-stat {
  border-radius: var(--r-lg);
  padding: 22px 20px 18px;
  transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease;
}
.ym-stat:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}
.ym-stat-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: 0.04em;
  margin-bottom: 10px;
  text-transform: uppercase;
}
.ym-stat-value {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -1.5px;
  line-height: 1;
  color: var(--text-primary);
}
.ym-stat-value.accent-mint  { color: var(--mint); text-shadow: 0 0 20px var(--mint-glow); }
.ym-stat-value.accent-sky   { color: var(--sky);  text-shadow: 0 0 20px var(--sky-glow); }
.ym-stat-sub {
  font-size: 11px;
  color: var(--text-tertiary);
  margin-top: 6px;
  font-weight: 400;
}
.ym-stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  margin-top: 6px;
  padding: 3px 9px;
  border-radius: var(--r-pill);
  background: rgba(48,232,160,0.12);
  color: var(--mint);
  border: 1px solid rgba(48,232,160,0.2);
}

/* ── MAIN GRID ──────────────────────────────────────────── */
.ym-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 16px;
}
.ym-col { display: flex; flex-direction: column; gap: 16px; }

/* ── PANEL ──────────────────────────────────────────────── */
.ym-panel {
  border-radius: var(--r-xl);
  overflow: hidden;
}
.ym-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.ym-panel-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ym-panel-hint {
  font-size: 11px;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
}
.ym-panel-body { padding: 16px 20px; }

/* Live pulse dot */
.ym-pulse {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--mint);
  box-shadow: 0 0 0 0 var(--mint-glow);
  animation: livePulse 2s ease-out infinite;
}
.ym-pulse.sky {
  background: var(--sky);
  box-shadow: 0 0 0 0 var(--sky-glow);
  animation: livePulseSky 2s ease-out infinite;
}
@keyframes livePulse {
  0%   { box-shadow: 0 0 0 0 rgba(48,232,160,0.5); }
  70%  { box-shadow: 0 0 0 6px rgba(48,232,160,0); }
  100% { box-shadow: 0 0 0 0 rgba(48,232,160,0); }
}
@keyframes livePulseSky {
  0%   { box-shadow: 0 0 0 0 rgba(56,214,245,0.5); }
  70%  { box-shadow: 0 0 0 6px rgba(56,214,245,0); }
  100% { box-shadow: 0 0 0 0 rgba(56,214,245,0); }
}

/* ── POOL ITEMS ─────────────────────────────────────────── */
.ym-pool-list { display: flex; flex-direction: column; gap: 10px; }
.ym-pool-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: var(--r-lg);
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  transition: all 0.25s cubic-bezier(.34,1.56,.64,1);
  position: relative;
  overflow: hidden;
  cursor: default;
}
.ym-pool-item::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%);
  pointer-events: none;
}
.ym-pool-item.active {
  background: rgba(48,232,160,0.07);
  border-color: rgba(48,232,160,0.3);
  box-shadow: 0 0 0 1px rgba(48,232,160,0.1), inset 0 1px 0 rgba(48,232,160,0.15), 0 8px 32px rgba(0,0,0,0.3);
}
.ym-pool-item.active::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, var(--mint), transparent);
  border-radius: 0 2px 2px 0;
}
.ym-pool-avatar {
  width: 40px; height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  letter-spacing: -0.5px;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
}
.ym-pool-meta { flex: 1; min-width: 0; }
.ym-pool-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.ym-pool-type {
  font-size: 11px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-top: 1px;
}
.ym-pool-bar-track {
  height: 2px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
}
.ym-pool-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 1.2s cubic-bezier(.4,0,.2,1);
}
.ym-pool-apr-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
  min-width: 72px;
}
.ym-pool-apr {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1;
  color: var(--text-secondary);
}
.ym-pool-apr.best { color: var(--mint); text-shadow: 0 0 16px var(--mint-glow); }
.ym-pool-apr-lbl {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  margin-top: 2px;
}
.ym-active-tag {
  display: inline-block;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--bg-deep);
  background: var(--mint);
  padding: 3px 8px;
  border-radius: var(--r-pill);
  box-shadow: 0 2px 8px rgba(48,232,160,0.4);
  white-space: nowrap;
}

/* ── TABS ───────────────────────────────────────────────── */
.ym-tabs {
  display: flex;
  gap: 4px;
  padding: 6px;
  background: rgba(255,255,255,0.05);
  border-radius: var(--r-md);
  margin-bottom: 18px;
}
.ym-tab {
  flex: 1;
  padding: 9px;
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 600;
  border: none;
  border-radius: var(--r-sm);
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.02em;
}
.ym-tab.active {
  background: var(--glass-bg-2);
  color: var(--text-primary);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12);
}

/* ── INPUT ──────────────────────────────────────────────── */
.ym-input-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}
.ym-input-wrap {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--r-md);
  padding: 0 14px;
  gap: 10px;
  transition: border-color 0.2s, box-shadow 0.2s;
  margin-bottom: 16px;
}
.ym-input-wrap:focus-within {
  border-color: rgba(48,232,160,0.4);
  box-shadow: 0 0 0 3px rgba(48,232,160,0.08), inset 0 1px 0 rgba(255,255,255,0.06);
}
.ym-token {
  font-size: 12px;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--mint);
  white-space: nowrap;
  letter-spacing: 0.04em;
}
.ym-amount-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-ui);
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  padding: 14px 0;
  width: 100%;
  letter-spacing: -0.5px;
}
.ym-amount-input::placeholder { color: var(--text-tertiary); }
.ym-max-btn {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  color: var(--sky);
  background: rgba(56,214,245,0.08);
  border: 1px solid rgba(56,214,245,0.2);
  border-radius: var(--r-pill);
  padding: 4px 10px;
  cursor: pointer;
  letter-spacing: 0.06em;
  transition: all 0.15s;
  white-space: nowrap;
}
.ym-max-btn:hover { background: rgba(56,214,245,0.15); }

/* Info rows */
.ym-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--text-tertiary);
  padding: 5px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.ym-info-row:last-of-type { border-bottom: none; }
.ym-info-row span:last-child { color: var(--text-secondary); font-weight: 500; }
.ym-info-row .green { color: var(--mint) !important; font-weight: 600; }

/* ── BUTTONS ────────────────────────────────────────────── */
.ym-btn-primary {
  width: 100%;
  font-family: var(--font-ui);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 15px;
  border: none;
  border-radius: var(--r-md);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(.34,1.56,.64,1);
  margin-top: 18px;
  position: relative;
  overflow: hidden;
}
.ym-btn-primary::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 50%;
  background: linear-gradient(rgba(255,255,255,0.12), rgba(255,255,255,0));
  border-radius: inherit;
  pointer-events: none;
}
.ym-btn-primary.deposit {
  background: linear-gradient(135deg, var(--mint) 0%, #1dc882 100%);
  color: #042a18;
  box-shadow: 0 4px 20px rgba(48,232,160,0.35), inset 0 1px 0 rgba(255,255,255,0.25);
}
.ym-btn-primary.deposit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(48,232,160,0.45), inset 0 1px 0 rgba(255,255,255,0.3);
}
.ym-btn-primary.withdraw {
  background: rgba(255,255,255,0.07);
  color: var(--text-primary);
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
}
.ym-btn-primary.withdraw:hover:not(:disabled) {
  background: rgba(255,255,255,0.11);
  transform: translateY(-1px);
}
.ym-btn-primary.approve {
  background: linear-gradient(135deg, var(--sky) 0%, #1ab5d4 100%);
  color: #04202a;
  box-shadow: 0 4px 20px var(--sky-glow), inset 0 1px 0 rgba(255,255,255,0.25);
}
.ym-btn-primary:disabled { opacity: 0.35; cursor: not-allowed; transform: none !important; }

.ym-btn-faucet {
  width: 100%;
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 600;
  padding: 10px;
  border-radius: var(--r-md);
  background: rgba(255,203,107,0.07);
  border: 1px solid rgba(255,203,107,0.2);
  color: var(--amber);
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.15s;
}
.ym-btn-faucet:hover:not(:disabled) { background: rgba(255,203,107,0.12); }
.ym-btn-faucet:disabled { opacity: 0.3; cursor: not-allowed; }

/* Approve notice */
.ym-notice {
  font-size: 11px;
  color: var(--amber);
  margin-top: 10px;
  padding: 9px 12px;
  background: rgba(255,203,107,0.06);
  border: 1px solid rgba(255,203,107,0.18);
  border-radius: var(--r-sm);
}

/* ── AGENT PANEL ────────────────────────────────────────── */
.ym-agent-online {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: rgba(48,232,160,0.06);
  border: 1px solid rgba(48,232,160,0.16);
  border-radius: var(--r-md);
  margin-bottom: 14px;
}
.ym-agent-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--mint);
  flex-shrink: 0;
  animation: livePulse 2s ease-out infinite;
}
.ym-agent-status-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--mint);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.ym-agent-timer {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-tertiary);
  margin-left: auto;
}

.ym-reasoning {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: var(--r-md);
  padding: 14px;
  margin-bottom: 14px;
}
.ym-reasoning-lbl {
  font-size: 9px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--sky);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.ym-reasoning-body {
  font-size: 12px;
  line-height: 1.75;
  color: rgba(255,255,255,0.45);
  font-weight: 400;
}
.ym-reasoning-body .hl  { color: var(--mint); font-weight: 600; }
.ym-reasoning-body .hl2 { color: var(--amber); }

.ym-decision-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(48,232,160,0.06);
  border: 1px solid rgba(48,232,160,0.18);
  border-radius: var(--r-md);
  margin-bottom: 12px;
}
.ym-decision-icon { font-size: 20px; }
.ym-decision-body { font-size: 13px; color: rgba(255,255,255,0.7); }
.ym-decision-body strong { color: var(--mint); font-weight: 700; }

.ym-btn-trigger {
  width: 100%;
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 600;
  padding: 12px;
  border-radius: var(--r-md);
  cursor: pointer;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--text-tertiary);
  letter-spacing: 0.02em;
  transition: all 0.2s;
}
.ym-btn-trigger:hover:not(:disabled) {
  border-color: rgba(48,232,160,0.3);
  color: var(--mint);
  background: rgba(48,232,160,0.05);
}
.ym-btn-trigger:disabled { opacity: 0.4; cursor: not-allowed; }
.ym-btn-trigger.running {
  color: var(--mint);
  border-color: rgba(48,232,160,0.5);
  background: rgba(48,232,160,0.06);
  animation: triggerPulse 1.2s ease-in-out infinite;
}
@keyframes triggerPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(48,232,160,0.2); }
  50%      { box-shadow: 0 0 0 6px rgba(48,232,160,0); }
}

/* ── HISTORY ────────────────────────────────────────────── */
.ym-history-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 13px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: background 0.15s;
}
.ym-history-item:last-child { border-bottom: none; }
.ym-history-item:hover { background: rgba(255,255,255,0.02); }
.ym-h-track { display: flex; flex-direction: column; align-items: center; padding-top: 5px; }
.ym-h-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  border: 1.5px solid var(--mint);
  background: var(--bg-deep);
  flex-shrink: 0;
}
.ym-h-line {
  width: 1px; flex: 1;
  min-height: 22px;
  background: linear-gradient(rgba(48,232,160,0.2), transparent);
  margin-top: 4px;
}
.ym-history-item:last-child .ym-h-line { display: none; }
.ym-h-content { flex: 1 }
.ym-h-action { font-size: 13px; font-weight: 500; margin-bottom: 2px; }
.ym-h-action strong { color: var(--mint); }
.ym-h-meta { font-size: 11px; color: var(--text-tertiary); }
.ym-h-gain { font-size: 12px; font-weight: 700; color: var(--mint); white-space: nowrap; font-family: var(--font-mono); }
.ym-h-gain.neg { color: var(--text-tertiary); }

/* ── TOAST ──────────────────────────────────────────────── */
.ym-toast {
  position: fixed;
  bottom: 28px; right: 20px;
  z-index: 999;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 18px;
  border-radius: var(--r-lg);
  background: rgba(13,15,28,0.85);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset;
  font-size: 13px;
  font-weight: 500;
  max-width: 320px;
  animation: toastSlide 0.4s cubic-bezier(.34,1.56,.64,1) forwards;
}
@keyframes toastSlide {
  from { transform: translateY(16px) scale(0.96); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
}
.ym-toast-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--mint); flex-shrink: 0; }
.ym-toast.error .ym-toast-dot { background: var(--rose); }

/* ── STAGGER ANIMATION ──────────────────────────────────── */
.ym-fade-in {
  opacity: 0;
  transform: translateY(14px);
  animation: fadeUp 0.5s cubic-bezier(.4,0,.2,1) forwards;
}
@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
.d1 { animation-delay: 0.05s; }
.d2 { animation-delay: 0.12s; }
.d3 { animation-delay: 0.19s; }
.d4 { animation-delay: 0.26s; }
.d5 { animation-delay: 0.33s; }
.d6 { animation-delay: 0.40s; }

/* ── RESPONSIVE ─────────────────────────────────────────── */
@media (max-width: 960px) {
  .ym-hero { grid-template-columns: 1fr 1fr; }
  .ym-grid  { grid-template-columns: 1fr; }
}
@media (max-width: 560px) {
  .ym-hero { grid-template-columns: 1fr; }
}
`;

// ─── APR DRIFT ───────────────────────────────────────────────────────────────
function useDriftedAprs(pools) {
  const [aprs, setAprs] = useState(() =>
    Object.fromEntries(pools.map((p) => [p.address, p.aprPercent]))
  );
  useEffect(() => {
    setAprs(Object.fromEntries(pools.map((p) => [p.address, p.aprPercent])));
  }, [pools.length]);
  useEffect(() => {
    const iv = setInterval(() => {
      setAprs((prev) => {
        const next = {};
        pools.forEach((p) => {
          const drift = (Math.random() - 0.48) * 0.25;
          next[p.address] = Math.max(1, +((prev[p.address] || p.aprPercent) + drift).toFixed(2));
        });
        return next;
      });
    }, 3500);
    return () => clearInterval(iv);
  }, [pools]);
  return aprs;
}

// ─── REASONING ───────────────────────────────────────────────────────────────
const mkReasoning = (pools, best) => {
  const others = pools.filter((p) => p.address !== best.address);
  const avg = others.reduce((a, b) => a + b.apr, 0) / (others.length || 1);
  const diff = (best.apr - avg).toFixed(1);
  return `Analyzed <span class="hl">${pools.length} active pools</span> on Monad testnet. <span class="hl">${best.name}</span> leads at <span class="hl">${best.apr.toFixed(1)}% APR</span> — <span class="hl2">${diff}pp above average</span>. Risk profile is ${best.risk?.toLowerCase() || "low"}, TVL depth is adequate. Gas cost negligible on Monad. <span class="hl">Recommending allocation to ${best.name}.</span>`;
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function Dashboard({ ConnectButton, onBackToHome }) {
  const { address, isConnected } = useAccount();

  const { data: userBalRaw, refetch: refetchBal } = useUserBalance(address);
  const { data: totalDepRaw } = useTotalDeposited();
  const { data: activePoolAddr } = useActivePool();
  const { data: poolAddrs = [] } = useRegisteredPools();
  const { data: usdcBalRaw, refetch: refetchUsdc } = useUSDCBalance(address);
  const { data: allowanceRaw } = useAllowance(address);

  const contractsDeployed = !!ADDRESSES.Vault;
  const { pools: onChainPools } = usePools(contractsDeployed ? poolAddrs : []);
  const basePools = contractsDeployed && onChainPools.length > 0 ? onChainPools : MOCK_POOLS;
  const aprs = useDriftedAprs(basePools);
  const pools = basePools.map((p) => ({ ...p, apr: aprs[p.address] ?? p.aprPercent }));

  const { deposit, isPending: isDepositing, isConfirming: isDepConfirming } = useDeposit();
  const { withdraw, isPending: isWithdrawing, isConfirming: isWithConfirming } = useWithdraw();
  const { approve, isPending: isApproving } = useApprove();
  const { mint, isPending: isMinting } = useFaucet();

  const [tab, setTab] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [activePool, setActivePool] = useState(null);
  const [agentRunning, setAgentRunning] = useState(false);
  const [reasoning, setReasoning] = useState("");
  const [history, setHistory] = useState([
    { id: 1, from: "MonoVault",  to: "AlphaLend", time: "2h ago",  gain: "+0.4%", reason: "Higher net yield" },
    { id: 2, from: "KuruSwap",   to: "MonoVault",  time: "1d ago", gain: "–1.2%", reason: "Risk threshold", neg: true },
    { id: 3, from: "AlphaLend",  to: "KuruSwap",   time: "2d ago", gain: "+3.7%", reason: "LP incentives spike" },
  ]);
  const [countdown, setCountdown] = useState(86400);
  const [toast, setToast] = useState(null);
  const toastRef = useRef();

  useEffect(() => { if (activePoolAddr) setActivePool(activePoolAddr.toLowerCase()); }, [activePoolAddr]);
  useEffect(() => {
    if (!activePool && pools.length > 0)
      setActivePool([...pools].sort((a, b) => b.apr - a.apr)[0].address.toLowerCase());
  }, [pools.length]);
  useEffect(() => {
    if (pools.length > 0 && !reasoning) {
      const best = [...pools].sort((a, b) => b.apr - a.apr)[0];
      setReasoning(mkReasoning(pools, best));
    }
  }, [pools.length]);
  useEffect(() => {
    const iv = setInterval(() => setCountdown((c) => (c <= 0 ? 86400 : c - 1)), 1000);
    return () => clearInterval(iv);
  }, []);

  const showToast = (msg, error = false) => {
    setToast({ msg, error });
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 4000);
  };

  const handleAction = async () => {
    if (!isConnected) { showToast("Connect your wallet first", true); return; }
    const val = parseFloat(amount);
    if (!val || val <= 0) { showToast("Enter a valid amount", true); return; }
    try {
      if (tab === "deposit") {
        const amountParsed = parseUnits(amount, 6);
        if ((allowanceRaw || 0n) < amountParsed) {
          showToast("Approving USDC spend…");
          await approve(amount);
        }
        showToast("Depositing…");
        await deposit(amount);
        showToast(`Deposited ${val} USDC ✓`);
        refetchBal(); refetchUsdc();
      } else {
        showToast("Withdrawing…");
        await withdraw(amount);
        showToast(`Withdrew ${val} USDC ✓`);
        refetchBal(); refetchUsdc();
      }
      setAmount("");
    } catch (e) {
      showToast(e.shortMessage || e.message || "Transaction failed", true);
    }
  };

  const handleFaucet = async () => {
    try {
      showToast("Minting 10,000 USDC…");
      await mint();
      showToast("10,000 test USDC minted ✓");
      refetchUsdc();
    } catch (e) { showToast(e.shortMessage || "Faucet failed", true); }
  };

  const handleRunAgent = () => {
    if (agentRunning) return;
    setAgentRunning(true);
    setTimeout(() => {
      const sorted = [...pools].sort((a, b) => b.apr - a.apr);
      const best = sorted[0];
      const prev = pools.find((p) => p.address.toLowerCase() === (activePool || ""));
      setReasoning(mkReasoning(pools, best));
      if (!prev || best.address.toLowerCase() !== activePool) {
        const diff = (best.apr - (prev?.apr || 0)).toFixed(1);
        setHistory((h) => [{ id: Date.now(), from: prev?.name || "Unknown", to: best.name, time: "just now", gain: `+${diff}%`, reason: "AI agent decision" }, ...h.slice(0, 9)]);
        setActivePool(best.address.toLowerCase());
        showToast(`AI rebalanced → ${best.name} (${best.apr.toFixed(1)}% APR) ✓`);
      } else {
        showToast("AI confirmed: current pool is optimal ✓");
      }
      setCountdown(86400);
      setAgentRunning(false);
    }, 2800);
  };

  const userBal    = userBalRaw  ? Number(formatUnits(userBalRaw,  6)) : 0;
  const usdcBal    = usdcBalRaw  ? Number(formatUnits(usdcBalRaw,  6)) : 0;
  const activeMeta = pools.find((p) => p.address.toLowerCase() === activePool) || pools[0];
  const currentApr = activeMeta?.apr || 0;
  const dailyYield = userBal > 0 ? ((userBal * currentApr) / 100 / 365).toFixed(4) : "0.0000";
  const maxApr     = Math.max(...pools.map((p) => p.apr), 0.01);
  const sortedPools = [...pools].sort((a, b) => b.apr - a.apr);
  const isWorking  = isDepositing || isDepConfirming || isWithdrawing || isWithConfirming || isApproving;
  const needsApprove = tab === "deposit" && amount && parseFloat(amount) > 0 && contractsDeployed
    && (allowanceRaw || 0n) < parseUnits(amount || "0", 6);

  const fmtCountdown = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  return (
    <>
      <style>{GLOBAL_CSS + CSS}</style>
      <div className="ym-app">
        {/* BACKGROUND */}
        <div className="ym-bg">
          <div className="ym-orb ym-orb-1" />
          <div className="ym-orb ym-orb-2" />
          <div className="ym-orb ym-orb-3" />
          <div className="ym-orb ym-orb-4" />
        </div>

        {/* NAVBAR */}
        <nav className="ym-nav">
          <div className="ym-logo">
            <div className="ym-logo-icon">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                <polygon points="16,2 30,9 30,23 16,30 2,23 2,9" stroke="#30e8a0" strokeWidth="1.5" fill="rgba(48,232,160,0.08)" />
                <circle cx="16" cy="16" r="4" fill="#30e8a0" />
              </svg>
            </div>
            <span className="ym-logo-wordmark">Yield<em>Mind</em></span>
          </div>
          <div className="ym-nav-right">
            {onBackToHome && (
              <button className="ym-btn-back" onClick={onBackToHome}>← Home</button>
            )}
            <span className="ym-chip">MONAD TESTNET</span>
            <ConnectButton />
          </div>
        </nav>

        <div className="ym-content">
          {/* HERO */}
          <div className="ym-hero">
            {[
              { label: "Your Deposit",  value: `$${userBal.toLocaleString("en", { minimumFractionDigits: 2 })}`, sub: "USDC in vault",           cls: "",           delay: "d1" },
              { label: "Current APR",   value: `${currentApr.toFixed(1)}%`,                                       pill: "↑ AI-optimized",         cls: "accent-mint", delay: "d2" },
              { label: "Daily Yield",   value: dailyYield,                                                         sub: "USDC / day (est.)",       cls: "accent-sky",  delay: "d3" },
              { label: "Active Pool",   value: activeMeta?.name || "—",                                            sub: "Auto-selected by agent",  cls: "",            delay: "d4", sm: true },
            ].map((s) => (
              <div key={s.label} className={`ym-stat glass ym-fade-in ${s.delay}`} style={{ borderRadius: "var(--r-lg)" }}>
                <div className="ym-stat-label">{s.label}</div>
                <div className={`ym-stat-value ${s.cls}`} style={s.sm ? { fontSize: 20, paddingTop: 4 } : {}}>{s.value}</div>
                {s.pill && <div className="ym-stat-pill">✦ {s.pill}</div>}
                {s.sub  && <div className="ym-stat-sub">{s.sub}</div>}
              </div>
            ))}
          </div>

          {/* MAIN GRID */}
          <div className="ym-grid">
            {/* LEFT */}
            <div className="ym-col">
              {/* POOLS */}
              <div className="ym-panel glass ym-fade-in d5">
                <div className="ym-panel-head">
                  <span className="ym-panel-title"><span className="ym-pulse" /> Live Pool APRs</span>
                  <span className="ym-panel-hint">refreshes every 3.5s</span>
                </div>
                <div className="ym-panel-body">
                  <div className="ym-pool-list">
                    {sortedPools.map((pool, i) => {
                      const isActive = pool.address.toLowerCase() === activePool;
                      const isBest   = i === 0;
                      const barW     = Math.round((pool.apr / maxApr) * 100);
                      return (
                        <div key={pool.address} className={`ym-pool-item ${isActive ? "active" : ""}`}>
                          <div className="ym-pool-avatar" style={{ background: pool.bg, color: pool.color }}>{pool.icon}</div>
                          <div className="ym-pool-meta">
                            <div className="ym-pool-name">{pool.name}</div>
                            <div className="ym-pool-type">{pool.type}</div>
                            <div className="ym-pool-bar-track">
                              <div className="ym-pool-bar-fill" style={{ width: `${barW}%`, background: pool.color, opacity: 0.7 }} />
                            </div>
                          </div>
                          <div className="ym-pool-apr-block">
                            {isActive && <span className="ym-active-tag">ACTIVE</span>}
                            <div className={`ym-pool-apr ${isBest ? "best" : ""}`}>{pool.apr.toFixed(1)}%</div>
                            <div className="ym-pool-apr-lbl">APR</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* HISTORY */}
              <div className="ym-panel glass ym-fade-in d6">
                <div className="ym-panel-head">
                  <span className="ym-panel-title">Rebalance History</span>
                </div>
                {history.slice(0, 5).map((h) => (
                  <div className="ym-history-item" key={h.id}>
                    <div className="ym-h-track">
                      <div className="ym-h-dot" />
                      <div className="ym-h-line" />
                    </div>
                    <div className="ym-h-content">
                      <div className="ym-h-action"><strong>{h.from}</strong> → <strong>{h.to}</strong></div>
                      <div className="ym-h-meta">{h.time} · {h.reason}</div>
                    </div>
                    <div className={`ym-h-gain ${h.neg ? "neg" : ""}`}>{h.gain}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <div className="ym-col">
              {/* DEPOSIT / WITHDRAW */}
              <div className="ym-panel glass ym-fade-in d5">
                <div className="ym-panel-body">
                  <div className="ym-tabs">
                    <button className={`ym-tab ${tab === "deposit"  ? "active" : ""}`} onClick={() => setTab("deposit")}>Deposit</button>
                    <button className={`ym-tab ${tab === "withdraw" ? "active" : ""}`} onClick={() => setTab("withdraw")}>Withdraw</button>
                  </div>

                  <div className="ym-input-label">Amount</div>
                  <div className="ym-input-wrap">
                    <span className="ym-token">USDC</span>
                    <input
                      className="ym-amount-input"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <button className="ym-max-btn" onClick={() => {
                      if (tab === "withdraw") setAmount(userBal.toString());
                      else setAmount(usdcBal > 0 ? usdcBal.toFixed(2) : "1000");
                    }}>MAX</button>
                  </div>

                  <div className="ym-info-row"><span>Wallet USDC</span><span>${usdcBal.toFixed(2)}</span></div>
                  <div className="ym-info-row"><span>Vault balance</span><span>${userBal.toFixed(2)}</span></div>
                  <div className="ym-info-row"><span>Current APR</span><span className="green">{currentApr.toFixed(1)}%</span></div>
                  <div className="ym-info-row"><span>Network fee</span><span>~0.002 MON</span></div>

                  {needsApprove && <div className="ym-notice">⚠ Approve USDC spend before depositing</div>}

                  <button
                    className={`ym-btn-primary ${tab === "deposit" ? (needsApprove ? "approve" : "deposit") : "withdraw"}`}
                    onClick={handleAction}
                    disabled={!isConnected || isWorking}
                  >
                    {isWorking ? "Processing…"
                      : tab === "deposit"
                        ? (needsApprove ? "Approve USDC" : "Deposit into Vault")
                        : "Withdraw from Vault"}
                  </button>

                  {isConnected && contractsDeployed && (
                    <button className="ym-btn-faucet" onClick={handleFaucet} disabled={isMinting}>
                      {isMinting ? "Minting…" : "🚰 Get 10,000 test USDC (faucet)"}
                    </button>
                  )}
                </div>
              </div>

              {/* AI AGENT */}
              <div className="ym-panel glass ym-fade-in d6">
                <div className="ym-panel-head">
                  <span className="ym-panel-title">
                    <span className="ym-pulse sky" />
                    AI Yield Agent
                  </span>
                </div>
                <div className="ym-panel-body">
                  <div className="ym-agent-online">
                    <div className="ym-agent-dot" />
                    <span className="ym-agent-status-label">Online</span>
                    <span className="ym-agent-timer">Next run {fmtCountdown(countdown)}</span>
                  </div>

                  {reasoning && (
                    <div className="ym-reasoning">
                      <div className="ym-reasoning-lbl">
                        <svg width="9" height="9" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/><line x1="5" y1="3" x2="5" y2="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="5" cy="7" r="0.6" fill="currentColor"/></svg>
                        Agent Reasoning
                      </div>
                      <div className="ym-reasoning-body" dangerouslySetInnerHTML={{ __html: reasoning }} />
                    </div>
                  )}

                  <div className="ym-decision-card">
                    <span className="ym-decision-icon">⚡</span>
                    <span className="ym-decision-body">
                      Funds in <strong>{activeMeta?.name || "—"}</strong> at <strong>{currentApr.toFixed(1)}% APR</strong>
                    </span>
                  </div>

                  <button
                    className={`ym-btn-trigger ${agentRunning ? "running" : ""}`}
                    onClick={handleRunAgent}
                    disabled={agentRunning}
                  >
                    {agentRunning ? "⟳  Analyzing pools…" : "↺  Trigger Manual Rebalance"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TOAST */}
        {toast && (
          <div className={`ym-toast ${toast.error ? "error" : ""}`}>
            <div className="ym-toast-dot" />
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}
