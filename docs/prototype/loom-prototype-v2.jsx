import React, { useState, useEffect, useRef } from 'react';
import { ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import {
  ChevronRight, ChevronDown, Calendar, AlertTriangle,
  CheckCircle2, ArrowUpRight, ArrowDownRight, Minus,
  X, ExternalLink, FileText, MessageSquare, Mic, Mail,
  Layers, GitCompare, Network, ListChecks, Inbox, Settings,
  Building2, Search, History, ChevronsLeft, Pin,
  FileDown, ArrowRight, Activity, Command,
  HelpCircle, Wifi, RotateCw, MoreHorizontal,
  Sparkles, EyeOff
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Typography & motion + loom motif background
// ─────────────────────────────────────────────────────────────────
const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400&family=Manrope:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
.font-display { font-family: 'Newsreader', Georgia, serif; font-feature-settings: 'ss01'; }
.font-ui { font-family: 'Manrope', -apple-system, system-ui, sans-serif; }
.font-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
.weave-bg {
  background-image:
    repeating-linear-gradient(0deg, rgba(120,100,60,0.025) 0 1px, transparent 1px 9px),
    repeating-linear-gradient(90deg, rgba(120,100,60,0.025) 0 1px, transparent 1px 9px);
}
.scroll-area::-webkit-scrollbar { width: 6px; height: 6px; }
.scroll-area::-webkit-scrollbar-track { background: transparent; }
.scroll-area::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 3px; }

@keyframes panel-in {
  from { transform: translateX(12px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}
@keyframes pulse-once {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}
.animate-panel-in { animation: panel-in 240ms ease-out; }
.animate-fade-in { animation: fade-in 160ms ease-out; }
.animate-pulse-once { animation: pulse-once 220ms ease-in-out; }
.skeleton {
  background: linear-gradient(90deg, #f5f5f4 0%, #fafaf9 50%, #f5f5f4 100%);
  background-size: 200px 100%;
  animation: shimmer 1200ms linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .animate-panel-in, .animate-fade-in, .animate-pulse-once, .skeleton { animation: none; }
}
.warp-stroke { stroke-dasharray: 600; stroke-dashoffset: 600; animation: warp-draw 600ms ease-out forwards; }
.weft-stroke { stroke-dasharray: 400; stroke-dashoffset: 400; animation: warp-draw 600ms ease-out forwards; }
.crossing-pop { opacity: 0; animation: fade-in 220ms ease-out forwards; }
@keyframes warp-draw {
  to { stroke-dashoffset: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .warp-stroke, .weft-stroke, .crossing-pop { animation: none; stroke-dashoffset: 0; opacity: 1; }
}
`;

// ─────────────────────────────────────────────────────────────────
// Mock data — Panasonic Wave 2
// ─────────────────────────────────────────────────────────────────
const ARENAS = [
  { id: 'panasonic', name: 'Panasonic', region: 'JP',
    engagements: [
      { id: 'wave2', name: 'Wave 2 Migration', status: 'active', triage: 12, hyps: 5 },
      { id: 'wave3', name: 'Wave 3 Scoping', status: 'active', triage: 3, hyps: 2 },
    ]},
  { id: 'fivestar', name: 'Five-Star Business Finance', region: 'IN',
    engagements: [{ id: 'fs-mod', name: 'Core Modernization', status: 'active', triage: 5, hyps: 4 }]},
  { id: 'aws', name: 'AWS Partnership', region: 'SEA',
    engagements: [{ id: 'sea', name: 'SEA Coverage Plan', status: 'active', triage: 0, hyps: 3 }]},
];

const TODAY = [
  { time: '10:00', dur: '60m', title: 'Panasonic Wave 2 — SteerCo',
    attendees: ['Tatsuya Sato', 'Takeshi Yamada', 'Madhavan', 'Phani', 'Suresh'],
    atoms: [
      { kind: 'pending', text: 'Wave 2 budget reallocation pending Tatsuya sign-off', hyp: 'h5' },
      { kind: 'overdue', text: 'Customer network topology diagrams not yet received', hyp: 'h1', meta: 'Due May 20 · 5 days late' },
      { kind: 'risk', text: 'Cutover-window concern raised by Tatsuya in May 15 email', hyp: 'h1', meta: 'severity: high' },
    ]},
  { time: '14:00', dur: '30m', title: '1CH Internal — Wave 2 staffing',
    attendees: ['Suresh', 'Phani'],
    atoms: [{ kind: 'ask', text: 'Suresh requesting additional Basis consultant', hyp: 'h2', meta: 'internal' }]},
  { time: '16:30', dur: '30m', title: 'Madhavan 1:1',
    attendees: ['Madhavan (AWS PSA)', 'Phani'],
    atoms: [{ kind: 'ask', text: 'AWS SAP-on-AWS workshop slot — last raised May 10', hyp: 'h3', meta: 'asks-of-AWS' }]},
];

const HYPS = [
  { id: 'h1', label: 'H1', type: 'Delivery',
    statement: 'Wave 2 SAP cutover completes by September 30 with zero data-loss incidents.',
    state: { progress: 62, confidence: 'amber', momentum: 'stable' },
    counts: { decisions: 3, commitments: 6, asks: 2, risks: 2, status: 4 },
    items: [
      { id: 'a1', kind: 'decision', date: 'May 12', text: 'CTO Tatsuya approved S/4HANA target architecture at SteerCo.',
        src: { type: 'teams', label: 'Teams transcript · May 12 SteerCo', detail: 'paragraph 47',
          excerpt: '…Tatsuya: "We will proceed with the S/4HANA target as proposed. The target architecture is approved subject to the network validation work that Takeshi-san is leading. Phani-san, please update the RACI to reflect this and we can confirm at the next steering committee."…' }},
      { id: 'a2', kind: 'commitment', date: 'Due May 24', text: 'Phani to share revised RACI matrix.',
        status: 'open', owner: 'Phani',
        src: { type: 'email', label: 'Email · "RE: RACI revision"', detail: 'May 14',
          excerpt: 'From: Tatsuya Sato\nDate: May 14\n\n"Phani-san, aligning with what we agreed in the SteerCo, please share the revised RACI by end of next week so we can socialise it with the wider Panasonic team before the June review."' }},
      { id: 'a3', kind: 'commitment', date: 'Due May 20', text: 'Customer to provide network topology diagrams.',
        status: 'overdue', owner: 'Takeshi',
        src: { type: 'teams', label: 'Teams transcript · May 8 sync', detail: 'paragraph 12',
          excerpt: '…Takeshi: "I will get the network topology diagrams to you by May 20. We need to coordinate with the Yokohama infra team but they have committed to the date."…' }},
      { id: 'a4', kind: 'risk', date: 'May 15', text: 'Wave 1 cutover delay (8 days) compresses Wave 2 prep window.',
        severity: 'high', owner: 'Phani',
        src: { type: 'note', label: 'Dictation · May 15 commute', detail: '2m 14s audio',
          excerpt: 'Just got off the call with Suresh. Wave 1 cutover slipped 8 days because of the customer Basis team being short on hands during the data-validation step. That eats into our Wave 2 prep — we now have 22 working days instead of 30.' }},
      { id: 'a5', kind: 'status', date: 'May 19', text: '3 of 5 testing tracks reported green at standup.',
        src: { type: 'teams', label: 'Teams transcript · May 19 standup', detail: 'paragraph 8',
          excerpt: '…Suresh: "On testing — UAT track is green, integration track is green, performance track is green. Security is amber, we have an open finding from the Yokohama team. Cutover-rehearsal is amber."…' }},
      { id: 'a6', kind: 'ask', date: 'May 18', text: 'Need confirmed cutover-weekend resource availability from customer.',
        side: 'customer',
        src: { type: 'email', label: 'Email · sent to Takeshi', detail: 'May 18',
          excerpt: '"Takeshi-san, ahead of the June 15 review I would like to confirm the cutover-weekend resource availability on the Panasonic side. Specifically Basis, network, and security on-call."' }},
    ]},
  { id: 'h2', label: 'H2', type: 'Capability transfer',
    statement: 'Customer Basis team owns 70% of L2 issues by Wave 2 mid-point.',
    state: { progress: 38, confidence: 'amber', momentum: 'slowing' },
    counts: { decisions: 1, commitments: 3, asks: 4, risks: 1, status: 2 },
    items: [
      { id: 'b1', kind: 'status', date: 'May 19', text: 'L2 ownership at 38% — flat for two weeks.',
        src: { type: 'teams', label: 'Teams transcript · May 19 standup', detail: 'paragraph 14' }},
      { id: 'b2', kind: 'risk', date: 'May 16', text: 'Basis team headcount remains 1 below plan; backfill not approved by Panasonic HR.',
        severity: 'medium', owner: 'Suresh',
        src: { type: 'email', label: 'Email · Suresh weekly update', detail: 'May 16' }},
    ]},
  { id: 'h3', label: 'H3', type: 'Relationship',
    statement: 'Madhavan (AWS PSA) actively defends 1CH technical positioning at June SteerCo.',
    state: { progress: 75, confidence: 'green', momentum: 'strengthening' },
    counts: { decisions: 0, commitments: 2, asks: 3, risks: 0, status: 5 },
    items: [
      { id: 'c1', kind: 'status', date: 'May 17', text: 'Madhavan attended pre-SteerCo prep session and aligned on talking points.',
        src: { type: 'teams', label: 'Teams transcript · May 17 prep', detail: 'paragraph 22' }},
    ]},
  { id: 'h4', label: 'H4', type: 'Quality',
    statement: 'Wave 1 lessons-learned reduce Wave 2 rework by more than 40%.',
    state: { progress: 55, confidence: 'green', momentum: 'stable' },
    counts: { decisions: 2, commitments: 4, asks: 1, risks: 1, status: 3 }, items: [] },
  { id: 'h5', label: 'H5', type: 'Stakeholder alignment',
    statement: 'Steering committee approves revised cutover plan at June 15 review.',
    state: { progress: 20, confidence: 'amber', momentum: 'stable' },
    counts: { decisions: 1, commitments: 1, asks: 2, risks: 1, status: 1 }, items: [] },
];

const TIMELINE = [
  { week: 'Apr 7',  h1Progress: 30, h1Conf: 50, decisions: 1, commitments: 2, risks: 0 },
  { week: 'Apr 14', h1Progress: 38, h1Conf: 60, decisions: 0, commitments: 3, risks: 1 },
  { week: 'Apr 21', h1Progress: 45, h1Conf: 65, decisions: 2, commitments: 1, risks: 0 },
  { week: 'Apr 28', h1Progress: 50, h1Conf: 55, decisions: 0, commitments: 2, risks: 2 },
  { week: 'May 5',  h1Progress: 55, h1Conf: 50, decisions: 1, commitments: 4, risks: 1 },
  { week: 'May 12', h1Progress: 60, h1Conf: 55, decisions: 3, commitments: 2, risks: 1 },
  { week: 'May 19', h1Progress: 62, h1Conf: 55, decisions: 1, commitments: 3, risks: 1 },
  { week: 'May 26', h1Progress: 62, h1Conf: 55, decisions: 0, commitments: 2, risks: 0 },
];

const PIVOTAL = [
  { week: 'Apr 28', label: 'Wave 1 cutover delayed 8 days', kind: 'risk' },
  { week: 'May 12', label: 'CTO approved target architecture', kind: 'decision' },
];

const DIFF_WOW = [
  { hyp: 'H1', dim: 'progress',   last: '60%',     curr: '62%',          delta: '+2', tone: 'neutral' },
  { hyp: 'H1', dim: 'confidence', last: 'amber',   curr: 'amber',        delta: '—',  tone: 'neutral' },
  { hyp: 'H1', dim: 'momentum',   last: 'stable',  curr: 'stable',       delta: '—',  tone: 'neutral' },
  { hyp: 'H2', dim: 'progress',   last: '36%',     curr: '38%',          delta: '+2', tone: 'neutral' },
  { hyp: 'H2', dim: 'momentum',   last: 'stable',  curr: 'slowing',      delta: '↓',  tone: 'down' },
  { hyp: 'H3', dim: 'progress',   last: '65%',     curr: '75%',          delta: '+10', tone: 'up' },
  { hyp: 'H3', dim: 'momentum',   last: 'stable',  curr: 'strengthening', delta: '↑',  tone: 'up' },
  { hyp: 'H4', dim: 'progress',   last: '53%',     curr: '55%',          delta: '+2', tone: 'neutral' },
  { hyp: 'H5', dim: 'progress',   last: '15%',     curr: '20%',          delta: '+5', tone: 'up' },
];

const STAKEHOLDERS = ['Tatsuya', 'Takeshi', 'Madhavan', 'Suresh', 'Phani'];
const WEAVE = {
  h1: { Tatsuya: 3, Takeshi: 2, Madhavan: 0, Suresh: 2, Phani: 3 },
  h2: { Tatsuya: 0, Takeshi: 1, Madhavan: 0, Suresh: 3, Phani: 2 },
  h3: { Tatsuya: 0, Takeshi: 0, Madhavan: 3, Suresh: 0, Phani: 2 },
  h4: { Tatsuya: 1, Takeshi: 1, Madhavan: 1, Suresh: 2, Phani: 2 },
  h5: { Tatsuya: 3, Takeshi: 0, Madhavan: 0, Suresh: 0, Phani: 2 },
};

// Command palette commands
const COMMANDS = [
  { cat: 'Navigate', label: 'Open engagement: Panasonic Wave 2', shortcut: '', icon: Building2 },
  { cat: 'Navigate', label: 'Open engagement: Five-Star Core Modernization', shortcut: '', icon: Building2 },
  { cat: 'Navigate', label: 'Switch to Hypotheses tab', shortcut: '⌘1', icon: Layers },
  { cat: 'Navigate', label: 'Switch to Timeline tab', shortcut: '⌘2', icon: Activity },
  { cat: 'Navigate', label: 'Switch to Diff tab', shortcut: '⌘3', icon: GitCompare },
  { cat: 'Navigate', label: 'Switch to Composition tab', shortcut: '⌘4', icon: Network },
  { cat: 'Navigate', label: 'Toggle provenance panel', shortcut: '⌘⌥I', icon: FileText },
  { cat: 'Navigate', label: 'Toggle sidebar', shortcut: '⌘⌥1', icon: ChevronsLeft },
  { cat: 'Triage',   label: 'Open triage queue', shortcut: '', icon: Inbox },
  { cat: 'Triage',   label: 'Confirm next state-change proposal', shortcut: 'C', icon: CheckCircle2 },
  { cat: 'Brief',    label: 'Refresh briefs now', shortcut: '⌘R', icon: RotateCw },
  { cat: 'Brief',    label: 'Export current brief', shortcut: '⌘E', icon: FileDown },
  { cat: 'Help',     label: 'Show keyboard shortcuts', shortcut: '?', icon: HelpCircle },
  { cat: 'Settings', label: 'Open settings', shortcut: '⌘,', icon: Settings },
  { cat: 'System',   label: 'Run loom doctor', shortcut: '', icon: Activity },
];

// ─────────────────────────────────────────────────────────────────
// Visual primitives
// ─────────────────────────────────────────────────────────────────
const STATE_TONE = {
  green: { dot: 'bg-emerald-500', text: 'text-emerald-700', soft: 'bg-emerald-50' },
  amber: { dot: 'bg-amber-500',   text: 'text-amber-700',   soft: 'bg-amber-50' },
  red:   { dot: 'bg-rose-500',    text: 'text-rose-700',    soft: 'bg-rose-50' },
};

const KIND_META = {
  decision:   { label: 'Decision',   icon: CheckCircle2, color: 'text-stone-700', bg: 'bg-stone-100' },
  commitment: { label: 'Commitment', icon: ListChecks,   color: 'text-teal-700',  bg: 'bg-teal-50' },
  ask:        { label: 'Ask',        icon: ArrowRight,   color: 'text-amber-800', bg: 'bg-amber-50' },
  risk:       { label: 'Risk',       icon: AlertTriangle,color: 'text-rose-700',  bg: 'bg-rose-50' },
  status:     { label: 'Status',     icon: Activity,     color: 'text-sky-700',   bg: 'bg-sky-50' },
};

const SOURCE_ICON = { teams: MessageSquare, email: Mail, note: Mic, doc: FileText };

const Pill = ({ children, tone = 'neutral', size = 'md', title }) => {
  const tones = {
    neutral: 'bg-stone-100 text-stone-700 ring-stone-200',
    green:   'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber:   'bg-amber-50 text-amber-700 ring-amber-200',
    red:     'bg-rose-50 text-rose-700 ring-rose-200',
    teal:    'bg-teal-50 text-teal-700 ring-teal-200',
  };
  const sizes = { sm: 'px-1.5 py-0.5 text-[10px]', md: 'px-2 py-0.5 text-[11px]' };
  return <span title={title} className={`inline-flex items-center gap-1 rounded-full ring-1 font-medium font-ui transition-colors ${tones[tone]} ${sizes[size]}`}>{children}</span>;
};

const MomentumIcon = ({ momentum, title }) => {
  const t = title || `Momentum: ${momentum} — interpretive · operational`;
  if (momentum === 'strengthening') return <ArrowUpRight title={t} size={12} className="text-emerald-600" />;
  if (momentum === 'slowing')        return <ArrowDownRight title={t} size={12} className="text-rose-600" />;
  return <Minus title={t} size={12} className="text-stone-400" />;
};

const Skeleton = ({ className = '', height = 12 }) => (
  <div className={`skeleton rounded ${className}`} style={{ height }} />
);

// ─────────────────────────────────────────────────────────────────
// Toolbar
// ─────────────────────────────────────────────────────────────────
function Toolbar({ engagementName, connectivity, onPalette, onShortcuts, onDemoMenu, demoOpen }) {
  const conn = connectivity === 'normal'
    ? { dot: 'bg-emerald-500', label: 'All systems', tone: 'green', tip: 'Loom Core ✓ · Apple AI ✓ · Claude ✓' }
    : connectivity === 'degraded'
      ? { dot: 'bg-amber-500', label: 'Apple AI offline', tone: 'amber', tip: 'Apple AI sidecar offline. Atom extraction is falling back to Claude (slower).' }
      : { dot: 'bg-stone-400', label: 'Local only', tone: 'neutral', tip: 'Apple AI ✗ · Claude ✗ · Loom Core ✓ — reading from cache.' };

  return (
    <div className="h-11 shrink-0 border-b border-stone-200/80 bg-stone-50/80 backdrop-blur flex items-center px-3 gap-2 select-none">
      {/* Traffic lights */}
      <div className="flex gap-1.5 mr-2">
        <span className="w-3 h-3 rounded-full bg-rose-400/80" />
        <span className="w-3 h-3 rounded-full bg-amber-400/80" />
        <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
      </div>

      {/* Title (centered would be ideal but flex-1 works) */}
      <div className="flex items-baseline gap-2 ml-2">
        <span className="font-display text-[13px] text-stone-800 font-medium">Loom</span>
        <span className="text-stone-300">·</span>
        <span className="font-ui text-[12px] text-stone-600">{engagementName}</span>
      </div>

      <div className="flex-1" />

      {/* Connectivity pill */}
      <button
        title={conn.tip}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-stone-100 transition-colors"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${conn.dot} ${connectivity !== 'normal' ? 'animate-pulse-once' : ''}`} />
        <span className="font-ui text-[11px] text-stone-600">{conn.label}</span>
      </button>

      {/* Command palette */}
      <button
        onClick={onPalette}
        title="Open command palette (⌘K)"
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-stone-100 text-stone-500 transition-colors"
      >
        <Command size={12} />
        <span className="font-mono text-[10px]">⌘K</span>
      </button>

      {/* Help */}
      <button onClick={onShortcuts} title="Keyboard shortcuts (?)"
        className="p-1.5 rounded-md hover:bg-stone-100 text-stone-500 transition-colors">
        <HelpCircle size={13} />
      </button>

      {/* Demo menu */}
      <button onClick={onDemoMenu} title="Demo: toggle UI states"
        className={`p-1.5 rounded-md transition-colors ${demoOpen ? 'bg-amber-100 text-amber-800' : 'hover:bg-stone-100 text-stone-500'}`}>
        <Sparkles size={13} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Banners
// ─────────────────────────────────────────────────────────────────
function Banner({ tone = 'amber', icon: Icon, title, children, onAction, actionLabel, onDismiss }) {
  const tones = {
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    rose: 'bg-rose-50 border-rose-200 text-rose-900',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    stone: 'bg-stone-50 border-stone-200 text-stone-700',
  };
  return (
    <div className={`border-b ${tones[tone]} px-8 py-2.5 flex items-start gap-3 animate-fade-in`}>
      {Icon && <Icon size={14} className="shrink-0 mt-0.5" />}
      <div className="flex-1 font-ui text-[12px] leading-snug">
        {title && <span className="font-medium">{title} </span>}
        {children}
      </div>
      {onAction && (
        <button onClick={onAction} className="font-ui text-[11.5px] font-medium underline underline-offset-2 hover:no-underline">
          {actionLabel}
        </button>
      )}
      {onDismiss && (
        <button onClick={onDismiss} className="p-0.5 rounded hover:bg-black/5 transition-colors"><X size={13} /></button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────────────────────────
function Sidebar({ activeView, onNav, expandedArenas, toggleArena, selected, onSelect, collapsed }) {
  if (collapsed) {
    return (
      <aside className="w-[56px] shrink-0 border-r border-stone-200/80 bg-stone-50/60 flex flex-col items-center py-3 gap-2">
        <button title="Triage (12 awaiting)" onClick={() => onNav('triage')}
          className={`p-2 rounded-md ${activeView === 'triage' ? 'bg-stone-200/70' : 'hover:bg-stone-100'}`}>
          <Inbox size={14} className="text-stone-600" />
        </button>
        <button title="Migration" onClick={() => onNav('migration')}
          className={`p-2 rounded-md ${activeView === 'migration' ? 'bg-stone-200/70' : 'hover:bg-stone-100'}`}>
          <History size={14} className="text-stone-600" />
        </button>
        <div className="flex-1" />
        <button title="Settings" onClick={() => onNav('settings')}
          className="p-2 rounded-md hover:bg-stone-100">
          <Settings size={14} className="text-stone-500" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-[244px] shrink-0 border-r border-stone-200/80 flex flex-col bg-stone-50/60">
      <div className="px-4 pt-3 pb-3 flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 22 22" className="text-amber-700">
          <line x1="3" y1="6" x2="19" y2="6" stroke="currentColor" strokeWidth="1" />
          <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="1" />
          <line x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="1" />
          <line x1="6" y1="3" x2="6" y2="19" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <line x1="11" y1="3" x2="11" y2="19" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <line x1="16" y1="3" x2="16" y2="19" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        </svg>
        <span className="font-display text-[16px] tracking-tight text-stone-900">Loom</span>
        <span className="font-mono text-[9px] text-stone-400 ml-auto">Work</span>
      </div>

      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white ring-1 ring-stone-200/80 text-stone-400 hover:ring-stone-300 transition-colors cursor-text">
          <Search size={13} />
          <span className="font-ui text-[12px]">Search engagements, atoms…</span>
          <span className="ml-auto font-mono text-[10px] text-stone-400">⌘L</span>
        </div>
      </div>

      <nav className="px-2">
        <SidebarItem icon={Inbox} label="Triage" badge={20}
          tooltip="Triage queue: 3 state-change proposals, 14 atoms, 3 ambiguous routings"
          active={activeView === 'triage'} onClick={() => onNav('triage')} />
        <SidebarItem icon={History} label="Migration" badge={14}
          tooltip="14 records pending review"
          active={activeView === 'migration'} onClick={() => onNav('migration')} />
      </nav>

      <div className="mt-4 px-2 flex-1 overflow-y-auto scroll-area">
        <div className="px-2 pb-1 text-[10px] tracking-[0.12em] uppercase font-ui font-medium text-stone-400">
          Arenas
        </div>
        {ARENAS.map(arena => {
          const open = expandedArenas[arena.id];
          return (
            <div key={arena.id} className="mb-1">
              <button
                onClick={() => toggleArena(arena.id)}
                className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-stone-100 transition-colors"
              >
                {open ? <ChevronDown size={12} className="text-stone-400" /> : <ChevronRight size={12} className="text-stone-400" />}
                <Building2 size={12} className="text-stone-400" />
                <span className="font-ui text-[13px] text-stone-700 truncate flex-1 text-left">{arena.name}</span>
                <span className="font-mono text-[9px] text-stone-400">{arena.region}</span>
              </button>
              {open && (
                <div className="ml-5 border-l border-stone-200/80">
                  {arena.engagements.map(eng => {
                    const isSel = activeView === 'engagement' && selected === eng.id;
                    return (
                      <button
                        key={eng.id}
                        onClick={() => { onNav('engagement'); onSelect(eng.id); }}
                        className={`w-full flex items-center gap-2 pl-3 pr-2 py-1.5 text-left transition-colors ${isSel ? 'bg-amber-50/70 border-l-2 border-amber-700 -ml-px' : 'hover:bg-stone-100 border-l-2 border-transparent -ml-px'}`}
                      >
                        <span className={`font-ui text-[12.5px] truncate flex-1 ${isSel ? 'text-stone-900 font-medium' : 'text-stone-600'}`}>{eng.name}</span>
                        {eng.triage > 0 && (
                          <span title={`${eng.triage} items awaiting triage`} className={`font-mono text-[10px] px-1.5 rounded-full ${isSel ? 'bg-amber-100 text-amber-800' : 'bg-stone-200/70 text-stone-600'}`}>{eng.triage}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-2 py-2 border-t border-stone-200/80">
        <SidebarItem icon={Settings} label="Settings" onClick={() => onNav('settings')} active={activeView === 'settings'} />
      </div>
    </aside>
  );
}

const SidebarItem = ({ icon: Icon, label, badge, active, onClick, tooltip }) => (
  <button
    onClick={onClick}
    title={tooltip}
    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors ${active ? 'bg-stone-200/70 text-stone-900' : 'hover:bg-stone-100 text-stone-600'}`}
  >
    <Icon size={13} className={active ? 'text-stone-700' : 'text-stone-500'} />
    <span className="font-ui text-[13px] flex-1">{label}</span>
    {badge != null && badge > 0 && (
      <span className="font-mono text-[10px] px-1.5 rounded-full bg-stone-200/70 text-stone-600">{badge}</span>
    )}
  </button>
);

// ─────────────────────────────────────────────────────────────────
// Engagement header & today
// ─────────────────────────────────────────────────────────────────
function EngagementHeader({ onOpenTriage, loading }) {
  if (loading) {
    return (
      <div className="px-8 pt-6 pb-3 border-b border-stone-200/80 space-y-3">
        <Skeleton className="w-32" height={9} />
        <Skeleton className="w-2/3" height={26} />
        <div className="flex gap-2"><Skeleton className="w-16" height={18} /><Skeleton className="w-16" height={18} /><Skeleton className="w-16" height={18} /></div>
      </div>
    );
  }
  return (
    <div className="px-8 pt-6 pb-3 border-b border-stone-200/80">
      <div className="flex items-center gap-2 text-[11px] font-ui text-stone-500">
        <span>Panasonic</span>
        <ChevronRight size={11} />
        <span className="text-stone-700">Wave 2 Migration</span>
      </div>
      <div className="mt-1 flex items-baseline gap-3 flex-wrap">
        <h1 className="font-display text-[28px] tracking-tight text-stone-900 leading-tight">Panasonic Wave 2 Migration</h1>
        <Pill tone="green">active</Pill>
        <span className="font-mono text-[11px] text-stone-400">5 hypotheses · 23 atoms · last brief Tue 07:00</span>
      </div>
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <Pill title="Confidence high"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> 2 green</Pill>
        <Pill title="Confidence mid"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"/> 3 amber</Pill>
        <Pill title="Confidence low"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"/> 0 red</Pill>
        <button
          onClick={onOpenTriage}
          title="Open triage queue · 3 state-change proposals, 7 atoms, 2 ambiguous routings"
          className="ml-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100/70 hover:bg-amber-100 text-amber-900 font-ui text-[11.5px] font-medium ring-1 ring-amber-200 transition-colors"
        >
          <Inbox size={12} /> 12 awaiting triage
        </button>
        <div className="ml-auto flex items-center gap-1">
          <button title="Refresh briefs (⌘R)" className="p-1.5 rounded-md hover:bg-stone-100 text-stone-500 transition-colors"><RotateCw size={13} /></button>
          <button title="Export brief (⌘E)" className="p-1.5 rounded-md hover:bg-stone-100 text-stone-500 transition-colors"><FileDown size={13} /></button>
          <button title="More" className="p-1.5 rounded-md hover:bg-stone-100 text-stone-500 transition-colors"><MoreHorizontal size={13} /></button>
        </div>
      </div>
    </div>
  );
}

function TodayStrip({ loading }) {
  if (loading) {
    return (
      <div className="px-8 py-4 border-b border-stone-200/80 bg-amber-50/30 grid grid-cols-3 gap-3">
        {[0,1,2].map(i => (
          <div key={i} className="bg-white rounded-lg ring-1 ring-stone-200/80 p-3 space-y-2">
            <Skeleton className="w-1/2" /><Skeleton className="w-3/4" /><Skeleton className="w-2/3" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="px-8 py-4 border-b border-stone-200/80 bg-amber-50/30">
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={13} className="text-amber-800" />
        <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.1em] text-amber-900">Today · Tue Apr 26</span>
        <span className="font-mono text-[10px] text-stone-500">3 meetings touching this engagement</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {TODAY.map((m, i) => (
          <div key={i} className="bg-white rounded-lg ring-1 ring-stone-200/80 hover:ring-stone-300 p-3 transition-all">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[11px] text-stone-700 font-medium">{m.time}</span>
              <span className="font-mono text-[10px] text-stone-400">{m.dur}</span>
            </div>
            <div className="font-ui text-[12.5px] text-stone-900 mt-0.5 leading-tight">{m.title}</div>
            <div className="font-ui text-[10.5px] text-stone-500 mt-1 truncate" title={m.attendees.join(', ')}>{m.attendees.join(' · ')}</div>
            {m.atoms.length > 0 && (
              <div className="mt-2.5 pt-2.5 border-t border-stone-100 space-y-1.5">
                {m.atoms.map((a, j) => (
                  <div key={j} className="flex items-start gap-1.5">
                    <AtomKindGlyph kind={a.kind} />
                    <div className="flex-1 min-w-0">
                      <div className="font-ui text-[11.5px] text-stone-700 leading-snug">{a.text}</div>
                      <div className="font-mono text-[9.5px] text-stone-400 mt-0.5">
                        {a.hyp.toUpperCase()}{a.meta ? ` · ${a.meta}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const AtomKindGlyph = ({ kind }) => {
  const map = {
    pending:  { color: 'bg-stone-400',  label: 'P', tip: 'Pending' },
    overdue:  { color: 'bg-rose-500',   label: 'O', tip: 'Overdue commitment' },
    risk:     { color: 'bg-rose-500',   label: 'R', tip: 'Risk' },
    ask:      { color: 'bg-amber-600',  label: 'A', tip: 'Ask' },
    decision: { color: 'bg-stone-700',  label: 'D', tip: 'Decision' },
  };
  const m = map[kind] || map.pending;
  return <span title={m.tip} className={`mt-0.5 w-3.5 h-3.5 rounded-sm ${m.color} text-white font-mono text-[8px] flex items-center justify-center shrink-0`}>{m.label}</span>;
};

// ─────────────────────────────────────────────────────────────────
// Tab bar
// ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'hypotheses',  label: 'Hypotheses',  icon: Layers,    shortcut: '⌘1' },
  { id: 'timeline',    label: 'Timeline',    icon: Activity,  shortcut: '⌘2' },
  { id: 'diff',        label: 'Diff',        icon: GitCompare, shortcut: '⌘3' },
  { id: 'composition', label: 'Composition', icon: Network,   shortcut: '⌘4' },
];

function TabBar({ active, onChange }) {
  return (
    <div className="px-8 border-b border-stone-200/80 bg-white">
      <div className="flex">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            title={`${t.label} (${t.shortcut})`}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-[12.5px] font-ui border-b-2 -mb-px transition-colors ${active === t.id ? 'border-amber-700 text-stone-900 font-medium' : 'border-transparent text-stone-500 hover:text-stone-700'}`}
          >
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Hypotheses tab
// ─────────────────────────────────────────────────────────────────
function HypothesesTab({ selectedHyp, setSelectedHyp, onOpenProvenance, demoEmpty }) {
  const hyp = HYPS.find(h => h.id === selectedHyp) || HYPS[0];
  return (
    <div className="flex flex-1 min-h-0 animate-fade-in">
      <div className="w-[320px] border-r border-stone-200/80 overflow-y-auto scroll-area">
        <div className="px-4 pt-4 pb-2 text-[10px] tracking-[0.12em] uppercase font-ui text-stone-400">Hypotheses (warp)</div>
        {HYPS.map(h => {
          const isSel = h.id === selectedHyp;
          const tone = STATE_TONE[h.state.confidence];
          return (
            <button
              key={h.id}
              onClick={() => setSelectedHyp(h.id)}
              className={`w-full text-left px-4 py-3 border-l-2 transition-colors ${isSel ? 'bg-amber-50/40 border-amber-700' : 'border-transparent hover:bg-stone-50'}`}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-mono text-[10px] text-stone-500">{h.label}</span>
                <span className="font-ui text-[10px] text-stone-400">{h.type}</span>
                <span className="ml-auto flex items-center gap-1.5">
                  <span title={`Confidence: ${h.state.confidence} — interpretive · operational`} className={`w-2 h-2 rounded-full ${tone.dot}`} />
                  <MomentumIcon momentum={h.state.momentum} />
                </span>
              </div>
              <div className="font-display text-[13.5px] leading-snug text-stone-800 line-clamp-3">{h.statement}</div>
              <div className="mt-2 flex items-center gap-3 font-mono text-[9.5px] text-stone-500">
                <span>{h.state.progress}%</span>
                <span>·</span>
                <span>{h.counts.commitments} cmt</span>
                <span>{h.counts.risks} risk</span>
                <span>{h.counts.asks} ask</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto scroll-area">
        <HypothesisDetail hyp={hyp} onOpenProvenance={onOpenProvenance} demoEmpty={demoEmpty} />
      </div>
    </div>
  );
}

function HypothesisDetail({ hyp, onOpenProvenance, demoEmpty }) {
  const items = demoEmpty ? [] : hyp.items;
  return (
    <div className="px-8 py-6 animate-fade-in">
      <div className="flex items-baseline gap-3 mb-1">
        <span className="font-mono text-[11px] text-stone-500">{hyp.label}</span>
        <Pill>{hyp.type}</Pill>
      </div>
      <h2 className="font-display text-[22px] leading-snug text-stone-900 max-w-2xl">{hyp.statement}</h2>

      <div className="mt-6 grid grid-cols-3 gap-4 max-w-2xl">
        <StateDim label="Progress" value={`${hyp.state.progress}%`} sub="evidence-driven" interpretive={false}>
          <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
            <div className="h-full bg-stone-700 transition-all duration-500" style={{ width: `${hyp.state.progress}%` }} />
          </div>
        </StateDim>
        <StateDim label="Confidence" value={hyp.state.confidence} sub="interpretive · operational" interpretive>
          <div className="flex gap-1">
            {['red', 'amber', 'green'].map(c => (
              <div key={c} className={`flex-1 h-1.5 rounded-full transition-colors ${c === hyp.state.confidence ? STATE_TONE[c].dot : 'bg-stone-100'}`} />
            ))}
          </div>
        </StateDim>
        <StateDim label="Momentum" value={hyp.state.momentum} sub="interpretive · operational" interpretive>
          <div className="flex items-center gap-1.5 text-stone-700">
            <MomentumIcon momentum={hyp.state.momentum} />
            <span className="font-ui text-[11px] capitalize">{hyp.state.momentum}</span>
          </div>
        </StateDim>
      </div>

      <div className="mt-5 flex items-center gap-2 max-w-2xl flex-wrap">
        <span className="font-ui text-[10px] uppercase tracking-[0.12em] text-stone-400">Atoms (weft)</span>
        <span className="text-stone-200">·</span>
        {Object.entries(hyp.counts).map(([k, v]) => (
          <span key={k} className="font-mono text-[10.5px] text-stone-600">
            <span className="text-stone-900">{v}</span> {k}
          </span>
        ))}
      </div>

      <div className="mt-6">
        <div className="font-ui text-[10px] uppercase tracking-[0.12em] text-stone-400 mb-3">Recent evidence</div>
        {items.length === 0 ? (
          <EmptyState
            glyph="thread"
            title="No evidence attached yet"
            body="Atoms will appear here as they are extracted from transcripts, dictations, and email. The first atom typically arrives within an hour of capture."
            actionLabel="Show inbox folder"
          />
        ) : (
          <div className="space-y-2">
            {items.map(it => <AtomCard key={it.id} item={it} onOpenProvenance={onOpenProvenance} />)}
          </div>
        )}
      </div>
    </div>
  );
}

const StateDim = ({ label, value, sub, children, interpretive }) => (
  <div>
    <div className="flex items-baseline justify-between">
      <span className="font-ui text-[10px] uppercase tracking-[0.1em] text-stone-400">{label}</span>
      <span className="font-mono text-[11px] text-stone-700">{value}</span>
    </div>
    <div className="mt-1.5">{children}</div>
    <div className={`mt-1 font-ui text-[10px] ${interpretive ? 'text-stone-400 italic' : 'text-stone-400'}`}>{sub}</div>
  </div>
);

function AtomCard({ item, onOpenProvenance }) {
  const meta = KIND_META[item.kind];
  const Icon = meta.icon;
  const SrcIcon = SOURCE_ICON[item.src.type] || FileText;
  const overdue = item.status === 'overdue';
  return (
    <div className={`group rounded-lg ring-1 transition-all duration-150 bg-white p-3 ${overdue ? 'ring-rose-200 bg-rose-50/30 hover:ring-rose-300' : 'ring-stone-200/70 hover:ring-stone-300 hover:-translate-y-px hover:shadow-sm'}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 w-7 h-7 rounded-md flex items-center justify-center ${meta.bg}`}>
          <Icon size={13} className={meta.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-ui text-[10px] uppercase tracking-[0.1em] ${meta.color}`}>{meta.label}</span>
            <span className="font-mono text-[10px] text-stone-400">{item.date}</span>
            {item.severity && <Pill tone={item.severity === 'high' ? 'red' : 'amber'} size="sm" title={`Severity: ${item.severity}`}>{item.severity}</Pill>}
            {item.owner && <span className="font-mono text-[10px] text-stone-500">· {item.owner}</span>}
            {item.status === 'overdue' && <Pill tone="red" size="sm">overdue</Pill>}
            {item.status === 'open' && <Pill tone="amber" size="sm">open</Pill>}
            {item.side && <Pill tone="teal" size="sm">asks-of-{item.side}</Pill>}
          </div>
          <div className="font-ui text-[13px] text-stone-800 mt-1 leading-snug">{item.text}</div>
          <button
            onClick={() => onOpenProvenance(item)}
            title="Open provenance (Space)"
            className="mt-2 flex items-center gap-1.5 font-ui text-[10.5px] text-stone-500 hover:text-amber-800 transition-colors"
          >
            <SrcIcon size={11} /> {item.src.label}
            {item.src.detail && <span className="font-mono text-[9.5px] text-stone-400">· {item.src.detail}</span>}
            <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────
function EmptyState({ glyph, title, body, actionLabel, onAction }) {
  return (
    <div className="bg-stone-50/60 ring-1 ring-stone-200/60 rounded-lg p-10 flex flex-col items-center text-center max-w-xl mx-auto">
      <svg width="32" height="32" viewBox="0 0 32 32" className="text-stone-300 mb-3">
        {glyph === 'thread' ? (
          <line x1="2" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="1" />
        ) : (
          <>
            <line x1="2" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="1" />
            <line x1="16" y1="2" x2="16" y2="30" stroke="currentColor" strokeWidth="1" />
          </>
        )}
      </svg>
      <div className="font-display text-[15px] text-stone-700 mb-1">{title}</div>
      <div className="font-ui text-[12px] text-stone-500 leading-relaxed max-w-sm">{body}</div>
      {actionLabel && (
        <button onClick={onAction} className="mt-3 font-ui text-[11.5px] text-amber-800 hover:text-amber-900 underline underline-offset-2 transition-colors">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Timeline tab
// ─────────────────────────────────────────────────────────────────
function TimelineTab({ selectedHyp, setSelectedHyp }) {
  const [layers, setLayers] = useState({ progress: true, confidence: true, atoms: false, pivotal: true });
  const toggle = k => setLayers(l => ({ ...l, [k]: !l[k] }));
  const hyp = HYPS.find(h => h.id === selectedHyp) || HYPS[0];

  return (
    <div className="flex-1 overflow-y-auto scroll-area px-8 py-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-ui text-[10px] uppercase tracking-[0.1em] text-stone-400">Hypothesis</span>
        <select
          value={selectedHyp}
          onChange={e => setSelectedHyp(e.target.value)}
          className="font-ui text-[12px] bg-white ring-1 ring-stone-200 hover:ring-stone-300 focus:ring-amber-700 focus:outline-none rounded-md px-2 py-1 transition-colors"
        >
          {HYPS.map(h => <option key={h.id} value={h.id}>{h.label} — {h.type}</option>)}
        </select>
      </div>
      <h3 className="font-display text-[18px] text-stone-900 max-w-2xl mt-1">{hyp.statement}</h3>

      <div className="mt-5 flex items-center gap-2 flex-wrap">
        <span className="font-ui text-[10px] uppercase tracking-[0.1em] text-stone-400 mr-1">Layers</span>
        <LayerChip label="Progress" active={layers.progress} onClick={() => toggle('progress')} dotClass="bg-stone-700"
          tip="Evidence-driven progress over time. Factual." />
        <LayerChip label="Confidence band" active={layers.confidence} onClick={() => toggle('confidence')} dotClass="bg-amber-400"
          tip="Confidence — interpretive · operational. Regenerated weekly from recent evidence." />
        <LayerChip label="Atom volume" active={layers.atoms} onClick={() => toggle('atoms')} dotClass="bg-teal-500"
          tip="Stacked atom counts per week: decisions, commitments, risks." />
        <LayerChip label="Pivotal events" active={layers.pivotal} onClick={() => toggle('pivotal')} dotClass="bg-rose-500"
          tip="Manually-marked moments that shifted the thread." />
      </div>

      <div className="mt-5 bg-white ring-1 ring-stone-200 rounded-lg p-4 weave-bg">
        <div style={{ width: '100%', height: 360 }}>
          <ResponsiveContainer>
            <ComposedChart data={TIMELINE} margin={{ top: 14, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#e7e5e4" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#78716c' }} />
              <YAxis yAxisId="pct" domain={[0, 100]} tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#78716c' }} />
              <YAxis yAxisId="cnt" orientation="right" domain={[0, 8]} tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#78716c' }} hide={!layers.atoms} />
              <Tooltip
                contentStyle={{ fontFamily: 'Manrope', fontSize: 11, borderRadius: 6, border: '1px solid #e7e5e4' }}
                labelStyle={{ fontFamily: 'JetBrains Mono', fontSize: 10 }}
              />
              {layers.confidence && (
                <Area yAxisId="pct" type="monotone" dataKey="h1Conf" fill="#fcd34d" fillOpacity={0.18} stroke="none" name="confidence" />
              )}
              {layers.progress && (
                <Line yAxisId="pct" type="monotone" dataKey="h1Progress" stroke="#292524" strokeWidth={1.8} dot={{ r: 2.5, fill: '#292524' }} name="progress" />
              )}
              {layers.atoms && <Bar yAxisId="cnt" dataKey="decisions"   fill="#0f766e" stackId="atoms" name="decisions" />}
              {layers.atoms && <Bar yAxisId="cnt" dataKey="commitments" fill="#14b8a6" stackId="atoms" name="commitments" />}
              {layers.atoms && <Bar yAxisId="cnt" dataKey="risks"       fill="#e11d48" stackId="atoms" name="risks" />}
              {layers.pivotal && PIVOTAL.map((p, i) => (
                <ReferenceLine key={i} yAxisId="pct" x={p.week}
                  stroke={p.kind === 'risk' ? '#e11d48' : '#a16207'} strokeDasharray="3 3" strokeWidth={1}
                  label={{ value: p.label, position: 'top', fill: p.kind === 'risk' ? '#e11d48' : '#a16207', fontSize: 9, fontFamily: 'Manrope' }} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 font-ui text-[10.5px] text-stone-400 italic">
          Confidence and momentum are interpretive layers. They exist for current operations; they do not accrete into long-term memory.
        </div>
      </div>

      <div className="mt-6">
        <div className="font-ui text-[10px] uppercase tracking-[0.12em] text-stone-400 mb-3">Pivotal events on this thread</div>
        <div className="space-y-2 max-w-2xl">
          {PIVOTAL.map((p, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 bg-white rounded-md ring-1 ring-stone-200/70 hover:ring-stone-300 transition-colors">
              <span className={`w-1.5 h-1.5 rounded-full ${p.kind === 'risk' ? 'bg-rose-500' : 'bg-amber-700'}`} />
              <span className="font-mono text-[11px] text-stone-500 w-16">{p.week}</span>
              <span className="font-ui text-[12.5px] text-stone-800 flex-1">{p.label}</span>
              <Pill tone={p.kind === 'risk' ? 'red' : 'amber'} size="sm">{p.kind}</Pill>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const LayerChip = ({ label, active, onClick, dotClass, tip }) => (
  <button
    onClick={onClick}
    title={tip}
    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ring-1 font-ui text-[11px] transition-all ${active ? 'bg-stone-900 text-stone-50 ring-stone-900' : 'bg-white text-stone-600 ring-stone-200 hover:ring-stone-300'}`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${dotClass} ${active ? 'opacity-100' : 'opacity-50'}`} />
    {label}
  </button>
);

// ─────────────────────────────────────────────────────────────────
// Diff tab
// ─────────────────────────────────────────────────────────────────
function DiffTab() {
  return (
    <div className="flex-1 overflow-y-auto scroll-area px-8 py-6 animate-fade-in">
      <div className="flex items-baseline gap-3 mb-1">
        <h3 className="font-display text-[18px] text-stone-900">Diff</h3>
        <span className="font-mono text-[11px] text-stone-500">Tue Apr 26 brief vs. Tue Apr 19 brief</span>
      </div>
      <div className="font-ui text-[12px] text-stone-500 max-w-2xl">
        What moved on this engagement in the last seven days, and how the hypothesis set itself changed.
      </div>

      <div className="mt-6">
        <div className="font-ui text-[10px] uppercase tracking-[0.12em] text-stone-400 mb-3">Week-over-week — hypothesis state</div>
        <div className="bg-white rounded-lg ring-1 ring-stone-200/80 overflow-hidden">
          <div className="grid grid-cols-[60px_120px_1fr_1fr_70px] px-4 py-2 border-b border-stone-200/80 bg-stone-50/60 font-ui text-[10px] uppercase tracking-[0.1em] text-stone-500">
            <div>Hyp</div><div>Dim</div><div>Last Tue</div><div>This Tue</div><div className="text-right">Δ</div>
          </div>
          {DIFF_WOW.map((row, i) => (
            <div key={i} className={`grid grid-cols-[60px_120px_1fr_1fr_70px] px-4 py-2 items-center border-b border-stone-100 last:border-b-0 transition-colors ${row.tone === 'down' ? 'bg-rose-50/30' : row.tone === 'up' ? 'bg-emerald-50/30' : ''}`}>
              <div className="font-mono text-[11px] text-stone-700">{row.hyp}</div>
              <div className="font-ui text-[11.5px] text-stone-600 capitalize">{row.dim}</div>
              <div className="font-mono text-[11.5px] text-stone-500">{row.last}</div>
              <div className="font-mono text-[11.5px] text-stone-900">{row.curr}</div>
              <div className={`font-mono text-[12px] text-right ${row.tone === 'down' ? 'text-rose-700' : row.tone === 'up' ? 'text-emerald-700' : 'text-stone-400'}`}>{row.delta}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="font-ui text-[10px] uppercase tracking-[0.12em] text-stone-400 mb-3">Engagement composition</div>
        <div className="grid grid-cols-3 gap-3">
          <CompCard label="Hypotheses" value="5 → 5" sub="No additions, no merges, no removals." />
          <CompCard label="Atoms added" value="+8" sub="3 decisions · 4 commitments · 1 risk" />
          <CompCard label="Triage outcomes" value="3 confirmed · 1 overridden" sub="2 atoms dismissed · 0 ambiguous routings cleared" />
        </div>
      </div>
    </div>
  );
}

const CompCard = ({ label, value, sub }) => (
  <div className="bg-white rounded-lg ring-1 ring-stone-200/80 p-4 hover:ring-stone-300 transition-colors">
    <div className="font-ui text-[10px] uppercase tracking-[0.1em] text-stone-400">{label}</div>
    <div className="font-display text-[20px] text-stone-900 mt-1">{value}</div>
    <div className="font-ui text-[11px] text-stone-500 mt-1.5 leading-snug">{sub}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────────
// Composition tab — warp & weft
// ─────────────────────────────────────────────────────────────────
function CompositionTab({ setSelectedHyp, setTab }) {
  return (
    <div className="flex-1 overflow-y-auto scroll-area px-8 py-6 animate-fade-in">
      <h3 className="font-display text-[18px] text-stone-900">Composition</h3>
      <div className="font-ui text-[12px] text-stone-500 max-w-2xl mt-1">
        The whole fabric of this engagement: hypotheses (warp) crossing stakeholders (weft). Atom intensity at each crossing shows where the evidence is concentrating.
      </div>

      <div className="mt-6 bg-white rounded-lg ring-1 ring-stone-200/80 p-6">
        <WarpWeftDiagram setSelectedHyp={setSelectedHyp} setTab={setTab} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg ring-1 ring-stone-200/80 p-4">
          <div className="font-ui text-[10px] uppercase tracking-[0.12em] text-stone-400 mb-2">State summary</div>
          <div className="space-y-1.5">
            {HYPS.map(h => {
              const tone = STATE_TONE[h.state.confidence];
              return (
                <button
                  key={h.id}
                  onClick={() => { setSelectedHyp(h.id); setTab('hypotheses'); }}
                  className="w-full flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-stone-50 text-left transition-colors"
                >
                  <span className="font-mono text-[10px] text-stone-500 w-6">{h.label}</span>
                  <span className={`w-2 h-2 rounded-full ${tone.dot}`} />
                  <span className="font-mono text-[10px] text-stone-500 w-10">{h.state.progress}%</span>
                  <MomentumIcon momentum={h.state.momentum} />
                  <span className="font-display text-[12.5px] text-stone-800 flex-1 truncate">{h.statement}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="bg-white rounded-lg ring-1 ring-stone-200/80 p-4">
          <div className="font-ui text-[10px] uppercase tracking-[0.12em] text-stone-400 mb-2">Cross-hypothesis patterns</div>
          <div className="space-y-2 font-ui text-[12px] text-stone-700 leading-snug">
            <p><span className="font-medium">Tatsuya</span> appears in H1 (delivery) and H5 (alignment) — same person, two threads. State on either should not be read independently.</p>
            <p><span className="font-medium">Suresh</span> is the only stakeholder with weight on H2 (capability transfer). Single-point-of-failure for that hypothesis.</p>
            <p>No stakeholder appears across all five threads. Phani is on four — expected for the engagement owner.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WarpWeftDiagram({ setSelectedHyp, setTab }) {
  const W = 760, H = 360;
  const leftPad = 120, topPad = 60;
  const rowGap = 50, colGap = 110;
  const rows = HYPS;
  const cols = STAKEHOLDERS;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 700 }}>
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#fafaf9" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />

        {cols.map((s, i) => (
          <g key={s}>
            <text x={leftPad + i * colGap} y={topPad - 25} fontFamily="Manrope" fontSize="11" fill="#44403c" textAnchor="middle">{s}</text>
            <line
              className="weft-stroke"
              style={{ animationDelay: `${300 + i * 30}ms` }}
              x1={leftPad + i * colGap} y1={topPad - 12}
              x2={leftPad + i * colGap} y2={topPad + (rows.length - 1) * rowGap + 18}
              stroke="#a8a29e" strokeWidth="0.5" strokeDasharray="2 3"
            />
          </g>
        ))}

        {rows.map((h, r) => {
          const y = topPad + r * rowGap;
          return (
            <g key={h.id}>
              <text x={leftPad - 18} y={y + 4} fontFamily="JetBrains Mono" fontSize="10" fill="#78716c" textAnchor="end">{h.label}</text>
              <circle cx={leftPad - 8} cy={y} r={3}
                fill={h.state.confidence === 'green' ? '#10b981' : h.state.confidence === 'amber' ? '#f59e0b' : '#f43f5e'} />
              <line
                className="warp-stroke"
                style={{ animationDelay: `${r * 60}ms` }}
                x1={leftPad} y1={y}
                x2={leftPad + (cols.length - 1) * colGap + 10} y2={y}
                stroke="#a16207" strokeWidth="1" opacity="0.5"
              />
              {cols.map((s, c) => {
                const intensity = WEAVE[h.id][s];
                if (!intensity) return null;
                const cx = leftPad + c * colGap;
                const radius = 3 + intensity * 2;
                return (
                  <circle
                    key={s}
                    className="crossing-pop"
                    style={{ animationDelay: `${600 + r * 40 + c * 30}ms` }}
                    cx={cx} cy={y} r={radius}
                    fill="#0f766e" fillOpacity={0.15 + intensity * 0.2}
                    stroke="#0f766e" strokeWidth="0.7"
                    onClick={() => { setSelectedHyp(h.id); setTab('hypotheses'); }}
                  >
                    <title>{`${h.label} × ${s} — ${intensity} atom${intensity > 1 ? 's' : ''}. Click to open this thread.`}</title>
                  </circle>
                );
              })}
            </g>
          );
        })}

        <g transform={`translate(${leftPad}, ${H - 22})`}>
          <line x1="0" y1="0" x2="20" y2="0" stroke="#a16207" strokeWidth="1" opacity="0.6" />
          <text x="26" y="3" fontFamily="Manrope" fontSize="10" fill="#78716c">warp · hypothesis thread</text>
          <line x1="200" y1="-6" x2="200" y2="6" stroke="#a8a29e" strokeWidth="0.5" strokeDasharray="2 3" />
          <text x="208" y="3" fontFamily="Manrope" fontSize="10" fill="#78716c">weft · stakeholder column</text>
          <circle cx="412" cy="0" r="5" fill="#0f766e" fillOpacity="0.4" stroke="#0f766e" strokeWidth="0.7" />
          <text x="422" y="3" fontFamily="Manrope" fontSize="10" fill="#78716c">crossing · atom intensity</text>
        </g>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Provenance side panel
// ─────────────────────────────────────────────────────────────────
function ProvenancePanel({ atom, onClose, pinned, onPin }) {
  if (!atom) return null;
  const SrcIcon = SOURCE_ICON[atom.src.type] || FileText;
  const meta = KIND_META[atom.kind];
  const Icon = meta.icon;
  return (
    <aside className="w-[380px] border-l border-stone-200/80 bg-stone-50/50 flex flex-col shrink-0 animate-panel-in">
      <div className="px-5 py-3 border-b border-stone-200/80 flex items-center gap-2">
        <span className="font-ui text-[10px] uppercase tracking-[0.12em] text-stone-500 flex-1">Provenance</span>
        <button onClick={onPin} title={pinned ? 'Unpin panel' : 'Pin panel'}
          className={`p-1 rounded transition-colors ${pinned ? 'bg-amber-100 text-amber-800' : 'hover:bg-stone-200 text-stone-500'}`}>
          <Pin size={13} />
        </button>
        <button onClick={onClose} title="Close (Esc)"
          className="p-1 rounded hover:bg-stone-200 text-stone-500 transition-colors"><X size={14} /></button>
      </div>
      <div className="px-5 py-4 overflow-y-auto scroll-area flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${meta.bg}`}>
            <Icon size={12} className={meta.color} />
          </div>
          <span className={`font-ui text-[10px] uppercase tracking-[0.1em] ${meta.color}`}>{meta.label}</span>
          <span className="font-mono text-[10px] text-stone-400">{atom.date}</span>
        </div>
        <div className="font-ui text-[13px] text-stone-800 leading-snug">{atom.text}</div>

        <div className="mt-5 pt-4 border-t border-stone-200/70">
          <div className="font-ui text-[10px] uppercase tracking-[0.12em] text-stone-400 mb-2">Source</div>
          <div className="flex items-center gap-2 mb-3">
            <SrcIcon size={13} className="text-stone-500" />
            <span className="font-ui text-[12px] text-stone-700">{atom.src.label}</span>
            {atom.src.detail && <span className="font-mono text-[10px] text-stone-400">· {atom.src.detail}</span>}
          </div>
          <div className="bg-white rounded-md ring-1 ring-stone-200/70 p-3 font-display text-[12.5px] text-stone-700 leading-relaxed whitespace-pre-line">
            {atom.src.excerpt || '(Excerpt not available in this prototype.)'}
          </div>
          <button className="mt-3 flex items-center gap-1.5 font-ui text-[11px] text-amber-800 hover:text-amber-900 transition-colors">
            <ExternalLink size={11} /> Open original
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-stone-200/70">
          <div className="font-ui text-[10px] uppercase tracking-[0.12em] text-stone-400 mb-2">Related provenance</div>
          <button className="w-full text-left p-2.5 rounded-md hover:bg-stone-100 transition-colors">
            <div className="font-ui text-[11.5px] text-stone-700 leading-snug">Earlier mention in May 8 sync</div>
            <div className="font-mono text-[10px] text-stone-400 mt-0.5">teams · paragraph 22</div>
          </button>
          <button className="w-full text-left p-2.5 rounded-md hover:bg-stone-100 transition-colors">
            <div className="font-ui text-[11.5px] text-stone-700 leading-snug">Pre-read shared by Phani · April 30</div>
            <div className="font-mono text-[10px] text-stone-400 mt-0.5">email · "Wave 2 architecture pre-read"</div>
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────
// Command palette
// ─────────────────────────────────────────────────────────────────
function CommandPalette({ open, onClose }) {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQ('');
    }
  }, [open]);

  if (!open) return null;
  const filtered = COMMANDS.filter(c => c.label.toLowerCase().includes(q.toLowerCase()));
  const grouped = filtered.reduce((acc, c) => {
    acc[c.cat] = acc[c.cat] || [];
    acc[c.cat].push(c);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh] animate-fade-in" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-[560px] max-h-[60vh] bg-white rounded-xl shadow-2xl ring-1 ring-stone-200/80 overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-200">
          <Command size={14} className="text-stone-500" />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Type a command or search…"
            className="flex-1 font-ui text-[13px] bg-transparent outline-none text-stone-900 placeholder:text-stone-400"
          />
          <span className="font-mono text-[10px] text-stone-400">Esc</span>
        </div>
        <div className="flex-1 overflow-y-auto scroll-area py-2">
          {Object.keys(grouped).length === 0 && (
            <div className="px-4 py-6 text-center font-ui text-[12px] text-stone-400">No matches.</div>
          )}
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="mb-1">
              <div className="px-4 py-1 font-ui text-[10px] uppercase tracking-[0.12em] text-stone-400">{cat}</div>
              {items.map((c, i) => (
                <button
                  key={i}
                  onClick={onClose}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-amber-50/60 text-left transition-colors"
                >
                  <c.icon size={13} className="text-stone-500" />
                  <span className="font-ui text-[12.5px] text-stone-800 flex-1">{c.label}</span>
                  {c.shortcut && <span className="font-mono text-[10px] text-stone-400">{c.shortcut}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Shortcut overlay
// ─────────────────────────────────────────────────────────────────
function ShortcutOverlay({ open, onClose }) {
  if (!open) return null;
  const groups = [
    { name: 'Global', items: [
      ['⌘K', 'Open command palette'],
      ['⌘L', 'Focus search'],
      ['⌘1–4', 'Switch tabs'],
      ['⌘[ / ⌘]', 'Navigate back / forward'],
      ['⌘⌥I', 'Toggle provenance panel'],
      ['⌘⌥1', 'Toggle sidebar'],
      ['⌘R', 'Refresh briefs'],
      ['⌘E', 'Export brief'],
      ['⌘,', 'Settings'],
      ['?', 'Show this overlay'],
    ]},
    { name: 'Hypothesis list', items: [
      ['J / ↓', 'Move down'],
      ['K / ↑', 'Move up'],
      ['Enter', 'Drill in'],
    ]},
    { name: 'Atom card', items: [
      ['Space', 'Open provenance'],
      ['A', 'Attach to hypothesis'],
      ['D', 'Dismiss with reason'],
    ]},
    { name: 'Triage proposal', items: [
      ['C', 'Confirm'],
      ['O', 'Override'],
    ]},
  ];
  return (
    <div className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-[560px] max-h-[80vh] bg-white rounded-xl shadow-2xl ring-1 ring-stone-200/80 overflow-hidden flex flex-col">
        <div className="px-5 py-3 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle size={14} className="text-stone-500" />
            <span className="font-display text-[15px] text-stone-900">Keyboard shortcuts</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-stone-100 text-stone-500"><X size={14}/></button>
        </div>
        <div className="overflow-y-auto scroll-area p-5 space-y-5">
          {groups.map(g => (
            <div key={g.name}>
              <div className="font-ui text-[10px] uppercase tracking-[0.12em] text-stone-400 mb-2">{g.name}</div>
              <div className="space-y-1">
                {g.items.map(([k, v]) => (
                  <div key={k} className="flex items-center gap-3 py-1">
                    <span className="font-mono text-[11px] text-stone-700 bg-stone-100 rounded px-1.5 py-0.5 min-w-[80px] text-center">{k}</span>
                    <span className="font-ui text-[12.5px] text-stone-700">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Demo state menu (prototype-only)
// ─────────────────────────────────────────────────────────────────
function DemoMenu({ open, demo, setDemo, onClose }) {
  if (!open) return null;
  const Item = ({ k, label, desc }) => (
    <label className="flex items-start gap-3 px-4 py-2.5 hover:bg-stone-50 cursor-pointer transition-colors">
      <input
        type="checkbox"
        checked={demo[k]}
        onChange={() => setDemo({ ...demo, [k]: !demo[k] })}
        className="mt-0.5 accent-amber-700"
      />
      <div className="flex-1">
        <div className="font-ui text-[12.5px] text-stone-800">{label}</div>
        <div className="font-ui text-[10.5px] text-stone-500 mt-0.5">{desc}</div>
      </div>
    </label>
  );
  return (
    <div className="absolute right-3 top-12 w-[320px] bg-white rounded-lg shadow-xl ring-1 ring-stone-200 z-40 animate-fade-in" onMouseLeave={onClose}>
      <div className="px-4 py-2.5 border-b border-stone-200 flex items-center gap-2">
        <Sparkles size={12} className="text-amber-700"/>
        <span className="font-ui text-[11px] uppercase tracking-[0.12em] text-stone-500">Demo states</span>
      </div>
      <div className="py-1">
        <Item k="loading" label="Loading skeleton" desc="Show shimmer skeletons in header and Today strip." />
        <Item k="empty" label="Empty state on selected hypothesis" desc="Hide all atoms — show empty state message." />
        <Item k="stale" label="Stale brief banner" desc="Show Tier-2 amber banner about a failed brief refresh." />
        <Item k="degraded" label="Degraded connectivity" desc="Apple AI sidecar offline; falling back to Claude." />
        <Item k="welcome" label="First-run welcome banner" desc="Onboarding nudge at top of canvas." />
        <Item k="reduceMotion" label="Reduce motion (preview)" desc="Disable entrance animations on Composition tab." />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Stubbed views
// ─────────────────────────────────────────────────────────────────
function StubView({ title, blurb, items }) {
  return (
    <div className="flex-1 overflow-y-auto scroll-area px-8 py-10 animate-fade-in">
      <div className="max-w-2xl">
        <div className="font-ui text-[10px] uppercase tracking-[0.12em] text-amber-800 mb-2">Stub — lower priority for v1 prototype</div>
        <h2 className="font-display text-[26px] text-stone-900">{title}</h2>
        <p className="font-ui text-[13px] text-stone-600 mt-2 leading-relaxed">{blurb}</p>
        <div className="mt-6 space-y-2">
          {items.map((it, i) => (
            <div key={i} className="bg-white ring-1 ring-stone-200/80 rounded-lg p-3 flex items-start gap-3 hover:ring-stone-300 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-700 mt-2" />
              <div className="font-ui text-[12.5px] text-stone-700 leading-snug">{it}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main app
// ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeView, setActiveView] = useState('engagement');
  const [selectedEngagement, setSelectedEngagement] = useState('wave2');
  const [tab, setTab] = useState('hypotheses');
  const [selectedHyp, setSelectedHyp] = useState('h1');
  const [provenanceAtom, setProvenanceAtom] = useState(null);
  const [provenancePinned, setProvenancePinned] = useState(false);
  const [expanded, setExpanded] = useState({ panasonic: true, fivestar: false, aws: false });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [demo, setDemo] = useState({ loading: false, empty: false, stale: true, degraded: true, welcome: true, reduceMotion: false });
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const [staleDismissed, setStaleDismissed] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target?.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA';
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setPaletteOpen(p => !p); setShortcutsOpen(false);
      } else if (!isTyping && e.key === '?') {
        e.preventDefault(); setShortcutsOpen(s => !s); setPaletteOpen(false);
      } else if (e.key === 'Escape') {
        setPaletteOpen(false); setShortcutsOpen(false); setProvenanceAtom(null); setDemoOpen(false);
      } else if ((e.metaKey || e.ctrlKey) && ['1','2','3','4'].includes(e.key) && activeView === 'engagement') {
        e.preventDefault();
        const map = { '1': 'hypotheses', '2': 'timeline', '3': 'diff', '4': 'composition' };
        setTab(map[e.key]);
      } else if ((e.metaKey || e.ctrlKey) && e.altKey && e.key === '1') {
        e.preventDefault(); setSidebarCollapsed(c => !c);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeView]);

  const connectivity = demo.degraded ? 'degraded' : 'normal';
  const showWelcome = demo.welcome && !welcomeDismissed && activeView === 'engagement';
  const showStale = demo.stale && !staleDismissed && activeView === 'engagement';

  return (
    <div className={`font-ui bg-stone-50 text-stone-900 antialiased ${demo.reduceMotion ? 'motion-reduce' : ''}`} style={{ height: '100vh' }}>
      <style>{FONT_CSS}</style>

      <div className="flex flex-col h-full">
        <Toolbar
          engagementName={activeView === 'engagement' ? 'Panasonic Wave 2 Migration' : activeView}
          connectivity={connectivity}
          onPalette={() => setPaletteOpen(true)}
          onShortcuts={() => setShortcutsOpen(true)}
          onDemoMenu={() => setDemoOpen(o => !o)}
          demoOpen={demoOpen}
        />

        <div className="flex-1 flex min-h-0 relative">
          <Sidebar
            activeView={activeView}
            onNav={setActiveView}
            expandedArenas={expanded}
            toggleArena={id => setExpanded(e => ({ ...e, [id]: !e[id] }))}
            selected={selectedEngagement}
            onSelect={setSelectedEngagement}
            collapsed={sidebarCollapsed}
          />

          <main className="flex-1 flex flex-col min-w-0 bg-white">
            {showWelcome && (
              <Banner
                tone="stone"
                icon={Sparkles}
                title="Welcome to Loom."
                onDismiss={() => setWelcomeDismissed(true)}
              >
                Press <span className="font-mono text-[11px] bg-white rounded px-1 py-0.5 ring-1 ring-stone-200">⌘K</span> for the command palette, <span className="font-mono text-[11px] bg-white rounded px-1 py-0.5 ring-1 ring-stone-200">?</span> for keyboard shortcuts. The four tabs below cover hypotheses, timeline, diff, and the engagement's composition.
              </Banner>
            )}
            {showStale && (
              <Banner
                tone="amber"
                icon={AlertTriangle}
                title="Brief is stale."
                onAction={() => setStaleDismissed(true)}
                actionLabel="Retry refresh"
                onDismiss={() => setStaleDismissed(true)}
              >
                Last refreshed Mon 07:00. Tuesday's refresh failed — Claude API was unreachable at 07:03.
              </Banner>
            )}
            {demo.degraded && (
              <Banner tone="amber" icon={Wifi}>
                <span className="font-medium">Apple AI sidecar offline.</span>{' '}
                Atom extraction is falling back to Claude (slower). Reads continue normally.
              </Banner>
            )}

            {activeView === 'engagement' && (
              <>
                <EngagementHeader onOpenTriage={() => setActiveView('triage')} loading={demo.loading} />
                <TodayStrip loading={demo.loading} />
                <TabBar active={tab} onChange={setTab} />
                {tab === 'hypotheses' && (
                  <HypothesesTab selectedHyp={selectedHyp} setSelectedHyp={setSelectedHyp}
                    onOpenProvenance={setProvenanceAtom} demoEmpty={demo.empty} />
                )}
                {tab === 'timeline' && <TimelineTab selectedHyp={selectedHyp} setSelectedHyp={setSelectedHyp} />}
                {tab === 'diff' && <DiffTab />}
                {tab === 'composition' && <CompositionTab setSelectedHyp={setSelectedHyp} setTab={setTab} />}
              </>
            )}

            {activeView === 'triage' && (
              <StubView title="Triage queue"
                blurb="The Friday/Sunday ritual surface. Stubbed in this prototype — the engagement detail is the spine and got the design attention. Once the spine is settled, this view inherits the same primitives: hypothesis pills, atom cards, provenance panel."
                items={[
                  'State-change proposals (highest priority): cron-generated state transitions awaiting confirm/override with reasoning and supporting atoms.',
                  'Atom triage: candidate atoms not yet attached to a hypothesis. Attach-to-hypothesis or dismiss-with-reason.',
                  'Ambiguous routings: atoms the extractor could not confidently route to one engagement.',
                  'Keyboard-first: J/K to move, A to attach, D to dismiss, C to confirm, O to override.',
                ]} />
            )}
            {activeView === 'migration' && (
              <StubView title="Migration review"
                blurb="One-time activity for ingesting existing Obsidian vaults. Side-by-side diff of original markdown vs canonical rewrite."
                items={[
                  'Two-tier confidence: Apple AI pre-pass cleanup, Claude canonical rewrite.',
                  'Side-by-side diff with inline highlights for content changes vs structural changes.',
                  'Bulk-accept where confidence is high; per-record review where it is not.',
                ]} />
            )}
            {activeView === 'settings' && (
              <StubView title="Settings" blurb="Stubbed."
                items={['Vault paths, API keys, cron cadences, Apple AI sidecar health, log levels.']} />
            )}
          </main>

          <ProvenancePanel atom={provenanceAtom} onClose={() => setProvenanceAtom(null)}
            pinned={provenancePinned} onPin={() => setProvenancePinned(p => !p)} />

          <DemoMenu open={demoOpen} demo={demo} setDemo={setDemo} onClose={() => setDemoOpen(false)} />
        </div>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ShortcutOverlay open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}
