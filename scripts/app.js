(function () {
  'use strict';

  const LOCALES = window.IghnightLocales || {};
  const GM = window.IgnightGamification || null;
  const $ = id => document.getElementById(id);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const IS_IOS_WEBKIT = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const IS_ANDROID = /Android/i.test(navigator.userAgent);
  const URL_FLAGS = new URLSearchParams(window.location.search);
  const DEV_MODE = URL_FLAGS.get('debug') === '1' || URL_FLAGS.get('dev') === '1';
  const MP_DEBUG = URL_FLAGS.get('mpdebug') === '1' || URL_FLAGS.get('mpdiag') === '1';
  const cleanMpRoom = value => String(value || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 96);
  const MP_DEBUG_ROLE = ['host', 'guest'].includes(URL_FLAGS.get('mprole')) ? URL_FLAGS.get('mprole') : '';
  const MP_DEBUG_ROOM = cleanMpRoom(URL_FLAGS.get('mproom'));
  const MP_JOIN_ROOM = cleanMpRoom(URL_FLAGS.get('mp') || (MP_DEBUG_ROLE === 'guest' ? MP_DEBUG_ROOM : ''));
  const MP_FORCE_RELAY = URL_FLAGS.get('mprelay') === '1' || URL_FLAGS.get('mptur') === 'relay';
  const MP_WEBCAM_VIEWPORT_PAD = 5;
  const MP_ICE_URL = 'turn-config.php';
  const MP_CAM_RELAY_URL = 'mp-cam-relay.php';
  const MP_CAM_FRAME_MS = 320;
  const MP_CAM_POLL_MS = 620;
  const MP_STATE_VERSION = 2;
  const MP_STATE_TTL_MS = 2 * 60 * 60 * 1000;

  if (IS_IOS_WEBKIT) document.documentElement.classList.add('ios');
  if (IS_ANDROID) document.documentElement.classList.add('android');
  if (MP_DEBUG) document.documentElement.classList.add('mp-debug-on');

  const GAME = {
    NEVER: 'neverHaveIEver',
    TD: 'truthOrDare'
  };

  const G = {
    lang: 'en',
    locale: null,
    game: GAME.NEVER,
    pendingGame: GAME.NEVER,
    ritual: null,
    session: null,
    lastAfterglow: null,
    deck: [],
    truthDeck: [],
    dareDeck: [],
    cur: null,
    curKind: null,
    cat: 'all',
    flipped: false,
    busy: false,
    drawn: 0,
    yes: 0,
    never: 0,
    truthDone: 0,
    dareDone: 0,
    skips: 0,
    total: 0,
    completed: false,
    formingDeck: false,
    effectQuality: 'recommended',
    actionStreak: { type: null, count: 0 },
    neverTutorialArmed: false,
    truthDareTutorialArmed: false,
    truthDareIntroReady: true,
    tutorialing: false,
    legalKind: 'privacy',
    mp: {
      active: false,
      requestedJoin: MP_JOIN_ROOM,
      role: null,
      roomId: null,
      peer: null,
      conn: null,
      conns: [],
      call: null,
      calls: [],
      remotePeerId: null,
      remoteReady: false,
      hadRemote: false,
      connectionState: 'idle',
      turn: 'host',
      stateSeq: 0,
      lastAppliedSeq: 0,
      stateBroadcastTimer: null,
      pendingStateSnapshot: null,
      lastStateRequestAt: 0,
      localStream: null,
      webcamOn: false,
      suppressNetwork: false,
      pendingDrawId: null,
      pendingAnswerChoice: null,
      pendingAnswer: null,
      pendingTdChoice: null,
      pendingTdResult: null,
      playerStats: {
        host: { yes: 0, never: 0, truth: 0, dare: 0, skips: 0 },
        guest: { yes: 0, never: 0, truth: 0, dare: 0, skips: 0 }
      },
      backchannelAttempted: false,
      relayClientId: null,
      relayTimer: null,
      relaySeen: new Set(),
      relaySeq: 0,
      relayReadyNotified: false,
      relayFailCount: 0,
      relayMissingCount: 0,
      iceServers: null,
      iceSource: 'default-stun',
      iceConfigured: false,
      camRelaySendTimer: null,
      camRelayPollTimer: null,
      camRelayBusy: false,
      camRelayCanvas: null,
      camRelayLastRemote: 0,
      camRelayRemoteOn: false,
      remoteVideoLive: false
    }
  };

  const els = {
    ageGate: $('age-gate'),
    ageAccept: $('age-accept'),
    ageExit: $('age-exit'),
    splash: $('splash'),
    splashBtn: $('sp-btn'),
    splashLogo: $('splash-logo'),
    splashLogoMask: $('splash-logo-mask-text'),
    splashLogoMaskFeather: $('splash-logo-mask-feather'),
    splashFireOrbit: $('splash-fire-orbit'),
    modeSelect: $('mode-select'),
    app: $('app'),
    cardArea: document.querySelector('.card-area'),
    modeClose: $('mode-close'),
    hdrLogo: $('hdr-logo'),
    card: $('card'),
    deckFormation: $('deck-formation'),
    back: $('back'),
    badge: $('badge'),
    cText: $('c-text'),
    cEmoji: $('c-emoji'),
    dirLeft: $('dir-left'),
    dirRight: $('dir-right'),
    actDraw: $('act-draw'),
    actRev: $('act-rev'),
    actTdChoice: $('act-td-choice'),
    actTdResult: $('act-td-result'),
    btnTruth: $('btn-truth'),
    btnDare: $('btn-dare'),
    btnSkip: $('btn-skip'),
    sDrawn: $('s-drawn'),
    sLeft: $('s-left'),
    sYes: $('s-yes'),
    sNever: $('s-never'),
    stat1Lbl: $('stat-1-lbl'),
    stat2Lbl: $('stat-2-lbl'),
    stat3Lbl: $('stat-3-lbl'),
    stat4Lbl: $('stat-4-lbl'),
    prog: $('prog'),
    progLbl: $('prog-lbl'),
    riftBg: $('rift-bg'),
    orbA: $('orb-a'),
    orbB: $('orb-b'),
    orbC: $('orb-c'),
    heatWash: $('heat-wash'),
    tabsEl: $('tabs'),
    mpBar: $('mp-bar'),
    mpCopy: $('mp-copy'),
    mpKicker: $('mp-kicker'),
    mpStatus: $('mp-status'),
    mpEmoji: $('mp-emoji'),
    mpEmojiDial: $('mp-emoji-dial'),
    mpCamera: $('mp-camera'),
    mpExit: $('mp-exit'),
    mpWebcam: $('mp-webcam'),
    mpLocalVideo: $('mp-local-video'),
    mpRemoteVideo: $('mp-remote-video'),
    mpRelayImage: $('mp-relay-image'),
    mpVideoEmpty: $('mp-video-empty'),
    pill: $('pill'),
    ritualActiveTab: $('ritual-active-tab'),
    ritualActiveTitle: $('ritual-active-title'),
    gameLabel: $('game-label'),
    after: $('after'),
    afterGrid: $('after-grid'),
    afterExtra: $('after-extra'),
    legalModal: $('legal-modal'),
    legalClose: $('legal-close'),
    legalTitle: $('legal-title'),
    legalBody: $('legal-body'),
    sponsorMode: $('sponsor-mode'),
    sponsorAfter: $('sponsor-after'),
    ritualShell: $('ritual-shell'),
    ritualBack: $('ritual-back'),
    ritualKicker: $('ritual-kicker'),
    ritualTitle: $('ritual-title'),
    ritualSub: $('ritual-sub'),
    ritualGrid: $('ritual-grid'),
    afterGamification: $('after-gamification'),
    afterKicker: $('after-kicker'),
    afterXp: $('after-xp'),
    afterEmbersTotal: $('after-embers-total'),
    afterEmbersEarned: $('after-embers-earned'),
    afterXpBar: $('after-xp-bar'),
    afterXpFill: $('after-xp-fill'),
    afterNext: $('after-next'),
    afterRitualsSection: $('after-rituals-section'),
    afterRitualsTitle: $('after-rituals-title'),
    afterRitualUnlocks: $('after-ritual-unlocks'),
    afterCollectionBoard: $('after-collection-board'),
    afterSealsTitle: $('after-seals-title'),
    afterPathsTitle: $('after-paths-title'),
    afterUnlocksTitle: $('after-unlocks-title'),
    afterSeals: $('after-seals'),
    afterPaths: $('after-paths'),
    afterUnlocks: $('after-unlocks'),
    afterTooltip: $('after-item-tooltip'),
    afterShare: $('after-share'),
    collectionModal: $('collection-modal'),
    collectionClose: $('collection-close'),
    collectionTitle: $('collection-title'),
    collectionEmbers: $('collection-embers'),
    collectionSealsTitle: $('collection-seals-title'),
    collectionPathsTitle: $('collection-paths-title'),
    collectionUnlocksTitle: $('collection-unlocks-title'),
    collectionSeals: $('collection-seals'),
    collectionPaths: $('collection-paths'),
    collectionUnlocks: $('collection-unlocks'),
    confirmModal: $('confirm-modal'),
    confirmTitle: $('confirm-title'),
    confirmBody: $('confirm-body'),
    confirmCancel: $('confirm-cancel'),
    confirmPrimary: $('confirm-primary')
  };

  const ATM = {
    warm: { a:'rgba(201,168,76,0.16)', b:'rgba(180,80,50,0.10)', c:'rgba(0,0,0,0)', cOp:'0' },
    hot:  { a:'rgba(201,69,90,0.22)', b:'rgba(160,25,55,0.14)', c:'rgba(0,0,0,0)', cOp:'0' },
    fire: { a:'rgba(220,28,50,0.28)', b:'rgba(110,8,70,0.22)', c:'rgba(180,20,60,0.15)', cOp:'1' }
  };

  const HEAT = { all: 0, warm: 0.10, hot: 0.15, fire: 0.20 };
  const TIER_CLASS = { warm: 't-warm', hot: 't-hot', fire: 't-fire' };
  const THRESH = 105;
  const OVERLAY_MAX = 0.86;
  const MODE_FADE_MS = 560;
  const SPLASH_ANTICIPATION_MS = 250;
  const AFTER_GLOW_PERIOD_MS = 7200;
  const AGE_KEY = 'ignight.ageGate.v1';
  const MP_PREFIX = 'ignight-mp';
  const MP_PUBLIC_URL = 'https://ignight.me/';
  const MP_RELAY_URL = 'mp-relay.php';
  const VERSION = '1.0-rc';
  const SESSION_ID = (() => {
    try {
      return crypto.randomUUID();
    } catch (e) {
      return `rc-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
  })();
  const DEFAULT_SPONSORS = {
    mode: {
      enabled: false,
      provider: 'ignight-partner',
      placement: 'mode_select',
      url: 'mailto:ads@ignight.me?subject=Ignight%20partnership'
    },
    after: {
      enabled: false,
      provider: 'ignight-partner',
      placement: 'results',
      url: 'mailto:ads@ignight.me?subject=Ignight%20partnership'
    }
  };
  const LEGAL_KEYS = {
    privacy: ['legalTitlePrivacy', 'legalBodyPrivacy'],
    terms: ['legalTitleTerms', 'legalBodyTerms'],
    notice: ['legalTitleNotice', 'legalBodyNotice'],
    contact: ['legalTitleContact', 'legalBodyContact']
  };
  const RIFT_PALETTES = ['palette-never', 'palette-yes', 'palette-truth', 'palette-dare'];
  const EFFECT_PROFILES = {
    'ultra-high': {
      splashParticles: 46,
      riftShards: { never: 56, yes: 56, truth: 56, dare: 64 },
      riftTimeoutMs: 1720,
      deckCountScale: 1.18,
      deckDurScale: 1.06,
      deckLandingScale: 1.08,
      deckOpacityScale: 1.08,
      emojiRainCount: 42
    },
    recommended: {
      splashParticles: 30,
      riftShards: { never: 12, yes: 12, truth: 12, dare: 14 },
      riftTimeoutMs: 1320,
      deckCountScale: 0.54,
      deckDurScale: 0.82,
      deckLandingScale: 0.9,
      deckOpacityScale: 0.74,
      emojiRainCount: 20
    },
    high: {
      splashParticles: 34,
      riftShards: { never: 40, yes: 40, truth: 40, dare: 46 },
      riftTimeoutMs: 1600,
      deckCountScale: 1,
      deckDurScale: 1,
      deckLandingScale: 1,
      deckOpacityScale: 1,
      emojiRainCount: 32
    },
    medium: {
      splashParticles: 22,
      riftShards: { never: 24, yes: 24, truth: 24, dare: 28 },
      riftTimeoutMs: 1500,
      deckCountScale: 0.72,
      deckDurScale: 0.94,
      deckLandingScale: 1.02,
      deckOpacityScale: 0.88,
      emojiRainCount: 24
    },
    low: {
      splashParticles: 12,
      riftShards: { never: 10, yes: 10, truth: 10, dare: 12 },
      riftTimeoutMs: 1300,
      deckCountScale: 0.5,
      deckDurScale: 0.78,
      deckLandingScale: 0.88,
      deckOpacityScale: 0.72,
      emojiRainCount: 12
    },
    'ultra-low': {
      splashParticles: 6,
      riftShards: { never: 4, yes: 4, truth: 4, dare: 5 },
      riftTimeoutMs: 1050,
      deckCountScale: 0.34,
      deckDurScale: 0.68,
      deckLandingScale: 0.78,
      deckOpacityScale: 0.52,
      emojiRainCount: 6
    }
  };
  const EFFECT_CLASS_NAMES = Object.keys(EFFECT_PROFILES).map(name => `fx-${name}`).concat(['fx-high', 'fx-low']);
  const EFFECT_JANK_KEY = 'ignight.fxJank.v1';
  const EFFECT_MEMORY_MS = 24 * 60 * 60 * 1000;
  const FX_OVERRIDE = normalizeEffectQuality(URL_FLAGS.get('fx') || URL_FLAGS.get('effects') || URL_FLAGS.get('quality'));
  const FX_REDUCED_MOTION = (() => {
    try {
      return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  })();
  const FX_SAVE_DATA = !!navigator.connection?.saveData;
  const FX_PERF = {
    forced: !!FX_OVERRIDE,
    manualLock: false,
    reason: '',
    initial: 'recommended',
    phase: 'boot',
    phaseUntil: 0,
    frames: [],
    phaseFrames: [],
    longTasks: 0,
    longTaskTimes: [],
    lastTs: 0,
    rafId: 0,
    lastMetricsAt: 0,
    stats: null,
    probe: null,
    probeRunning: false,
    pendingQuality: null,
    pendingTimer: null,
    debugEl: null,
    debugTextEl: null
  };
  const MOOD_SYMBOLS = {
    confession: '"✧   ◌   ✧"',
    power: '"◆   ◆   ◆"',
    voyeur: '"◐   ◌   ◐"',
    surrender: '"◇   ✦   ◇"',
    fire: '"✦   ◆   ✦"',
    desire: '"✦   ◇   ✦"'
  };
  const FORMATION_VARIANTS = ['crown', 'orbit', 'spiral', 'swan'];
  const FORMATION_CLASSES = ['sidecut', ...FORMATION_VARIANTS].map(name => `formation-${name}`);
  const FORMATION_CONFIGS = {
    sidecut: { count: 10, stepMs: 26, durMs: 660, landingDelayMs: 260, landingDurMs: 1080, opacity: 0.28 },
    crown: { count: 14, stepMs: 26, durMs: 950, landingDelayMs: 260, landingDurMs: 1130, opacity: 0.34 },
    orbit: { count: 14, stepMs: 32, durMs: 1020, landingDelayMs: 260, landingDurMs: 1200, opacity: 0.33 },
    spiral: { count: 15, stepMs: 26, durMs: 1040, landingDelayMs: 260, landingDurMs: 1220, opacity: 0.31 },
    swan: { count: 14, stepMs: 30, durMs: 980, landingDelayMs: 260, landingDurMs: 1160, opacity: 0.33 }
  };
  const CARD_CORNER_SVG = '<svg viewBox="0 0 26 26" fill="none"><path d="M2 24L2 2L24 2" stroke="#c9a84c" stroke-width="1.5"/><circle cx="2" cy="2" r="1.8" fill="#c9a84c"/></svg>';
  const CARD_CORNERS = ['tl', 'tr', 'bl', 'br'].map(pos => `<div class="corner ${pos}">${CARD_CORNER_SVG}</div>`).join('');

  const drag = { on: false, mode: null, x0: 0, y0: 0, dx: 0, moved: false, pid: null };
  let modeCloseTimer = null;
  let localeSwapTimer = null;
  let swipeTutorialTimers = [];
  let swipeNudgeTimers = [];
  let riftTimer = null;
  let deckFormationTimer = null;
  let fxQualityTimer = null;
  let modeFormationIndex = 0;
  let splashIntroStarted = false;
  let splashAnticipationTimer = null;
  let afterStatTimers = [];
  let afterStatFrames = [];
  let afterProgressTimers = [];
  let afterGlowFrame = null;
  let afterTooltipTarget = null;
  let afterTooltipSticky = false;
  let riftShardPool = [];
  let deckFormationPool = [];
  const actionTimers = new WeakMap();
  let pendingConfirmAction = null;
  const mpDebugEntries = [];
  let mpDebugPanel = null;
  let mpDebugLogEl = null;
  const webcamDrag = {
    on: false,
    moved: false,
    suppressClick: false,
    pid: null,
    x0: 0,
    y0: 0,
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
    corner: 'tr',
    introTimer: null,
    hideTimer: null,
    busy: false
  };

  function normalizeEffectQuality(quality) {
    const value = String(quality || '').trim().toLowerCase();
    const aliases = {
      ultra: 'ultra-high',
      ultrahigh: 'ultra-high',
      'ultra_high': 'ultra-high',
      uhigh: 'ultra-high',
      rec: 'recommended',
      recommend: 'recommended',
      baseline: 'recommended',
      med: 'medium',
      ultralow: 'ultra-low',
      'ultra_low': 'ultra-low',
      ulow: 'ultra-low'
    };
    const normalized = aliases[value] || value;
    return EFFECT_PROFILES[normalized] ? normalized : null;
  }

  function readEffectJankMemory() {
    try {
      const raw = localStorage.getItem(EFFECT_JANK_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data?.until || data.until < Date.now() || !EFFECT_PROFILES[data.quality]) {
        localStorage.removeItem(EFFECT_JANK_KEY);
        return null;
      }
      return data;
    } catch (e) {
      return null;
    }
  }

  function writeEffectJankMemory(quality, reason, stats = null) {
    if (!['recommended', 'low', 'ultra-low'].includes(quality)) return;
    try {
      localStorage.setItem(EFFECT_JANK_KEY, JSON.stringify({
        quality,
        reason,
        stats,
        until: Date.now() + EFFECT_MEMORY_MS
      }));
    } catch (e) {}
  }

  function isMobileEffectTarget() {
    const uaMobile = IS_ANDROID || IS_IOS_WEBKIT || /Mobi|Mobile|Tablet/i.test(navigator.userAgent);
    let coarsePointer = false;
    try {
      coarsePointer = window.matchMedia?.('(pointer: coarse)').matches;
    } catch (e) {}
    const minScreen = Math.min(screen.width || window.innerWidth, screen.height || window.innerHeight);
    const minViewport = Math.min(window.innerWidth || minScreen, window.innerHeight || minScreen);
    return uaMobile || minViewport <= 540 || (coarsePointer && minScreen <= 920);
  }

  function isDesktopEffectTarget() {
    return !isMobileEffectTarget();
  }

  function isFlagshipMobileCandidate() {
    if (!isMobileEffectTarget()) return false;
    const cores = navigator.hardwareConcurrency || 0;
    const memory = navigator.deviceMemory || 0;
    const dpr = window.devicePixelRatio || 1;
    const minScreen = Math.min(screen.width || window.innerWidth, screen.height || window.innerHeight);
    const minViewport = Math.min(window.innerWidth || minScreen, window.innerHeight || minScreen);
    const strongAndroid = IS_ANDROID && (memory >= 6 || cores >= 8) && dpr >= 2.5;
    const strongIOS = IS_IOS_WEBKIT && dpr >= 3 && Math.max(minScreen, minViewport) >= 390 && (cores >= 6 || !cores);
    return strongAndroid || strongIOS;
  }

  function detectEffectQuality() {
    if (FX_OVERRIDE) {
      FX_PERF.reason = `url:${FX_OVERRIDE}`;
      return FX_OVERRIDE;
    }
    if (FX_REDUCED_MOTION || FX_SAVE_DATA) {
      FX_PERF.reason = FX_REDUCED_MOTION ? 'reduced-motion' : 'save-data';
      return 'low';
    }
    const remembered = readEffectJankMemory();
    if (remembered) {
      FX_PERF.reason = `memory:${remembered.reason || remembered.quality}`;
      return remembered.quality;
    }
    if (isDesktopEffectTarget()) {
      FX_PERF.reason = 'desktop';
      return 'high';
    }
    FX_PERF.reason = isFlagshipMobileCandidate() ? 'mobile-flagship-probe' : 'mobile-baseline';
    return 'recommended';
  }

  function setEffectQuality(quality, options = {}) {
    const safeQuality = normalizeEffectQuality(quality) || 'recommended';
    if (options.manual) FX_PERF.manualLock = true;
    G.effectQuality = safeQuality;
    FX_PERF.reason = options.reason || FX_PERF.reason || 'manual';
    document.documentElement.dataset.fx = safeQuality;
    EFFECT_CLASS_NAMES.forEach(name => document.documentElement.classList.remove(name));
    document.documentElement.classList.add(`fx-${safeQuality}`);
    if (safeQuality === 'ultra-high') document.documentElement.classList.add('fx-high');
    if (safeQuality === 'ultra-low') document.documentElement.classList.add('fx-low');
    window.IgnightEffectQuality = safeQuality;
    window.IgnightSetEffectQuality = setEffectQuality;
    updateFxDebugPanel();
    if (els.splash && els.splash.style.display !== 'none') requestAnimationFrame(syncSplashLogoFx);
  }

  function effectProfile() {
    return EFFECT_PROFILES[G.effectQuality] || EFFECT_PROFILES.recommended;
  }

  function baselineEffectQuality() {
    return ['recommended', 'low', 'ultra-low'].includes(G.effectQuality);
  }

  function markFxPhase(phase, durationMs = 1200) {
    FX_PERF.phase = phase;
    FX_PERF.phaseUntil = performance.now() + durationMs;
    FX_PERF.phaseFrames = [];
    updateFxDebugPanel();
  }

  function fxStats(frames = FX_PERF.frames) {
    const clean = frames.filter(n => Number.isFinite(n) && n > 0 && n < 250);
    if (!clean.length) {
      return { fps: 0, avg: 0, p95: 0, dropped: 0, samples: 0, longTasks: 0, longTasksTotal: FX_PERF.longTasks };
    }
    const now = performance.now();
    const recentLongTasks = FX_PERF.longTaskTimes.filter(time => now - time < 10000).length;
    const sorted = [...clean].sort((a, b) => a - b);
    const avg = clean.reduce((sum, value) => sum + value, 0) / clean.length;
    const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))];
    return {
      fps: Math.round(1000 / avg),
      avg: Math.round(avg * 10) / 10,
      p95: Math.round(p95 * 10) / 10,
      dropped: clean.filter(value => value > 34).length,
      samples: clean.length,
      longTasks: recentLongTasks,
      longTasksTotal: FX_PERF.longTasks
    };
  }

  function fxReport() {
    return {
      quality: G.effectQuality,
      reason: FX_PERF.reason,
      forced: FX_PERF.forced,
      manualLock: FX_PERF.manualLock,
      phase: FX_PERF.phase,
      stats: FX_PERF.stats || fxStats(),
      probe: FX_PERF.probe,
      mobile: isMobileEffectTarget(),
      flagshipCandidate: isFlagshipMobileCandidate(),
      reducedMotion: FX_REDUCED_MOTION,
      saveData: FX_SAVE_DATA,
      device: {
        dpr: window.devicePixelRatio || 1,
        cores: navigator.hardwareConcurrency || null,
        memory: navigator.deviceMemory || null,
        screen: `${screen.width || window.innerWidth}x${screen.height || window.innerHeight}`,
        ua: navigator.userAgent
      }
    };
  }

  function updateFxDebugPanel() {
    if (!FX_PERF.debugTextEl) return;
    const stats = FX_PERF.stats || fxStats();
    FX_PERF.debugTextEl.textContent = [
      `FX ${G.effectQuality}`,
      FX_PERF.reason || 'auto',
      `phase ${FX_PERF.phase}`,
      `fps ${stats.fps || '...'}`,
      `p95 ${stats.p95 || '...'}ms`,
      `drop ${stats.dropped || 0}`,
      `long ${stats.longTasks || 0}`
    ].join(' · ');
  }

  function copyFxReport() {
    const text = JSON.stringify(fxReport(), null, 2);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => toast('FX report copied'))
        .catch(() => window.prompt('Copy FX report:', text));
    } else {
      window.prompt('Copy FX report:', text);
    }
  }

  function canApplyEffectQuality() {
    if (G.busy || G.formingDeck || G.tutorialing) return false;
    if (els.splash && els.splash.style.display !== 'none' && !els.splash.classList.contains('leaving')) return false;
    if (els.riftBg?.classList.contains('playing')) return false;
    if (document.querySelector('.emoji-rain, .after-ember-particle')) return false;
    return true;
  }

  function requestEffectQuality(quality, reason = 'auto', attempt = 0) {
    const safeQuality = normalizeEffectQuality(quality);
    if (!safeQuality || safeQuality === G.effectQuality) return false;
    if (FX_PERF.forced || FX_PERF.manualLock) return false;
    FX_PERF.pendingQuality = safeQuality;
    if (!canApplyEffectQuality() && attempt < 40) {
      clearTimeout(fxQualityTimer);
      fxQualityTimer = setTimeout(() => requestEffectQuality(safeQuality, reason, attempt + 1), 260);
      return false;
    }
    FX_PERF.pendingQuality = null;
    setEffectQuality(safeQuality, { reason });
    return true;
  }

  function shouldDowngradeFx(stats) {
    if (G.effectQuality === 'ultra-high') return stats.p95 > 38 || stats.dropped > 12 || stats.longTasks > 4;
    if (G.effectQuality === 'high') return stats.p95 > 40 || stats.dropped > 14 || stats.longTasks > 4;
    if (G.effectQuality === 'recommended') return stats.p95 > 72 || stats.dropped > 42 || stats.longTasks > 7;
    if (G.effectQuality === 'medium') return stats.p95 > 54 || stats.dropped > 26 || stats.longTasks > 5;
    return false;
  }

  function downgradeFxFromStats(stats) {
    if (FX_PERF.forced || FX_PERF.manualLock) return;
    if (!shouldDowngradeFx(stats)) return;
    const next = ['ultra-high', 'high'].includes(G.effectQuality) ? 'recommended' : 'low';
    writeEffectJankMemory(next, `jank:${G.effectQuality}`, stats);
    requestEffectQuality(next, `jank:${stats.p95}ms`);
  }

  function startFxPerfMonitor() {
    if (FX_PERF.rafId) return;
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver(list => {
          const now = performance.now();
          const entries = list.getEntries();
          FX_PERF.longTasks += entries.length;
          entries.forEach(() => FX_PERF.longTaskTimes.push(now));
          FX_PERF.longTaskTimes = FX_PERF.longTaskTimes.filter(time => now - time < 15000);
          updateFxDebugPanel();
        });
        observer.observe({ type: 'longtask', buffered: true });
      } catch (e) {}
    }
    const tick = ts => {
      if (document.visibilityState === 'visible' && FX_PERF.lastTs) {
        const dt = ts - FX_PERF.lastTs;
        if (dt > 0 && dt < 250) {
          FX_PERF.frames.push(dt);
          if (FX_PERF.frames.length > 180) FX_PERF.frames.shift();
          if (performance.now() <= FX_PERF.phaseUntil) FX_PERF.phaseFrames.push(dt);
          else if (FX_PERF.phase !== 'idle') FX_PERF.phase = 'idle';
        }
      }
      FX_PERF.lastTs = ts;
      if (ts - FX_PERF.lastMetricsAt > 650) {
        FX_PERF.stats = fxStats();
        FX_PERF.lastMetricsAt = ts;
        if (FX_PERF.stats.samples >= 60) downgradeFxFromStats(FX_PERF.stats);
        updateFxDebugPanel();
      }
      FX_PERF.rafId = requestAnimationFrame(tick);
    };
    FX_PERF.rafId = requestAnimationFrame(tick);
  }

  function startFxCapabilityProbe({ force = false } = {}) {
    if (FX_PERF.probeRunning || FX_PERF.forced || FX_PERF.manualLock) return;
    if (!force && (!isMobileEffectTarget() || !isFlagshipMobileCandidate())) return;
    FX_PERF.probeRunning = true;
    const longTaskStart = FX_PERF.longTasks;
    const start = performance.now();
    const startFrames = FX_PERF.frames.length;
    markFxPhase('capability-probe', 1150);
    setTimeout(() => {
      const recent = FX_PERF.frames.slice(startFrames);
      const stats = fxStats(recent.length >= 24 ? recent : FX_PERF.frames);
      stats.duration = Math.round(performance.now() - start);
      stats.newLongTasks = FX_PERF.longTasks - longTaskStart;
      FX_PERF.probe = stats;
      FX_PERF.probeRunning = false;
      const smoothForHigh = stats.samples >= 24 && stats.p95 <= 28 && stats.dropped <= 2 && stats.newLongTasks === 0;
      if (isMobileEffectTarget() && isFlagshipMobileCandidate() && G.effectQuality === 'recommended' && smoothForHigh) {
        requestEffectQuality('high', 'probe-high');
      }
      if (isDesktopEffectTarget() && ['high', 'ultra-high'].includes(G.effectQuality) && !smoothForHigh && stats.p95 > 45) {
        writeEffectJankMemory('recommended', 'desktop-probe', stats);
        requestEffectQuality('recommended', 'desktop-probe');
      }
      updateFxDebugPanel();
    }, 1120);
  }

  function scheduleFxCapabilityProbe() {
    if (FX_PERF.forced || FX_REDUCED_MOTION || FX_SAVE_DATA) return;
    setTimeout(() => startFxCapabilityProbe(), 1200);
  }

  function shuffle(a) {
    const r = [...a];
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(min, value, max) {
    return Math.min(Math.max(value, min), max);
  }

  function wave(seed, amount = 1) {
    return Math.sin(seed * 12.9898) * amount;
  }

  function vibe(p) {
    if (navigator.vibrate) navigator.vibrate(p);
  }

  function t(key) {
    return G.locale?.ui?.[key] || LOCALES.en.ui[key] || key;
  }

  function track(name, data = {}) {
    const event = {
      name,
      version: VERSION,
      sessionId: SESSION_ID,
      ts: new Date().toISOString(),
      lang: G.lang,
      game: G.game,
      tier: G.cat,
      ...data
    };
    const store = window.IgnightAnalytics = window.IgnightAnalytics || { queue: [] };
    store.queue.push(event);
    store.last = event;
    window.dispatchEvent(new CustomEvent('ignight:analytics', { detail: event }));
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: `ignight_${name}`, ...event });
    }
  }

  function readAgeGate() {
    try {
      return localStorage.getItem(AGE_KEY) === 'accepted';
    } catch (e) {
      return false;
    }
  }

  function writeAgeGate() {
    try {
      localStorage.setItem(AGE_KEY, 'accepted');
    } catch (e) {}
  }

  function buildSplashFireParticles() {
    if (!els.splashFireOrbit) return;
    const desiredCount = effectProfile().splashParticles;
    if (els.splashFireOrbit.children.length === desiredCount) return;
    els.splashFireOrbit.replaceChildren();
    const frag = document.createDocumentFragment();
    for (let i = 0; i < desiredCount; i++) {
      const particle = document.createElement('i');
      particle.className = 'splash-fire-particle';
      if (i % 7 === 0) particle.classList.add('is-gold');
      if (i % 5 === 0) particle.classList.add('is-coal');
      frag.appendChild(particle);
    }
    els.splashFireOrbit.appendChild(frag);
  }

  function positionSplashFireParticles(logoRect) {
    if (!els.splashFireOrbit || !logoRect?.width) return;
    const orbitW = clamp(360, logoRect.width + 290, Math.min(window.innerWidth * 0.96, 720));
    const orbitH = clamp(175, logoRect.height + 170, Math.min(window.innerHeight * 0.34, 300));
    document.body.style.setProperty('--splash-logo-cx', `${logoRect.left + logoRect.width / 2}px`);
    document.body.style.setProperty('--splash-logo-cy', `${logoRect.top + logoRect.height / 2}px`);
    document.body.style.setProperty('--splash-orbit-w', `${orbitW}px`);
    document.body.style.setProperty('--splash-orbit-h', `${orbitH}px`);

    const particles = Array.from(els.splashFireOrbit.querySelectorAll('.splash-fire-particle'));
    const total = particles.length || 1;
    particles.forEach((particle, i) => {
      const t = total === 1 ? 0 : i / (total - 1);
      const reverse = i % 4 === 0;
      const highArc = i % 3 === 1;
      const phase = reverse ? 1 - t : t;
      const angle = (-210 + phase * 420 + wave(i, 18)) * Math.PI / 180;
      const startX = (reverse ? 0.58 : -0.58) * orbitW + wave(i + 2.3, 18);
      const endX = (reverse ? -0.54 : 0.54) * orbitW + wave(i + 9.1, 22);
      const startY = (highArc ? -0.08 : 0.28) * orbitH + (phase - 0.5) * orbitH * 0.68 + wave(i + 6.7, 14);
      const endY = (highArc ? 0.1 : -0.22) * orbitH + (0.5 - phase) * orbitH * 0.58 + wave(i + 4.4, 18);
      const midX = Math.cos(angle) * orbitW * (0.26 + (i % 4) * 0.018);
      const midY = Math.sin(angle) * orbitH * (0.42 + (i % 5) * 0.018);
      const depth = 46 + (i % 6) * 28;
      const size = 2.6 + (i % 6) * 0.72 + (i % 2) * 1.4;
      const longSpark = i % 3 !== 0;
      const op = 0.62 + (i % 5) * 0.065;
      const delay = 0.04 + (i % 10) * 0.022 + Math.floor(i / 10) * 0.018;
      const dur = 0.74 + (i % 8) * 0.035;

      particle.style.setProperty('--sx', `${startX.toFixed(1)}px`);
      particle.style.setProperty('--sy', `${startY.toFixed(1)}px`);
      particle.style.setProperty('--mx', `${midX.toFixed(1)}px`);
      particle.style.setProperty('--my', `${midY.toFixed(1)}px`);
      particle.style.setProperty('--ex', `${endX.toFixed(1)}px`);
      particle.style.setProperty('--ey', `${endY.toFixed(1)}px`);
      particle.style.setProperty('--z0', `${(-120 - (i % 4) * 18).toFixed(1)}px`);
      particle.style.setProperty('--z1', `${depth.toFixed(1)}px`);
      particle.style.setProperty('--z2', `${(-70 - (i % 5) * 22).toFixed(1)}px`);
      particle.style.setProperty('--r0', `${(reverse ? 26 : -26) + wave(i + 1, 20)}deg`);
      particle.style.setProperty('--r1', `${(reverse ? -144 : 144) + wave(i + 3, 36)}deg`);
      particle.style.setProperty('--r2', `${(reverse ? -286 : 286) + wave(i + 5, 44)}deg`);
      particle.style.setProperty('--ry0', `${reverse ? -42 : 42}deg`);
      particle.style.setProperty('--ry1', `${reverse ? 58 : -58}deg`);
      particle.style.setProperty('--ry2', `${reverse ? 22 : -22}deg`);
      particle.style.setProperty('--particle-w', `${(longSpark ? size * 3.7 : size * 1.6).toFixed(1)}px`);
      particle.style.setProperty('--particle-h', `${(longSpark ? size * 0.58 : size * 1.18).toFixed(1)}px`);
      particle.style.setProperty('--particle-scale', `${(0.72 + (i % 6) * 0.09).toFixed(2)}`);
      particle.style.setProperty('--particle-op', `${Math.min(op, 0.96).toFixed(2)}`);
      particle.style.setProperty('--particle-op-mid', `${Math.min(op * 0.72, 0.72).toFixed(2)}`);
      particle.style.setProperty('--particle-delay', `${delay.toFixed(3)}s`);
      particle.style.setProperty('--particle-dur', `${dur.toFixed(3)}s`);
    });
  }

  function syncSplashLogoFx() {
    if (!els.splashLogo || !els.splashLogoMask || !els.splashLogoMaskFeather) return;
    buildSplashFireParticles();
    const r = els.splashLogo.getBoundingClientRect();
    const cs = getComputedStyle(els.splashLogo);
    document.body.style.setProperty('--splash-logo-x', `${r.left}px`);
    document.body.style.setProperty('--splash-logo-y', `${r.top}px`);
    document.body.style.setProperty('--splash-logo-w', `${r.width}px`);
    document.body.style.setProperty('--splash-logo-h', `${r.height}px`);
    document.body.style.setProperty('--splash-logo-font-family', cs.fontFamily);
    document.body.style.setProperty('--splash-logo-font-style', cs.fontStyle);
    document.body.style.setProperty('--splash-logo-font-weight', cs.fontWeight);
    document.body.style.setProperty('--splash-logo-font-size', cs.fontSize);
    document.body.style.setProperty('--splash-logo-line-height', cs.lineHeight);
    document.body.style.setProperty('--splash-logo-letter-spacing', cs.letterSpacing);
    document.body.style.setProperty('--splash-logo-text-align', cs.textAlign);
    [els.splashLogoMask, els.splashLogoMaskFeather].forEach(el => {
      el.style.left = `${r.left}px`;
      el.style.top = `${r.top}px`;
      el.style.width = `${r.width}px`;
      el.style.height = `${r.height}px`;
    });
    positionSplashFireParticles(r);
  }

  function startSplashIntro(force = false) {
    if (!els.splash || els.splash.style.display === 'none') return;
    if (splashIntroStarted && !force) return;
    splashIntroStarted = true;
    markFxPhase('splash', 2200);
    syncSplashLogoFx();
    clearTimeout(splashAnticipationTimer);
    els.splash.classList.remove('splash-intro', 'splash-anticipating');
    void els.splash.offsetWidth;
    els.splash.classList.add('splash-anticipating');
    splashAnticipationTimer = setTimeout(() => {
      els.splash.classList.add('splash-intro');
      els.splash.classList.remove('splash-anticipating');
    }, SPLASH_ANTICIPATION_MS);
  }

  function acceptAgeGate() {
    writeAgeGate();
    track('age_gate_accepted');
    els.ageGate.classList.add('leaving');
    setTimeout(() => {
      els.ageGate.classList.add('hidden');
      document.body.classList.add('age-ok');
      setTimeout(() => startSplashIntro(true), 360);
    }, 430);
  }

  function initAgeGate() {
    if (readAgeGate()) {
      els.ageGate.classList.add('hidden');
      document.body.classList.add('age-ok');
      setTimeout(() => startSplashIntro(true), 80);
      return;
    }
    document.body.classList.remove('age-ok');
    clearTimeout(splashAnticipationTimer);
    els.splash?.classList.remove('splash-intro', 'splash-anticipating');
    splashIntroStarted = false;
  }

  function sponsorConfig(slot) {
    return {
      ...DEFAULT_SPONSORS[slot],
      ...(window.IgnightSponsors?.[slot] || {})
    };
  }

  function renderSponsorSlot(slot, el) {
    if (!el) return;
    const cfg = sponsorConfig(slot);
    el.classList.toggle('hidden', cfg.enabled === false);
    if (cfg.enabled === false) return;
    el.href = cfg.url || DEFAULT_SPONSORS[slot].url;
    el.dataset.provider = cfg.provider || 'custom';
    el.dataset.placement = cfg.placement || slot;

    if (cfg.eyebrow) el.querySelector('span').textContent = cfg.eyebrow;
    if (cfg.title) el.querySelector('strong').textContent = cfg.title;
    if (cfg.body) el.querySelector('em').textContent = cfg.body;
    if (cfg.cta) el.querySelector('b').textContent = cfg.cta;
  }

  function renderSponsors() {
    renderSponsorSlot('mode', els.sponsorMode);
    renderSponsorSlot('after', els.sponsorAfter);
  }

  function trackSponsorImpression(slot) {
    const cfg = sponsorConfig(slot);
    if (cfg.enabled === false) return;
    track('sponsor_impression', {
      slot,
      provider: cfg.provider || 'custom',
      placement: cfg.placement || slot,
      url: cfg.url || DEFAULT_SPONSORS[slot].url
    });
  }

  function openLegal(kind = 'privacy') {
    const safeKind = LEGAL_KEYS[kind] ? kind : 'privacy';
    G.legalKind = safeKind;
    const [titleKey, bodyKey] = LEGAL_KEYS[safeKind];
    els.legalTitle.textContent = t(titleKey);
    els.legalBody.textContent = t(bodyKey);
    els.legalModal.classList.remove('hidden');
    track('legal_open', { kind: safeKind });
  }

  function closeLegal() {
    els.legalModal.classList.add('hidden');
  }

  function closeConfirm() {
    pendingConfirmAction = null;
    els.confirmModal?.classList.add('hidden');
  }

  function openConfirm({ title, body, action, onConfirm }) {
    if (!els.confirmModal) {
      onConfirm?.();
      return;
    }
    pendingConfirmAction = onConfirm;
    els.confirmTitle.textContent = title;
    els.confirmBody.textContent = body;
    els.confirmCancel.textContent = t('confirmStay');
    els.confirmPrimary.textContent = action;
    els.confirmModal.classList.remove('hidden');
    window.SFX.click?.();
    vibe(4);
  }

  function applyTierSwitch(cat) {
    window.SFX.tab?.();
    vibe(5);
    setActiveTab(cat);
    track('tier_selected', { selectedTier: cat });
    resetDeck(cat, { clearRitual: true });
  }

  function runHasStarted() {
    return G.drawn > 0 || G.flipped || !!G.curKind;
  }

  function confirmTierSwitch(cat) {
    if (!runHasStarted()) {
      applyTierSwitch(cat);
      return;
    }
    openConfirm({
      title: t('confirmTierTitle'),
      body: t('confirmTierBody'),
      action: t('confirmTierAction'),
      onConfirm: () => applyTierSwitch(cat)
    });
  }

  function leaveRitualNow() {
    window.SFX.tab?.();
    vibe(5);
    setActiveTab('all');
    track('ritual_exited', { ritualId: G.ritual?.id || null });
    resetDeck('all', { clearRitual: true });
  }

  function confirmLeaveRitual() {
    if (!runHasStarted()) {
      leaveRitualNow();
      return;
    }
    openConfirm({
      title: t('confirmRitualTitle'),
      body: t('confirmRitualBody'),
      action: t('confirmRitualAction'),
      onConfirm: () => leaveRitualNow()
    });
  }

  function startRitualFromAfter(ritual) {
    if (!ritual) return;
    clearAfterProgressAnimation();
    clearAfterStatAnimation();
    els.after.classList.add('hidden');
    G.pendingGame = ritual.mode;
    beginGame(ritual.mode, ritual);
  }

  function confirmStartAfterRitual(ritual) {
    if (!ritual) return;
    if (GM?.isRitualUnlocked?.(ritual, GM.readProgress()) === false) {
      toast(gmLabel('locked'));
      return;
    }
    const title = GM.ritualTitle(ritual, G.lang);
    openConfirm({
      title: t('confirmStartRitualTitle'),
      body: format(t('confirmStartRitualBody'), { title }),
      action: t('confirmStartRitualAction'),
      onConfirm: () => startRitualFromAfter(ritual)
    });
  }

  function clearRiftShards() {
    riftShardPool.forEach(el => el.classList.remove('is-live'));
  }

  function ensureRiftShardPool(size) {
    if (!els.riftBg) return [];
    if (!riftShardPool.length) {
      riftShardPool = Array.from(els.riftBg.querySelectorAll('.rift-shard'));
    }
    const frag = document.createDocumentFragment();
    while (riftShardPool.length < size) {
      const shard = document.createElement('i');
      shard.className = 'rift-shard';
      riftShardPool.push(shard);
      frag.appendChild(shard);
    }
    if (frag.childNodes.length) els.riftBg.appendChild(frag);
    return riftShardPool;
  }

  function seedRiftShards(action) {
    if (!els.riftBg) return;
    const right = action === 'yes' || action === 'dare';
    const bias = right ? 1 : -1;
    const profile = effectProfile();
    const count = profile.riftShards[action] || profile.riftShards.yes;
    const maxX = Math.min(window.innerWidth * 0.42, 250);
    const maxY = Math.min(window.innerHeight * 0.34, 230);
    const pool = ensureRiftShardPool(count);

    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const shard = pool[i];
      shard.style.setProperty('--x', `${(side * rand(58, maxX)) + (bias * rand(12, 54))}px`);
      shard.style.setProperty('--y', `${rand(-maxY, maxY)}px`);
      shard.style.setProperty('--a', `${rand(-38, 38)}deg`);
      shard.style.setProperty('--s', `${rand(3, action === 'dare' ? 7 : 6)}px`);
      shard.style.setProperty('--d', `${rand(0.78, 1.28)}s`);
      shard.style.setProperty('--delay', `${rand(0, 0.08)}s`);
      shard.classList.add('is-live');
    }
  }

  function triggerRift(action) {
    if (!els.riftBg) return;
    if (baselineEffectQuality() && els.riftBg.classList.contains('playing')) return;
    markFxPhase('rift', effectProfile().riftTimeoutMs + 240);
    clearTimeout(riftTimer);
    clearRiftShards();
    RIFT_PALETTES.forEach(name => els.riftBg.classList.remove(name));
    els.riftBg.classList.add(`palette-${action}`);
    seedRiftShards(action);
    els.riftBg.classList.remove('playing');
    void els.riftBg.offsetWidth;
    els.riftBg.classList.add('playing');
    riftTimer = setTimeout(() => {
      els.riftBg.classList.remove('playing');
      clearRiftShards();
    }, effectProfile().riftTimeoutMs);
  }

  function tierLabel(tier) {
    return G.locale.tiers[tier] || tier;
  }

  function gameLabel() {
    return G.game === GAME.TD ? t('gameTruthDareName') : t('gameNeverName');
  }

  function format(str, vars) {
    return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
  }

  function gmLabel(key, vars = {}) {
    if (!GM) return key;
    return GM.format(GM.label(G.lang, key), vars);
  }

  function activeRitualTitle() {
    if (!GM || !G.ritual || G.ritual.classic) return gameLabel();
    return GM.ritualTitle(G.ritual, G.lang);
  }

  function isActiveRitual() {
    return !!(GM && G.ritual && !G.ritual.classic);
  }

  function sourceForCurrent() {
    if (G.game === GAME.TD) return G.curKind === 'dare' ? 'dareCards' : 'truthCards';
    return 'neverCards';
  }

  function enrichCard(card, source) {
    return GM?.enrichCard(card, source) || card;
  }

  function currentStats() {
    return {
      game: G.game,
      tier: G.cat,
      ritualId: G.ritual?.id || null,
      drawn: G.drawn,
      yes: G.yes,
      never: G.never,
      truths: G.truthDone,
      dares: G.dareDone,
      skips: G.skips,
      total: G.total,
      multiplayer: multiplayerActive() ? multiplayerRoundStats() : null
    };
  }

  function cardsFor(cat, source) {
    const cards = G.locale[source] || G.locale.cards || [];
    const filtered = cat === 'all' ? cards : cards.filter(card => card.tier === cat);
    return filtered.map(card => enrichCard(card, source));
  }

  function quickRunLimit() {
    const limit = GM?.quickNormalCount?.() || 12;
    if (G.game === GAME.NEVER && (!G.ritual || G.ritual.id === 'classic-never')) return limit;
    if (G.game === GAME.TD && (!G.ritual || G.ritual.id === 'classic-td')) return limit;
    return null;
  }

  function buildDeck(cat, source) {
    let cards = cardsFor(cat, source);
    if (GM?.ritualApplies(G.ritual, G.game, source)) {
      cards = GM.filterCardsForRitual(cards, G.ritual, source, cat);
    }
    const deck = shuffle(cards);
    const limit = GM?.deckLimit(G.ritual, source);
    if (Number.isFinite(limit)) return deck.slice(0, Math.min(limit, deck.length));
    const quickLimit = quickRunLimit();
    if (G.game === GAME.NEVER && source === 'neverCards' && Number.isFinite(quickLimit)) {
      return deck.slice(0, Math.min(quickLimit, deck.length));
    }
    return deck;
  }

  function cardFromLocale(locale, source, id) {
    const card = (locale?.[source] || []).find(item => item.id === id) || null;
    return card ? enrichCard(card, source) : null;
  }

  function translateDeck(deck, source) {
    return deck.map(card => cardFromLocale(G.locale, source, card.id) || card);
  }

  function translateCurrentCard() {
    if (!G.cur) return;
    const source = G.game === GAME.TD
      ? (G.curKind === 'dare' ? 'dareCards' : 'truthCards')
      : 'neverCards';
    G.cur = cardFromLocale(G.locale, source, G.cur.id) || G.cur;
    applyCard(G.cur, G.curKind);
  }

  function translateLiveCards() {
    G.deck = translateDeck(G.deck, 'neverCards');
    G.truthDeck = translateDeck(G.truthDeck, 'truthCards');
    G.dareDeck = translateDeck(G.dareDeck, 'dareCards');
    translateCurrentCard();
  }

  function setAtm(tier) {
    const atm = ATM[tier] || ATM.warm;
    els.orbA.style.background = atm.a;
    els.orbB.style.background = atm.b;
    els.orbC.style.background = atm.c;
    els.orbC.style.opacity = atm.cOp;
  }

  function setHeat(cat) {
    els.heatWash.style.opacity = HEAT[cat] ?? 0;
  }

  function setFrontHint() {
    const text = G.game === GAME.TD ? t('chooseTruthDareHint') : t('tapToReveal');
    $$('.front-hint').forEach(el => { el.textContent = text; });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[ch]);
  }

  function setChoiceFaceFade(opacity = 1) {
    els.card.style.setProperty('--choice-face-opacity', String(opacity));
  }

  function clearIOSBlurState() {
    if (!IS_IOS_WEBKIT) return;
    $$('.lang-btn, .sp-lang, .mini-lang, .hdr, .tabs-wrap, .card-area, .stats, #splash [data-i18n]').forEach(el => {
      el.style.webkitFilter = 'none';
      el.style.filter = 'none';
    });
    void document.body.offsetHeight;
  }

  function primeIOSDeckLayer() {
    if (!IS_IOS_WEBKIT) return;
    [els.cardArea, els.deckFormation].forEach(el => {
      if (!el) return;
      el.style.webkitTransform = el === els.deckFormation ? 'translate3d(0,-50%,1px)' : 'translateZ(0)';
      el.style.transform = el === els.deckFormation ? 'translate3d(0,-50%,1px)' : 'translateZ(0)';
      if (el === els.deckFormation) el.style.zIndex = '9';
    });
    void els.deckFormation?.offsetHeight;
  }

  function releaseIOSDeckLayer() {
    if (!IS_IOS_WEBKIT) return;
    requestAnimationFrame(() => {
      [els.cardArea, els.deckFormation].forEach(el => {
        if (!el) return;
        el.style.removeProperty('-webkit-transform');
        el.style.removeProperty('transform');
        el.style.removeProperty('z-index');
      });
      clearIOSBlurState();
    });
  }

  function clearDeckFormation({ releaseIOS = true } = {}) {
    clearTimeout(deckFormationTimer);
    deckFormationTimer = null;
    G.formingDeck = false;
    document.body.classList.remove('forming-deck');
    els.deckFormation?.classList.remove('running');
    els.deckFormation?.classList.remove(...FORMATION_CLASSES);
    deckFormationPool.forEach(card => {
      card.className = 'deck-formation-card';
      card.removeAttribute('style');
    });
    els.card.classList.remove('deck-form-hidden', 'deck-form-land');
    if (releaseIOS) releaseIOSDeckLayer();
  }

  function ensureDeckFormationPool(size) {
    if (!els.deckFormation) return [];
    if (!deckFormationPool.length) {
      deckFormationPool = Array.from(els.deckFormation.querySelectorAll('.deck-formation-card'));
    }
    while (deckFormationPool.length < size) {
      const card = document.createElement('div');
      card.className = 'deck-formation-card';
      deckFormationPool.push(card);
      els.deckFormation.appendChild(card);
    }
    return deckFormationPool;
  }

  function nextModeFormationVariant() {
    const variant = FORMATION_VARIANTS[modeFormationIndex % FORMATION_VARIANTS.length];
    modeFormationIndex++;
    return variant;
  }

  function formationConfig(variant = 'sidecut') {
    const base = FORMATION_CONFIGS[variant] || FORMATION_CONFIGS.sidecut;
    const profile = effectProfile();
    return {
      ...base,
      count: Math.max(5, Math.round(base.count * profile.deckCountScale)),
      durMs: Math.round(base.durMs * profile.deckDurScale),
      landingDurMs: Math.round(base.landingDurMs * profile.deckLandingScale),
      opacity: base.opacity * profile.deckOpacityScale
    };
  }

  function makeFormationCard(i, total, cfg, { landing = false, variant = 'sidecut', el = null } = {}) {
    const card = el || document.createElement('div');
    const side = i % 2 === 0 ? -1 : 1;
    const center = i - (total - 1) / 2;
    const progress = total <= 1 ? 0 : i / (total - 1);
    const angle = -112 + progress * 224;
    const rad = angle * Math.PI / 180;
    const wide = Math.sin(rad);
    const high = -Math.cos(rad);
    const sideDistance = 74 + i * 2.8;
    const stackX = center * 0.9;
    const stackY = 8 + center * -0.38;

    card.className = `deck-formation-card is-live${landing ? ' is-landing' : ''}`;
    card.removeAttribute('style');
    card.style.zIndex = landing ? '999' : String(2 + i);
    const delayMs = landing ? cfg.landingDelayMs : i * cfg.stepMs;
    card.style.setProperty('--delay', `${delayMs / 1000}s`);
    card.style.setProperty('--form-dur', `${(landing ? cfg.landingDurMs : cfg.durMs) / 1000}s`);
    card.style.setProperty('--from-x', `${side * sideDistance}vw`);
    card.style.setProperty('--from-y', `${side * (18 + i * 1.4)}px`);
    card.style.setProperty('--from-rz', `${side * (18 + i * 1.8)}deg`);
    card.style.setProperty('--mid-x', `${side * (58 - progress * 24)}px`);
    card.style.setProperty('--mid-y', `${-20 + center * 1.6}px`);
    card.style.setProperty('--mid-rz', `${side * (5 + i * 0.3)}deg`);
    card.style.setProperty('--to-x', `${landing ? 0 : stackX}px`);
    card.style.setProperty('--to-y', `${landing ? 0 : stackY}px`);
    card.style.setProperty('--to-z', '0px');
    card.style.setProperty('--to-rz', `${landing ? 0 : center * 0.2}deg`);
    card.style.setProperty('--to-scale', `${landing ? 1 : 0.966 + i * 0.0018}`);
    card.style.setProperty('--final-opacity', landing ? '1' : `${Math.max(0.07, cfg.opacity - (total - i) * 0.012)}`);
    card.style.setProperty('--start-scale', landing ? '0.98' : '');
    card.style.setProperty('--mid-scale', landing ? '1' : '');
    card.style.setProperty('--pre-scale', landing ? '1' : '');

    card.style.setProperty('--wide-from-x', `${wide * 320}px`);
    card.style.setProperty('--wide-from-y', `${high * 172 - 96}px`);
    card.style.setProperty('--wide-from-rz', `${angle * 0.38}deg`);
    card.style.setProperty('--arc-x', `${wide * 178}px`);
    card.style.setProperty('--arc-y', `${high * 94 - 32}px`);
    card.style.setProperty('--arc-rz', `${angle * 0.24}deg`);
    card.style.setProperty('--fan-x', `${center * 18}px`);
    card.style.setProperty('--fan-y', `${-34 + Math.abs(center) * 3.8}px`);
    card.style.setProperty('--fan-rz', `${center * 5.2}deg`);

    card.style.setProperty('--tilt-y', `${side * (20 - progress * 8)}deg`);
    card.style.setProperty('--orbit-start-x', `${side * (320 + Math.abs(center) * 8)}px`);
    card.style.setProperty('--orbit-start-y', `${-130 + Math.abs(center) * 6}px`);
    card.style.setProperty('--orbit-mid-x', `${side * (166 - progress * 42)}px`);
    card.style.setProperty('--orbit-mid-y', `${-92 + Math.abs(center) * 5}px`);
    card.style.setProperty('--orbit-rz', `${side * (44 - progress * 18)}deg`);
    card.style.setProperty('--weave-x', `${side * (40 + Math.abs(center) * 3)}px`);
    card.style.setProperty('--weave-y', `${center * 4}px`);
    card.style.setProperty('--weave-rz', `${side * (9 - progress * 3)}deg`);

    const spiralA = angle + 70;
    const spiralB = angle + 18;
    const spiralARad = spiralA * Math.PI / 180;
    const spiralBRad = spiralB * Math.PI / 180;
    card.style.setProperty('--spiral-a-x', `${Math.sin(spiralARad) * 300}px`);
    card.style.setProperty('--spiral-a-y', `${Math.cos(spiralARad) * 190 - 60}px`);
    card.style.setProperty('--spiral-b-x', `${Math.sin(spiralBRad) * 170}px`);
    card.style.setProperty('--spiral-b-y', `${Math.cos(spiralBRad) * 104 - 24}px`);
    card.style.setProperty('--spiral-c-x', `${Math.sin(rad) * 82}px`);
    card.style.setProperty('--spiral-c-y', `${Math.cos(rad) * 44}px`);
    card.style.setProperty('--spiral-rz', `${angle + 90}deg`);
    card.style.setProperty('--spiral-end-rz', `${center * 5}deg`);

    card.style.setProperty('--swan-start-x', `${side * (300 + Math.abs(center) * 9)}px`);
    card.style.setProperty('--swan-start-y', `${-40 + Math.abs(center) * 3}px`);
    card.style.setProperty('--swan-wing-x', `${side * (170 + Math.abs(center) * 12)}px`);
    card.style.setProperty('--swan-wing-y', `${-88 + Math.abs(center) * 5}px`);
    card.style.setProperty('--swan-wing-rz', `${side * (38 + Math.abs(center) * 1.8)}deg`);
    card.style.setProperty('--swan-fan-x', `${center * 21}px`);
    card.style.setProperty('--swan-fan-y', `${-48 + Math.abs(center) * 4.8}px`);
    card.style.setProperty('--swan-fan-rz', `${center * 6.2}deg`);

    card.innerHTML = landing
      ? `${CARD_CORNERS}<div class="front-icon">🔥</div><div class="front-hint">${escapeHtml(G.game === GAME.TD ? t('chooseTruthDareHint') : t('tapToReveal'))}</div>`
      : CARD_CORNERS;
    return card;
  }

  function playDeckFormation({ variant = 'sidecut' } = {}) {
    if (baselineEffectQuality() && G.formingDeck) return;
    if (!els.app.classList.contains('on') || !els.deckFormation) {
      G.formingDeck = false;
      showCurrentActions();
      return;
    }

    const safeVariant = FORMATION_CONFIGS[variant] ? variant : 'sidecut';
    const cfg = formationConfig(safeVariant);
    markFxPhase('shuffle', cfg.landingDelayMs + cfg.landingDurMs + 760);
    clearDeckFormation({ releaseIOS: false });
    hideActions({ immediate: true });
    G.busy = true;
    G.formingDeck = true;
    document.body.classList.add('forming-deck');
    els.card.classList.add('deck-form-hidden');
    primeIOSDeckLayer();
    window.SFX.shuffle?.();

    const pool = ensureDeckFormationPool(cfg.count + 1);
    els.deckFormation.classList.add(`formation-${safeVariant}`);
    for (let i = 0; i < cfg.count; i++) {
      els.deckFormation.appendChild(makeFormationCard(i, cfg.count, cfg, { variant: safeVariant, el: pool[i] }));
    }
    els.deckFormation.appendChild(makeFormationCard(cfg.count, cfg.count + 1, cfg, { landing: true, variant: safeVariant, el: pool[cfg.count] }));

    void els.deckFormation.offsetWidth;
    els.deckFormation.classList.add('running');

    deckFormationTimer = setTimeout(() => {
      els.card.classList.remove('deck-form-hidden');
      els.card.classList.add('deck-form-land');

      deckFormationTimer = setTimeout(() => {
        const runIntroTutorial = shouldRunTruthDareTutorial();
        clearDeckFormation();
        G.formingDeck = false;
        G.busy = false;
        if (multiplayerActive()) positionMpWebcam(webcamDrag.corner || 'tr');
        updateTruthDareButtons();
        if (runIntroTutorial) queueTruthDareTutorial(220);
        else {
          if (G.game === GAME.TD) G.truthDareIntroReady = true;
          showCurrentActions();
          processMultiplayerQueue();
        }
      }, 440);
    }, cfg.landingDelayMs + cfg.landingDurMs + 70);
  }

  function clearSwipeTutorialTimers() {
    const hadTimers = swipeTutorialTimers.length > 0;
    swipeTutorialTimers.forEach(id => clearTimeout(id));
    swipeTutorialTimers = [];
    return hadTimers;
  }

  function tutorialTimer(fn, ms) {
    const id = setTimeout(() => {
      swipeTutorialTimers = swipeTutorialTimers.filter(timerId => timerId !== id);
      fn();
    }, ms);
    swipeTutorialTimers.push(id);
  }

  function setSwipeTutorialFrame(dx, leftOpacity, rightOpacity, faceOpacity = 1) {
    const rot = dx * 0.04;
    const lift = Math.min(Math.abs(dx) * 0.032, 10);
    els.card.style.transform = dx ? `translateX(${dx}px) translateY(${-lift}px) rotate(${rot}deg)` : '';
    els.dirLeft.style.opacity = leftOpacity;
    els.dirRight.style.opacity = rightOpacity;
    setChoiceFaceFade(faceOpacity);
  }

  function resetTutorialVisuals() {
    els.card.classList.remove('td-tutorial');
    els.card.classList.remove('never-tutorial');
    els.card.style.transition = '';
    els.dirLeft.style.transition = '';
    els.dirRight.style.transition = '';
    setSwipeTutorialFrame(0, '0', '0', 1);
  }

  function cancelSwipeTutorial({ restoreActions = true } = {}) {
    const hadTimers = clearSwipeTutorialTimers();
    if (!G.tutorialing) {
      if (hadTimers && restoreActions && !G.formingDeck && !G.completed) {
        resetTutorialVisuals();
        G.busy = false;
        requestAnimationFrame(() => {
          showCurrentActions();
          processMultiplayerQueue();
        });
      }
      return;
    }
    G.tutorialing = false;
    G.busy = false;
    resetTutorialVisuals();
    if (restoreActions && !G.formingDeck && !G.completed) {
      requestAnimationFrame(() => {
        showCurrentActions();
        processMultiplayerQueue();
      });
    }
  }

  function shouldRunTruthDareTutorial() {
    return G.truthDareTutorialArmed && G.game === GAME.TD && G.drawn === 0 && !G.flipped && !G.completed && !G.tutorialing;
  }

  function truthDareIntroBlocking() {
    return G.game === GAME.TD && G.drawn === 0 && !G.flipped && !G.completed && !G.truthDareIntroReady;
  }

  function shouldRunNeverTutorial() {
    return G.neverTutorialArmed && G.game === GAME.NEVER && G.drawn === 1 && G.flipped && G.cur && !G.completed && !G.tutorialing;
  }

  function queueTruthDareTutorial(delay = 620) {
    clearSwipeTutorialTimers();
    if (!shouldRunTruthDareTutorial()) {
      if (G.game === GAME.TD) G.truthDareIntroReady = true;
      return;
    }
    G.truthDareIntroReady = false;
    G.truthDareTutorialArmed = false;
    tutorialTimer(runTruthDareTutorial, delay);
  }

  function queueNeverTutorial(delay = 430) {
    clearSwipeTutorialTimers();
    if (!shouldRunNeverTutorial()) return;
    tutorialTimer(runNeverTutorial, delay);
  }

  function runTruthDareTutorial() {
    if (G.game !== GAME.TD || G.drawn > 0 || G.flipped || G.completed || G.busy) {
      if (G.game === GAME.TD && !G.completed) G.truthDareIntroReady = true;
      return;
    }
    G.tutorialing = true;
    G.busy = true;
    hideActions({ immediate: true });
    els.card.classList.add('td-tutorial');
    els.card.style.opacity = '';
    els.card.style.transition = 'transform 0.44s cubic-bezier(0.2,0.82,0.2,1)';
    els.dirLeft.style.transition = 'opacity 0.22s ease';
    els.dirRight.style.transition = 'opacity 0.22s ease';

    const travel = Math.min(92, Math.max(58, els.card.getBoundingClientRect().width * 0.25));
    setSwipeTutorialFrame(0, '0', '0', 1);
    tutorialTimer(() => setSwipeTutorialFrame(-travel, String(OVERLAY_MAX * 0.78), '0', 0.06), 120);
    tutorialTimer(() => {
      els.card.style.transition = 'transform 0.32s cubic-bezier(0.34,1.4,0.64,1)';
      setSwipeTutorialFrame(0, '0', '0', 1);
    }, 790);
    tutorialTimer(() => {
      els.card.style.transition = 'transform 0.44s cubic-bezier(0.2,0.82,0.2,1)';
      setSwipeTutorialFrame(travel, '0', String(OVERLAY_MAX * 0.78), 0.06);
    }, 1220);
    tutorialTimer(() => {
      els.card.style.transition = 'transform 0.32s cubic-bezier(0.34,1.4,0.64,1)';
      setSwipeTutorialFrame(0, '0', '0', 1);
    }, 1890);
    tutorialTimer(() => {
      G.tutorialing = false;
      G.busy = false;
      els.card.classList.remove('td-tutorial');
      els.card.style.transition = '';
      els.dirLeft.style.transition = '';
      els.dirRight.style.transition = '';
      setSwipeTutorialFrame(0, '0', '0', 1);
      G.truthDareIntroReady = true;
      showCurrentActions();
      processMultiplayerQueue();
    }, 2500);
  }

  function runNeverTutorial() {
    if (!G.neverTutorialArmed || G.game !== GAME.NEVER || G.drawn !== 1 || !G.flipped || !G.cur || G.completed || G.busy) return;
    G.neverTutorialArmed = false;
    G.tutorialing = true;
    G.busy = true;
    hideActions({ immediate: true });
    els.card.classList.add('never-tutorial');
    els.card.style.opacity = '';
    els.card.style.transition = 'transform 0.42s cubic-bezier(0.2,0.82,0.2,1)';
    els.dirLeft.style.transition = 'opacity 0.2s ease';
    els.dirRight.style.transition = 'opacity 0.2s ease';

    const travel = Math.min(92, Math.max(58, els.card.getBoundingClientRect().width * 0.25));
    setSwipeTutorialFrame(0, '0', '0', 1);
    tutorialTimer(() => setSwipeTutorialFrame(-travel, String(OVERLAY_MAX * 0.78), '0', 1), 110);
    tutorialTimer(() => {
      els.card.style.transition = 'transform 0.3s cubic-bezier(0.34,1.4,0.64,1)';
      setSwipeTutorialFrame(0, '0', '0', 1);
    }, 760);
    tutorialTimer(() => {
      els.card.style.transition = 'transform 0.42s cubic-bezier(0.2,0.82,0.2,1)';
      setSwipeTutorialFrame(travel, '0', String(OVERLAY_MAX * 0.78), 1);
    }, 1180);
    tutorialTimer(() => {
      els.card.style.transition = 'transform 0.3s cubic-bezier(0.34,1.4,0.64,1)';
      setSwipeTutorialFrame(0, '0', '0', 1);
    }, 1830);
    tutorialTimer(() => {
      G.tutorialing = false;
      G.busy = false;
      els.card.classList.remove('never-tutorial');
      els.card.style.transition = '';
      els.dirLeft.style.transition = '';
      els.dirRight.style.transition = '';
      setSwipeTutorialFrame(0, '0', '0', 1);
      showCurrentActions();
      processMultiplayerQueue();
    }, 2380);
  }

  function setSwipeOverlayContent() {
    const leftEmoji = els.dirLeft.querySelector('.dir-emoji');
    const rightEmoji = els.dirRight.querySelector('.dir-emoji');

    if (G.game === GAME.TD) {
      const resultPhase = G.flipped && G.cur;
      document.body.dataset.tdPhase = resultPhase ? 'result' : 'choice';
      if (resultPhase) {
        els.dirLeft.dataset.label = t('skip');
        els.dirRight.dataset.label = t('done');
        leftEmoji.textContent = '👼';
        rightEmoji.textContent = '😈';
        return;
      }

      els.dirLeft.dataset.label = t('truthLabel');
      els.dirRight.dataset.label = t('dareLabel');
      leftEmoji.textContent = '⚠️';
      rightEmoji.textContent = '🚨';
      return;
    }

    delete document.body.dataset.tdPhase;
    els.dirLeft.dataset.label = t('answerNever');
    els.dirRight.dataset.label = t('answerYes');
    leftEmoji.textContent = '👼';
    rightEmoji.textContent = '😈';
  }

  function tick(el, val, force = false) {
    const next = String(val);
    if (!force && el.dataset.value === next) return;
    el.dataset.value = next;
    el.classList.remove('ticking');
    void el.offsetWidth;
    el.textContent = next;
    el.classList.add('ticking');
  }

  function remaining() {
    return Math.max(G.total - G.drawn, 0);
  }

  function truthDareRemaining() {
    return G.game === GAME.TD ? remaining() : G.truthDeck.length + G.dareDeck.length;
  }

  function truthDareDeckRemaining() {
    return G.truthDeck.length + G.dareDeck.length;
  }

  function truthDareDeck(kind) {
    return kind === 'dare' ? G.dareDeck : G.truthDeck;
  }

  function truthDareCanChoose(kind) {
    return G.game === GAME.TD && !G.flipped && !G.completed && remaining() > 0 && truthDareDeck(kind).length > 0;
  }

  function handleTruthDareEmpty(kind) {
    const choiceActionsVisible = !els.actTdChoice.classList.contains('hidden');
    resetSyntheticSwipe();
    drag.moved = true;
    setChoiceFaceFade(1);
    G.busy = false;
    toast(kind === 'truth' ? t('truthEmpty') : t('dareEmpty'));
    updateTruthDareButtons();
    if (choiceActionsVisible) {
      els.actTdChoice.classList.remove('hidden', 'flow-enter', 'flow-exit');
      els.actTdChoice.setAttribute('aria-hidden', 'false');
    }
    if (truthDareDeckRemaining() === 0 || remaining() <= 0) {
      showAfter();
      return;
    }
    setSwipeOverlayContent();
    if (els.actTdChoice.classList.contains('hidden')) {
      setActionVisible(els.actTdChoice, true, true);
    }
  }

  function isNoSkipRun() {
    return G.game === GAME.TD && G.ritual?.id === 'no-skips';
  }

  function setStatLabels() {
    if (G.game === GAME.TD) {
      if (multiplayerActive()) {
        els.stat1Lbl.textContent = t('afterPlayed');
        els.stat2Lbl.textContent = t('statLeft');
        els.stat3Lbl.textContent = mpPlayerScoreLabel('host');
        els.stat4Lbl.textContent = mpPlayerScoreLabel('guest');
        return;
      }
      els.stat1Lbl.textContent = t('statTruths');
      els.stat2Lbl.textContent = t('statDares');
      els.stat3Lbl.textContent = isNoSkipRun() ? t('afterPlayed') : t('statSkips');
      els.stat4Lbl.textContent = t('statLeft');
      return;
    }

    els.stat1Lbl.textContent = t('statDrawn');
    els.stat2Lbl.textContent = t('statLeft');
    if (multiplayerActive() && G.game === GAME.NEVER) {
      els.stat3Lbl.textContent = mpPlayerScoreLabel('host');
      els.stat4Lbl.textContent = mpPlayerScoreLabel('guest');
      return;
    }
    els.stat3Lbl.textContent = t('answerYes');
    els.stat4Lbl.textContent = t('answerNever');
  }

  function updateUI() {
    setStatLabels();
    if (G.game === GAME.TD) {
      if (multiplayerActive()) {
        tick(els.sDrawn, G.drawn);
        tick(els.sLeft, remaining());
        tick(els.sYes, mpPlayerScore('host'));
        tick(els.sNever, mpPlayerScore('guest'));
      } else {
        tick(els.sDrawn, G.truthDone);
        tick(els.sLeft, G.dareDone);
        tick(els.sYes, isNoSkipRun() ? G.drawn : G.skips);
        tick(els.sNever, remaining());
      }
    } else {
      tick(els.sDrawn, G.drawn);
      tick(els.sLeft, remaining());
      if (multiplayerActive()) {
        tick(els.sYes, mpPlayerScore('host'));
        tick(els.sNever, mpPlayerScore('guest'));
      } else {
        tick(els.sYes, G.yes);
        tick(els.sNever, G.never);
      }
    }

    const pct = G.total > 0 ? Math.round((G.drawn / G.total) * 100) : 0;
    els.prog.style.width = pct + '%';
    els.progLbl.textContent = format(t('progress'), { drawn: G.drawn, total: G.total });
    updateTruthDareButtons();
    updateMultiplayerButtons();
    if (multiplayerActive()) setMpStatus();
  }

  let toastTimer = null;
  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('on'), 2200);
  }

  function mpDebugError(error) {
    if (!error) return null;
    return {
      name: error.name || null,
      message: error.message || String(error),
      type: error.type || null,
      code: error.code || null
    };
  }

  function mpDebugTrackState(stream) {
    return stream?.getTracks?.().map(track => ({
      kind: track.kind,
      enabled: track.enabled,
      muted: track.muted,
      readyState: track.readyState,
      label: track.label || ''
    })) || [];
  }

  function mpDebugVideoState(video) {
    if (!video) return null;
    return {
      hasSrcObject: !!video.srcObject,
      tracks: mpDebugTrackState(video.srcObject),
      readyState: video.readyState,
      paused: video.paused,
      muted: video.muted,
      autoplay: video.autoplay,
      playsInline: video.playsInline,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      currentTime: Number(video.currentTime || 0).toFixed(2),
      error: video.error ? { code: video.error.code, message: video.error.message || '' } : null
    };
  }

  function mpDebugState() {
    return {
      role: G.mp.role,
      roomId: G.mp.roomId,
      remoteReady: G.mp.remoteReady,
      hadRemote: G.mp.hadRemote,
      connectionState: G.mp.connectionState,
      remotePeerId: G.mp.remotePeerId,
      stateSeq: G.mp.stateSeq || 0,
      lastAppliedSeq: G.mp.lastAppliedSeq || 0,
      lastStateRequestAt: G.mp.lastStateRequestAt || 0,
      pendingStateSnapshot: G.mp.pendingStateSnapshot ? {
        seq: G.mp.pendingStateSnapshot.seq || 0,
        reason: G.mp.pendingStateSnapshot.reason || null
      } : null,
      webcamOn: G.mp.webcamOn,
      isAndroid: IS_ANDROID,
      isIOS: IS_IOS_WEBKIT,
      secure: window.isSecureContext,
      visibility: document.visibilityState,
      forceRelay: MP_FORCE_RELAY,
      relayClientId: G.mp.relayClientId,
      relayFailCount: G.mp.relayFailCount,
      relayMissingCount: G.mp.relayMissingCount || 0,
      relaySeen: G.mp.relaySeen?.size || 0,
      playerStats: multiplayerActive() ? multiplayerRoundStats() : null,
      peer: G.mp.peer ? {
        id: G.mp.peer.id || null,
        open: !!G.mp.peer.open,
        destroyed: !!G.mp.peer.destroyed,
        disconnected: !!G.mp.peer.disconnected
      } : null,
      conn: G.mp.conn ? {
        peer: G.mp.conn.peer || null,
        open: !!G.mp.conn.open,
        type: G.mp.conn.type || null
      } : null,
      conns: (G.mp.conns || []).map(conn => ({
        peer: conn?.peer || null,
        open: !!conn?.open,
        type: conn?.type || null,
        label: conn?.label || null
      })),
      call: G.mp.call ? {
        peer: G.mp.call.peer || null,
        open: !!G.mp.call.open
      } : null,
      calls: (G.mp.calls || []).map(call => ({
        peer: call?.peer || null,
        open: !!call?.open
      })),
      localStream: mpDebugTrackState(G.mp.localStream),
      localVideo: mpDebugVideoState(els.mpLocalVideo),
      remoteVideo: mpDebugVideoState(els.mpRemoteVideo),
      ua: navigator.userAgent
    };
  }

  function ensureMpDebugPanel() {
    if (!MP_DEBUG) return;
    if (mpDebugPanel) return;
    mpDebugPanel = document.createElement('section');
    mpDebugPanel.className = 'mp-debug-panel';
    mpDebugPanel.innerHTML = `
      <div class="mp-debug-head">
        <b>MP DEBUG</b>
        <button type="button" data-mp-debug-copy>Copy</button>
        <button type="button" data-mp-debug-clear>Clear</button>
      </div>
      <pre class="mp-debug-log" aria-live="polite"></pre>
    `;
    document.body.appendChild(mpDebugPanel);
    mpDebugLogEl = mpDebugPanel.querySelector('.mp-debug-log');
    mpDebugPanel.querySelector('[data-mp-debug-copy]')?.addEventListener('click', async () => {
      const text = JSON.stringify(mpDebugEntries, null, 2);
      try {
        await navigator.clipboard.writeText(text);
        toast('Debug log copied');
      } catch (e) {
        window.prompt('Copy debug log:', text);
      }
    });
    mpDebugPanel.querySelector('[data-mp-debug-clear]')?.addEventListener('click', () => {
      mpDebugEntries.length = 0;
      renderMpDebugPanel();
    });
  }

  function renderMpDebugPanel() {
    if (!MP_DEBUG) return;
    ensureMpDebugPanel();
    if (!mpDebugLogEl) return;
    mpDebugLogEl.textContent = mpDebugEntries.slice(-42).map(entry => {
      const side = entry.remote ? 'REMOTE' : 'LOCAL';
      const role = entry.role || entry.state?.role || '?';
      const detail = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
      return `${entry.time} ${side}/${role} ${entry.event}${detail}`;
    }).join('\n');
    mpDebugLogEl.scrollTop = mpDebugLogEl.scrollHeight;
  }

  function sendMpDebugEntry(entry) {
    if (!MP_DEBUG || entry.remote) return;
    const conn = getOpenMpConn();
    if (!conn || !conn.open) return;
    try {
      conn.send({ type: 'mp-debug', entry });
    } catch (error) {
      console.warn('[Ignight mp debug send]', error);
    }
  }

  function mpDebug(event, data = null) {
    if (!MP_DEBUG) return;
    const entry = {
      time: new Date().toISOString().split('T')[1].replace('Z', ''),
      ms: Math.round(performance.now()),
      event,
      role: G.mp.role || null,
      roomId: G.mp.roomId || null,
      data,
      state: mpDebugState()
    };
    mpDebugEntries.push(entry);
    if (mpDebugEntries.length > 180) mpDebugEntries.splice(0, mpDebugEntries.length - 180);
    console.log('[Ignight MP debug]', entry);
    renderMpDebugPanel();
    sendMpDebugEntry(entry);
  }

  function receiveMpDebug(entry) {
    if (!MP_DEBUG || !entry) return;
    mpDebugEntries.push({ ...entry, remote: true });
    if (mpDebugEntries.length > 180) mpDebugEntries.splice(0, mpDebugEntries.length - 180);
    renderMpDebugPanel();
  }

  function bindMpDebugVideoEvents() {
    if (!MP_DEBUG) return;
    [
      ['remote', els.mpRemoteVideo],
      ['local', els.mpLocalVideo]
    ].forEach(([name, video]) => {
      if (!video) return;
      ['loadedmetadata', 'playing', 'pause', 'waiting', 'stalled', 'resize', 'error'].forEach(eventName => {
        video.addEventListener(eventName, () => {
          mpDebug(`${name}-video-${eventName}`, mpDebugVideoState(video));
        });
      });
    });
  }

  function bindMpTrackDebug(stream, owner = 'local-stream') {
    if (!MP_DEBUG || !stream?.getTracks) return;
    stream.getTracks().forEach(track => {
      if (track.__ignightDebugBound) return;
      track.__ignightDebugBound = true;
      ['mute', 'unmute', 'ended'].forEach(eventName => {
        track.addEventListener?.(eventName, () => {
          mpDebug(`${owner}-track-${eventName}`, {
            kind: track.kind,
            enabled: track.enabled,
            muted: track.muted,
            readyState: track.readyState,
            label: track.label || ''
          });
        });
      });
    });
  }

  function waitForMpVideoWarmup(video, timeoutMs = 1200) {
    if (!video) return Promise.resolve(false);
    if (video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= 2) return Promise.resolve(true);
    return new Promise(resolve => {
      let done = false;
      const finish = ok => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        video.removeEventListener('loadedmetadata', onReady);
        video.removeEventListener('resize', onReady);
        video.removeEventListener('playing', onReady);
        resolve(ok);
      };
      const onReady = () => {
        if (video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= 2) finish(true);
      };
      const timer = setTimeout(() => finish(false), timeoutMs);
      video.addEventListener('loadedmetadata', onReady);
      video.addEventListener('resize', onReady);
      video.addEventListener('playing', onReady);
      onReady();
    });
  }

  function classicNeverRitual() {
    return GM?.getRitual?.('classic-never') || { id: 'classic-never', classic: true, mode: GAME.NEVER, tier: 'all' };
  }

  function multiplayerActive() {
    return !!G.mp?.active;
  }

  function mpConnectionBlocksAction() {
    return ['waiting', 'connecting', 'reconnecting', 'offline', 'syncing'].includes(G.mp.connectionState);
  }

  function localTurn() {
    if (!multiplayerActive()) return true;
    return G.mp.turn === G.mp.role;
  }

  function multiplayerCanAct() {
    if (!multiplayerActive()) return true;
    return G.mp.remoteReady && !mpConnectionBlocksAction() && localTurn();
  }

  function multiplayerWaitCopy() {
    if (!multiplayerActive()) return t('mpWait');
    if (G.mp.connectionState === 'syncing') return t('mpRestoringSession');
    if (G.mp.connectionState === 'offline') return t('mpTryingAgain');
    if (G.mp.connectionState === 'reconnecting') return t('mpPartnerReconnecting');
    if (!G.mp.remoteReady) {
      return G.mp.role === 'host' ? t('mpSendInviteFirst') : t('mpWaitingHost');
    }
    return t('mpWaitTurn');
  }

  function remoteRole() {
    return G.mp.role === 'host' ? 'guest' : 'host';
  }

  function blankMpPlayerStats() {
    return {
      host: { yes: 0, never: 0, truth: 0, dare: 0, skips: 0 },
      guest: { yes: 0, never: 0, truth: 0, dare: 0, skips: 0 }
    };
  }

  function normalizeMpRole(role) {
    return role === 'guest' ? 'guest' : 'host';
  }

  function resetMpPlayerStats() {
    G.mp.playerStats = blankMpPlayerStats();
  }

  function mpStatsFor(role) {
    if (!G.mp.playerStats) resetMpPlayerStats();
    const key = normalizeMpRole(role);
    if (!G.mp.playerStats[key]) G.mp.playerStats[key] = {};
    G.mp.playerStats[key] = {
      yes: 0,
      never: 0,
      truth: 0,
      dare: 0,
      skips: 0,
      ...G.mp.playerStats[key]
    };
    return G.mp.playerStats[key];
  }

  function recordMpNeverOutcome(choice, role) {
    if (!multiplayerActive()) return;
    const stats = mpStatsFor(role || G.mp.role);
    if (choice === 'yes') stats.yes++;
    else stats.never++;
  }

  function recordMpTruthDareOutcome(outcome, kind, role) {
    if (!multiplayerActive()) return;
    const stats = mpStatsFor(role || G.mp.role);
    if (outcome === 'skip') {
      stats.skips++;
    } else if (kind === 'dare') {
      stats.dare++;
    } else {
      stats.truth++;
    }
  }

  function mpInitial(text, fallback) {
    const clean = String(text || fallback || '').trim();
    return clean ? clean.charAt(0).toUpperCase() : fallback;
  }

  function mpPlayerScoreLabel(role) {
    if (G.game === GAME.TD) {
      return `${role === 'host' ? 'P1' : 'P2'} ${mpInitial(t('statTruths'), 'T')}/${mpInitial(t('statDares'), 'D')}`;
    }
    return `${role === 'host' ? 'P1' : 'P2'} ${mpInitial(t('answerYes'), 'Y')}/${mpInitial(t('answerNever'), 'N')}`;
  }

  function mpPlayerScore(role) {
    const stats = mpStatsFor(role);
    if (G.game === GAME.TD) return `${stats.truth}/${stats.dare}`;
    return `${stats.yes}/${stats.never}`;
  }

  function multiplayerRoundStats() {
    const host = mpStatsFor('host');
    const guest = mpStatsFor('guest');
    return {
      role: G.mp.role || null,
      turn: G.mp.turn || null,
      host: { yes: host.yes, never: host.never, truth: host.truth, dare: host.dare, skips: host.skips },
      guest: { yes: guest.yes, never: guest.never, truth: guest.truth, dare: guest.dare, skips: guest.skips }
    };
  }

  function makeMpClientId() {
    const raw = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return `${G.mp.role || 'peer'}-${raw.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40)}`;
  }

  function makeMpPacketId() {
    if (!G.mp.relayClientId) G.mp.relayClientId = makeMpClientId();
    G.mp.relaySeq = (G.mp.relaySeq || 0) + 1;
    return `${G.mp.relayClientId}-${G.mp.relaySeq}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function rememberMpPacket(id) {
    if (!id) return true;
    if (!G.mp.relaySeen) G.mp.relaySeen = new Set();
    if (G.mp.relaySeen.has(id)) return false;
    G.mp.relaySeen.add(id);
    if (G.mp.relaySeen.size > 260) {
      G.mp.relaySeen = new Set(Array.from(G.mp.relaySeen).slice(-180));
    }
    return true;
  }

  function makeMpRoomId() {
    if (MP_DEBUG_ROLE === 'host' && MP_DEBUG_ROOM) return MP_DEBUG_ROOM;
    const seed = crypto.randomUUID
      ? crypto.randomUUID().replaceAll('-', '').slice(0, 16)
      : Math.random().toString(36).slice(2, 18);
    return `${MP_PREFIX}-${seed}`;
  }

  function mpInviteUrl() {
    const url = new URL(MP_PUBLIC_URL);
    url.searchParams.set('mp', G.mp.roomId);
    if (MP_DEBUG) {
      url.searchParams.set('mpdebug', '1');
      if (MP_FORCE_RELAY) url.searchParams.set('mprelay', '1');
      url.searchParams.set('t', URL_FLAGS.get('t') || 'mpdebug');
    }
    return url.href;
  }

  function multiplayerGameDetail() {
    if (!G.game) return t('mpMultiplayer');
    return activeRitualTitle() || (G.game === GAME.TD ? t('gameTruthDareName') : t('gameNeverName'));
  }

  function defaultMpIceServers() {
    return [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ];
  }

  function normalizeMpIceServers(servers) {
    if (!Array.isArray(servers)) return [];
    return servers
      .map(server => {
        if (!server || !server.urls) return null;
        const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
        const cleanUrls = urls
          .map(url => String(url || '').trim())
          .filter(url => /^(stun|turn|turns):/i.test(url));
        if (!cleanUrls.length) return null;
        const clean = { urls: cleanUrls.length === 1 ? cleanUrls[0] : cleanUrls };
        if (server.username) clean.username = String(server.username);
        if (server.credential) clean.credential = String(server.credential);
        return clean;
      })
      .filter(Boolean);
  }

  function summarizeMpIceServers(servers) {
    return (servers || []).map(server => ({
      urls: server.urls,
      turn: String(Array.isArray(server.urls) ? server.urls.join(' ') : server.urls).includes('turn:') ||
        String(Array.isArray(server.urls) ? server.urls.join(' ') : server.urls).includes('turns:'),
      hasCredential: !!server.credential
    }));
  }

  async function loadMpIceServers() {
    if (G.mp.iceServers?.length) return G.mp.iceServers;
    const fallback = defaultMpIceServers();
    try {
      const url = new URL(MP_ICE_URL, window.location.href);
      url.searchParams.set('room', G.mp.roomId || 'ignight');
      url.searchParams.set('role', G.mp.role || 'peer');
      const response = await fetch(url.href, { cache: 'no-store' });
      if (!response.ok) throw new Error(`ICE ${response.status}`);
      const data = await response.json();
      const servers = normalizeMpIceServers(data?.iceServers || data?.ice_servers);
      G.mp.iceServers = servers.length ? servers : fallback;
      G.mp.iceSource = data?.source || (servers.length ? 'turn-config' : 'default-stun');
      G.mp.iceConfigured = !!data?.configured || G.mp.iceServers.some(server =>
        String(Array.isArray(server.urls) ? server.urls.join(' ') : server.urls).includes('turn')
      );
      mpDebug('ice-config', {
        source: G.mp.iceSource,
        configured: G.mp.iceConfigured,
        servers: summarizeMpIceServers(G.mp.iceServers)
      });
    } catch (error) {
      G.mp.iceServers = fallback;
      G.mp.iceSource = 'default-stun-fallback';
      G.mp.iceConfigured = false;
      mpDebug('ice-config-error', mpDebugError(error));
    }
    return G.mp.iceServers;
  }

  function mpPeerOptions() {
    return {
      host: '0.peerjs.com',
      port: 443,
      path: '/',
      secure: true,
      debug: 1,
      config: {
        iceServers: G.mp.iceServers?.length ? G.mp.iceServers : defaultMpIceServers(),
        iceTransportPolicy: MP_FORCE_RELAY ? 'relay' : 'all'
      }
    };
  }

  function mpConnectOptions(label = 'ignight-control') {
    return {
      label,
      serialization: 'json',
      metadata: {
        app: 'ignight',
        role: G.mp.role,
        roomId: G.mp.roomId
      }
    };
  }

  function waitForPeerJs() {
    mpDebug('peerjs-wait-start', { hasPeer: !!window.Peer });
    return new Promise((resolve, reject) => {
      if (!window.Peer && !document.querySelector('script[data-peerjs-loader]')) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.5/peerjs.min.js';
        script.async = true;
        script.dataset.peerjsLoader = '1';
        script.onerror = () => {
          mpDebug('peerjs-script-error');
          reject(new Error('PeerJS did not load.'));
        };
        document.head.appendChild(script);
      }
      let tries = 0;
      const tick = () => {
        tries++;
        if (window.Peer) {
          mpDebug('peerjs-ready', { tries });
          resolve();
          return;
        }
        if (tries > 50) {
          mpDebug('peerjs-timeout', { tries });
          reject(new Error('PeerJS did not load.'));
          return;
        }
        setTimeout(tick, 120);
      };
      tick();
    });
  }

  function setMpConnectionState(state, options = {}) {
    if (!multiplayerActive()) return;
    const previous = G.mp.connectionState;
    const next = state || 'connected';
    G.mp.connectionState = next;
    G.mp.remoteReady = next === 'connected' || next === 'completed';
    if (G.mp.remoteReady) {
      G.mp.hadRemote = true;
      G.mp.relayReadyNotified = true;
      G.mp.relayMissingCount = 0;
    }
    if (options.peerId) G.mp.remotePeerId = options.peerId;
    if (previous !== next) {
      mpDebug('connection-state', { from: previous || null, to: next });
      if (options.toastKey) toast(t(options.toastKey));
    }
    setMpStatus(options.status || null);
    showCurrentActions();
  }

  function markMpConnected(options = {}) {
    setMpConnectionState('connected', options);
  }

  function markMpReconnecting(reason = 'partner-missing', options = {}) {
    if (!multiplayerActive()) return;
    const offline = navigator.onLine === false;
    setMpConnectionState(offline ? 'offline' : 'reconnecting', {
      ...options,
      toastKey: options.toast === false ? null : 'mpPlayerDisconnected'
    });
    mpDebug('reconnect-needed', { reason, offline });
  }

  function setMpStatus(status = null) {
    if (!els.mpStatus || !els.mpKicker) return;
    const copy = mpStatusCopy(status);
    els.mpKicker.textContent = copy.kicker;
    els.mpStatus.textContent = copy.detail;
    if (els.mpBar) {
      const invite = G.mp.role === 'host' && G.mp.roomId ? mpInviteUrl() : '';
      const canCopy = !!invite && G.mp.role === 'host' && !G.mp.remoteReady;
      els.mpBar.dataset.invite = invite;
      els.mpBar.dataset.copyable = canCopy ? 'true' : 'false';
      els.mpBar.title = invite || '';
    }
    updateMultiplayerButtons();
    syncMultiplayerLabels();
  }

  async function copyMpInvite() {
    const url = mpInviteUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast(t('mpInviteCopied'));
    } catch (e) {
      try {
        window.prompt(t('mpCopyPrompt'), url);
      } catch (promptError) {
        toast(t('mpTapCopyInvite'));
      }
    }
  }

  function mpStatusCopy(status = null) {
    if (!multiplayerActive()) return { kicker: t('mpMultiplayer'), detail: multiplayerGameDetail() };
    if (status === 'Signal') return { kicker: t('mpConnecting'), detail: t('mpOpeningRoom') };
    if (status === 'Reconnecting') return { kicker: t('mpReconnecting'), detail: t('mpPartnerReconnecting') };
    if (G.mp.connectionState === 'syncing') return { kicker: t('mpSyncing'), detail: t('mpRestoringSession') };
    if (G.mp.connectionState === 'offline') return { kicker: t('mpConnectionPaused'), detail: t('mpTryingAgain') };
    if (G.mp.connectionState === 'reconnecting') return { kicker: t('mpReconnecting'), detail: t('mpPartnerReconnecting') };
    if (G.mp.connectionState === 'completed') return { kicker: t('mpSessionComplete'), detail: multiplayerGameDetail() };
    if (!G.mp.remoteReady) {
      if (G.mp.role === 'host') return { kicker: t('mpWaitingPartner'), detail: t('mpTapCopyInvite') };
      return { kicker: t('mpJoiningPartner'), detail: t('mpWaitingHost') };
    }
    return {
      kicker: localTurn() ? t('mpYourTurn') : t('mpPartnerTurn'),
      detail: multiplayerGameDetail()
    };
  }

  function syncMultiplayerLabels() {
    els.mpEmoji?.setAttribute('aria-label', t('mpEmojiRain'));
    els.mpEmojiDial?.setAttribute('aria-label', t('mpEmojiRainMenu'));
    els.mpCamera?.setAttribute('aria-label', G.mp.webcamOn ? t('mpStopWebcam') : t('mpStartWebcam'));
    els.mpExit?.setAttribute('aria-label', t('mpLeaveAction'));
  }

  function clearMpWebcamTimers() {
    clearTimeout(webcamDrag.introTimer);
    clearTimeout(webcamDrag.hideTimer);
    webcamDrag.introTimer = null;
    webcamDrag.hideTimer = null;
  }

  function mpWebcamSize() {
    if (!els.mpWebcam) return { width: 0, height: 0 };
    return {
      width: els.mpWebcam.offsetWidth || 120,
      height: els.mpWebcam.offsetHeight || 120
    };
  }

  function mpWebcamIconPoint() {
    const area = els.cardArea?.getBoundingClientRect();
    const icon = els.mpCamera?.getBoundingClientRect();
    const size = mpWebcamSize();
    if (!area || !icon) return { x: webcamDrag.x, y: webcamDrag.y };
    return {
      x: icon.left + icon.width * 0.5 - area.left - size.width * 0.5,
      y: icon.top + icon.height * 0.5 - area.top - size.height * 0.5
    };
  }

  function mpCardCornerPoint(corner = webcamDrag.corner || 'tr') {
    const area = els.cardArea?.getBoundingClientRect();
    const card = document.querySelector('.bg-card')?.getBoundingClientRect() || els.card?.getBoundingClientRect();
    const size = mpWebcamSize();
    if (!area || !card) return { x: webcamDrag.x, y: webcamDrag.y };
    const right = corner.includes('r');
    const bottom = corner.includes('b');
    const px = right ? card.right : card.left;
    const py = bottom ? card.bottom : card.top;
    return {
      x: px - area.left - size.width * 0.5,
      y: py - area.top - size.height * 0.5
    };
  }

  function clampMpWebcamPoint(point) {
    const area = els.cardArea?.getBoundingClientRect();
    const size = mpWebcamSize();
    if (!area || !point || !size.width || !size.height) return point;
    const viewport = window.visualViewport || null;
    const vw = viewport?.width || window.innerWidth || document.documentElement.clientWidth;
    const vh = viewport?.height || window.innerHeight || document.documentElement.clientHeight;
    const minX = MP_WEBCAM_VIEWPORT_PAD - area.left;
    const minY = MP_WEBCAM_VIEWPORT_PAD - area.top;
    const maxX = vw - MP_WEBCAM_VIEWPORT_PAD - size.width - area.left;
    const maxY = vh - MP_WEBCAM_VIEWPORT_PAD - size.height - area.top;
    return {
      x: clamp(minX, point.x, Math.max(minX, maxX)),
      y: clamp(minY, point.y, Math.max(minY, maxY))
    };
  }

  function setMpWebcamPoint(point) {
    if (!els.mpWebcam || !point) return;
    const next = clampMpWebcamPoint(point);
    webcamDrag.x = next.x;
    webcamDrag.y = next.y;
    els.mpWebcam.style.setProperty('--mp-webcam-x', `${next.x}px`);
    els.mpWebcam.style.setProperty('--mp-webcam-y', `${next.y}px`);
  }

  function positionMpWebcam(corner = webcamDrag.corner || 'tr') {
    if (!els.mpWebcam) return;
    webcamDrag.corner = corner;
    setMpWebcamPoint(mpCardCornerPoint(corner));
  }

  function mpWebcamTransform(point, scale = 1) {
    return `translate3d(${point.x}px, ${point.y}px, 0) scale(${scale})`;
  }

  function cancelMpWebcamMotion() {
    if (!els.mpWebcam) return;
    els.mpWebcam.getAnimations?.().forEach(anim => anim.cancel());
    els.mpWebcam.classList.remove('is-animating');
  }

  function animateMpWebcamFromIcon({ preview = false } = {}) {
    if (!els.mpWebcam || !multiplayerActive()) return;
    cancelMpWebcamMotion();
    const from = mpWebcamIconPoint();
    const to = clampMpWebcamPoint(mpCardCornerPoint(webcamDrag.corner || 'tr'));
    setMpWebcamPoint(to);
    document.body.classList.add('mp-webcam-peek');
    els.mpWebcam.classList.remove('is-minimizing');
    els.mpWebcam.classList.add('is-visible', 'is-animating');
    els.mpWebcam.classList.toggle('is-preview', !!preview);
    if (!els.mpWebcam.animate) {
      els.mpWebcam.classList.remove('is-animating');
      return;
    }
    const anim = els.mpWebcam.animate([
      { transform: mpWebcamTransform(from, 0), opacity: 0, filter: 'blur(11px)' },
      { offset: 0.72, transform: mpWebcamTransform(to, 1.035), opacity: 1, filter: 'blur(0)' },
      { transform: mpWebcamTransform(to, 1), opacity: 1, filter: 'blur(0)' }
    ], {
      duration: 680,
      easing: 'cubic-bezier(0.18,0.72,0.2,1)',
      fill: 'both'
    });
    anim.onfinish = () => {
      els.mpWebcam.classList.remove('is-animating');
      setMpWebcamPoint(to);
      anim.cancel();
    };
  }

  function animateMpWebcamToIcon() {
    if (!els.mpWebcam) return;
    cancelMpWebcamMotion();
    const from = { x: webcamDrag.x, y: webcamDrag.y };
    const to = mpWebcamIconPoint();
    els.mpWebcam.classList.add('is-animating');
    if (!els.mpWebcam.animate) {
      setMpWebcamPoint(to);
      els.mpWebcam.classList.remove('is-visible', 'is-preview', 'is-minimizing', 'is-animating');
      document.body.classList.remove('mp-webcam-peek');
      positionMpWebcam(webcamDrag.corner || 'tr');
      return;
    }
    const anim = els.mpWebcam.animate([
      { transform: mpWebcamTransform(from, 1), opacity: 1, filter: 'blur(0)' },
      { offset: 0.62, transform: mpWebcamTransform(to, 0.08), opacity: 0.46, filter: 'blur(4px)' },
      { transform: mpWebcamTransform(to, 0), opacity: 0, filter: 'blur(11px)' }
    ], {
      duration: 560,
      easing: 'cubic-bezier(0.34,0,0.2,1)',
      fill: 'both'
    });
    anim.onfinish = () => {
      els.mpWebcam.classList.remove('is-visible', 'is-preview', 'is-minimizing', 'is-animating');
      document.body.classList.remove('mp-webcam-peek');
      positionMpWebcam(webcamDrag.corner || 'tr');
      anim.cancel();
    };
  }

  function showMpWebcamWindow({ preview = false } = {}) {
    if (!els.mpWebcam || !multiplayerActive()) return;
    clearMpWebcamTimers();
    if (!els.mpWebcam.classList.contains('is-visible')) {
      animateMpWebcamFromIcon({ preview });
      return;
    }
    cancelMpWebcamMotion();
    positionMpWebcam(webcamDrag.corner || 'tr');
    document.body.classList.add('mp-webcam-peek');
    els.mpWebcam.classList.remove('is-minimizing');
    els.mpWebcam.classList.add('is-visible');
    els.mpWebcam.classList.toggle('is-preview', !!preview);
  }

  function hideMpWebcamWindow({ toIcon = true } = {}) {
    if (!els.mpWebcam) return;
    if (G.mp.webcamOn || els.mpWebcam.classList.contains('has-remote') || webcamDrag.on) return;
    clearMpWebcamTimers();
    els.mpWebcam.classList.add('is-minimizing');
    if (toIcon) {
      animateMpWebcamToIcon();
      return;
    }
    cancelMpWebcamMotion();
    webcamDrag.hideTimer = setTimeout(() => {
      els.mpWebcam.classList.remove('is-visible', 'is-preview', 'is-minimizing');
      document.body.classList.remove('mp-webcam-peek');
      positionMpWebcam(webcamDrag.corner || 'tr');
    }, 560);
  }

  function queueMpWebcamIntro(delay = 2100) {
    if (!els.mpWebcam || !multiplayerActive()) return;
    clearMpWebcamTimers();
    webcamDrag.introTimer = setTimeout(() => {
      if (!multiplayerActive() || G.mp.webcamOn) return;
      animateMpWebcamFromIcon({ preview: true });
      webcamDrag.hideTimer = setTimeout(() => hideMpWebcamWindow({ toIcon: true }), 2600);
    }, delay);
  }

  function nearestMpWebcamCorner() {
    const area = els.cardArea?.getBoundingClientRect();
    const card = document.querySelector('.bg-card')?.getBoundingClientRect() || els.card?.getBoundingClientRect();
    const size = mpWebcamSize();
    if (!area || !card) return webcamDrag.corner || 'tr';
    const cx = area.left + webcamDrag.x + size.width * 0.5;
    const cy = area.top + webcamDrag.y + size.height * 0.5;
    const corners = {
      tl: { x: card.left, y: card.top },
      tr: { x: card.right, y: card.top },
      bl: { x: card.left, y: card.bottom },
      br: { x: card.right, y: card.bottom }
    };
    return Object.entries(corners).reduce((best, [key, point]) => {
      const dist = Math.hypot(point.x - cx, point.y - cy);
      return dist < best.dist ? { key, dist } : best;
    }, { key: webcamDrag.corner || 'tr', dist: Infinity }).key;
  }

  function setMpActive(active) {
    document.body.classList.toggle('mp-active', !!active);
    if (active) {
      setMpStatus();
    } else {
      document.body.classList.remove('mp-results');
      els.mpEmoji?.parentElement?.classList.remove('is-open');
      clearMpWebcamTimers();
      cancelMpWebcamMotion();
      document.body.classList.remove('mp-webcam-peek');
      els.mpWebcam?.classList.remove('has-local', 'has-remote', 'has-relay-remote', 'remote-video-live', 'is-live', 'is-visible', 'is-preview', 'is-minimizing', 'is-dragging', 'is-animating');
      els.mpRelayImage?.removeAttribute('src');
      if (els.mpCamera) els.mpCamera.classList.add('is-off');
      ['btn-draw', 'btn-yes', 'btn-never', 'btn-truth', 'btn-dare', 'btn-skip', 'btn-done'].forEach(id => {
        const btn = $(id);
        if (btn) btn.disabled = false;
      });
    }
  }

  function pruneMpConnections() {
    G.mp.conns = (G.mp.conns || []).filter(Boolean);
    G.mp.calls = (G.mp.calls || []).filter(Boolean);
  }

  function getOpenMpConn() {
    pruneMpConnections();
    if (G.mp.conn?.open) return G.mp.conn;
    const open = (G.mp.conns || []).find(conn => conn?.open);
    if (open) G.mp.conn = open;
    return open || null;
  }

  function mpConnectionStatsLabel(candidate = {}) {
    if (!candidate) return null;
    return {
      type: candidate.candidateType || candidate.type || null,
      protocol: candidate.protocol || null,
      relayProtocol: candidate.relayProtocol || null,
      address: candidate.address || candidate.ip || null,
      port: candidate.port || null
    };
  }

  async function reportMpSelectedCandidate(owner, pc) {
    if (!MP_DEBUG || !pc?.getStats) return;
    try {
      const stats = await pc.getStats();
      let pair = null;
      stats.forEach(item => {
        if (item.type === 'candidate-pair' && (item.selected || item.nominated)) pair = item;
        if (item.type === 'transport' && item.selectedCandidatePairId) pair = stats.get(item.selectedCandidatePairId) || pair;
      });
      const local = pair ? stats.get(pair.localCandidateId) : null;
      const remote = pair ? stats.get(pair.remoteCandidateId) : null;
      mpDebug(`${owner}-ice-selected`, {
        state: pc.iceConnectionState || null,
        connectionState: pc.connectionState || null,
        local: mpConnectionStatsLabel(local),
        remote: mpConnectionStatsLabel(remote)
      });
    } catch (error) {
      mpDebug(`${owner}-ice-stats-error`, mpDebugError(error));
    }
  }

  function bindMpPeerConnectionDebug(owner, connectionLike) {
    if (!MP_DEBUG || !connectionLike?.peerConnection || connectionLike.__ignightPcDebugBound) return;
    connectionLike.__ignightPcDebugBound = true;
    const pc = connectionLike.peerConnection;
    mpDebug(`${owner}-pc-bind`, {
      iceConnectionState: pc.iceConnectionState || null,
      connectionState: pc.connectionState || null,
      iceGatheringState: pc.iceGatheringState || null,
      signalingState: pc.signalingState || null,
      forceRelay: MP_FORCE_RELAY
    });
    [
      ['iceconnectionstatechange', 'ice'],
      ['connectionstatechange', 'connection'],
      ['icegatheringstatechange', 'gathering'],
      ['signalingstatechange', 'signaling']
    ].forEach(([eventName, shortName]) => {
      pc.addEventListener?.(eventName, () => {
        mpDebug(`${owner}-pc-${shortName}`, {
          iceConnectionState: pc.iceConnectionState || null,
          connectionState: pc.connectionState || null,
          iceGatheringState: pc.iceGatheringState || null,
          signalingState: pc.signalingState || null
        });
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed' || pc.connectionState === 'connected') {
          setTimeout(() => reportMpSelectedCandidate(owner, pc), 120);
        }
      });
    });
    pc.addEventListener?.('icecandidate', event => {
      const candidate = event.candidate?.candidate || '';
      mpDebug(`${owner}-pc-candidate`, candidate ? {
        type: (/ typ ([a-z]+)/.exec(candidate)?.[1]) || null,
        protocol: candidate.split(' ')[2] || null,
        relay: candidate.includes(' typ relay '),
        srflx: candidate.includes(' typ srflx '),
        tcp: candidate.includes(' tcp ')
      } : { complete: true });
    });
    pc.addEventListener?.('icecandidateerror', event => {
      mpDebug(`${owner}-pc-candidate-error`, {
        url: event.url || null,
        errorCode: event.errorCode || null,
        errorText: event.errorText || null,
        hostCandidate: event.hostCandidate || null
      });
    });
  }

  async function mpRelayRequest(action, extra = {}) {
    if (!multiplayerActive() || !G.mp.roomId || !G.mp.role) return null;
    if (!G.mp.relayClientId) G.mp.relayClientId = makeMpClientId();
    const body = {
      action,
      roomId: G.mp.roomId,
      role: G.mp.role,
      clientId: G.mp.relayClientId,
      peerId: G.mp.peer?.id || null,
      ...extra
    };
    const response = await fetch(MP_RELAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`Relay ${response.status}`);
    return response.json();
  }

  function mpRelayPartner(data) {
    if (!data?.members) return null;
    return data.members[remoteRole()] || null;
  }

  function handleMpRelayReady(data = null) {
    if (!multiplayerActive()) return;
    G.mp.relayMissingCount = 0;
    const partner = mpRelayPartner(data);
    if (partner?.peerId && partner.peerId !== G.mp.relayClientId) {
      G.mp.remotePeerId = partner.peerId;
    }
    const wasReady = G.mp.hadRemote && ['connected', 'completed'].includes(G.mp.connectionState);
    const wasSyncing = G.mp.hadRemote && G.mp.connectionState === 'syncing';
    if (wasSyncing) {
      G.mp.relayReadyNotified = true;
      const requestAge = Date.now() - (G.mp.lastStateRequestAt || 0);
      if (requestAge > 2600) requestMpState('relay-sync-retry');
      setMpStatus();
      return;
    }
    markMpConnected({ peerId: partner?.peerId || null, toast: false });
    if (wasReady) return;
    toast(t('mpPlayerConnected'));
    mpDebug('relay-ready', {
      partnerRole: remoteRole(),
      partnerPeerId: partner?.peerId || null
    });
    if (G.mp.role === 'host') {
      if (G.drawn || G.flipped || G.completed || (G.mp.stateSeq || 0) > 0) mpBroadcastState('relay-ready', { advance: false });
      else mpSendStart();
    } else {
      setMpConnectionState('syncing', { toast: false });
      requestMpState('relay-ready');
    }
    if (G.mp.webcamOn && G.mp.localStream && G.mp.peer && G.mp.remotePeerId) {
      bindMpCall(G.mp.peer.call(G.mp.remotePeerId, G.mp.localStream));
    }
  }

  function handleMpRelayMissingPartner(data = null) {
    if (!multiplayerActive() || !G.mp.hadRemote) return;
    const hasOpenConnection = !!getOpenMpConn();
    G.mp.relayMissingCount = (G.mp.relayMissingCount || 0) + 1;
    if (hasOpenConnection && G.mp.relayMissingCount < 3) {
      mpDebug('relay-partner-missing-grace', {
        missingCount: G.mp.relayMissingCount,
        partnerRole: remoteRole()
      });
      return;
    }

    G.mp.remotePeerId = null;
    G.mp.relayReadyNotified = false;
    markMpReconnecting('relay-partner-missing', { toast: G.mp.connectionState !== 'reconnecting' && G.mp.connectionState !== 'offline' });
    mpDebug('relay-partner-missing', {
      partnerRole: remoteRole(),
      missingCount: G.mp.relayMissingCount,
      members: data?.members || null
    });
  }

  function scheduleMpRelayPoll(delay = 850) {
    clearTimeout(G.mp.relayTimer);
    if (!multiplayerActive() || !G.mp.relayClientId) return;
    G.mp.relayTimer = setTimeout(() => {
      pollMpRelay();
    }, delay);
  }

  async function pollMpRelay() {
    if (!multiplayerActive() || !G.mp.relayClientId) return;
    try {
      const data = await mpRelayRequest('poll', {
        seen: Array.from(G.mp.relaySeen || []).slice(-120)
      });
      G.mp.relayFailCount = 0;
      if (data?.partnerPresent) handleMpRelayReady(data);
      else handleMpRelayMissingPartner(data);
      (data?.messages || []).forEach(message => {
        const packet = message.payload || message;
        if (!packet) return;
        if (!packet.id) packet.id = message.id;
        mpDebug('relay-data', { type: packet.type || null, from: packet.role || message.role || null });
        handleMpData(packet);
      });
      scheduleMpRelayPoll(data?.partnerPresent ? 720 : 980);
    } catch (error) {
      G.mp.relayFailCount = (G.mp.relayFailCount || 0) + 1;
      mpDebug('relay-error', mpDebugError(error));
      if (G.mp.hadRemote && G.mp.relayFailCount >= 2) markMpReconnecting('relay-error', { toast: false });
      scheduleMpRelayPoll(Math.min(2600, 900 + G.mp.relayFailCount * 320));
    }
  }

  function startMpRelay() {
    if (!multiplayerActive()) return;
    clearTimeout(G.mp.relayTimer);
    G.mp.relayClientId = makeMpClientId();
    G.mp.relaySeen = new Set();
    G.mp.relaySeq = 0;
    G.mp.relayFailCount = 0;
    G.mp.relayReadyNotified = false;
    G.mp.relayMissingCount = 0;
    G.mp.connectionState = G.mp.role === 'host' ? 'waiting' : 'connecting';
    mpDebug('relay-start', { clientId: G.mp.relayClientId });
    mpRelayRequest('join')
      .then(data => {
        if (data?.partnerPresent) handleMpRelayReady(data);
      })
      .catch(error => {
        G.mp.relayFailCount = (G.mp.relayFailCount || 0) + 1;
        mpDebug('relay-join-error', mpDebugError(error));
      })
      .finally(() => scheduleMpRelayPoll(240));
  }

  function stopMpRelay() {
    clearTimeout(G.mp.relayTimer);
    G.mp.relayTimer = null;
    if (!G.mp.roomId || !G.mp.role || !G.mp.relayClientId) return;
    try {
      const payload = JSON.stringify({
        action: 'leave',
        roomId: G.mp.roomId,
        role: G.mp.role,
        clientId: G.mp.relayClientId
      });
      navigator.sendBeacon?.(MP_RELAY_URL, new Blob([payload], { type: 'application/json' }));
    } catch (e) {}
  }

  async function mpCamRelayRequest(action, extra = {}) {
    if (!multiplayerActive() || !G.mp.roomId || !G.mp.role) return null;
    if (!G.mp.relayClientId) G.mp.relayClientId = makeMpClientId();
    const response = await fetch(MP_CAM_RELAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        roomId: G.mp.roomId,
        role: G.mp.role,
        clientId: G.mp.relayClientId,
        ...extra
      }),
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`Cam relay ${response.status}`);
    return response.json();
  }

  function mpCamRelayImageUrl(role, updated) {
    const url = new URL(MP_CAM_RELAY_URL, window.location.href);
    url.searchParams.set('action', 'image');
    url.searchParams.set('roomId', G.mp.roomId || '');
    url.searchParams.set('role', role || remoteRole());
    url.searchParams.set('v', String(updated || Date.now()));
    return url.href;
  }

  function clearMpRelayRemote() {
    G.mp.camRelayLastRemote = 0;
    G.mp.camRelayRemoteOn = false;
    els.mpRelayImage?.removeAttribute('src');
    els.mpWebcam?.classList.remove('has-relay-remote');
  }

  function updateMpRemoteVideoLive(reason = 'check') {
    const video = els.mpRemoteVideo;
    const live = !!(video?.srcObject && video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= 2);
    if (G.mp.remoteVideoLive === live) return live;
    G.mp.remoteVideoLive = live;
    els.mpWebcam?.classList.toggle('remote-video-live', live);
    mpDebug('remote-video-live', { live, reason, video: mpDebugVideoState(video) });
    return live;
  }

  function bindMpRemoteVideoHealth() {
    const video = els.mpRemoteVideo;
    if (!video || video.__ignightRemoteHealthBound) return;
    video.__ignightRemoteHealthBound = true;
    ['loadedmetadata', 'loadeddata', 'canplay', 'playing', 'resize', 'timeupdate', 'waiting', 'stalled', 'error'].forEach(eventName => {
      video.addEventListener(eventName, () => updateMpRemoteVideoLive(eventName));
    });
  }

  function stopMpCamRelaySend() {
    clearInterval(G.mp.camRelaySendTimer);
    G.mp.camRelaySendTimer = null;
    G.mp.camRelayBusy = false;
  }

  function startMpCamRelaySend() {
    stopMpCamRelaySend();
    if (!multiplayerActive() || !G.mp.webcamOn || !els.mpLocalVideo) return;
    if (!G.mp.camRelayCanvas) G.mp.camRelayCanvas = document.createElement('canvas');
    const canvas = G.mp.camRelayCanvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    canvas.width = 220;
    canvas.height = 220;
    const sendFrame = async () => {
      if (!multiplayerActive() || !G.mp.webcamOn || G.mp.camRelayBusy || !ctx) return;
      const video = els.mpLocalVideo;
      if (!video || !video.videoWidth || !video.videoHeight || video.readyState < 2) return;
      G.mp.camRelayBusy = true;
      try {
        const size = Math.min(video.videoWidth, video.videoHeight);
        const sx = Math.max(0, (video.videoWidth - size) * 0.5);
        const sy = Math.max(0, (video.videoHeight - size) * 0.5);
        ctx.drawImage(video, sx, sy, size, size, 0, 0, canvas.width, canvas.height);
        const image = canvas.toDataURL('image/jpeg', 0.48);
        await mpCamRelayRequest('frame', { image });
      } catch (error) {
        mpDebug('cam-relay-frame-error', mpDebugError(error));
      } finally {
        G.mp.camRelayBusy = false;
      }
    };
    sendFrame();
    G.mp.camRelaySendTimer = setInterval(sendFrame, MP_CAM_FRAME_MS);
  }

  function stopMpCamRelayPoll() {
    clearTimeout(G.mp.camRelayPollTimer);
    G.mp.camRelayPollTimer = null;
  }

  function scheduleMpCamRelayPoll(delay = MP_CAM_POLL_MS) {
    stopMpCamRelayPoll();
    if (!multiplayerActive()) return;
    G.mp.camRelayPollTimer = setTimeout(() => pollMpCamRelay(), delay);
  }

  async function pollMpCamRelay() {
    if (!multiplayerActive()) return;
    try {
      const data = await mpCamRelayRequest('poll', { targetRole: remoteRole() });
      if (data?.present && data.updated && data.updated !== G.mp.camRelayLastRemote) {
        G.mp.camRelayLastRemote = data.updated;
        G.mp.camRelayRemoteOn = true;
        if (els.mpRelayImage) {
          els.mpRelayImage.src = mpCamRelayImageUrl(remoteRole(), data.updated);
        }
        els.mpWebcam?.classList.add('has-relay-remote', 'has-remote', 'is-live');
        updateMpRemoteVideoLive('cam-relay-poll');
        showMpWebcamWindow();
        mpDebug('cam-relay-remote-frame', { updated: data.updated });
      } else if (!data?.present && G.mp.camRelayRemoteOn) {
        clearMpRelayRemote();
        if (!els.mpRemoteVideo?.srcObject) {
          els.mpWebcam?.classList.remove('has-remote');
          els.mpWebcam?.classList.toggle('is-live', !!G.mp.webcamOn);
        }
      }
    } catch (error) {
      mpDebug('cam-relay-poll-error', mpDebugError(error));
    } finally {
      scheduleMpCamRelayPoll();
    }
  }

  function startMpCamRelayPoll() {
    if (!multiplayerActive()) return;
    scheduleMpCamRelayPoll(420);
  }

  function stopMpCamRelay({ notify = false } = {}) {
    stopMpCamRelaySend();
    stopMpCamRelayPoll();
    clearMpRelayRemote();
    G.mp.remoteVideoLive = false;
    els.mpWebcam?.classList.remove('remote-video-live');
    if (notify && G.mp.roomId && G.mp.role && G.mp.relayClientId) {
      try {
        const payload = JSON.stringify({
          action: 'leave',
          roomId: G.mp.roomId,
          role: G.mp.role,
          clientId: G.mp.relayClientId
        });
        navigator.sendBeacon?.(MP_CAM_RELAY_URL, new Blob([payload], { type: 'application/json' }));
      } catch (e) {}
    }
  }

  function mpRelaySend(packet) {
    if (!multiplayerActive() || !G.mp.roomId || !G.mp.role || !G.mp.relayClientId) return false;
    mpRelayRequest('send', { message: packet })
      .then(() => {
        G.mp.relayFailCount = 0;
        if (packet?.type !== 'mp-debug') mpDebug('relay-send-ok', { type: packet?.type || null });
      })
      .catch(error => {
        G.mp.relayFailCount = (G.mp.relayFailCount || 0) + 1;
        mpDebug('relay-send-error', { type: packet?.type || null, error: mpDebugError(error) });
        if (G.mp.hadRemote && G.mp.relayFailCount >= 2) markMpReconnecting('relay-send-error', { toast: false });
      });
    return true;
  }

  function mpSend(payload) {
    const packet = {
      ...payload,
      id: payload?.id || makeMpPacketId(),
      sentAt: Date.now(),
      role: G.mp.role
    };
    rememberMpPacket(packet.id);
    const conn = getOpenMpConn();
    let sent = false;
    if (conn && conn.open) {
      try {
        conn.send(packet);
        sent = true;
      } catch (error) {
        mpDebug('conn-send-error', { type: payload?.type || null, error: mpDebugError(error) });
        if (G.mp.hadRemote) markMpReconnecting('conn-send-error', { toast: false });
      }
    }
    if (mpRelaySend(packet)) sent = true;
    if (!sent) {
      mpDebug('send-blocked', { type: payload?.type || null, hasConn: !!conn, open: !!conn?.open, hasRelay: !!G.mp.relayClientId });
      return false;
    }
    if (payload?.type !== 'mp-debug') mpDebug('send', { type: payload?.type || null });
    return true;
  }

  function canProcessMpQueue() {
    if (!multiplayerActive() || G.busy || G.formingDeck || G.tutorialing) return false;
    if (G.game === GAME.TD && truthDareIntroBlocking()) return false;
    return true;
  }

  function processMultiplayerQueue() {
    if (!canProcessMpQueue() || G.mp.suppressNetwork) return;
    if (applyPendingMpState()) return;

    if (G.game === GAME.NEVER && G.mp.pendingDrawId && !G.flipped) {
      const cardId = G.mp.pendingDrawId;
      G.mp.pendingDrawId = null;
      G.mp.suppressNetwork = true;
      if (setNeverCurrentById(cardId)) revealCard('remote');
      G.mp.suppressNetwork = false;
      return;
    }

    const pendingAnswer = G.mp.pendingAnswer || (G.mp.pendingAnswerChoice ? { choice: G.mp.pendingAnswerChoice, role: remoteRole() } : null);
    if (G.game === GAME.NEVER && pendingAnswer?.choice && G.flipped && G.cur) {
      const { choice, role } = pendingAnswer;
      G.mp.pendingAnswerChoice = null;
      G.mp.pendingAnswer = null;
      G.mp.suppressNetwork = true;
      answer(choice, 'remote', { playerRole: role });
      G.mp.suppressNetwork = false;
      return;
    }

    if (G.game === GAME.TD && G.mp.pendingTdChoice && !G.flipped) {
      const choice = G.mp.pendingTdChoice;
      G.mp.pendingTdChoice = null;
      receiveTruthDareChoice(choice);
      return;
    }

    if (G.game === GAME.TD && G.mp.pendingTdResult && G.flipped && G.cur) {
      const result = G.mp.pendingTdResult;
      G.mp.pendingTdResult = null;
      G.mp.suppressNetwork = true;
      completeTruthDare(result.outcome, 'remote', { playerRole: result.role || remoteRole(), cardKind: result.kind || G.curKind });
      G.mp.suppressNetwork = false;
    }
  }

  function neverSequenceIds() {
    const ids = [];
    if (G.cur?.id) ids.push(G.cur.id);
    G.deck.slice().reverse().forEach(card => {
      if (card?.id) ids.push(card.id);
    });
    return ids;
  }

  function applyNeverSequence(ids = []) {
    const cards = ids.map(id => cardFromLocale(G.locale, 'neverCards', id)).filter(Boolean);
    if (!cards.length) return;
    G.deck = cards.slice(1).reverse();
    G.cur = cards[0];
    G.curKind = null;
    G.total = cards.length;
    applyCard(G.cur);
    updateUI();
  }

  function truthDareSequenceIds() {
    return {
      truthIds: G.truthDeck.slice().reverse().map(card => card.id).filter(Boolean),
      dareIds: G.dareDeck.slice().reverse().map(card => card.id).filter(Boolean)
    };
  }

  function applyTruthDareSequence({ truthIds = [], dareIds = [], total = null } = {}) {
    const truths = truthIds.map(id => cardFromLocale(G.locale, 'truthCards', id)).filter(Boolean);
    const dares = dareIds.map(id => cardFromLocale(G.locale, 'dareCards', id)).filter(Boolean);
    G.truthDeck = truths.slice().reverse();
    G.dareDeck = dares.slice().reverse();
    G.deck = [];
    G.cur = null;
    G.curKind = null;
    G.total = Number.isFinite(total) ? Math.min(total, truths.length + dares.length) : truths.length + dares.length;
    updateUI();
  }

  function setNeverCurrentById(id) {
    const card = cardFromLocale(G.locale, 'neverCards', id);
    if (!card) return false;
    G.deck = G.deck.filter(item => item.id !== id);
    G.cur = card;
    G.curKind = null;
    applyCard(card);
    return true;
  }

  function setTruthDareCurrentById(kind, id) {
    const source = kind === 'dare' ? 'dareCards' : 'truthCards';
    const card = cardFromLocale(G.locale, source, id);
    if (!card) return false;
    if (kind === 'dare') G.dareDeck = G.dareDeck.filter(item => item.id !== id);
    else G.truthDeck = G.truthDeck.filter(item => item.id !== id);
    G.cur = card;
    G.curKind = kind === 'dare' ? 'dare' : 'truth';
    applyCard(card, G.curKind);
    return true;
  }

  function mpDeckIds(deck = []) {
    return deck.map(card => card?.id).filter(Boolean);
  }

  function mpCardsFromIds(ids = [], source) {
    return (Array.isArray(ids) ? ids : [])
      .map(id => cardFromLocale(G.locale, source, id))
      .filter(Boolean);
  }

  function mpStorageKey(role = G.mp.role, roomId = G.mp.roomId) {
    if (!role || !roomId) return null;
    return `ignight:mp-state:${role}:${roomId}`;
  }

  function saveMpSnapshot(snapshot) {
    const key = mpStorageKey();
    if (!key || !snapshot) return;
    try {
      localStorage.setItem(key, JSON.stringify({
        savedAt: Date.now(),
        snapshot
      }));
    } catch (error) {
      mpDebug('state-save-error', mpDebugError(error));
    }
  }

  function loadMpStoredSnapshot(role = G.mp.role, roomId = G.mp.roomId) {
    const key = mpStorageKey(role, roomId);
    if (!key) return null;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const stored = JSON.parse(raw);
      if (!stored?.snapshot || Date.now() - Number(stored.savedAt || 0) > MP_STATE_TTL_MS) {
        localStorage.removeItem(key);
        return null;
      }
      return stored.snapshot;
    } catch (error) {
      mpDebug('state-load-error', mpDebugError(error));
      return null;
    }
  }

  function normalizeMpPlayerStats(stats = null) {
    const next = blankMpPlayerStats();
    ['host', 'guest'].forEach(role => {
      if (!stats?.[role]) return;
      ['yes', 'never', 'truth', 'dare', 'skips'].forEach(key => {
        next[role][key] = Math.max(0, Number(stats[role][key]) || 0);
      });
    });
    return next;
  }

  function buildMpSnapshot(reason = 'sync', { advance = false } = {}) {
    if (!multiplayerActive()) return null;
    if (advance && G.mp.role === 'host') G.mp.stateSeq = (G.mp.stateSeq || 0) + 1;
    return {
      version: MP_STATE_VERSION,
      reason,
      seq: G.mp.stateSeq || 0,
      game: G.game,
      ritualId: G.ritual?.id || (G.game === GAME.TD ? 'classic-td' : 'classic-never'),
      cat: G.cat,
      turn: G.mp.turn || 'host',
      drawn: G.drawn,
      yes: G.yes,
      never: G.never,
      truths: G.truthDone,
      dares: G.dareDone,
      skips: G.skips,
      total: G.total,
      completed: !!G.completed,
      flipped: !!G.flipped,
      curId: G.cur?.id || null,
      curKind: G.curKind || null,
      deckIds: G.game === GAME.NEVER ? mpDeckIds(G.deck) : [],
      truthDeckIds: G.game === GAME.TD ? mpDeckIds(G.truthDeck) : [],
      dareDeckIds: G.game === GAME.TD ? mpDeckIds(G.dareDeck) : [],
      playerStats: normalizeMpPlayerStats(G.mp.playerStats)
    };
  }

  function setMpCurrentFromSnapshot(snapshot) {
    const flipped = !!snapshot.flipped && !!snapshot.curId;
    els.card.classList.toggle('do-flip', flipped);
    els.back.classList.toggle('shown', flipped);
    G.flipped = flipped;
    G.cur = null;
    G.curKind = null;
    if (!snapshot.curId) {
      setSwipeOverlayContent();
      return;
    }
    const kind = snapshot.game === GAME.TD && snapshot.curKind === 'dare' ? 'dare' : (snapshot.game === GAME.TD ? 'truth' : null);
    const source = snapshot.game === GAME.TD
      ? (kind === 'dare' ? 'dareCards' : 'truthCards')
      : 'neverCards';
    const card = cardFromLocale(G.locale, source, snapshot.curId);
    if (!card) {
      G.flipped = false;
      els.card.classList.remove('do-flip');
      els.back.classList.remove('shown');
      setSwipeOverlayContent();
      return;
    }
    G.cur = card;
    G.curKind = kind;
    applyCard(card, kind);
    els.card.classList.toggle('do-flip', G.flipped);
    els.back.classList.toggle('shown', G.flipped);
    setSwipeOverlayContent();
  }

  function applyMpSnapshot(snapshot, options = {}) {
    if (!snapshot || !multiplayerActive()) return false;
    const seq = Number(snapshot.seq) || 0;
    if (!options.force && seq < (G.mp.lastAppliedSeq || 0)) {
      mpDebug('state-sync-stale', { seq, lastAppliedSeq: G.mp.lastAppliedSeq || 0, reason: snapshot.reason || null });
      return false;
    }
    if (!options.force && (G.busy || G.formingDeck || G.tutorialing)) {
      G.mp.pendingStateSnapshot = snapshot;
      mpDebug('state-sync-queued', { seq, reason: snapshot.reason || null });
      return false;
    }

    const game = snapshot.game === GAME.TD ? GAME.TD : GAME.NEVER;
    const ritual = ritualForMultiplayerStart(game, snapshot.ritualId);
    const ritualId = ritual?.id || null;
    const sameGame = G.game === game && (G.ritual?.id || null) === ritualId;
    G.mp.suppressNetwork = true;
    if (!sameGame) beginGame(game, ritual, { keepMultiplayer: true, bypassUnlock: true, fromNetwork: true });
    G.game = game;
    G.ritual = ritual;
    G.cat = snapshot.cat || G.cat || 'all';
    G.mp.turn = normalizeMpRole(snapshot.turn);
    G.drawn = Math.max(0, Number(snapshot.drawn) || 0);
    G.yes = Math.max(0, Number(snapshot.yes) || 0);
    G.never = Math.max(0, Number(snapshot.never) || 0);
    G.truthDone = Math.max(0, Number(snapshot.truths) || 0);
    G.dareDone = Math.max(0, Number(snapshot.dares) || 0);
    G.skips = Math.max(0, Number(snapshot.skips) || 0);
    G.total = Math.max(0, Number(snapshot.total) || 0);
    G.completed = !!snapshot.completed;
    G.mp.playerStats = normalizeMpPlayerStats(snapshot.playerStats);
    if (game === GAME.TD) {
      G.deck = [];
      G.truthDeck = mpCardsFromIds(snapshot.truthDeckIds, 'truthCards');
      G.dareDeck = mpCardsFromIds(snapshot.dareDeckIds, 'dareCards');
    } else {
      G.truthDeck = [];
      G.dareDeck = [];
      G.deck = mpCardsFromIds(snapshot.deckIds, 'neverCards');
    }
    clearSwipeTutorialTimers();
    cancelSwipeNudge({ reset: false });
    clearDeckFormation();
    G.formingDeck = false;
    G.tutorialing = false;
    G.busy = false;
    setActiveTab(G.cat);
    setMpCurrentFromSnapshot({ ...snapshot, game });
    renderGameChrome();
    updateUI();
    G.mp.lastAppliedSeq = Math.max(G.mp.lastAppliedSeq || 0, seq);
    G.mp.stateSeq = Math.max(G.mp.stateSeq || 0, seq);
    G.mp.pendingStateSnapshot = null;
    saveMpSnapshot(buildMpSnapshot('local-store'));
    if (G.completed) {
      document.body.classList.add('mp-results');
      if (els.after.classList.contains('hidden')) showAfter();
      if (!options.preserveConnection) setMpConnectionState('completed', { toast: false });
    } else {
      els.after.classList.add('hidden');
      document.body.classList.remove('mp-results');
      if (!options.preserveConnection) markMpConnected({ toast: false });
    }
    G.mp.suppressNetwork = false;
    processMultiplayerQueue();
    mpDebug('state-sync-applied', { seq, reason: snapshot.reason || null, forced: !!options.force });
    return true;
  }

  function applyPendingMpState() {
    if (!G.mp.pendingStateSnapshot || G.busy || G.formingDeck || G.tutorialing) return false;
    const snapshot = G.mp.pendingStateSnapshot;
    G.mp.pendingStateSnapshot = null;
    return applyMpSnapshot(snapshot);
  }

  function mpBroadcastState(reason = 'sync', options = {}) {
    if (!multiplayerActive() || G.mp.role !== 'host') return false;
    const snapshot = buildMpSnapshot(reason, { advance: options.advance !== false });
    if (!snapshot) return false;
    saveMpSnapshot(snapshot);
    return mpSend({ type: 'state-sync', snapshot, reason });
  }

  function queueMpStateBroadcast(reason = 'sync', delay = 760) {
    if (!multiplayerActive() || G.mp.role !== 'host') return;
    clearTimeout(G.mp.stateBroadcastTimer);
    G.mp.stateBroadcastTimer = setTimeout(() => {
      G.mp.stateBroadcastTimer = null;
      mpBroadcastState(reason);
    }, delay);
  }

  function requestMpState(reason = 'reconnect') {
    if (!multiplayerActive()) return false;
    G.mp.lastStateRequestAt = Date.now();
    return mpSend({
      type: 'state-request',
      knownSeq: G.mp.lastAppliedSeq || G.mp.stateSeq || 0,
      reason
    });
  }

  function ritualForMultiplayerStart(game, ritualId) {
    const fallbackId = game === GAME.TD ? 'classic-td' : 'classic-never';
    return GM?.getRitual?.(ritualId || fallbackId) || GM?.getRitual?.(fallbackId) || null;
  }

  function applyMultiplayerStart(data) {
    const game = data.game === GAME.TD ? GAME.TD : GAME.NEVER;
    const ritual = ritualForMultiplayerStart(game, data.ritualId);
    G.mp.turn = data.turn || 'host';
    beginGame(game, ritual, { keepMultiplayer: true, bypassUnlock: true, fromNetwork: true });
    G.cat = data.cat || G.cat;
    if (game === GAME.TD) {
      applyTruthDareSequence({
        truthIds: data.truthIds || [],
        dareIds: data.dareIds || [],
        total: data.total
      });
    } else {
      applyNeverSequence(data.deckIds || []);
    }
    setActiveTab(G.cat);
    renderGameChrome();
    if (data.snapshot) {
      applyMpSnapshot(data.snapshot, { force: true, fromStart: true });
    } else {
      markMpConnected({ toast: false });
    }
  }

  function mpSendStart() {
    if (!multiplayerActive() || G.mp.role !== 'host') return;
    const payload = {
      type: 'start',
      game: G.game,
      ritualId: G.ritual?.id || (G.game === GAME.TD ? 'classic-td' : 'classic-never'),
      cat: G.cat,
      turn: G.mp.turn,
      total: G.total
    };
    if (G.game === GAME.TD) {
      Object.assign(payload, truthDareSequenceIds());
    } else {
      payload.deckIds = neverSequenceIds();
    }
    payload.snapshot = buildMpSnapshot('start', { advance: false });
    saveMpSnapshot(payload.snapshot);
    mpSend(payload);
  }

  function bindMpCall(call) {
    if (!call || call.__ignightBound) return;
    call.__ignightBound = true;
    mpDebug('call-bind', { peer: call?.peer || null });
    bindMpPeerConnectionDebug('call', call);
    setTimeout(() => bindMpPeerConnectionDebug('call', call), 60);
    G.mp.calls = G.mp.calls || [];
    G.mp.calls.push(call);
    G.mp.calls = G.mp.calls.filter((item, index, list) => item && list.indexOf(item) === index);
    G.mp.call = call;
    call.on('stream', stream => {
      mpDebug('call-stream', { peer: call.peer || null, tracks: mpDebugTrackState(stream) });
      if (!els.mpRemoteVideo || !els.mpWebcam) return;
      bindMpTrackDebug(stream, 'remote-stream');
      bindMpRemoteVideoHealth();
      call.__ignightRemoteStream = stream;
      const sameStream = els.mpRemoteVideo.srcObject === stream;
      if (!sameStream) {
        els.mpRemoteVideo.srcObject = stream;
      } else {
        mpDebug('call-stream-duplicate', { peer: call.peer || null });
      }
      const retryRemoteVideo = reason => {
        if (!els.mpRemoteVideo?.srcObject) return;
        mpDebug('remote-video-retry', { reason, video: mpDebugVideoState(els.mpRemoteVideo) });
        els.mpRemoteVideo.play()
          .then(() => mpDebug('remote-video-retry-ok', { reason }))
          .catch(error => mpDebug('remote-video-retry-error', { reason, error: mpDebugError(error) }));
      };
      stream.getVideoTracks?.().forEach(track => {
        if (track.__ignightRemotePlayBound) return;
        track.__ignightRemotePlayBound = true;
        track.addEventListener?.('unmute', () => retryRemoteVideo('track-unmute'));
        track.addEventListener?.('mute', () => setTimeout(() => retryRemoteVideo('track-mute-timeout'), 700));
      });
      els.mpRemoteVideo.play()
        .then(() => mpDebug('remote-video-play-ok'))
        .catch(error => {
          mpDebug('remote-video-play-error', mpDebugError(error));
          setTimeout(() => {
            if (!els.mpRemoteVideo?.srcObject) return;
            els.mpRemoteVideo.play()
              .then(() => mpDebug('remote-video-play-retry-ok'))
              .catch(retryError => mpDebug('remote-video-play-retry-error', mpDebugError(retryError)));
          }, 220);
        });
      setTimeout(() => updateMpRemoteVideoLive('stream-timeout'), 450);
      els.mpWebcam.classList.add('has-remote', 'is-live');
      showMpWebcamWindow();
    });
    call.on('close', () => {
      mpDebug('call-close', { peer: call.peer || null });
      G.mp.calls = (G.mp.calls || []).filter(item => item !== call);
      if (G.mp.call === call) G.mp.call = (G.mp.calls || []).find(item => item?.open) || null;
      if (els.mpRemoteVideo?.srcObject === call.__ignightRemoteStream) {
        els.mpWebcam?.classList.remove('has-remote', 'is-live');
        els.mpRemoteVideo.srcObject = null;
        updateMpRemoteVideoLive('call-close');
      }
      els.mpWebcam?.classList.toggle('is-live', !!G.mp.webcamOn);
      if (!G.mp.webcamOn) hideMpWebcamWindow({ toIcon: true });
    });
    call.on('error', error => {
      mpDebug('call-error', { peer: call.peer || null, error: mpDebugError(error) });
    });
  }

  function scheduleMpBackchannel(peerId, reason = 'fallback') {
    if (!multiplayerActive() || G.mp.role !== 'host' || !G.mp.peer || !peerId || G.mp.backchannelAttempted) return;
    G.mp.backchannelAttempted = true;
    mpDebug('backchannel-scheduled', { peer: peerId, reason });
    setTimeout(() => {
      if (!multiplayerActive() || G.mp.role !== 'host' || !G.mp.peer || getOpenMpConn()) return;
      try {
        mpDebug('backchannel-start', { peer: peerId, reason });
        bindMpConn(G.mp.peer.connect(peerId, mpConnectOptions('host-backchannel')));
      } catch (error) {
        mpDebug('backchannel-error', mpDebugError(error));
      }
    }, 1400);
  }

  function handleMpConnOpen(conn, eventName = 'conn-open') {
    if (!conn) return;
    if (conn.__ignightOpenHandled && G.mp.conn === conn && G.mp.remoteReady) return;
    conn.__ignightOpenHandled = true;
    const wasReady = G.mp.remoteReady;
    mpDebug(eventName, { peer: conn.peer || null });
    G.mp.conn = conn;
    markMpConnected({ peerId: conn.peer || null, toast: false });
    if (!wasReady) toast(t('mpPlayerConnected'));
    mpSend({ type: 'hello' });
    if (G.mp.role === 'host') {
      if (G.drawn || G.flipped || G.completed || (G.mp.stateSeq || 0) > 0) mpBroadcastState('conn-open', { advance: false });
      else mpSendStart();
    } else {
      setMpConnectionState('syncing', { toast: false });
      requestMpState('conn-open');
    }
    if (G.mp.webcamOn && G.mp.localStream && G.mp.peer && G.mp.remotePeerId) {
      bindMpCall(G.mp.peer.call(G.mp.remotePeerId, G.mp.localStream));
    }
  }

  function bindMpConn(conn) {
    if (!conn) return;
    if (conn.__ignightBound) return;
    conn.__ignightBound = true;
    mpDebug('conn-bind', { peer: conn?.peer || null });
    bindMpPeerConnectionDebug('conn', conn);
    setTimeout(() => bindMpPeerConnectionDebug('conn', conn), 60);
    G.mp.conns = G.mp.conns || [];
    G.mp.conns.push(conn);
    G.mp.conns = G.mp.conns.filter((item, index, list) => item && list.indexOf(item) === index);
    if (!G.mp.conn || !G.mp.conn.open) G.mp.conn = conn;
    G.mp.remotePeerId = conn.peer;
    if (G.mp.role === 'host') scheduleMpBackchannel(conn.peer, 'incoming-data-connection');
    conn.on('open', () => {
      handleMpConnOpen(conn, 'conn-open');
    });
    conn.on('data', data => {
      if (!G.mp.conn || !G.mp.conn.open) G.mp.conn = conn;
      if (data?.type !== 'mp-debug') mpDebug('conn-data', { type: data?.type || null, from: data?.role || null });
      handleMpData(data);
    });
    conn.on('close', () => {
      mpDebug('conn-close', { peer: conn.peer || null });
      G.mp.conns = (G.mp.conns || []).filter(item => item !== conn);
      if (G.mp.conn === conn) G.mp.conn = getOpenMpConn();
      if (G.mp.conn?.open || G.mp.relayReadyNotified) markMpConnected({ toast: false });
      else if (G.mp.hadRemote) markMpReconnecting('conn-close');
      else setMpConnectionState(G.mp.role === 'host' ? 'waiting' : 'connecting', { toast: false });
    });
    conn.on('error', error => {
      mpDebug('conn-error', { peer: conn.peer || null, error: mpDebugError(error) });
    });
    if (conn.open) setTimeout(() => handleMpConnOpen(conn, 'conn-open-existing'), 0);
  }

  function handleMpData(data) {
    if (!data || !multiplayerActive()) return;
    if (data.id && !rememberMpPacket(data.id)) return;
    if (data.type === 'mp-debug') {
      receiveMpDebug(data.entry);
      return;
    }
    if (!G.mp.remoteReady && data.type !== 'leave') markMpConnected({ toast: false });
    if (data.type === 'hello') {
      mpDebug('hello-received', { from: data.role || null });
      markMpConnected({ toast: false });
      if (G.mp.role === 'host') {
        if (G.drawn || G.flipped || G.completed || (G.mp.stateSeq || 0) > 0) mpBroadcastState('hello', { advance: false });
        else mpSendStart();
      } else {
        setMpConnectionState('syncing', { toast: false });
        requestMpState('hello');
      }
      return;
    }
    if (data.type === 'leave') {
      mpDebug('leave-received', { from: data.role || null });
      markMpReconnecting('peer-left');
      return;
    }
    if (data.type === 'state-request') {
      mpDebug('state-request-received', { from: data.role || null, knownSeq: data.knownSeq || 0, reason: data.reason || null });
      if (G.mp.role === 'host') mpBroadcastState(data.reason || 'state-request', { advance: false });
      return;
    }
    if (data.type === 'state-sync') {
      mpDebug('state-sync-received', {
        from: data.role || null,
        seq: data.snapshot?.seq || 0,
        reason: data.reason || data.snapshot?.reason || null
      });
      applyMpSnapshot(data.snapshot);
      return;
    }
    if (data.type === 'start') {
      mpDebug('start-received', {
        from: data.role || null,
        game: data.game || null,
        ritualId: data.ritualId || null,
        deckCount: data.deckIds?.length || ((data.truthIds?.length || 0) + (data.dareIds?.length || 0))
      });
      if (G.mp.role === 'guest') {
        applyMultiplayerStart(data);
      }
      return;
    }
    if (data.type === 'draw') {
      if (G.game !== GAME.NEVER) return;
      if (!canProcessMpQueue() || G.flipped) {
        G.mp.pendingDrawId = data.cardId || null;
        return;
      }
      G.mp.suppressNetwork = true;
      if (setNeverCurrentById(data.cardId)) revealCard('remote');
      G.mp.suppressNetwork = false;
      return;
    }
    if (data.type === 'answer') {
      if (G.game !== GAME.NEVER) return;
      if (!canProcessMpQueue() || !G.flipped || !G.cur) {
        G.mp.pendingAnswerChoice = data.choice || null;
        G.mp.pendingAnswer = data.choice ? { choice: data.choice, role: data.role || remoteRole() } : null;
        return;
      }
      G.mp.suppressNetwork = true;
      answer(data.choice, 'remote', { playerRole: data.role || remoteRole() });
      G.mp.turn = G.mp.role;
      setMpStatus();
      G.mp.suppressNetwork = false;
      return;
    }
    if (data.type === 'td-choice') {
      const packet = { kind: data.kind === 'dare' ? 'dare' : 'truth', cardId: data.cardId || null, role: data.role || remoteRole() };
      if (G.game !== GAME.TD) {
        G.mp.pendingTdChoice = packet;
        return;
      }
      if (!canProcessMpQueue() || G.flipped) {
        G.mp.pendingTdChoice = packet;
        return;
      }
      G.mp.suppressNetwork = true;
      receiveTruthDareChoice(packet);
      G.mp.suppressNetwork = false;
      return;
    }
    if (data.type === 'td-result') {
      const packet = {
        outcome: data.outcome === 'skip' ? 'skip' : 'done',
        kind: data.kind === 'dare' ? 'dare' : 'truth',
        cardId: data.cardId || null,
        role: data.role || remoteRole()
      };
      if (G.game !== GAME.TD) {
        G.mp.pendingTdResult = packet;
        return;
      }
      if (!canProcessMpQueue() || !G.flipped || !G.cur) {
        G.mp.pendingTdResult = packet;
        return;
      }
      G.mp.suppressNetwork = true;
      completeTruthDare(packet.outcome, 'remote', { playerRole: packet.role, cardKind: packet.kind });
      G.mp.suppressNetwork = false;
      return;
    }
    if (data.type === 'emoji') {
      emojiRain(data.emoji || '💖', data.tone || 'yes');
      return;
    }
    if (data.type === 'webcam-off') {
      mpDebug('webcam-off-received', { from: data.role || null });
      els.mpWebcam?.classList.remove('has-remote', 'is-live');
      if (els.mpRemoteVideo) els.mpRemoteVideo.srcObject = null;
      clearMpRelayRemote();
      updateMpRemoteVideoLive('webcam-off');
      els.mpWebcam?.classList.toggle('is-live', !!G.mp.webcamOn);
      if (!G.mp.webcamOn) hideMpWebcamWindow({ toIcon: true });
    }
  }

  async function startMpPeer() {
    setMpStatus('Signal');
    mpDebug('peer-start', { role: G.mp.role, roomId: G.mp.roomId });
    try {
      await waitForPeerJs();
    } catch (error) {
      mpDebug('peerjs-load-failed', mpDebugError(error));
      clearMpWebcamTimers();
      toast(t('mpSignalDidNotLoad'));
      return;
    }
    await loadMpIceServers();
    const peerId = G.mp.role === 'host' ? G.mp.roomId : undefined;
    G.mp.peer = new Peer(peerId, mpPeerOptions());
    G.mp.peer.on('open', () => {
      mpDebug('peer-open', { id: G.mp.peer?.id || null, role: G.mp.role });
      if (G.mp.relayClientId) {
        mpRelayRequest('join').catch(error => mpDebug('relay-peerid-error', mpDebugError(error)));
      }
      if (G.mp.role === 'guest') {
        bindMpConn(G.mp.peer.connect(G.mp.roomId, mpConnectOptions('guest-control')));
      } else {
        setMpStatus('Invite ready');
        copyMpInvite();
      }
    });
    G.mp.peer.on('connection', bindMpConn);
    G.mp.peer.on('call', async call => {
      mpDebug('incoming-call', { peer: call?.peer || null, hasLocalStream: !!G.mp.localStream });
      G.mp.remotePeerId = call?.peer || G.mp.remotePeerId;
      scheduleMpBackchannel(call?.peer, 'incoming-media-call');
      const stream = G.mp.localStream || new MediaStream();
      call.answer(stream);
      mpDebug('call-answered', { peer: call?.peer || null, tracks: mpDebugTrackState(stream) });
      bindMpCall(call);
    });
    G.mp.peer.on('error', error => {
      mpDebug('peer-error', mpDebugError(error));
      console.warn('[Ignight multiplayer]', error);
      toast(error?.type === 'peer-unavailable' ? 'Room not found. Open the matching host link first.' : (error?.type === 'unavailable-id' ? t('mpRoomBusy') : t('mpSignalError')));
    });
    G.mp.peer.on('disconnected', () => {
      mpDebug('peer-disconnected');
      if (G.mp.hadRemote) markMpReconnecting('peer-disconnected', { toast: false });
      try {
        if (!G.mp.peer.destroyed && G.mp.peer.disconnected) G.mp.peer.reconnect();
      } catch (error) {
        mpDebug('peer-reconnect-error', mpDebugError(error));
      }
    });
    G.mp.peer.on('close', () => {
      mpDebug('peer-close');
      if (G.mp.hadRemote) markMpReconnecting('peer-close', { toast: false });
    });
  }

  function startMultiplayerHost(ritual, options = {}) {
    const game = ritual?.mode === GAME.TD || G.pendingGame === GAME.TD ? GAME.TD : GAME.NEVER;
    const selectedRitual = ritual || GM?.getRitual?.(game === GAME.TD ? 'classic-td' : 'classic-never') || classicNeverRitual();
    G.mp.active = true;
    G.mp.role = 'host';
    G.mp.roomId = cleanMpRoom(options.roomId) || makeMpRoomId();
    G.mp.turn = 'host';
    G.mp.remoteReady = false;
    G.mp.hadRemote = false;
    G.mp.connectionState = 'waiting';
    G.mp.stateSeq = 0;
    G.mp.lastAppliedSeq = 0;
    G.mp.pendingStateSnapshot = null;
    G.mp.lastStateRequestAt = 0;
    clearTimeout(G.mp.stateBroadcastTimer);
    G.mp.stateBroadcastTimer = null;
    G.mp.pendingDrawId = null;
    G.mp.pendingAnswerChoice = null;
    G.mp.pendingAnswer = null;
    G.mp.pendingTdChoice = null;
    G.mp.pendingTdResult = null;
    resetMpPlayerStats();
    setMpActive(true);
    beginGame(game, selectedRitual, { keepMultiplayer: true });
    const stored = loadMpStoredSnapshot('host', G.mp.roomId);
    if (stored && !stored.completed) applyMpSnapshot(stored, { force: true, restored: true, preserveConnection: true });
    mpDebug('host-start', { roomId: G.mp.roomId, game, ritualId: selectedRitual?.id || null });
    startMpRelay();
    startMpCamRelayPoll();
    queueMpWebcamIntro();
    startMpPeer();
    track('multiplayer_started', { role: 'host', roomId: G.mp.roomId, selectedGame: game, ritualId: selectedRitual?.id || null });
  }

  function startMultiplayerGuest(roomId) {
    G.mp.active = true;
    G.mp.role = 'guest';
    G.mp.roomId = roomId;
    G.mp.turn = 'host';
    G.mp.remoteReady = false;
    G.mp.hadRemote = false;
    G.mp.connectionState = 'connecting';
    G.mp.stateSeq = 0;
    G.mp.lastAppliedSeq = 0;
    G.mp.pendingStateSnapshot = null;
    G.mp.lastStateRequestAt = 0;
    clearTimeout(G.mp.stateBroadcastTimer);
    G.mp.stateBroadcastTimer = null;
    G.mp.pendingDrawId = null;
    G.mp.pendingAnswerChoice = null;
    G.mp.pendingAnswer = null;
    G.mp.pendingTdChoice = null;
    G.mp.pendingTdResult = null;
    resetMpPlayerStats();
    setMpActive(true);
    beginGame(GAME.NEVER, classicNeverRitual(), { keepMultiplayer: true });
    mpDebug('guest-start', { roomId: G.mp.roomId });
    startMpRelay();
    startMpCamRelayPoll();
    queueMpWebcamIntro();
    startMpPeer();
    track('multiplayer_joined', { role: 'guest', roomId });
  }

  function cleanupMultiplayer() {
    mpDebug('cleanup-multiplayer');
    if (multiplayerActive()) {
      try { mpSend({ type: 'leave' }); } catch (e) {}
    }
    clearTimeout(G.mp.stateBroadcastTimer);
    stopMpCamRelay({ notify: true });
    stopMpRelay();
    (G.mp.conns || []).forEach(conn => {
      try { conn?.close?.(); } catch (e) {}
    });
    (G.mp.calls || []).forEach(call => {
      try { call?.close?.(); } catch (e) {}
    });
    try { G.mp.conn?.close(); } catch (e) {}
    try { G.mp.call?.close(); } catch (e) {}
    try { G.mp.peer?.destroy(); } catch (e) {}
    G.mp.localStream?.getTracks?.().forEach(track => track.stop());
    Object.assign(G.mp, {
      active: false,
      role: null,
      roomId: null,
      peer: null,
      conn: null,
      conns: [],
      call: null,
      calls: [],
      remotePeerId: null,
      remoteReady: false,
      hadRemote: false,
      connectionState: 'idle',
      turn: 'host',
      stateSeq: 0,
      lastAppliedSeq: 0,
      stateBroadcastTimer: null,
      pendingStateSnapshot: null,
      lastStateRequestAt: 0,
      localStream: null,
      webcamOn: false,
      suppressNetwork: false,
      pendingDrawId: null,
      pendingAnswerChoice: null,
      pendingAnswer: null,
      pendingTdChoice: null,
      pendingTdResult: null,
      playerStats: blankMpPlayerStats(),
      backchannelAttempted: false,
      relayClientId: null,
      relayTimer: null,
      relaySeen: new Set(),
      relaySeq: 0,
      relayReadyNotified: false,
      relayFailCount: 0,
      relayMissingCount: 0,
      iceServers: null,
      iceSource: 'default-stun',
      iceConfigured: false,
      camRelaySendTimer: null,
      camRelayPollTimer: null,
      camRelayBusy: false,
      camRelayCanvas: null,
      camRelayLastRemote: 0,
      camRelayRemoteOn: false,
      remoteVideoLive: false
    });
    webcamDrag.busy = false;
    setMpActive(false);
  }

  function leaveMultiplayerToSplash() {
    cleanupMultiplayer();
    els.after.classList.add('hidden');
    closeModeSelect();
    resetDeck('all', { clearRitual: true });
    els.app.classList.remove('on');
    els.splash.style.display = 'flex';
    els.splash.classList.remove('leaving');
    startSplashIntro(true);
    toast(t('mpClosed'));
  }

  async function getMpLocalStream() {
    if (G.mp.localStream) return G.mp.localStream;
    mpDebug('get-user-media-start', { secure: window.isSecureContext, mediaDevices: !!navigator.mediaDevices });
    if (!navigator.mediaDevices?.getUserMedia) {
      mpDebug('get-user-media-unavailable');
      throw new Error('Camera unavailable');
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 540 }, height: { ideal: 540 } },
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    });
    G.mp.localStream = stream;
    bindMpTrackDebug(stream, 'local-stream');
    mpDebug('get-user-media-ok', { tracks: mpDebugTrackState(stream) });
    return stream;
  }

  async function toggleMpWebcam() {
    if (!multiplayerActive()) return;
    if (webcamDrag.busy) return;
    webcamDrag.busy = true;
    clearMpWebcamTimers();
    mpDebug('webcam-toggle', { currentlyOn: G.mp.webcamOn });
    if (G.mp.webcamOn) {
      G.mp.webcamOn = false;
      stopMpCamRelaySend();
      mpCamRelayRequest('leave').catch(error => mpDebug('cam-relay-leave-error', mpDebugError(error)));
      G.mp.localStream?.getTracks?.().forEach(track => track.stop());
      G.mp.localStream = null;
      if (els.mpLocalVideo) els.mpLocalVideo.srcObject = null;
      els.mpWebcam?.classList.remove('has-local');
      els.mpCamera?.classList.add('is-off');
      els.mpWebcam?.classList.toggle('is-live', els.mpWebcam.classList.contains('has-remote'));
      mpSend({ type: 'webcam-off' });
      if (!els.mpWebcam?.classList.contains('has-remote')) hideMpWebcamWindow({ toIcon: true });
      syncMultiplayerLabels();
      mpDebug('webcam-off-local');
      webcamDrag.busy = false;
      return;
    }
    try {
      const stream = await getMpLocalStream();
      G.mp.webcamOn = true;
      if (els.mpLocalVideo) {
        els.mpLocalVideo.srcObject = stream;
        await els.mpLocalVideo.play()
          .then(() => mpDebug('local-video-play-ok'))
          .catch(error => mpDebug('local-video-play-error', mpDebugError(error)));
      }
      const warmed = await waitForMpVideoWarmup(els.mpLocalVideo, IS_ANDROID ? 1600 : 900);
      mpDebug('local-video-warmup', { warmed, video: mpDebugVideoState(els.mpLocalVideo) });
      els.mpWebcam?.classList.add('has-local');
      els.mpWebcam?.classList.add('is-live');
      els.mpCamera?.classList.remove('is-off');
      syncMultiplayerLabels();
      showMpWebcamWindow();
      startMpCamRelaySend();
      mpDebug('webcam-on-local', { remotePeerId: G.mp.remotePeerId || null, hasPeer: !!G.mp.peer });
      if (G.mp.remotePeerId && G.mp.peer) {
        mpDebug('outgoing-call-start', { remotePeerId: G.mp.remotePeerId, tracks: mpDebugTrackState(stream) });
        bindMpCall(G.mp.peer.call(G.mp.remotePeerId, stream));
      }
    } catch (error) {
      mpDebug('get-user-media-error', mpDebugError(error));
      console.warn('[Ignight multiplayer camera]', error);
      toast(t('mpCameraBlocked'));
      hideMpWebcamWindow({ toIcon: true });
    } finally {
      webcamDrag.busy = false;
    }
  }

  function mpEmojiTone(emoji) {
    if (emoji === '💩' || emoji === '💀') return 'dare';
    if (emoji === '💋' || emoji === '💖') return 'yes';
    return 'yes';
  }

  function sendMpEmoji(emoji) {
    const tone = mpEmojiTone(emoji);
    emojiRain(emoji, tone);
    mpSend({ type: 'emoji', emoji, tone });
  }

  function embers(n = 20) {
    const box = $('embers');
    const colors = ['#ffaa00', '#e8c97a', '#ff8866', '#e8607a'];
    for (let i = 0; i < n; i++) {
      setTimeout(() => {
        const e = document.createElement('div');
        e.className = 'ember';
        e.style.left = (12 + Math.random() * 76) + '%';
        const dur = 1.9 + Math.random() * 2.4;
        e.style.animationDuration = dur + 's';
        e.style.animationDelay = (Math.random() * 0.4) + 's';
        const s = 2 + Math.random() * 6;
        e.style.width = s + 'px';
        e.style.height = s + 'px';
        const c = colors[Math.floor(Math.random() * colors.length)];
        e.style.background = `radial-gradient(circle, ${c}, #ff1a00)`;
        box.appendChild(e);
        setTimeout(() => e.remove(), (dur + 0.6) * 1000);
      }, i * 38 + Math.random() * 25);
    }
  }

  function resetActionStreak() {
    G.actionStreak = { type: null, count: 0 };
  }

  function emojiRainPalette(emoji, tone = 'yes') {
    if (emoji === '💖' || emoji === '💋') {
      return {
        cls: 'is-devil',
        glow: 'rgba(255,86,154,0.62)',
        hot: 'rgba(255,211,226,0.72)',
        spark: 'rgba(255,124,184,0.56)'
      };
    }
    if (emoji === '💩') {
      return {
        cls: 'is-devil',
        glow: 'rgba(180,106,42,0.58)',
        hot: 'rgba(235,174,92,0.66)',
        spark: 'rgba(210,132,54,0.52)'
      };
    }
    if (emoji === '💀') {
      return {
        cls: 'is-angel',
        glow: 'rgba(205,214,236,0.54)',
        hot: 'rgba(255,255,255,0.62)',
        spark: 'rgba(196,206,232,0.48)'
      };
    }
    if (emoji === '👼' || tone === 'never' || tone === 'truth') {
      return {
        cls: 'is-angel',
        glow: 'rgba(126,211,255,0.62)',
        hot: 'rgba(245,250,255,0.78)',
        spark: 'rgba(183,231,255,0.56)'
      };
    }
    return {
      cls: 'is-devil',
      glow: tone === 'dare' ? 'rgba(255,64,74,0.58)' : 'rgba(218,75,255,0.62)',
      hot: tone === 'dare' ? 'rgba(255,150,92,0.7)' : 'rgba(246,194,255,0.72)',
      spark: tone === 'dare' ? 'rgba(255,77,64,0.52)' : 'rgba(229,91,255,0.56)'
    };
  }

  function emojiRain(emoji, tone = 'yes') {
    const box = $('embers');
    if (!box) return;
    if (baselineEffectQuality() && box.querySelector('.emoji-rain')) return;
    markFxPhase('emoji-rain', 4700);
    const count = effectProfile().emojiRainCount || 20;
    const palette = emojiRainPalette(emoji, tone);
    for (let i = 0; i < count; i++) {
      const e = document.createElement('div');
      e.className = `emoji-rain ${palette.cls}`;
      e.textContent = emoji;
      e.style.left = `${rand(8, 92)}%`;
      e.style.setProperty('--rain-size', `${rand(1.05, 1.72)}rem`);
      e.style.setProperty('--rain-x0', `${rand(-8, 8)}px`);
      e.style.setProperty('--rain-x1', `${rand(-46, 46)}px`);
      e.style.setProperty('--rain-x2', `${rand(-78, 78)}px`);
      e.style.setProperty('--rain-x3', `${rand(-42, 42)}px`);
      e.style.setProperty('--rain-rot', `${rand(-28, 28)}deg`);
      e.style.setProperty('--rain-rot-mid', `${rand(-18, 18)}deg`);
      e.style.setProperty('--rain-dur', `${rand(2.9, 4.55)}s`);
      e.style.setProperty('--rain-delay', `${i * rand(0.02, 0.055)}s`);
      e.style.setProperty('--rain-glow', palette.glow);
      e.style.setProperty('--rain-hot', palette.hot);
      e.style.setProperty('--rain-spark', palette.spark);
      box.appendChild(e);
      setTimeout(() => e.remove(), 6200);
    }
  }

  function registerActionStreak(type) {
    const normalized = ['yes', 'never', 'truth', 'dare'].includes(type) ? type : null;
    if (!normalized) {
      resetActionStreak();
      return;
    }
    if (G.actionStreak.type === normalized) {
      G.actionStreak.count++;
    } else {
      G.actionStreak = { type: normalized, count: 1 };
    }
    if (G.actionStreak.count < 4) return;
    emojiRain(normalized === 'yes' || normalized === 'dare' ? '😈' : '👼', normalized);
    G.actionStreak.count = 0;
  }

  function ripple(btn, e) {
    const r = btn.getBoundingClientRect();
    const x = (e.clientX ?? e.touches?.[0]?.clientX ?? r.left + r.width / 2) - r.left;
    const y = (e.clientY ?? e.touches?.[0]?.clientY ?? r.top + r.height / 2) - r.top;
    btn.style.setProperty('--rx', x + 'px');
    btn.style.setProperty('--ry', y + 'px');
    btn.classList.remove('rip');
    void btn.offsetWidth;
    btn.classList.add('rip');
  }

  function applyCard(c, kind = null) {
    const shown = els.back.classList.contains('shown');
    els.back.className = `face back ${TIER_CLASS[c.tier] || 't-warm'}${shown ? ' shown' : ''}`;
    els.badge.textContent = kind ? `${kind === 'truth' ? t('truthLabel') : t('dareLabel')} · ${tierLabel(c.tier)}` : tierLabel(c.tier);
    els.cText.textContent = c.text;
    els.cEmoji.textContent = c.emoji;
    setAtm(c.tier);
  }

  function preloadNext() {
    G.cur = G.deck.pop() || null;
    G.curKind = null;
    if (G.cur) applyCard(G.cur);
  }

  function actionEls() {
    return [els.actDraw, els.actRev, els.actTdChoice, els.actTdResult].filter(Boolean);
  }

  function setActionVisible(el, visible, immediate = false) {
    if (!el) return;
    const timer = actionTimers.get(el);
    if (timer) {
      clearTimeout(timer);
      actionTimers.delete(el);
    }

    if (visible) {
      el.classList.remove('hidden', 'flow-enter', 'flow-exit');
      el.setAttribute('aria-hidden', 'false');
      void el.offsetWidth;
      el.classList.add('flow-enter');
      actionTimers.set(el, setTimeout(() => {
        el.classList.remove('flow-enter');
        actionTimers.delete(el);
      }, 520));
      return;
    }

    el.setAttribute('aria-hidden', 'true');
    if (immediate || el.classList.contains('hidden')) {
      el.classList.add('hidden');
      el.classList.remove('flow-enter', 'flow-exit');
      return;
    }

    el.classList.remove('flow-enter');
    el.classList.add('flow-exit');
    actionTimers.set(el, setTimeout(() => {
      el.classList.add('hidden');
      el.classList.remove('flow-exit');
      actionTimers.delete(el);
    }, 300));
  }

  function hideActions({ immediate = false } = {}) {
    actionEls().forEach(el => setActionVisible(el, false, immediate));
  }

  function showCurrentActions() {
    setSwipeOverlayContent();
    hideActions();
    if (G.completed || G.formingDeck || G.tutorialing) return;

    if (G.game === GAME.TD) {
      if (truthDareIntroBlocking()) return;
      updateTruthDareButtons();
      if (!G.flipped && remaining() <= 0) return;
      setActionVisible(G.flipped ? els.actTdResult : els.actTdChoice, true);
      updateMultiplayerButtons();
      return;
    }

    setActionVisible(G.flipped ? els.actRev : els.actDraw, true);
    updateMultiplayerButtons();
  }

  function resetCardShell() {
    cancelSwipeTutorial({ restoreActions: false });
    clearDeckFormation();
    els.card.classList.remove('do-flip');
    els.back.classList.remove('shown');
    els.card.style.transition = '';
    els.card.style.transform = '';
    els.card.style.opacity = '';
    setChoiceFaceFade(1);
    [els.dirLeft, els.dirRight].forEach(dir => {
      dir.style.opacity = '0';
      dir.style.transition = '';
    });
    drag.moved = false;
    drag.mode = null;
    drag.dx = 0;
    G.flipped = false;
    G.cur = null;
    G.curKind = null;
    setSwipeOverlayContent();
  }

  function updateTruthDareButtons() {
    if (!els.btnTruth || !els.btnDare) return;
    const done = G.game === GAME.TD && remaining() <= 0;
    els.btnTruth.disabled = G.game === GAME.TD && (done || G.truthDeck.length === 0);
    els.btnDare.disabled = G.game === GAME.TD && (done || G.dareDeck.length === 0);
  }

  function updateMultiplayerButtons() {
    if (!multiplayerActive()) return;
    const disabled = !G.mp.remoteReady || mpConnectionBlocksAction() || !localTurn();
    if (G.game === GAME.TD) {
      if (disabled) {
        [els.btnTruth, els.btnDare, els.btnSkip, $('btn-done')].forEach(btn => {
          if (btn) btn.disabled = true;
        });
      } else {
        updateTruthDareButtons();
        [els.btnSkip, $('btn-done')].forEach(btn => {
          if (btn) btn.disabled = false;
        });
      }
      return;
    }
    ['btn-draw', 'btn-yes', 'btn-never'].forEach(id => {
      const btn = $(id);
      if (btn) btn.disabled = disabled;
    });
  }

  function renderGameChrome() {
    els.gameLabel.textContent = activeRitualTitle();
    setFrontHint();
    setSwipeOverlayContent();
    document.body.dataset.game = G.game;
    document.body.dataset.ritual = G.ritual?.classic ? 'classic' : (G.ritual?.id || 'none');
    setStatLabels();
    renderTierChrome();
    syncModeCards();
  }

  function resetDeck(cat = G.cat, { formation = 'tier', ritual = G.ritual, clearRitual = false } = {}) {
    clearSwipeTutorialTimers();
    cancelSwipeNudge();
    G.cat = cat;
    G.ritual = clearRitual ? null : (ritual || null);
    G.session = els.app.classList.contains('on') && GM
      ? GM.startSession({ game: G.game, tier: cat, ritual: G.ritual })
      : null;
    G.lastAfterglow = null;
    G.drawn = 0;
    G.yes = 0;
    G.never = 0;
    G.truthDone = 0;
    G.dareDone = 0;
    G.skips = 0;
    if (multiplayerActive()) resetMpPlayerStats();
    G.completed = false;
    document.body.classList.remove('mp-results');
    G.busy = false;
    G.truthDareIntroReady = G.game !== GAME.TD || !G.truthDareTutorialArmed;
    resetActionStreak();
    els.after.classList.add('hidden');
    [els.sDrawn, els.sLeft, els.sYes, els.sNever].forEach(el => { delete el.dataset.value; });
    resetCardShell();
    hideActions({ immediate: true });

    if (G.game === GAME.TD) {
      G.deck = [];
      G.truthDeck = buildDeck(cat, 'truthCards');
      G.dareDeck = buildDeck(cat, 'dareCards');
      const quickLimit = quickRunLimit();
      G.total = Number.isFinite(quickLimit)
        ? Math.min(quickLimit, G.truthDeck.length + G.dareDeck.length)
        : G.truthDeck.length + G.dareDeck.length;
      setAtm(cat === 'all' ? 'warm' : cat);
    } else {
      G.truthDeck = [];
      G.dareDeck = [];
      G.deck = buildDeck(cat, 'neverCards');
      G.total = G.deck.length;
      preloadNext();
      setAtm('warm');
    }

    setHeat(cat);
    renderGameChrome();
    updateUI();
    playDeckFormation({ variant: formation === 'mode' ? nextModeFormationVariant() : 'sidecut' });
  }

  function revealLoadedCard() {
    if (G.busy || G.flipped || !G.cur || G.completed) return;
    G.busy = true;
    window.SFX.flip();
    vibe([8, 18, 8]);
    G.drawn++;
    updateUI();
    track('card_drawn', {
      cardId: G.cur.id,
      kind: G.curKind || 'never',
      cardTier: G.cur.tier,
      drawn: G.drawn,
      total: G.total
    });
    GM?.recordDraw(G.session, G.cur, sourceForCurrent());

    els.card.classList.add('do-flip');
    setTimeout(() => {
      els.back.classList.add('shown');
      G.flipped = true;
      setSwipeOverlayContent();
      G.busy = false;
      if (G.cur.tier === 'fire') {
        window.SFX.fire();
        embers(26);
      } else {
        window.SFX.land();
        if (G.cur.tier === 'hot') embers(8);
      }
      if (shouldRunNeverTutorial()) queueNeverTutorial(240);
      else {
        showCurrentActions();
        processMultiplayerQueue();
      }
    }, 340);
  }

  function revealCard(source = 'local') {
    if (G.game !== GAME.NEVER) return;
    if (multiplayerActive() && source !== 'remote') {
      if (!multiplayerCanAct()) {
        toast(multiplayerWaitCopy());
        return;
      }
      if (G.cur?.id && !G.mp.suppressNetwork) {
        mpSend({ type: 'draw', cardId: G.cur.id });
      }
    }
    revealLoadedCard();
    if (multiplayerActive()) queueMpStateBroadcast('draw', 620);
  }

  function chooseTruthDare(kind, withRift = true, options = {}) {
    if (G.game !== GAME.TD || G.busy || G.flipped || G.completed) return;
    const source = options.source || 'local';
    if (multiplayerActive() && source !== 'remote' && !multiplayerCanAct()) {
      toast(multiplayerWaitCopy());
      return;
    }
    if (remaining() <= 0) {
      showAfter();
      return;
    }
    const deck = truthDareDeck(kind);
    if (!options.cardId && !deck.length) {
      handleTruthDareEmpty(kind);
      return;
    }

    if (options.cardId) {
      if (!setTruthDareCurrentById(kind, options.cardId)) {
        if (!deck.length) {
          if (source === 'remote') {
            showCurrentActions();
            updateUI();
          } else {
            handleTruthDareEmpty(kind);
          }
          return;
        }
        G.cur = deck.pop();
        G.curKind = kind;
        applyCard(G.cur, kind);
      }
    } else {
      G.cur = deck.pop();
      G.curKind = kind;
      applyCard(G.cur, kind);
    }
    if (withRift) triggerRift(kind);
    if (multiplayerActive() && source !== 'remote' && !G.mp.suppressNetwork) {
      mpSend({ type: 'td-choice', kind, cardId: G.cur?.id || null });
    }
    revealLoadedCard();
    if (multiplayerActive()) queueMpStateBroadcast('td-choice', source === 'remote' ? 1240 : 760);
  }

  function answer(choice, source = 'button', meta = {}) {
    if (G.busy || !G.flipped || !G.cur || G.game !== GAME.NEVER) return;
    if (multiplayerActive() && source !== 'remote' && !multiplayerCanAct()) {
      toast(multiplayerWaitCopy());
      return;
    }
    if (source === 'button') {
      answerByButton(choice);
      return;
    }
    triggerRift(choice);
    GM?.recordOutcome(G.session, G.cur, choice);
    if (choice === 'yes') G.yes++;
    else G.never++;
    if (multiplayerActive()) recordMpNeverOutcome(choice, source === 'remote' ? meta.playerRole : G.mp.role);
    registerActionStreak(choice);
    updateUI();
    if (multiplayerActive() && source !== 'remote' && !G.mp.suppressNetwork) {
      mpSend({ type: 'answer', choice });
      G.mp.turn = remoteRole();
      setMpStatus();
    } else if (multiplayerActive() && source === 'remote') {
      G.mp.turn = G.mp.role;
      setMpStatus();
    }
    if (multiplayerActive()) queueMpStateBroadcast('answer', source === 'remote' ? 1240 : 980);
    dismiss(choice, source);
  }

  function denyTruthDareSkip() {
    window.SFX.click?.();
    vibe([4, 18, 4]);
    toast(t('skipDenied'));
    track('skip_denied', {
      cardId: G.cur?.id || null,
      kind: G.curKind || null
    });

    els.btnSkip?.classList.remove('denied');
    els.card?.classList.remove('skip-denied');
    void els.btnSkip?.offsetWidth;
    void els.card?.offsetWidth;
    els.btnSkip?.classList.add('denied');
    els.card?.classList.add('skip-denied');
    setTimeout(() => {
      els.btnSkip?.classList.remove('denied');
      els.card?.classList.remove('skip-denied');
    }, 520);
  }

  function resetRejectedResultSwipe() {
    resetSyntheticSwipe();
    els.card.style.transition = 'transform 0.24s cubic-bezier(0.34,1.4,0.64,1), opacity 0.18s ease';
    els.card.style.transform = '';
    els.card.style.opacity = '';
    setTimeout(() => {
      els.card.style.transition = '';
    }, 260);
  }

  function completeTruthDare(outcome, source = 'button', meta = {}) {
    if (G.busy || !G.flipped || !G.cur || G.game !== GAME.TD) return;
    if (multiplayerActive() && source !== 'remote' && !multiplayerCanAct()) {
      toast(multiplayerWaitCopy());
      return;
    }
    if (outcome === 'skip') {
      if (isNoSkipRun()) {
        if (source === 'swipe') resetRejectedResultSwipe();
        denyTruthDareSkip();
        return;
      }
      G.skips++;
      resetActionStreak();
    } else if (G.curKind === 'truth') {
      G.truthDone++;
      registerActionStreak('truth');
    } else {
      G.dareDone++;
      registerActionStreak('dare');
    }
    GM?.recordOutcome(G.session, G.cur, `${G.curKind || 'card'}:${outcome}`);
    if (multiplayerActive()) {
      recordMpTruthDareOutcome(outcome, meta.cardKind || G.curKind, source === 'remote' ? meta.playerRole : G.mp.role);
    }
    updateUI();
    if (multiplayerActive() && source !== 'remote' && !G.mp.suppressNetwork) {
      mpSend({ type: 'td-result', outcome, kind: G.curKind, cardId: G.cur?.id || null });
      G.mp.turn = remoteRole();
      setMpStatus();
    } else if (multiplayerActive() && source === 'remote') {
      G.mp.turn = G.mp.role;
      setMpStatus();
    }
    if (multiplayerActive()) queueMpStateBroadcast('td-result', source === 'remote' ? 1240 : 980);
    triggerRift(outcome === 'skip' ? 'never' : 'yes');
    dismiss(outcome === 'skip' ? 'never' : 'yes', source);
  }

  function swipeMode() {
    if (G.busy || G.completed) return null;
    if (G.game === GAME.NEVER && !G.flipped && G.cur) return 'never-reveal';
    if (G.game === GAME.NEVER && G.flipped && G.cur) return 'never-answer';
    if (G.game === GAME.TD && !G.flipped) return 'truth-dare-choice';
    if (G.game === GAME.TD && G.flipped && G.cur) return 'truth-dare-result';
    return null;
  }

  function swipeOverlayOpacity(dx) {
    const distance = Math.abs(dx);
    const cardW = els.card.getBoundingClientRect().width || 360;
    const fullAt = Math.max(THRESH * 1.55, cardW * 0.55);
    const startAt = Math.max(THRESH * 0.48, fullAt * 0.34);
    if (distance <= startAt) return 0;
    const raw = Math.min((distance - startAt) / (fullAt - startAt), 1);
    return OVERLAY_MAX * (1 - Math.pow(1 - raw, 2.6));
  }

  function runFinished() {
    return G.game === GAME.TD ? remaining() === 0 : G.deck.length === 0;
  }

  function resetSyntheticSwipe({ resetOverlay = true, resetCard = true, resetFace = true } = {}) {
    const dirs = [els.dirLeft, els.dirRight];
    if (resetOverlay) {
      dirs.forEach(d => {
        d.style.opacity = '0';
        d.style.transition = '';
      });
    }
    if (resetCard) {
      els.card.style.transition = '';
      els.card.style.transform = '';
    }
    if (resetFace) setChoiceFaceFade(1);
    drag.moved = false;
    drag.dx = 0;
    drag.mode = null;
  }

  function revealBySwipe() {
    resetSyntheticSwipe();
    drag.moved = true;
    els.card.style.transition = 'transform 0.18s cubic-bezier(0.34,1.35,0.64,1)';
    els.card.style.transform = '';
    setTimeout(() => {
      els.card.style.transition = '';
      revealCard();
    }, 90);
  }

  function clearSwipeNudgeTimers() {
    swipeNudgeTimers.forEach(id => clearTimeout(id));
    swipeNudgeTimers = [];
  }

  function nudgeTimer(fn, ms) {
    const id = setTimeout(() => {
      swipeNudgeTimers = swipeNudgeTimers.filter(timerId => timerId !== id);
      fn();
    }, ms);
    swipeNudgeTimers.push(id);
  }

  function cancelSwipeNudge({ reset = true } = {}) {
    const active = swipeNudgeTimers.length > 0 || els.card.classList.contains('swipe-nudge');
    clearSwipeNudgeTimers();
    els.card.classList.remove('swipe-nudge');
    if (active && reset) {
      resetSyntheticSwipe();
      els.card.style.opacity = '';
      G.busy = false;
    }
  }

  function nudgeSwipeAction(mode = swipeMode()) {
    if (!mode || G.busy || G.completed) return;
    if (mode === 'truth-dare-choice' && truthDareIntroBlocking()) return;
    clearSwipeNudgeTimers();
    cancelSwipeTutorial({ restoreActions: false });
    setSwipeOverlayContent();
    window.SFX.click?.();
    vibe([3, 8, 3]);
    G.busy = true;
    els.card.classList.add('swipe-nudge');
    els.card.style.opacity = '1';

    const travel = Math.min(96, Math.max(64, els.card.getBoundingClientRect().width * 0.26));
    const faceDim = mode === 'truth-dare-choice' ? '0.18' : 1;
    const leftOpacity = String(OVERLAY_MAX * 0.84);
    const rightOpacity = String(OVERLAY_MAX * 0.84);
    els.dirLeft.style.transition = 'opacity 0.22s ease';
    els.dirRight.style.transition = 'opacity 0.22s ease';
    els.card.style.transition = 'transform 0.26s cubic-bezier(0.16,1,0.3,1)';
    setSwipeTutorialFrame(-travel, leftOpacity, '0', faceDim);

    nudgeTimer(() => {
      els.card.style.transition = 'transform 0.34s cubic-bezier(0.16,1,0.3,1)';
      setSwipeTutorialFrame(travel, '0', rightOpacity, faceDim);
    }, 680);

    nudgeTimer(() => {
      els.card.style.transition = 'transform 0.28s cubic-bezier(0.34,1.4,0.64,1)';
      setSwipeTutorialFrame(0, '0', '0', 1);
    }, 1380);

    nudgeTimer(() => {
      els.card.classList.remove('swipe-nudge');
      els.card.style.transition = '';
      els.dirLeft.style.transition = '';
      els.dirRight.style.transition = '';
      setSwipeTutorialFrame(0, '0', '0', 1);
      G.busy = false;
    }, 1700);
  }

  function playButtonTriggeredSwipe({ side, riftAction, haptic = [6], fadeFace = false, keepOverlayOnCommit = false, onCommit }) {
    if (G.busy || G.completed) return;
    const poseMs = 620;
    G.busy = true;
    triggerRift(riftAction);
    vibe(haptic);
    hideActions();

    const right = side === 'right';
    const dirs = [els.dirLeft, els.dirRight];
    dirs[0].style.opacity = right ? '0' : OVERLAY_MAX;
    dirs[1].style.opacity = right ? OVERLAY_MAX : '0';
    dirs.forEach(d => { d.style.transition = 'opacity 0.34s ease'; });

    const dx = right ? 92 : -92;
    const rot = right ? 5.5 : -5.5;
    els.card.style.transition = 'transform 0.32s cubic-bezier(0.16,1,0.3,1), opacity 0.18s ease';
    els.card.style.transform = `translateX(${dx}px) translateY(-7px) rotate(${rot}deg)`;
    els.card.style.opacity = '1';
    if (fadeFace) setChoiceFaceFade(Math.max(0, 1 - (OVERLAY_MAX / 0.24)).toFixed(3));

    setTimeout(() => {
      if (!keepOverlayOnCommit) resetSyntheticSwipe();
      onCommit?.();
    }, poseMs);
  }

  function answerByButton(choice) {
    if (!G.flipped || !G.cur || G.game !== GAME.NEVER) return;
    if (multiplayerActive() && !multiplayerCanAct()) {
      toast(multiplayerWaitCopy());
      return;
    }
    playButtonTriggeredSwipe({
      side: choice === 'yes' ? 'right' : 'left',
      riftAction: choice,
      haptic: choice === 'yes' ? [6, 16, 6] : [6],
      keepOverlayOnCommit: true,
      onCommit: () => {
        GM?.recordOutcome(G.session, G.cur, choice);
        if (choice === 'yes') G.yes++;
        else G.never++;
        if (multiplayerActive()) recordMpNeverOutcome(choice, G.mp.role);
        registerActionStreak(choice);
        updateUI();
        if (multiplayerActive() && !G.mp.suppressNetwork) {
          mpSend({ type: 'answer', choice });
          G.mp.turn = remoteRole();
          setMpStatus();
        }
        if (multiplayerActive()) queueMpStateBroadcast('answer', 980);
        dismiss(choice, 'swipe', { busyAlready: true });
      }
    });
  }

  function receiveTruthDareChoice({ kind, cardId, role } = {}) {
    if (G.game !== GAME.TD || G.flipped || G.completed || !kind) return;
    if (G.busy || truthDareIntroBlocking()) {
      G.mp.pendingTdChoice = { kind, cardId, role };
      return;
    }
    G.busy = true;
    triggerRift(kind);
    hideActions();
    setSwipeOverlayContent();

    const right = kind === 'dare';
    const w = window.innerWidth || 480;
    const previewX = right ? Math.min(114, w * 0.28) : -Math.min(114, w * 0.28);
    const previewRot = right ? 5.5 : -5.5;
    els.dirLeft.style.transition = 'opacity 0.32s ease';
    els.dirRight.style.transition = 'opacity 0.32s ease';
    els.dirLeft.style.opacity = right ? '0' : OVERLAY_MAX;
    els.dirRight.style.opacity = right ? OVERLAY_MAX : '0';
    els.card.style.transition = 'transform 0.38s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease';
    els.card.style.transform = `translateX(${previewX}px) translateY(-7px) rotate(${previewRot}deg)`;
    els.card.style.opacity = '1';
    setChoiceFaceFade(0.18);

    setTimeout(() => {
      resetSyntheticSwipe();
      G.busy = false;
      chooseTruthDare(kind, false, { source: 'remote', cardId, playerRole: role || remoteRole() });
    }, 700);
  }

  function chooseTruthDareByButton(kind) {
    if (G.game !== GAME.TD || G.flipped || G.completed) return;
    if (multiplayerActive() && !multiplayerCanAct()) {
      toast(multiplayerWaitCopy());
      return;
    }
    if (!truthDareCanChoose(kind)) {
      handleTruthDareEmpty(kind);
      return;
    }
    playButtonTriggeredSwipe({
      side: kind === 'dare' ? 'right' : 'left',
      riftAction: kind,
      haptic: kind === 'dare' ? [6, 16, 6] : [6, 10],
      fadeFace: true,
      onCommit: () => {
        G.busy = false;
        chooseTruthDare(kind, false);
      }
    });
  }

  function chooseTruthDareBySwipe(kind, source = 'swipe') {
    if (source === 'button') {
      chooseTruthDareByButton(kind);
      return;
    }
    if (G.game !== GAME.TD || G.flipped || G.completed) return;
    if (multiplayerActive() && source !== 'remote' && !multiplayerCanAct()) {
      toast(multiplayerWaitCopy());
      return;
    }
    if (!truthDareCanChoose(kind)) {
      handleTruthDareEmpty(kind);
      return;
    }
    G.busy = true;
    window.SFX.click();
    vibe(kind === 'dare' ? [6, 16, 6] : [6, 10]);
    triggerRift(kind);
    hideActions();

    const dirs = [els.dirLeft, els.dirRight];
    const right = kind === 'dare';
    dirs[0].style.opacity = right ? '0' : OVERLAY_MAX;
    dirs[1].style.opacity = right ? OVERLAY_MAX : '0';
    const duration = source === 'button' ? 520 : 170;
    dirs.forEach(d => { d.style.transition = `opacity ${source === 'button' ? 0.3 : 0.16}s ease`; });
    els.card.style.transition = `transform ${source === 'button' ? 0.48 : 0.18}s cubic-bezier(0.16,1,0.3,1), opacity 0.16s ease`;
    if (source === 'button') {
      const dx = right ? 132 : -132;
      const rot = right ? 7 : -7;
      els.card.style.transform = `translateX(${dx}px) translateY(-7px) rotate(${rot}deg)`;
      setChoiceFaceFade(Math.max(0, 1 - (OVERLAY_MAX / 0.24)).toFixed(3));
    } else {
      els.card.style.transform = '';
    }

    setTimeout(() => {
      resetSyntheticSwipe();
      G.busy = false;
      chooseTruthDare(kind, false, { source });
    }, duration);
  }

  function dismiss(choice, source = 'button', { busyAlready = false } = {}) {
    if (G.busy && !busyAlready) return;
    if (!busyAlready) G.busy = true;
    window.SFX.swipe(choice === 'yes' ? 'yes' : 'never');
    vibe(choice === 'yes' ? [6, 16, 6] : [6]);
    hideActions();

    const dirs = els.card.querySelectorAll('.dir-left, .dir-right');
    const right = choice === 'yes';
    if (G.game === GAME.NEVER) {
      dirs[0].style.opacity = right ? '0' : OVERLAY_MAX;
      dirs[1].style.opacity = right ? OVERLAY_MAX : '0';
    } else if (G.game === GAME.TD) {
      setSwipeOverlayContent();
      dirs[0].style.opacity = right ? '0' : OVERLAY_MAX;
      dirs[1].style.opacity = right ? OVERLAY_MAX : '0';
    }

    const w = window.innerWidth || 480;
    const innerX = right ? (w * 0.95) : -(w * 0.95);
    const innerRot = right ? 10 : -10;
    const isRemoteSwipe = source === 'remote';
    const swipeMs = source === 'button' ? 560 : (isRemoteSwipe ? 360 : 245);
    const transformMs = source === 'button' ? 0.52 : 0.24;
    const opacityMs = source === 'button' ? 0.34 : 0.2;
    const opacityDelay = source === 'button' ? 0.18 : 0;

    const finishDismiss = () => {
      const finished = runFinished();
      els.card.style.transition = 'none';
      els.card.style.transform = 'scale(0.96) translateY(12px)';
      els.card.style.opacity = '0';
      setChoiceFaceFade(1);
      els.card.classList.remove('do-flip');
      els.back.classList.remove('shown');
      G.flipped = false;
      G.cur = null;
      G.curKind = null;
      setSwipeOverlayContent();
      drag.moved = false;
      drag.mode = null;
      drag.dx = 0;
      dirs.forEach(d => {
        d.style.opacity = '0';
        d.style.transition = '';
      });
      hideActions();

      if (finished) {
        G.busy = false;
        showAfter();
        applyPendingMpState();
        return;
      }

      if (G.game === GAME.NEVER) preloadNext();
      requestAnimationFrame(() => {
        els.card.style.transition = 'transform 0.24s cubic-bezier(0.34,1.45,0.64,1), opacity 0.16s ease';
        els.card.style.transform = '';
        els.card.style.opacity = '';
        setTimeout(() => {
          els.card.style.transition = '';
          G.busy = false;
          showCurrentActions();
          updateUI();
        }, 270);
      });
    };

    const commitDismiss = () => {
      dirs[0].style.transition = `opacity ${source === 'button' ? 0.28 : 0.20}s ease`;
      dirs[1].style.transition = `opacity ${source === 'button' ? 0.28 : 0.20}s ease`;
      els.card.style.transition = `transform ${transformMs}s cubic-bezier(0.16,1,0.3,1), opacity ${opacityMs}s ease ${opacityDelay}s`;
      els.card.style.transform = `translateX(${innerX}px) rotate(${innerRot}deg)`;
      els.card.style.opacity = '0';
      setTimeout(finishDismiss, swipeMs);
    };

    if (isRemoteSwipe) {
      const previewX = right ? Math.min(114, w * 0.28) : -Math.min(114, w * 0.28);
      const previewRot = right ? 5.5 : -5.5;
      dirs[0].style.transition = 'opacity 0.32s ease';
      dirs[1].style.transition = 'opacity 0.32s ease';
      els.card.style.transition = 'transform 0.38s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease';
      els.card.style.transform = `translateX(${previewX}px) translateY(-7px) rotate(${previewRot}deg)`;
      els.card.style.opacity = '1';
      setTimeout(commitDismiss, 680);
      return;
    }

    commitDismiss();
  }

  function verdict() {
    if (G.game === GAME.TD) {
      const played = Math.max(G.drawn, 1);
      const skipRatio = G.skips / played;
      const dareRatio = G.dareDone / played;
      if (!isNoSkipRun() && skipRatio > 0.34) return t('truthDareVerdictSoft');
      if (G.cat === 'fire' || (G.cat === 'hot' && dareRatio >= 0.5) || (G.cat === 'all' && dareRatio >= 0.48)) {
        return t('truthDareVerdictHot');
      }
      return t('truthDareVerdictBalanced');
    }

    const ratio = G.drawn ? G.yes / G.drawn : 0;
    if (ratio < 0.35) return t('verdictSoft');
    if (ratio < 0.72) return t('verdictBalanced');
    return t('verdictHot');
  }

  function afterAccent() {
    const ritualAccents = {
      'velvet-fire': { rgb: '232,201,122', glow: 'rgba(232,201,122,0.18)' },
      'the-window': { rgb: '214,162,122', glow: 'rgba(214,162,122,0.17)' },
      'third-shadow': { rgb: '205,118,92', glow: 'rgba(205,118,92,0.18)' },
      'no-skips': { rgb: '232,201,122', glow: 'rgba(232,201,122,0.17)' },
      'red-room': { rgb: '220,42,56', glow: 'rgba(220,42,56,0.22)' },
      'confessional': { rgb: '226,128,96', glow: 'rgba(226,128,96,0.18)' },
      'classic-never': { rgb: '232,201,122', glow: 'rgba(232,201,122,0.16)' },
      'classic-td': { rgb: '232,171,102', glow: 'rgba(232,171,102,0.16)' }
    };
    const tierAccents = {
      all: { rgb: '232,201,122', glow: 'rgba(232,201,122,0.16)' },
      warm: { rgb: '232,201,122', glow: 'rgba(232,201,122,0.15)' },
      hot: { rgb: '215,90,96', glow: 'rgba(215,90,96,0.18)' },
      fire: { rgb: '255,103,38', glow: 'rgba(255,103,38,0.22)' }
    };
    return ritualAccents[G.ritual?.id] || tierAccents[G.cat] || tierAccents.all;
  }

  function setAfterAccentVariables() {
    const accent = afterAccent();
    document.body.style.setProperty('--mood-rgb', accent.rgb);
    document.body.style.setProperty('--mood-glow', accent.glow);
  }

  function afterTooltipPrompt({ ritualId = null } = {}) {
    return ritualId ? gmLabel('tooltipPlay') : gmLabel('tooltipExplore');
  }

  function afterTooltipUsesHover() {
    return window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
  }

  function afterTooltipUsesCoarsePointer() {
    return window.matchMedia?.('(pointer: coarse)').matches;
  }

  function eventUsesHover(event) {
    if (event?.pointerType) return event.pointerType === 'mouse' || event.pointerType === 'pen';
    return afterTooltipUsesHover() || !afterTooltipUsesCoarsePointer();
  }

  function unlockTooltipDescription(unlock) {
    const key = `${unlock.kind || 'ambient'}Info`;
    const desc = gmLabel(key);
    return desc === key ? gmLabel('ambientInfo') : desc;
  }

  function hideAfterItemTooltip({ force = false } = {}) {
    if (!els.afterTooltip || (afterTooltipSticky && !force)) return;
    afterTooltipTarget?.classList.remove('is-tip-open');
    afterTooltipTarget = null;
    afterTooltipSticky = false;
    els.afterTooltip.classList.remove('on', 'below');
    els.afterTooltip.setAttribute('aria-hidden', 'true');
    afterProgressTimers.push(setTimeout(() => {
      if (!els.afterTooltip.classList.contains('on')) els.afterTooltip.classList.add('hidden');
    }, 180));
  }

  function positionAfterItemTooltip(target) {
    if (!els.afterTooltip || !target) return;
    const rect = target.getBoundingClientRect();
    const pad = 10;
    const vw = window.visualViewport?.width || window.innerWidth || document.documentElement.clientWidth || 0;
    const vh = window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || 0;
    const tipRect = els.afterTooltip.getBoundingClientRect();
    const width = tipRect.width || 220;
    const height = tipRect.height || 92;
    let left = rect.left + rect.width * 0.5;
    let top = rect.top - height - 10;
    let below = false;

    if (top < pad) {
      top = rect.bottom + 10;
      below = true;
    }
    if (top + height > vh - pad) top = Math.max(pad, vh - height - pad);
    left = Math.min(vw - width * 0.5 - pad, Math.max(width * 0.5 + pad, left));

    els.afterTooltip.style.left = `${left}px`;
    els.afterTooltip.style.top = `${top}px`;
    els.afterTooltip.classList.toggle('below', below);
  }

  function showAfterItemTooltip(target, { sticky = false } = {}) {
    if (!els.afterTooltip || !target || target.classList.contains('is-opening') || target.classList.contains('is-locked')) return;
    const title = target.dataset.tipTitle || '';
    const body = target.dataset.tipBody || '';
    const action = target.dataset.tipAction || '';
    if (!title && !body) return;

    afterTooltipTarget?.classList.remove('is-tip-open');
    afterTooltipTarget = target;
    afterTooltipSticky = sticky;
    target.classList.add('is-tip-open');

    els.afterTooltip.querySelector('b').textContent = title;
    els.afterTooltip.querySelector('span').textContent = body;
    els.afterTooltip.querySelector('em').textContent = action;
    els.afterTooltip.classList.remove('hidden');
    positionAfterItemTooltip(target);
    requestAnimationFrame(() => {
      positionAfterItemTooltip(target);
      els.afterTooltip.classList.add('on');
      els.afterTooltip.setAttribute('aria-hidden', 'false');
    });
  }

  function bindAfterItemTooltips() {
    const cards = Array.from(els.afterGamification?.querySelectorAll('.after-collection-item.is-open[data-tip-title]') || []);
    cards.forEach(card => {
      card.addEventListener('pointerenter', e => {
        if (!eventUsesHover(e)) return;
        showAfterItemTooltip(card);
      });
      card.addEventListener('pointerleave', e => {
        if (!eventUsesHover(e)) return;
        hideAfterItemTooltip();
      });
      card.addEventListener('mouseenter', e => {
        if (!eventUsesHover(e)) return;
        showAfterItemTooltip(card);
      });
      card.addEventListener('mouseleave', e => {
        if (!eventUsesHover(e)) return;
        hideAfterItemTooltip();
      });
      card.addEventListener('focus', e => {
        if (!eventUsesHover(e)) return;
        showAfterItemTooltip(card);
      });
      card.addEventListener('blur', () => hideAfterItemTooltip({ force: true }));
    });
  }

  function renderAfterGamification() {
    if (!GM || !els.afterGamification || !G.lastAfterglow) {
      els.afterGamification?.classList.add('hidden');
      return;
    }
    hideAfterItemTooltip({ force: true });

    const glow = G.lastAfterglow;
    const data = GM.collection(G.lang);
    const progress = data.progress || {};
    const beforeEmbers = glow.embersBefore ?? progress.embers ?? 0;
    const totalEmbers = glow.embersTotal ?? progress.embers ?? 0;
    const currentEmber = data.ember || GM.emberProgress?.(progress) || { pct: 100, next: null };
    const previousEmber = GM.emberProgress?.({ ...progress, embers: beforeEmbers, unlocks: glow.unlocksBefore || progress.unlocks }) || currentEmber;
    const shouldAnimate = !!glow.animate;
    const newSealIds = new Set((glow.newSeals || []).map(item => item.id));
    const newPathIds = new Set((glow.newPaths || []).map(item => item.id));
    const newUnlockIds = new Set((glow.newUnlocks || []).map(item => item.id));
    const newModeIds = new Set((glow.newModeUnlocks || []).map(item => item.id));

    setAfterAccentVariables();
    els.afterGamification.classList.remove('hidden');
    els.afterKicker.textContent = gmLabel('embers');
    if (els.afterShare) els.afterShare.textContent = gmLabel('share');
    els.afterSealsTitle.textContent = gmLabel('seals');
    els.afterRitualsTitle.textContent = gmLabel('rituals');
    els.afterPathsTitle.textContent = gmLabel('paths');
    els.afterUnlocksTitle.textContent = gmLabel('unlocks');
    els.afterEmbersTotal.textContent = String(shouldAnimate ? beforeEmbers : totalEmbers);
    els.afterEmbersEarned.textContent = glow.embersEarned ? `+${glow.embersEarned}` : '+0';
    els.afterXpFill.style.width = `${shouldAnimate ? previousEmber.pct : currentEmber.pct}%`;

    const itemHtml = ({ id, icon, title, status, opened, isNew, animateUnlock = false, order, meta = '', ritualId = null, description = '' }) => {
      const classes = [
        'after-collection-item',
        opened ? 'is-open' : 'is-locked',
        isNew ? 'is-new' : '',
        shouldAnimate && isNew && animateUnlock ? 'is-opening' : ''
      ].filter(Boolean).join(' ');
      const tag = opened || ritualId ? 'button' : 'div';
      const tooltipAction = afterTooltipPrompt({ ritualId });
      const tooltip = opened ? ` data-tip-title="${escapeHtml(title)}" data-tip-body="${escapeHtml(description || status || meta)}" data-tip-action="${escapeHtml(tooltipAction)}"` : '';
      const ritualAttr = ritualId ? ` data-ritual="${escapeHtml(ritualId)}" aria-disabled="${opened ? 'false' : 'true'}"` : '';
      const labelParts = [title, description || status || meta];
      if (opened) labelParts.push(tooltipAction);
      const attrs = tag === 'button' ? ` type="button"${ritualAttr}${tooltip} aria-label="${escapeHtml(labelParts.filter(Boolean).join('. '))}"` : tooltip;
      return `
        <${tag} class="${classes}" style="--order:${order};" data-id="${escapeHtml(id)}" data-locked="${escapeHtml(gmLabel('locked'))}"${attrs}>
          <b>${escapeHtml(icon || '✦')}</b>
          <span>${escapeHtml(title)}</span>
          <em>${escapeHtml(status || meta)}</em>
        </${tag}>
      `;
    };

    const ritualIds = [
      ...(GM.ritualUnlockOrder?.(GAME.NEVER) || []),
      ...(GM.ritualUnlockOrder?.(GAME.TD) || [])
    ];
    const ritualCards = ritualIds.map(id => GM.getRitual(id)).filter(Boolean);
    els.afterRitualsSection.classList.toggle('hidden', !ritualCards.length);
    els.afterRitualUnlocks.innerHTML = ritualCards.map((ritual, index) => {
      const opened = GM.isRitualUnlocked?.(ritual, progress) !== false;
      return itemHtml({
        id: ritual.id,
        icon: ritual.icon || '✦',
        title: GM.ritualTitle(ritual, G.lang),
        status: opened ? gmLabel('modeUnlocked') : (GM.unlockRequirement?.(ritual, progress, G.lang) || gmLabel('locked')),
        opened,
        isNew: newModeIds.has(ritual.id),
        animateUnlock: true,
        order: index,
        ritualId: ritual.id,
        description: GM.ritualDesc(ritual, G.lang)
      });
    }).join('');

    els.afterSeals.innerHTML = data.seals.map((seal, index) => itemHtml({
      id: seal.id,
      icon: seal.icon || '✦',
      title: seal.title,
      status: seal.opened ? gmLabel('opened') : gmLabel('locked'),
      opened: seal.opened,
      isNew: newSealIds.has(seal.id),
      animateUnlock: true,
      order: index + ritualCards.length,
      description: gmLabel('sealInfo')
    })).join('');

    els.afterPaths.innerHTML = data.paths.map((path, index) => itemHtml({
      id: path.id,
      icon: path.opened ? '✦' : `${path.done}/${path.total}`,
      title: path.title,
      status: path.opened ? gmLabel('opened') : `${path.done}/${path.total}`,
      opened: path.opened,
      isNew: newPathIds.has(path.id),
      animateUnlock: true,
      order: index + data.seals.length + ritualCards.length,
      description: gmLabel('pathInfo')
    })).join('');

    els.afterUnlocks.innerHTML = data.unlocks.map((unlock, index) => itemHtml({
      id: unlock.id,
      icon: unlock.icon || '◌',
      title: unlock.title,
      status: unlock.opened ? unlock.kindLabel : `${unlock.threshold} ${gmLabel('embers')}`,
      opened: unlock.opened,
      isNew: newUnlockIds.has(unlock.id),
      animateUnlock: true,
      order: index + data.seals.length + data.paths.length + ritualCards.length,
      description: unlockTooltipDescription(unlock)
    })).join('');

    if (els.afterNext) {
      els.afterNext.textContent = '';
      els.afterNext.classList.add('hidden');
    }
    bindAfterItemTooltips();
  }

  function clearAfterProgressAnimation() {
    afterProgressTimers.forEach(id => clearTimeout(id));
    afterProgressTimers = [];
    $$('.after-ember-particle').forEach(el => el.remove());
    $$('.after-unlock-impact, .after-unlock-spark').forEach(el => el.remove());
    hideAfterItemTooltip({ force: true });
    stopAfterGlowClock();
  }

  function stopAfterGlowClock() {
    if (afterGlowFrame) {
      cancelAnimationFrame(afterGlowFrame);
      afterGlowFrame = null;
    }
  }

  function startAfterGlowClock() {
    if (afterGlowFrame || !els.afterGamification) return;
    const tick = now => {
      const phase = ((now || 0) % AFTER_GLOW_PERIOD_MS) / AFTER_GLOW_PERIOD_MS;
      const wave = 0.5 - Math.cos(phase * Math.PI * 2) * 0.5;
      const velvet = 0.5 - Math.cos(wave * Math.PI) * 0.5;
      els.afterGamification.style.setProperty('--after-glow-border', (0.55 + velvet * 0.25).toFixed(3));
      els.afterGamification.style.setProperty('--after-glow-layer', (0.3 + velvet * 0.25).toFixed(3));
      els.afterGamification.style.setProperty('--after-glow-shadow', (0.15 + velvet * 0.14).toFixed(3));
      els.afterGamification.style.setProperty('--after-glow-halo-shadow', (0.07 + velvet * 0.095).toFixed(3));
      els.afterGamification.style.setProperty('--after-glow-radius', `${(20 + velvet * 15).toFixed(1)}px`);
      els.afterGamification.style.setProperty('--after-glow-bright', (1.025 + velvet * 0.2).toFixed(3));
      afterGlowFrame = requestAnimationFrame(tick);
    };
    afterGlowFrame = requestAnimationFrame(tick);
  }

  function animateAfterProgress() {
    if (!GM || !G.lastAfterglow || !els.afterGamification || els.afterGamification.classList.contains('hidden')) return;
    clearAfterProgressAnimation();
    startAfterGlowClock();

    const glow = G.lastAfterglow;
    const progress = glow.progress || GM.collection(G.lang).progress || {};
    const totalEmbers = glow.embersTotal ?? progress.embers ?? 0;
    const currentEmber = GM.emberProgress?.({ ...progress, embers: totalEmbers });
    const previousEmber = GM.emberProgress?.({ ...progress, embers: glow.embersBefore || 0, unlocks: glow.unlocksBefore || progress.unlocks });
    const crossedEmberUnlock = !!(glow.newUnlocks?.length && previousEmber?.next);

    els.afterXp.classList.remove('is-filling');
    els.afterXpFill.style.removeProperty('transition');
    void els.afterXp.offsetWidth;
    els.afterXp.classList.add('is-filling');
    afterProgressTimers.push(setTimeout(() => {
      els.afterXpFill.style.width = `${crossedEmberUnlock ? 100 : (currentEmber?.pct ?? 100)}%`;
      animateAfterCount(els.afterEmbersTotal, totalEmbers, 2700, glow.embersBefore || 0);
    }, 980));
    if (crossedEmberUnlock) {
      afterProgressTimers.push(setTimeout(() => {
        els.afterXpFill.style.transition = 'none';
        els.afterXpFill.style.width = '0%';
        void els.afterXpFill.offsetWidth;
        els.afterXpFill.style.removeProperty('transition');
        els.afterXpFill.style.width = `${currentEmber?.pct ?? 100}%`;
      }, 4300));
    }
    afterProgressTimers.push(setTimeout(launchAfterEmberParticles, 3600));
    afterProgressTimers.push(setTimeout(() => {
      els.afterXp.classList.remove('is-filling');
    }, 9800));
  }

  function launchAfterEmberParticles() {
    const openingTargets = $$('.after-collection-item.is-opening');
    const targets = openingTargets.filter(isVisibleAfterParticleTarget);
    const skippedTargets = openingTargets.filter(target => !targets.includes(target));
    skippedTargets.forEach((target, index) => settleAfterUnlockTarget(target, 720 + index * 90));
    if (!targets.length || !els.afterXpBar || !els.after) return;
    markFxPhase('end-unlock', 7200);

    const origin = els.afterXpBar.getBoundingClientRect();
    const sx = origin.left + origin.width * 0.82;
    const sy = origin.top + origin.height * 0.5;
    const particleCount = 12;
    const particleFlightMs = 3180;
    const particleStaggerMs = 58;
    const targetGapMs = 540;
    const impactPointMs = Math.round(particleFlightMs * 0.9);

    targets.forEach((target, targetIndex) => {
      const rect = target.getBoundingClientRect();
      const tx = rect.left + rect.width * 0.5;
      const ty = rect.top + rect.height * 0.48;
      target.classList.add('is-receiving');

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('span');
        particle.className = 'after-ember-particle';
        const dx = tx - sx + rand(-18, 18);
        const dy = ty - sy + rand(-12, 12);
        const arc = -Math.abs(dx) * rand(0.14, 0.24) - rand(24, 58);
        const particleDelayMs = targetIndex * targetGapMs + i * particleStaggerMs;
        particle.style.left = `${sx + rand(-14, 14)}px`;
        particle.style.top = `${sy + rand(-5, 5)}px`;
        particle.style.setProperty('--dx', `${dx}px`);
        particle.style.setProperty('--dy', `${dy}px`);
        particle.style.setProperty('--mx', `${dx * rand(0.34, 0.52) + rand(-34, 34)}px`);
        particle.style.setProperty('--my', `${dy * rand(0.18, 0.36) + arc}px`);
        particle.style.setProperty('--delay', `${particleDelayMs}ms`);
        particle.style.setProperty('--flight', `${particleFlightMs}ms`);
        particle.style.setProperty('--size', `${rand(4.2, 9.4)}px`);
        particle.style.setProperty('--trail-r', `${rand(-22, 12)}deg`);
        particle.style.setProperty('--rot1', `${rand(-120, 120)}deg`);
        particle.style.setProperty('--rot2', `${rand(-220, 220)}deg`);
        particle.style.setProperty('--rot3', `${rand(-320, 320)}deg`);
        els.after.appendChild(particle);
        afterProgressTimers.push(setTimeout(() => particle.remove(), particleDelayMs + particleFlightMs + 720));
      }

      const lastParticleDelay = targetIndex * targetGapMs + (particleCount - 1) * particleStaggerMs;
      const contactDelay = lastParticleDelay + impactPointMs - 90;
      const settleDelay = contactDelay + 1460;

      afterProgressTimers.push(setTimeout(() => {
        spawnAfterUnlockImpact(target);
        target.classList.add('is-contact', 'is-unlocking');
      }, contactDelay));

      afterProgressTimers.push(setTimeout(() => {
        settleAfterUnlockTarget(target);
      }, settleDelay));
    });
  }

  function spawnAfterUnlockImpact(target) {
    if (!els.after || !target?.isConnected) return;
    const rect = target.getBoundingClientRect();
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.5;
    const ring = document.createElement('span');
    ring.className = 'after-unlock-impact';
    ring.style.left = `${cx}px`;
    ring.style.top = `${cy}px`;
    ring.style.setProperty('--impact-size', `${Math.max(rect.width, rect.height) * 0.9}px`);
    els.after.appendChild(ring);
    afterProgressTimers.push(setTimeout(() => ring.remove(), 1900));

    for (let i = 0; i < 7; i++) {
      const spark = document.createElement('span');
      spark.className = 'after-unlock-spark';
      const angle = -Math.PI / 2 + rand(-1.75, 1.75);
      const distance = rand(18, 46);
      spark.style.left = `${cx + rand(-5, 5)}px`;
      spark.style.top = `${cy + rand(-4, 4)}px`;
      spark.style.setProperty('--sx', `${Math.cos(angle) * distance}px`);
      spark.style.setProperty('--sy', `${Math.sin(angle) * distance}px`);
      spark.style.setProperty('--sx2', `${Math.cos(angle) * distance * 1.12}px`);
      spark.style.setProperty('--sy2', `${Math.sin(angle) * distance - 14}px`);
      spark.style.setProperty('--spark-delay', `${i * 38}ms`);
      spark.style.setProperty('--spark-size', `${rand(2.6, 5.8)}px`);
      els.after.appendChild(spark);
      afterProgressTimers.push(setTimeout(() => spark.remove(), 1700 + i * 38));
    }
  }

  function isVisibleAfterParticleTarget(target) {
    if (!target || !target.isConnected || !els.after) return false;
    const rect = target.getBoundingClientRect();
    if (rect.width < 6 || rect.height < 6) return false;

    const afterCard = els.after.querySelector('.after-card');
    const viewportHeight = window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || 0;
    let visibleTop = 0;
    let visibleBottom = viewportHeight;

    if (afterCard) {
      const cardRect = afterCard.getBoundingClientRect();
      visibleTop = Math.max(visibleTop, cardRect.top);
      visibleBottom = Math.min(visibleBottom, cardRect.bottom);
    }

    if (els.sponsorAfter) {
      const sponsorRect = els.sponsorAfter.getBoundingClientRect();
      if (sponsorRect.width > 0 && sponsorRect.height > 0 && sponsorRect.top > visibleTop && sponsorRect.top < visibleBottom) {
        visibleBottom = Math.min(visibleBottom, sponsorRect.top - 10);
      }
    }

    return rect.top >= visibleTop - 4 && rect.bottom <= visibleBottom + 4;
  }

  function settleAfterUnlockTarget(target, delay = 0) {
    const apply = () => {
      target.classList.add('is-open', 'is-unlocked', 'is-fresh-unlock', 'is-arrived');
      target.classList.remove('is-locked', 'is-opening', 'is-receiving', 'is-contact', 'is-unlocking');
      if (target.matches('button')) {
        target.disabled = false;
        target.setAttribute('aria-disabled', 'false');
      }
      afterProgressTimers.push(setTimeout(() => target.classList.remove('is-fresh-unlock'), 3600));
    };
    if (delay > 0) {
      afterProgressTimers.push(setTimeout(apply, delay));
    } else {
      apply();
    }
  }

  function clearAfterStatAnimation() {
    afterStatTimers.forEach(id => clearTimeout(id));
    afterStatFrames.forEach(id => cancelAnimationFrame(id));
    afterStatTimers = [];
    afterStatFrames = [];
  }

  function animateAfterCount(el, target, duration = 860, from = 0) {
    if (!el) return;
    const final = Math.max(0, Number(target) || 0);
    const initial = Math.max(0, Number(from) || 0);
    const start = performance.now();
    const tickFrame = now => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(initial + (final - initial) * eased));
      if (p < 1) {
        const id = requestAnimationFrame(tickFrame);
        afterStatFrames.push(id);
      } else {
        el.textContent = String(final);
      }
    };
    const id = requestAnimationFrame(tickFrame);
    afterStatFrames.push(id);
  }

  function animateAfterStats(targets) {
    clearAfterStatAnimation();
    targets.forEach(({ id, value, pct }, index) => {
      const valueEl = $(id);
      const stat = valueEl?.closest('.after-stat');
      if (!valueEl || !stat || stat.classList.contains('hidden')) return;
      valueEl.textContent = '0';
      stat.classList.remove('is-ready');
      stat.style.setProperty('--bar-width', '0%');
      stat.style.setProperty('--bar-target', `${Math.max(0, Math.min(100, pct || 0))}%`);
      const timer = setTimeout(() => {
        stat.classList.add('is-ready');
        stat.style.setProperty('--bar-width', stat.style.getPropertyValue('--bar-target'));
        animateAfterCount(valueEl, value, 1460 + index * 180);
      }, 460 + index * 280);
      afterStatTimers.push(timer);
    });
  }

  function setAfterStatsStatic(targets) {
    clearAfterStatAnimation();
    targets.forEach(({ id, value, pct }) => {
      const valueEl = $(id);
      const stat = valueEl?.closest('.after-stat');
      if (!valueEl || !stat || stat.classList.contains('hidden')) return;
      valueEl.textContent = String(value);
      stat.classList.add('is-ready');
      stat.style.setProperty('--bar-width', `${Math.max(0, Math.min(100, pct || 0))}%`);
    });
  }

  function ratioPct(value, total) {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  }

  function drawShareCard(canvas, payload) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width = 1080;
    const h = canvas.height = 1350;
    const gradient = ctx.createRadialGradient(w * 0.5, h * 0.34, 80, w * 0.5, h * 0.5, h * 0.75);
    gradient.addColorStop(0, '#341020');
    gradient.addColorStop(0.48, '#130710');
    gradient.addColorStop(1, '#07050a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#c9a84c';
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.28, 280, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e8c97a';
    ctx.font = '700 104px Playfair Display, Georgia, serif';
    ctx.fillText('Ignight', w / 2, 220);
    ctx.font = '24px Cormorant Garamond, Georgia, serif';
    ctx.letterSpacing = '5px';
    ctx.fillStyle = 'rgba(245,237,224,0.58)';
    ctx.fillText(gmLabel('afterglow').toUpperCase(), w / 2, 280);
    ctx.letterSpacing = '0px';
    ctx.font = '58px Playfair Display, Georgia, serif';
    ctx.fillStyle = '#f5ede0';
    ctx.fillText(activeRitualTitle(), w / 2, 440);
    ctx.font = '42px Cormorant Garamond, Georgia, serif';
    ctx.fillStyle = 'rgba(245,237,224,0.78)';
    const line = `${G.drawn} cards · ${G.game === GAME.TD ? `${G.truthDone} Truth / ${G.dareDone} Dare` : `${G.yes} YES / ${G.never} NEVER`}`;
    ctx.fillText(line, w / 2, 520);
    wrapCanvasText(ctx, payload.text.replace(activeRitualTitle() + '. ', ''), w / 2, 690, 760, 50);
    ctx.font = '24px Cormorant Garamond, Georgia, serif';
    ctx.fillStyle = 'rgba(201,168,76,0.7)';
    ctx.fillText('ignight.me', w / 2, h - 120);
  }

  function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
    ctx.font = '46px Cormorant Garamond, Georgia, serif';
    ctx.fillStyle = 'rgba(245,237,224,0.82)';
    const words = text.split(/\s+/);
    let line = '';
    let yy = y;
    words.forEach(word => {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, yy);
        line = word;
        yy += lineHeight;
      } else {
        line = test;
      }
    });
    if (line) ctx.fillText(line, x, yy);
  }

  function renderAfter({ animate = false } = {}) {
    $('after-deck').textContent = `${activeRitualTitle()} · ${tierLabel(G.cat)}`;
    const afterTargets = [];

    if (G.game === GAME.TD) {
      els.afterGrid.classList.remove('four');
      els.afterExtra.classList.add('hidden');
      $('a-total').textContent = G.drawn;
      $('a-yes').textContent = G.truthDone;
      $('a-never').textContent = G.dareDone;
      $('a-total-lbl').textContent = t('afterPlayed');
      $('a-yes-lbl').textContent = t('statTruths');
      $('a-never-lbl').textContent = t('statDares');
      afterTargets.push(
        { id: 'a-total', value: G.drawn, pct: ratioPct(G.drawn, G.total || G.drawn) },
        { id: 'a-yes', value: G.truthDone, pct: ratioPct(G.truthDone, Math.max(G.drawn, 1)) },
        { id: 'a-never', value: G.dareDone, pct: ratioPct(G.dareDone, Math.max(G.drawn, 1)) }
      );
    } else {
      els.afterGrid.classList.remove('four');
      els.afterExtra.classList.add('hidden');
      $('a-total').textContent = G.drawn;
      $('a-yes').textContent = G.yes;
      $('a-never').textContent = G.never;
      $('a-total-lbl').textContent = t('afterAnswered');
      $('a-yes-lbl').textContent = t('answerYes');
      $('a-never-lbl').textContent = t('answerNever');
      afterTargets.push(
        { id: 'a-total', value: G.drawn, pct: ratioPct(G.drawn, G.total || G.drawn) },
        { id: 'a-yes', value: G.yes, pct: ratioPct(G.yes, Math.max(G.drawn, 1)) },
        { id: 'a-never', value: G.never, pct: ratioPct(G.never, Math.max(G.drawn, 1)) }
      );
    }

    if (G.lastAfterglow) G.lastAfterglow.animate = animate;
    renderAfterGamification();
    if (animate) {
      animateAfterStats(afterTargets);
      animateAfterProgress();
    } else {
      setAfterStatsStatic(afterTargets);
    }
  }

  function renderCollection() {
    if (!GM || !els.collectionModal) return;
    const data = GM.collection(G.lang);
    els.collectionTitle.textContent = gmLabel('collectionTitle');
    els.collectionEmbers.textContent = `${data.progress.embers} ${gmLabel('embers')}`;
    els.collectionSealsTitle.textContent = gmLabel('seals');
    els.collectionPathsTitle.textContent = gmLabel('paths');
    els.collectionUnlocksTitle.textContent = gmLabel('unlocks');

    els.collectionSeals.innerHTML = data.seals.map(seal => `
      <div class="collection-item${seal.opened ? ' is-open' : ''}">
        <b>${escapeHtml(seal.icon || '✦')}</b>
        <span>${escapeHtml(seal.title)}</span>
        <em>${seal.opened ? escapeHtml(gmLabel('afterglow')) : escapeHtml(gmLabel('locked'))}</em>
      </div>
    `).join('');

    els.collectionPaths.innerHTML = data.paths.map(path => `
      <div class="collection-item${path.done >= path.total && path.total ? ' is-open' : ''}">
        <b>${escapeHtml(`${path.done}/${path.total}`)}</b>
        <span>${escapeHtml(path.title)}</span>
        <em>${escapeHtml(gmLabel('paths'))}</em>
      </div>
    `).join('');

    els.collectionUnlocks.innerHTML = data.unlocks.map(unlock => `
      <div class="collection-item${unlock.opened ? ' is-open' : ''}">
        <b>✧</b>
        <span>${escapeHtml(unlock.title)}</span>
        <em>${unlock.opened ? escapeHtml(gmLabel('afterglow')) : `${unlock.threshold} ${escapeHtml(gmLabel('embers'))}`}</em>
      </div>
    `).join('');
  }

  function openCollection() {
    if (!GM || !els.collectionModal) return;
    renderCollection();
    els.collectionModal.classList.remove('hidden');
    track('collection_open');
  }

  function closeCollection() {
    els.collectionModal?.classList.add('hidden');
  }

  async function shareAfterglow() {
    if (!GM || !G.lastAfterglow) return;
    const payload = GM.sharePayload(G.lastAfterglow, currentStats(), G.lang);
    const canvas = document.createElement('canvas');
    drawShareCard(canvas, payload);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.92));
    const file = blob ? new File([blob], payload.filename, { type: 'image/png' }) : null;

    try {
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: payload.title, text: payload.text, files: [file] });
      } else if (navigator.share) {
        await navigator.share({ title: payload.title, text: payload.text });
      } else {
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = payload.filename;
        a.click();
        toast(gmLabel('shareFallback'));
      }
      track('share_created', { ritualId: G.ritual?.id || null });
    } catch (e) {
      toast(gmLabel('shareFallback'));
    }
  }

  function showAfter() {
    G.completed = true;
    if (multiplayerActive()) {
      document.body.classList.add('mp-results');
      setMpConnectionState('completed', { toast: false });
      queueMpStateBroadcast('completed', 120);
    }
    hideActions();
    G.lastAfterglow = GM?.finishSession(G.session, currentStats(), G.lang) || null;
    syncModeCards();
    clearAfterProgressAnimation();
    els.after.classList.add('after-entering');
    els.after.classList.remove('hidden');
    const afterCard = els.after.querySelector('.after-card');
    if (afterCard) afterCard.scrollTop = 0;
    renderAfter({ animate: true });
    setTimeout(() => {
      els.after.classList.remove('after-entering');
    }, 1800);
    track('deck_completed', {
      total: G.drawn,
      yes: G.yes,
      never: G.never,
      truths: G.truthDone,
      dares: G.dareDone,
      skips: G.skips,
      ritualId: G.ritual?.id || null,
      embersEarned: G.lastAfterglow?.embersEarned || 0
    });
    if (G.ritual && !G.ritual.classic) {
      track('ritual_completed', { ritualId: G.ritual.id, pathId: G.ritual.path || null });
    }
    G.lastAfterglow?.newSeals?.forEach(seal => track('seal_unlocked', { sealId: seal.id }));
    G.lastAfterglow?.newUnlocks?.forEach(unlock => track('unlock_earned', { unlockId: unlock.id }));
    G.lastAfterglow?.newModeUnlocks?.forEach(ritual => track('ritual_unlocked', { ritualId: ritual.id }));
    renderSponsors();
    trackSponsorImpression('after');
    window.SFX.chime();
  }

  function devEnterApp() {
    writeAgeGate();
    document.body.classList.add('age-ok');
    els.ageGate?.classList.add('hidden');
    els.splash?.classList.remove('splash-intro', 'splash-anticipating', 'leaving');
    if (els.splash) els.splash.style.display = 'none';
    els.modeSelect.classList.add('hidden');
    els.modeSelect.classList.remove('on', 'reselect', 'from-splash', 'ritual-picking');
    hideRitualSelector();
    els.after.classList.add('hidden');
    els.app.classList.add('on');
    clearSwipeTutorialTimers();
    cancelSwipeNudge();
    G.neverTutorialArmed = false;
    G.truthDareTutorialArmed = false;
    G.truthDareIntroReady = true;
    G.busy = false;
    G.formingDeck = false;
    G.tutorialing = false;
  }

  function devRecordResultCards(game, count, tier) {
    const session = GM?.startSession({ game, tier, ritual: G.ritual }) || null;
    if (!session || !G.locale) return session;
    if (game === GAME.TD) {
      const truths = cardsFor(tier, 'truthCards').slice(0, Math.ceil(count / 2));
      const dares = cardsFor(tier, 'dareCards').slice(0, Math.floor(count / 2));
      G.truthDone = truths.length;
      G.dareDone = dares.length;
      G.skips = 0;
      truths.forEach(card => {
        GM.recordDraw(session, card, 'truthCards');
        GM.recordOutcome(session, card, 'truth:done');
      });
      dares.forEach(card => {
        GM.recordDraw(session, card, 'dareCards');
        GM.recordOutcome(session, card, 'dare:done');
      });
      G.drawn = truths.length + dares.length;
      return session;
    }

    const cards = cardsFor(tier, 'neverCards').slice(0, count);
    G.yes = Math.ceil(cards.length * 0.7);
    G.never = cards.length - G.yes;
    cards.forEach((card, index) => {
      const outcome = index < G.yes ? 'yes' : 'never';
      GM.recordDraw(session, card, 'neverCards');
      GM.recordOutcome(session, card, outcome);
    });
    G.drawn = cards.length;
    return session;
  }

  function devShowAfter(game = GAME.NEVER, { reset = false, tier = 'all', ritualId = null } = {}) {
    if (reset) GM?.resetProgress?.();
    devEnterApp();
    G.game = game === GAME.TD ? GAME.TD : GAME.NEVER;
    G.pendingGame = G.game;
    G.ritual = GM?.getRitual(ritualId) || GM?.getRitual(G.game === GAME.TD ? 'classic-td' : 'classic-never') || null;
    G.cat = G.ritual?.tier || tier;
    G.total = G.game === GAME.TD
      ? ((G.ritual?.count?.truthCards || 0) + (G.ritual?.count?.dareCards || 0) || GM?.quickNormalCount?.() || 12)
      : (G.ritual?.count?.neverCards || GM?.quickNormalCount?.() || 12);
    G.deck = [];
    G.truthDeck = [];
    G.dareDeck = [];
    G.cur = null;
    G.curKind = null;
    G.flipped = false;
    G.completed = false;
    G.yes = 0;
    G.never = 0;
    G.truthDone = 0;
    G.dareDone = 0;
    G.skips = 0;
    G.session = devRecordResultCards(G.game, G.total, tier);
    setAtm(tier === 'all' ? 'warm' : tier);
    renderGameChrome();
    updateUI();
    hideActions({ immediate: true });
    showAfter();
  }

  function devOpenMode() {
    devEnterApp();
    renderGameChrome();
    updateUI();
    openModeSelect('switch');
  }

  function devOpenRituals(game = G.game) {
    devEnterApp();
    openModeSelect('initial');
    showRitualSelector(game === GAME.TD ? GAME.TD : GAME.NEVER);
  }

  function devEmptyDareState() {
    devEnterApp();
    G.game = GAME.TD;
    G.pendingGame = GAME.TD;
    G.ritual = GM?.getRitual('classic-td') || null;
    resetDeck('all', { formation: 'tier', ritual: G.ritual });
    G.dareDeck = [];
    updateTruthDareButtons();
    showCurrentActions();
    toast('Debug: dare deck empty');
  }

  function devTriggerFormation(variant = 'sidecut') {
    devEnterApp();
    renderGameChrome();
    updateUI();
    playDeckFormation({ variant });
  }

  function initDevMode() {
    if (!DEV_MODE) return;
    document.documentElement.classList.add('dev-mode');
    const panel = document.createElement('div');
    panel.className = 'dev-panel';
    panel.innerHTML = `
      <details open>
        <summary>DEV</summary>
        <div class="dev-group">
          <b>Go</b>
          <button type="button" data-dev="mode">Mode</button>
          <button type="button" data-dev="rituals-never">Never Rituals</button>
          <button type="button" data-dev="rituals-td">TD Rituals</button>
        </div>
        <div class="dev-group">
          <b>End</b>
          <button type="button" data-dev="never-after">Never</button>
          <button type="button" data-dev="never-fire-after">Never Fire</button>
          <button type="button" data-dev="td-after">T/D</button>
          <button type="button" data-dev="td-fire-after">T/D Fire</button>
          <button type="button" data-dev="velvet-after">Velvet</button>
          <button type="button" data-dev="red-after">Red</button>
        </div>
        <div class="dev-group">
          <b>FX</b>
          <button type="button" data-dev="quality-ultra-high">UHigh</button>
          <button type="button" data-dev="quality-high">High</button>
          <button type="button" data-dev="quality-medium">Med</button>
          <button type="button" data-dev="quality-rec">Rec</button>
          <button type="button" data-dev="quality-low">Low</button>
          <button type="button" data-dev="quality-ultra-low">ULow</button>
          <button type="button" data-dev="quality-auto">Auto</button>
          <button type="button" data-dev="perf-probe">Probe</button>
          <button type="button" data-dev="perf-copy">Copy FX</button>
          <button type="button" data-dev="rift-yes">Rift YES</button>
          <button type="button" data-dev="rift-dare">Rift DARE</button>
          <button type="button" data-dev="rain-devil">😈 Rain</button>
          <button type="button" data-dev="rain-angel">👼 Rain</button>
        </div>
        <div class="dev-group dev-fx-readout">
          <b>Perf</b>
          <span data-dev-fx-report>FX warming up...</span>
        </div>
        <div class="dev-group">
          <b>Anim</b>
          <button type="button" data-dev="form-sidecut">Side</button>
          <button type="button" data-dev="form-crown">Crown</button>
          <button type="button" data-dev="form-orbit">Orbit</button>
          <button type="button" data-dev="empty-dare">No Dares</button>
          <button type="button" data-dev="reset">Reset</button>
        </div>
      </details>
    `;
    panel.addEventListener('click', e => {
      const btn = e.target.closest('button[data-dev]');
      if (!btn) return;
      const action = btn.dataset.dev;
      if (action === 'mode') devOpenMode();
      if (action === 'rituals-never') devOpenRituals(GAME.NEVER);
      if (action === 'rituals-td') devOpenRituals(GAME.TD);
      if (action === 'never-after') devShowAfter(GAME.NEVER, { reset: true });
      if (action === 'never-fire-after') devShowAfter(GAME.NEVER, { reset: true, tier: 'fire' });
      if (action === 'td-after') devShowAfter(GAME.TD, { reset: true });
      if (action === 'td-fire-after') devShowAfter(GAME.TD, { reset: true, tier: 'fire' });
      if (action === 'velvet-after') devShowAfter(GAME.NEVER, { reset: true, ritualId: 'velvet-fire' });
      if (action === 'red-after') devShowAfter(GAME.TD, { reset: true, ritualId: 'red-room' });
      if (action === 'quality-ultra-high') { setEffectQuality('ultra-high', { manual: true, reason: 'debug' }); toast('Debug effects: ultra high'); }
      if (action === 'quality-high') { setEffectQuality('high', { manual: true, reason: 'debug' }); toast('Debug effects: high'); }
      if (action === 'quality-medium') { setEffectQuality('medium', { manual: true, reason: 'debug' }); toast('Debug effects: medium'); }
      if (action === 'quality-rec') { setEffectQuality('recommended', { manual: true, reason: 'debug' }); toast('Debug effects: recommended'); }
      if (action === 'quality-low') { setEffectQuality('low', { manual: true, reason: 'debug' }); toast('Debug effects: low'); }
      if (action === 'quality-ultra-low') { setEffectQuality('ultra-low', { manual: true, reason: 'debug' }); toast('Debug effects: ultra low'); }
      if (action === 'quality-auto') {
        FX_PERF.manualLock = false;
        setEffectQuality(detectEffectQuality(), { reason: FX_PERF.reason || 'debug-auto' });
        startFxCapabilityProbe({ force: true });
        toast('Debug effects: auto');
      }
      if (action === 'perf-probe') startFxCapabilityProbe({ force: true });
      if (action === 'perf-copy') copyFxReport();
      if (action === 'rift-yes') triggerRift('yes');
      if (action === 'rift-dare') triggerRift('dare');
      if (action === 'rain-devil') emojiRain('😈', 'dare');
      if (action === 'rain-angel') emojiRain('👼', 'truth');
      if (action === 'form-sidecut') devTriggerFormation('sidecut');
      if (action === 'form-crown') devTriggerFormation('crown');
      if (action === 'form-orbit') devTriggerFormation('orbit');
      if (action === 'empty-dare') devEmptyDareState();
      if (action === 'reset') {
        GM?.resetProgress?.();
        toast('Debug progress reset');
      }
    });
    FX_PERF.debugEl = panel;
    FX_PERF.debugTextEl = panel.querySelector('[data-dev-fx-report]');
    updateFxDebugPanel();
    document.body.appendChild(panel);
    window.IgnightDev = {
      mode: devOpenMode,
      ritualsNever: () => devOpenRituals(GAME.NEVER),
      ritualsTd: () => devOpenRituals(GAME.TD),
      neverEnd: (opts = {}) => devShowAfter(GAME.NEVER, opts),
      tdEnd: (opts = {}) => devShowAfter(GAME.TD, opts),
      emptyDare: devEmptyDareState,
      rift: triggerRift,
      rain: emojiRain,
      formation: devTriggerFormation,
      effects: setEffectQuality,
      perf: fxReport,
      probeEffects: () => startFxCapabilityProbe({ force: true }),
      mpSnapshot: () => buildMpSnapshot('debug', { advance: false }),
      mpApplySnapshot: snapshot => applyMpSnapshot(snapshot, { force: true }),
      mpApplySnapshotStrict: snapshot => applyMpSnapshot(snapshot),
      mpConnection: state => setMpConnectionState(state, { toast: false }),
      mpRequestState: requestMpState,
      reset: () => GM?.resetProgress?.()
    };
  }

  function movePill(btn) {
    const pr = els.tabsEl.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    els.pill.style.left = (br.left - pr.left) + 'px';
    els.pill.style.width = br.width + 'px';
  }

  function renderTierChrome() {
    const ritualActive = isActiveRitual();
    els.tabsEl.classList.toggle('is-ritual', ritualActive);
    els.ritualActiveTab?.classList.toggle('hidden', !ritualActive);

    if (ritualActive && els.ritualActiveTitle) {
      const title = activeRitualTitle();
      els.ritualActiveTitle.textContent = title;
      els.ritualActiveTab?.setAttribute('aria-label', `${title}. Leave ritual`);
      return;
    }

    const active = els.tabsEl.querySelector('.tab.active');
    if (active) movePill(active);
  }

  function setActiveTab(cat) {
    const tabBtns = els.tabsEl.querySelectorAll('.tab');
    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
    const active = els.tabsEl.querySelector('.tab.active');
    if (active && !isActiveRitual()) movePill(active);
  }

  function pulseLocaleSwap() {
    const sp = $('splash');
    const splashUp = sp && sp.style.display !== 'none' && !sp.classList.contains('leaving');
    if (splashUp) {
      // I use a filter transition here so the splash entrance never restarts.
      document.body.classList.add('splash-lang-swap');
      clearTimeout(localeSwapTimer);
      localeSwapTimer = setTimeout(() => {
        document.body.classList.remove('splash-lang-swap');
        clearIOSBlurState();
      }, 220);
    } else {
      document.body.classList.remove('locale-swap');
      void document.body.offsetWidth;
      document.body.classList.add('locale-swap');
      clearTimeout(localeSwapTimer);
      localeSwapTimer = setTimeout(() => {
        document.body.classList.remove('locale-swap');
        clearIOSBlurState();
      }, 260);
    }
  }

  function applyLocale(lang, reset = false) {
    if (!LOCALES[lang]) lang = 'en';
    G.lang = lang;
    G.locale = LOCALES[lang];
    document.documentElement.lang = lang;
    if (!reset) translateLiveCards();

    $$('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (G.locale.ui[key]) el.textContent = G.locale.ui[key];
    });

    $$('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    els.tabsEl.querySelector('[data-cat="all"]').textContent = tierLabel('all');
    els.tabsEl.querySelector('[data-cat="warm"]').textContent = tierLabel('warm');
    els.tabsEl.querySelector('[data-cat="hot"]').textContent = tierLabel('hot');
    els.tabsEl.querySelector('[data-cat="fire"]').textContent = tierLabel('fire');
    renderGameChrome();
    renderSponsors();
    setActiveTab(G.cat);
    if (reset) {
      resetDeck(G.cat);
    } else {
      updateUI();
      if (!multiplayerActive()) showCurrentActions();
      if (els.modeSelect.classList.contains('ritual-picking')) renderRitualSelector(G.pendingGame);
      if (!els.after.classList.contains('hidden')) renderAfter();
      if (!els.legalModal.classList.contains('hidden')) openLegal(G.legalKind);
      if (!els.confirmModal?.classList.contains('hidden')) {
        els.confirmCancel.textContent = t('confirmStay');
      }
      if (els.collectionModal && !els.collectionModal.classList.contains('hidden')) renderCollection();
      if (multiplayerActive()) {
        setMpStatus();
      } else {
        syncMultiplayerLabels();
      }
      pulseLocaleSwap();
    }
  }

  function addBtn(id, fn) {
    const b = $(id);
    b.addEventListener('pointerdown', e => {
      if (G.game === GAME.NEVER && G.drawn === 1 && G.flipped) G.neverTutorialArmed = false;
      cancelSwipeTutorial();
      cancelSwipeNudge();
      if (b.disabled) return;
      ripple(b, e);
      window.SFX.click();
      vibe(5);
    });
    b.addEventListener('click', fn);
  }

  function bindSwipe() {
    els.card.addEventListener('pointerdown', e => {
      if (truthDareIntroBlocking()) {
        drag.moved = false;
        return;
      }
      if (G.game === GAME.NEVER && G.drawn === 1 && G.flipped) G.neverTutorialArmed = false;
      cancelSwipeTutorial();
      cancelSwipeNudge();
      drag.moved = false;
      drag.dx = 0;
      drag.mode = swipeMode();
      if (!drag.mode) return;
      setSwipeOverlayContent();
      drag.on = true;
      drag.x0 = e.clientX;
      drag.y0 = e.clientY;
      drag.pid = e.pointerId;
      els.card.setPointerCapture(e.pointerId);
      els.card.style.transition = 'none';
      e.stopPropagation();
    });

    els.card.addEventListener('pointermove', e => {
      if (!drag.on || e.pointerId !== drag.pid) return;
      const dx = e.clientX - drag.x0;
      const dy = e.clientY - drag.y0;
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      drag.moved = true;
      drag.dx = dx;
      const rot = dx * 0.04;
      const lift = Math.min(Math.abs(dx) * 0.032, 10);
      els.card.style.transform = `translateX(${dx}px) translateY(${-lift}px) rotate(${rot}deg)`;

      const dirs = els.card.querySelectorAll('.dir-left, .dir-right');
      const ratio = swipeOverlayOpacity(dx);
      if (drag.mode === 'never-reveal') {
        dirs[0].style.opacity = '0';
        dirs[1].style.opacity = '0';
        return;
      }
      if (drag.mode === 'truth-dare-choice') {
        const faceOpacity = Math.max(0, 1 - (ratio / 0.24));
        setChoiceFaceFade(faceOpacity.toFixed(3));
      }
      if (dx > 18) {
        dirs[0].style.opacity = '0';
        dirs[1].style.opacity = ratio;
      } else if (dx < -18) {
        dirs[0].style.opacity = ratio;
        dirs[1].style.opacity = '0';
      } else {
        dirs[0].style.opacity = '0';
        dirs[1].style.opacity = '0';
      }
    });

    els.card.addEventListener('pointerup', e => {
      if (!drag.on || e.pointerId !== drag.pid) return;
      drag.on = false;
      const dirs = els.card.querySelectorAll('.dir-left, .dir-right');
      dirs.forEach(d => d.style.opacity = '0');
      if (drag.moved && Math.abs(drag.dx) > THRESH) {
        if (drag.mode === 'truth-dare-choice') {
          chooseTruthDareBySwipe(drag.dx > 0 ? 'dare' : 'truth', 'swipe');
        } else if (drag.mode === 'truth-dare-result') {
          completeTruthDare(drag.dx > 0 ? 'done' : 'skip', 'swipe');
        } else if (drag.mode === 'never-reveal') {
          revealBySwipe();
        } else {
          answer(drag.dx > 0 ? 'yes' : 'never', 'swipe');
        }
      } else {
        els.card.style.transition = 'transform 0.22s cubic-bezier(0.34,1.4,0.64,1)';
        els.card.style.transform = '';
        setChoiceFaceFade(1);
        drag.mode = null;
      }
    });

    els.card.addEventListener('pointercancel', () => {
      if (!drag.on) return;
      drag.on = false;
      drag.mode = null;
      const dirs = els.card.querySelectorAll('.dir-left, .dir-right');
      dirs.forEach(d => d.style.opacity = '0');
      setChoiceFaceFade(1);
      els.card.style.transition = '';
      els.card.style.transform = '';
    });

    els.card.addEventListener('click', () => {
      if (drag.moved) return;
      const mode = swipeMode();
      if (mode === 'never-reveal') {
        revealCard();
        return;
      }
      if (mode === 'truth-dare-choice' && truthDareIntroBlocking()) return;
      if (mode) {
        nudgeSwipeAction(mode);
        return;
      }
      if (G.game === GAME.NEVER && !G.flipped && !G.busy && G.cur) revealCard();
    });
  }

  function bindSwipeActivatedCards() {
    if (!els.modeSelect) return;
    const state = { card: null, x0: 0, y0: 0, dx: 0, active: false, canceled: false, pid: null };
    let suppressNativeClick = null;

    els.modeSelect.addEventListener('click', e => {
      if (!suppressNativeClick) return;
      const card = e.target.closest('.mode-card, .ritual-card');
      if (card === suppressNativeClick) {
        e.preventDefault();
        e.stopImmediatePropagation();
        suppressNativeClick = null;
      }
    }, true);

    els.modeSelect.addEventListener('pointerdown', e => {
      const card = e.target.closest('.mode-card, .ritual-card');
      if (!card || card.disabled || card.classList.contains('is-locked')) return;
      state.card = card;
      state.x0 = e.clientX;
      state.y0 = e.clientY;
      state.dx = 0;
      state.active = false;
      state.canceled = false;
      state.pid = e.pointerId;
    });

    els.modeSelect.addEventListener('pointermove', e => {
      if (!state.card || e.pointerId !== state.pid || state.canceled) return;
      const dx = e.clientX - state.x0;
      const dy = e.clientY - state.y0;
      if (!state.active) {
        if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx) * 1.12) {
          state.canceled = true;
          state.card = null;
          return;
        }
        if (Math.abs(dx) < 14 || Math.abs(dx) < Math.abs(dy) * 1.18) return;
        state.active = true;
        state.card.classList.add('swipe-arming');
        state.card.setPointerCapture?.(e.pointerId);
      }
      e.preventDefault();
      state.dx = dx;
      const damped = dx * 0.5;
      state.card.style.transition = 'none';
      state.card.style.transform = `translateX(${damped}px) rotate(${damped * 0.018}deg)`;
      state.card.classList.toggle('swipe-ready', Math.abs(dx) > 86);
    });

    function resetCardSwipe() {
      if (!state.card) return;
      state.card.classList.remove('swipe-arming', 'swipe-ready', 'swipe-commit');
      state.card.style.transition = '';
      state.card.style.transform = '';
      state.card.style.opacity = '';
      state.card = null;
      state.active = false;
      state.canceled = false;
      state.pid = null;
      state.dx = 0;
    }

    els.modeSelect.addEventListener('pointerup', e => {
      if (!state.card || e.pointerId !== state.pid) return;
      if (!state.active) {
        resetCardSwipe();
        return;
      }
      e.preventDefault();
      const card = state.card;
      const commit = Math.abs(state.dx) > 86;
      if (!commit) {
        suppressNativeClick = card;
        card.style.transition = 'transform 0.24s cubic-bezier(0.34,1.4,0.64,1), opacity 0.18s ease';
        card.style.transform = '';
        setTimeout(() => {
          suppressNativeClick = null;
          resetCardSwipe();
        }, 240);
        return;
      }
      suppressNativeClick = card;
      card.classList.add('swipe-commit');
      card.style.transition = 'transform 0.22s cubic-bezier(0.16,1,0.3,1), opacity 0.18s ease';
      card.style.transform = `translateX(${state.dx > 0 ? 120 : -120}px) rotate(${state.dx > 0 ? 7 : -7}deg)`;
      card.style.opacity = '0.18';
      window.SFX.click?.();
      vibe([4, 10]);
      setTimeout(() => {
        suppressNativeClick = null;
        resetCardSwipe();
        card.click();
      }, 180);
    });

    els.modeSelect.addEventListener('pointercancel', resetCardSwipe);
  }

  function renderRitualSelector(game = G.pendingGame) {
    if (!GM || !els.ritualGrid) return;
    const rituals = GM.getRitualsForMode(game);
    const progress = GM.readProgress();
    els.ritualBack.setAttribute('aria-label', gmLabel('back'));
    els.ritualBack.title = gmLabel('back');
    els.ritualKicker.textContent = gmLabel('tonight');
    els.ritualTitle.textContent = gmLabel('chooseRitual');
    els.ritualSub.textContent = gmLabel('ritualSub');
    els.ritualGrid.innerHTML = rituals.map(ritual => {
      const done = progress.rituals?.[ritual.id]?.completed;
      const unlocked = GM.isRitualUnlocked?.(ritual, progress) !== false;
      const title = GM.ritualTitle(ritual, G.lang);
      const desc = GM.ritualDesc(ritual, G.lang);
      const tone = ritual.id === 'classic-never' || ritual.id === 'classic-td'
        ? `${GM.quickNormalCount?.() || 12} ✦`
        : ritual.classic
        ? (game === GAME.TD ? t('gameTruthDareName') : t('gameNeverName'))
        : `${ritual.count?.neverCards || ((ritual.count?.truthCards || 0) + (ritual.count?.dareCards || 0))} ✦`;
      const footer = unlocked ? tone : (GM.unlockRequirement?.(ritual, progress, G.lang) || gmLabel('locked'));
      const playChoice = unlocked
        ? `<div class="ritual-play-choice" aria-hidden="true">
            <b>${escapeHtml(t('mpStart'))}</b>
            <div>
              <button type="button" data-play="solo"><span class="play-emoji" aria-hidden="true">👤</span><span class="play-label">${escapeHtml(t('mpSolo'))}</span></button>
              <button type="button" data-play="multiplayer"><span class="play-emoji" aria-hidden="true">👥</span><span class="play-label">${escapeHtml(t('mpMultiplayer'))}</span></button>
            </div>
          </div>`
        : '';
      return `
        <div class="ritual-card${ritual.classic ? ' is-classic' : ''}${done ? ' is-done' : ''}${unlocked ? '' : ' is-locked'}" data-ritual="${escapeHtml(ritual.id)}" data-locked="${escapeHtml(gmLabel('locked'))}" role="button" tabindex="${unlocked ? '0' : '-1'}" ${unlocked ? 'aria-disabled="false"' : 'aria-disabled="true"'}>
          <span>${escapeHtml(ritual.icon || '✦')}</span>
          <strong>${escapeHtml(title)}</strong>
          <em>${escapeHtml(desc)}</em>
          <small>${escapeHtml(footer)}</small>
          ${playChoice}
        </div>
      `;
    }).join('');
  }

  function showRitualSelector(game) {
    if (!GM) {
      beginGame(game, null);
      return;
    }
    G.pendingGame = game;
    els.modeSelect.classList.add('ritual-picking');
    els.ritualShell.classList.remove('hidden');
    renderRitualSelector(game);
  }

  function hideRitualSelector() {
    els.modeSelect.classList.remove('ritual-picking');
    els.ritualShell?.classList.add('hidden');
  }

  function beginGame(game, ritual, options = {}) {
    if (!options.bypassUnlock && ritual && GM?.isRitualUnlocked?.(ritual, GM.readProgress()) === false) {
      toast(gmLabel('locked'));
      return;
    }
    if (multiplayerActive() && !options.keepMultiplayer) cleanupMultiplayer();
    const nextGame = game === GAME.TD ? GAME.TD : GAME.NEVER;
    G.game = nextGame;
    G.ritual = ritual || null;
    G.neverTutorialArmed = nextGame === GAME.NEVER;
    G.truthDareTutorialArmed = nextGame === GAME.TD;
    track('mode_selected', {
      selectedGame: nextGame,
      ritualId: ritual?.id || null,
      ritualClassic: !!ritual?.classic
    });
    if (ritual && !ritual.classic) {
      track('ritual_started', {
        ritualId: ritual.id,
        pathId: ritual.path || null
      });
    }
    els.app.classList.add('on');
    setActiveTab(ritual?.tier || 'all');
    resetDeck(ritual?.tier || 'all', { formation: 'mode', ritual });
    closeModeSelect();
    requestAnimationFrame(() => {
      const active = els.tabsEl.querySelector('.tab.active');
      if (active) movePill(active);
    });
  }

  function selectGame(game) {
    const nextGame = game === GAME.TD ? GAME.TD : GAME.NEVER;
    if (GM?.hasUnlockedRitualForMode?.(nextGame, GM.readProgress()) === false) {
      toast(gmLabel('locked'));
      return;
    }
    showRitualSelector(nextGame);
  }

  function syncModeCards() {
    const markCurrent = els.modeSelect.classList.contains('reselect');
    const progress = GM?.readProgress?.();
    $$('.mode-card').forEach(btn => {
      const isCurrent = markCurrent && btn.dataset.game === G.game;
      const unlocked = !GM || GM.hasUnlockedRitualForMode?.(btn.dataset.game, progress) !== false;
      btn.classList.toggle('is-current', isCurrent);
      btn.classList.toggle('is-locked', !unlocked);
      btn.disabled = !unlocked;
      btn.dataset.locked = gmLabel('locked');
      btn.setAttribute('aria-disabled', unlocked ? 'false' : 'true');
      btn.setAttribute('aria-current', isCurrent ? 'true' : 'false');
    });
  }

  function openModeSelect(context = 'initial', { fromSplash = false } = {}) {
    clearTimeout(modeCloseTimer);
    const reselect = context === 'switch';
    hideRitualSelector();
    els.modeSelect.classList.toggle('reselect', reselect);
    els.modeSelect.classList.toggle('from-splash', fromSplash);
    syncModeCards();
    renderSponsors();
    els.modeSelect.classList.remove('hidden');
    requestAnimationFrame(() => els.modeSelect.classList.add('on'));
    if (fromSplash) {
      setTimeout(() => els.modeSelect.classList.remove('from-splash'), 1100);
    }
    trackSponsorImpression('mode');
  }

  function closeModeSelect() {
    clearTimeout(modeCloseTimer);
    els.modeSelect.classList.remove('on');
    modeCloseTimer = setTimeout(() => {
      els.modeSelect.classList.add('hidden');
      els.modeSelect.classList.remove('reselect');
      els.modeSelect.classList.remove('from-splash');
      hideRitualSelector();
      syncModeCards();
    }, MODE_FADE_MS);
  }

  function bindEvents() {
    els.ageAccept.addEventListener('click', () => {
      window.SFX.click();
      vibe(8);
      acceptAgeGate();
    });

    els.ageExit.addEventListener('click', () => {
      track('age_gate_exit');
      window.location.href = 'https://www.google.com/';
    });

    $$('[data-legal]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.SFX.click();
        vibe(4);
        openLegal(btn.dataset.legal);
      });
    });

    els.legalClose.addEventListener('click', () => {
      window.SFX.click();
      vibe(4);
      closeLegal();
    });

    els.legalModal.addEventListener('click', e => {
      if (e.target === els.legalModal) closeLegal();
    });

    els.confirmCancel?.addEventListener('click', () => {
      window.SFX.click?.();
      vibe(3);
      closeConfirm();
    });

    els.confirmPrimary?.addEventListener('click', () => {
      const action = pendingConfirmAction;
      closeConfirm();
      action?.();
    });

    els.confirmModal?.addEventListener('click', e => {
      if (e.target === els.confirmModal) closeConfirm();
    });

    [els.sponsorMode, els.sponsorAfter].forEach((link, index) => {
      if (!link) return;
      const slot = index === 0 ? 'mode' : 'after';
      link.addEventListener('click', () => {
        const cfg = sponsorConfig(slot);
        track('sponsor_click', {
          slot,
          provider: cfg.provider || 'custom',
          placement: cfg.placement || slot,
          url: cfg.url || DEFAULT_SPONSORS[slot].url
        });
      });
    });

    addBtn('btn-draw', revealCard);
    addBtn('btn-yes', () => answer('yes', 'button'));
    addBtn('btn-never', () => answer('never', 'button'));
    addBtn('btn-truth', () => chooseTruthDareBySwipe('truth', 'button'));
    addBtn('btn-dare', () => chooseTruthDareBySwipe('dare', 'button'));
    addBtn('btn-done', () => completeTruthDare('done'));
    addBtn('btn-skip', () => completeTruthDare('skip'));

    $$('.mode-card').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        window.SFX.click();
        vibe(8);
        selectGame(btn.dataset.game);
      });
    });

    els.ritualBack?.addEventListener('click', () => {
      window.SFX.click();
      vibe(5);
      hideRitualSelector();
    });

    els.ritualGrid?.addEventListener('click', e => {
      const card = e.target.closest('.ritual-card');
      if (!card) return;
      if (card.getAttribute('aria-disabled') === 'true' || card.classList.contains('is-locked')) {
        toast(gmLabel('locked'));
        return;
      }
      const ritual = GM?.getRitual(card.dataset.ritual) || null;
      const play = e.target.closest('[data-play]');
      if (play) {
        e.stopPropagation();
        window.SFX.click();
        vibe(8);
        if (play.dataset.play === 'multiplayer') startMultiplayerHost(ritual);
        else beginGame(G.pendingGame, ritual);
        return;
      }
      if (!card.classList.contains('is-choice-open')) {
        $$('.ritual-card.is-choice-open').forEach(item => item.classList.remove('is-choice-open'));
        card.classList.add('is-choice-open');
        window.SFX.click();
        vibe(5);
        return;
      }
      window.SFX.click();
      vibe(8);
      beginGame(G.pendingGame, ritual);
    });

    els.modeClose.addEventListener('click', () => {
      window.SFX.click();
      vibe(5);
      closeModeSelect();
    });

    els.mpEmoji?.addEventListener('click', () => {
      if (!multiplayerActive()) return;
      window.SFX.click?.();
      els.mpEmoji.parentElement.classList.toggle('is-open');
    });

    els.mpEmojiDial?.addEventListener('click', e => {
      const btn = e.target.closest('[data-mp-emoji]');
      if (!btn || !multiplayerActive()) return;
      window.SFX.click?.();
      vibe(5);
      sendMpEmoji(btn.dataset.mpEmoji);
      els.mpEmoji.parentElement.classList.remove('is-open');
    });

    els.mpCopy?.addEventListener('click', () => {
      if (!multiplayerActive() || G.mp.role !== 'host' || G.mp.remoteReady) return;
      window.SFX.click?.();
      vibe(4);
      copyMpInvite();
    });

    els.mpCamera?.addEventListener('click', () => {
      window.SFX.click?.();
      vibe(5);
      toggleMpWebcam();
    });

    els.mpRelayImage?.addEventListener('load', () => {
      els.mpWebcam?.classList.add('has-relay-remote', 'has-remote', 'is-live');
      updateMpRemoteVideoLive('relay-image-load');
    });

    els.mpRelayImage?.addEventListener('error', () => {
      mpDebug('cam-relay-image-error');
    });

    els.mpWebcam?.addEventListener('pointerdown', e => {
      if (!multiplayerActive() || !els.mpWebcam.classList.contains('is-visible')) return;
      webcamDrag.on = true;
      webcamDrag.moved = false;
      webcamDrag.suppressClick = false;
      webcamDrag.pid = e.pointerId;
      webcamDrag.x0 = e.clientX;
      webcamDrag.y0 = e.clientY;
      webcamDrag.startX = webcamDrag.x;
      webcamDrag.startY = webcamDrag.y;
      els.mpWebcam.classList.add('is-dragging');
      els.mpWebcam.setPointerCapture?.(e.pointerId);
    });

    els.mpWebcam?.addEventListener('pointermove', e => {
      if (!webcamDrag.on || e.pointerId !== webcamDrag.pid) return;
      const dx = e.clientX - webcamDrag.x0;
      const dy = e.clientY - webcamDrag.y0;
      if (Math.hypot(dx, dy) > 4) webcamDrag.moved = true;
      if (!webcamDrag.moved) return;
      e.preventDefault();
      setMpWebcamPoint({ x: webcamDrag.startX + dx, y: webcamDrag.startY + dy });
    });

    const endMpWebcamDrag = e => {
      if (!webcamDrag.on || e.pointerId !== webcamDrag.pid) return;
      els.mpWebcam?.releasePointerCapture?.(e.pointerId);
      els.mpWebcam?.classList.remove('is-dragging');
      webcamDrag.on = false;
      webcamDrag.pid = null;
      if (webcamDrag.moved) {
        webcamDrag.suppressClick = true;
        positionMpWebcam(nearestMpWebcamCorner());
        setTimeout(() => { webcamDrag.suppressClick = false; }, 260);
      }
    };

    els.mpWebcam?.addEventListener('pointerup', endMpWebcamDrag);
    els.mpWebcam?.addEventListener('pointercancel', endMpWebcamDrag);

    els.mpWebcam?.addEventListener('click', () => {
      if (!multiplayerActive()) return;
      if (webcamDrag.suppressClick) return;
      window.SFX.click?.();
      toggleMpWebcam();
    });

    els.mpExit?.addEventListener('click', () => {
      if (!multiplayerActive()) return;
      openConfirm({
        title: t('mpLeaveTitle'),
        body: t('mpLeaveBody'),
        action: t('mpLeaveAction'),
        onConfirm: () => leaveMultiplayerToSplash()
      });
    });

    els.ritualActiveTab?.addEventListener('click', () => {
      if (!isActiveRitual() || G.busy || G.formingDeck || G.tutorialing) return;
      confirmLeaveRitual();
    });

    els.hdrLogo.addEventListener('click', () => {
      if (!els.app.classList.contains('on')) return;
      window.SFX.click();
      vibe(5);
      openModeSelect('switch');
    });

    els.tabsEl.addEventListener('click', e => {
      const tab = e.target.closest('.tab');
      if (!tab || tab.classList.contains('active')) return;
      if (multiplayerActive()) {
        toast(t('mpSharedDeck'));
        return;
      }
      if (G.busy || G.formingDeck || G.tutorialing) return;
      confirmTierSwitch(tab.dataset.cat);
    });

    $$('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        applyLocale(btn.dataset.lang, false);
        track('language_changed', { selectedLang: btn.dataset.lang });
        toast(LOCALES[btn.dataset.lang]?.meta?.label || btn.dataset.lang);
      });
    });

    $('after-again').addEventListener('click', () => resetDeck(G.cat, { ritual: G.ritual }));
    $('after-decks').addEventListener('click', () => {
      els.after.classList.add('hidden');
      setActiveTab('all');
      resetDeck('all', { clearRitual: true });
      openModeSelect('initial');
      toast(t('chooseDeck'));
    });

    els.afterShare?.addEventListener('click', () => {
      window.SFX.click();
      vibe(5);
      shareAfterglow();
    });

    els.afterGamification?.addEventListener('click', e => {
      const card = e.target.closest('.after-collection-item');
      if (!card) return;
      const ritualId = card.dataset.ritual || '';
      const ritual = GM?.getRitual(card.dataset.ritual) || null;
      window.SFX.click?.();
      vibe(5);
      if (card.classList.contains('is-locked')) {
        toast(card.dataset.locked || gmLabel('locked'));
        return;
      }
      if (!afterTooltipUsesHover() && afterTooltipTarget !== card) {
        showAfterItemTooltip(card, { sticky: true });
        return;
      }
      if (!ritualId) {
        showAfterItemTooltip(card, { sticky: true });
        return;
      }
      if (!ritual) {
        toast(gmLabel('locked'));
        return;
      }
      hideAfterItemTooltip({ force: true });
      confirmStartAfterRitual(ritual);
    });

    document.addEventListener('click', e => {
      if (!afterTooltipTarget) return;
      if (e.target.closest('.after-collection-item') || e.target.closest('#after-item-tooltip')) return;
      hideAfterItemTooltip({ force: true });
    });

    els.collectionClose?.addEventListener('click', () => {
      window.SFX.click();
      vibe(4);
      closeCollection();
    });

    els.collectionModal?.addEventListener('click', e => {
      if (e.target === els.collectionModal) closeCollection();
    });

    els.splashBtn.addEventListener('click', () => {
      window.SFX.init();
      window.SFX.bg();
      window.SFX.chime();
      vibe(15);
      const sp = els.splash;
      sp.classList.add('leaving');
      if (MP_DEBUG_ROLE === 'host' && MP_DEBUG_ROOM) {
        setTimeout(() => startMultiplayerHost(classicNeverRitual(), { roomId: MP_DEBUG_ROOM }), 360);
      } else if (G.mp.requestedJoin) {
        setTimeout(() => startMultiplayerGuest(G.mp.requestedJoin), 360);
      } else {
        openModeSelect('initial', { fromSplash: true });
      }
      setTimeout(() => {
        sp.style.display = 'none';
        clearIOSBlurState();
      }, 920);
    });

    window.addEventListener('resize', () => {
      const active = els.tabsEl.querySelector('.tab.active');
      if (active) movePill(active);
      syncSplashLogoFx();
      if (multiplayerActive()) positionMpWebcam(webcamDrag.corner || 'tr');
    });

    window.addEventListener('offline', () => {
      if (!multiplayerActive()) return;
      markMpReconnecting('browser-offline', { toast: false });
    });

    window.addEventListener('online', () => {
      if (!multiplayerActive()) return;
      setMpConnectionState('syncing', { toast: false });
      requestMpState('browser-online');
      scheduleMpRelayPoll(120);
    });

    window.addEventListener('beforeunload', () => {
      if (multiplayerActive()) cleanupMultiplayer();
    });
  }

  function init() {
    const initialEffectQuality = detectEffectQuality();
    FX_PERF.initial = initialEffectQuality;
    setEffectQuality(initialEffectQuality, { reason: FX_PERF.reason || 'initial' });
    startFxPerfMonitor();
    scheduleFxCapabilityProbe();
    G.locale = LOCALES.en;
    ensureMpDebugPanel();
    bindMpDebugVideoEvents();
    mpDebug('app-init', { url: location.href, secure: window.isSecureContext });
    bindEvents();
    bindSwipe();
    bindSwipeActivatedCards();
    applyLocale('en', false);
    initAgeGate();
    resetDeck('all');
    renderSponsors();
    track('app_start');
    initDevMode();
    if (IS_IOS_WEBKIT) setTimeout(clearIOSBlurState, 1200);
    document.fonts.ready.then(() => {
      const active = els.tabsEl.querySelector('.tab.active');
      if (active) movePill(active);
      syncSplashLogoFx();
    });
  }

  window.addEventListener('load', () => {
    window.SFX.bg();
  });

  init();
})();
