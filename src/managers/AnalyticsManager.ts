/**
 * Analytics System
 * Comprehensive game analytics tracking with privacy compliance
 */

import { EventManager } from '@core/EventManager';

export interface AnalyticsEvent {
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  parameters?: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
}

export interface SessionData {
  sessionId: string;
  startTime: number;
  endTime?: number;
  duration: number;
  events: AnalyticsEvent[];
}

export interface PlayerProfile {
  playerId: string;
  firstSeen: number;
  lastSeen: number;
  totalSessions: number;
  totalPlayTime: number;
  platform: string;
  deviceInfo: { userAgent: string; language: string; screenResolution: string };
}

export class AnalyticsSystem {
  private static instance: AnalyticsSystem;
  private events: EventManager;
  private session: SessionData | null = null;
  private profile: PlayerProfile | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private isEnabled: boolean = true;
  private batchSize: number = 50;
  private flushInterval: number = 30000;
  private flushTimer: number | null = null;
  private endpoint: string | null = null;
  private metrics: Map<string, number> = new Map();
  private funnels: Map<string, string[]> = new Map();

  private constructor() {
    this.events = EventManager.getInstance();
    this.initializeProfile();
  }

  static getInstance(): AnalyticsSystem {
    if (!AnalyticsSystem.instance) {
      AnalyticsSystem.instance = new AnalyticsSystem();
    }
    return AnalyticsSystem.instance;
  }

  initialize(endpoint?: string): void {
    this.endpoint = endpoint || null;
    this.startSession();
    this.flushTimer = window.setInterval(() => { this.flush(); }, this.flushInterval);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { this.trackEvent('session', 'background', 'app_hidden'); }
      else { this.trackEvent('session', 'foreground', 'app_shown'); }
    });
    this.events.emit('analytics:initialized', {});
  }

  setEnabled(enabled: boolean): void { this.isEnabled = enabled; }
  isAnalyticsEnabled(): boolean { return this.isEnabled; }

  startSession(): void {
    if (this.session) { this.endSession(); }
    this.session = { sessionId: this.generateId(), startTime: Date.now(), duration: 0, events: [] };
    this.trackEvent('session', 'start', 'session_begin');
    if (this.profile) { this.profile.totalSessions++; this.profile.lastSeen = Date.now(); }
  }

  endSession(): void {
    if (!this.session) return;
    this.session.endTime = Date.now();
    this.session.duration = this.session.endTime - this.session.startTime;
    this.trackEvent('session', 'end', 'session_end', this.session.duration);
    this.flush();
    this.session = null;
  }

  trackEvent(category: string, action: string, label?: string, value?: number, parameters?: Record<string, unknown>): void {
    if (!this.isEnabled || !this.session) return;
    const event: AnalyticsEvent = {
      name: `${category}:${action}`, category, action, label, value, parameters,
      timestamp: Date.now(), sessionId: this.session.sessionId,
    };
    this.eventQueue.push(event);
    this.session.events.push(event);
    if (this.eventQueue.length >= this.batchSize) { this.flush(); }
    this.events.emit('analytics:event', event);
  }

  trackProgression(event: 'start' | 'complete' | 'fail', level: string, score?: number): void {
    this.trackEvent('progression', event, level, score, { level });
  }

  trackResource(type: 'earn' | 'spend', resource: string, amount: number, reason: string): void {
    this.trackEvent('resource', type, resource, amount, { resource, reason });
  }

  trackError(error: Error, context?: string): void {
    this.trackEvent('error', 'exception', context || 'unknown', undefined, {
      message: error.message, stack: error.stack, context,
    });
  }

  trackPurchase(productId: string, price: number, currency: string): void {
    this.trackEvent('business', 'purchase', productId, price, { productId, price, currency });
  }

  trackAd(action: 'show' | 'click' | 'reward', type: string, placement: string): void {
    this.trackEvent('ad', action, placement, undefined, { adType: type, placement });
  }

  setUserProperty(key: string, value: string | number | boolean): void {
    this.trackEvent('user', 'property_set', key, undefined, { [key]: value });
  }

  incrementMetric(key: string, value: number = 1): void {
    const current = this.metrics.get(key) || 0;
    this.metrics.set(key, current + value);
  }

  setMetric(key: string, value: number): void { this.metrics.set(key, value); }
  getMetric(key: string): number { return this.metrics.get(key) || 0; }

  trackFunnel(funnelName: string, step: string): void {
    if (!this.funnels.has(funnelName)) { this.funnels.set(funnelName, []); }
    const steps = this.funnels.get(funnelName)!;
    if (!steps.includes(step)) { steps.push(step); }
    this.trackEvent('funnel', 'step', `${funnelName}:${step}`, steps.length, {
      funnel: funnelName, step, stepNumber: steps.length,
    });
  }

  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;
    const events = [...this.eventQueue];
    this.eventQueue = [];
    if (this.endpoint) {
      try {
        await fetch(this.endpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session: this.session, profile: this.profile, events }),
        });
      } catch (error) {
        this.eventQueue.unshift(...events);
        console.warn('Analytics flush failed:', error);
      }
    }
    this.storeLocal(events);
  }

  getSessionData(): SessionData | null { return this.session; }
  getProfile(): PlayerProfile | null { return this.profile; }
  getAllMetrics(): Record<string, number> { return Object.fromEntries(this.metrics); }
  getFunnelProgress(funnelName: string): string[] { return this.funnels.get(funnelName) || []; }

  destroy(): void {
    this.endSession();
    if (this.flushTimer !== null) { clearInterval(this.flushTimer); this.flushTimer = null; }
  }

  private initializeProfile(): void {
    const stored = localStorage.getItem('bugsmasher_analytics_profile');
    if (stored) {
      this.profile = JSON.parse(stored);
    } else {
      this.profile = {
        playerId: this.generateId(), firstSeen: Date.now(), lastSeen: Date.now(),
        totalSessions: 0, totalPlayTime: 0, platform: this.detectPlatform(),
        deviceInfo: { userAgent: navigator.userAgent, language: navigator.language, screenResolution: `${screen.width}x${screen.height}` },
      };
      localStorage.setItem('bugsmasher_analytics_profile', JSON.stringify(this.profile));
    }
  }

  private detectPlatform(): string {
    const ua = navigator.userAgent;
    if (/mobile|android|iphone|ipad|ipod/i.test(ua)) return 'mobile';
    if (/tablet|ipad/i.test(ua)) return 'tablet';
    return 'desktop';
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private storeLocal(events: AnalyticsEvent[]): void {
    const stored = JSON.parse(localStorage.getItem('bugsmasher_analytics_events') || '[]');
    const combined = [...stored, ...events];
    if (combined.length > 100) { combined.splice(0, combined.length - 100); }
    localStorage.setItem('bugsmasher_analytics_events', JSON.stringify(combined));
  }
}

export const Analytics = AnalyticsSystem.getInstance();
