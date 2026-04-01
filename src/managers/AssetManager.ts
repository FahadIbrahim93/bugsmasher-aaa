/**
 * Asset Manager
 * Enterprise-grade asset loading with caching, lazy loading, and progress tracking
 */

import { EventManager } from '@core/EventManager';

export interface AssetLoadOptions { lazy?: boolean; priority?: number; crossOrigin?: string; retryCount?: number; timeout?: number; }
export interface AssetBundle { name: string; assets: Map<string, AssetDefinition>; loaded: boolean; loading: boolean; }
export interface AssetDefinition { key: string; url: string; type: 'image' | 'audio' | 'json' | 'blob' | 'text'; options?: AssetLoadOptions; }

export class AssetManager {
  private static instance: AssetManager;
  private cache: Map<string, unknown> = new Map();
  private bundles: Map<string, AssetBundle> = new Map();
  private events: EventManager;
  private loadPromises: Map<string, Promise<unknown>> = new Map();
  private totalLoaded: number = 0;
  private totalFailed: number = 0;
  private totalQueued: number = 0;

  private constructor() { this.events = EventManager.getInstance(); }

  static getInstance(): AssetManager {
    if (!AssetManager.instance) { AssetManager.instance = new AssetManager(); }
    return AssetManager.instance;
  }

  registerBundle(name: string, assets: AssetDefinition[]): void {
    const assetMap = new Map<string, AssetDefinition>();
    for (const asset of assets) { assetMap.set(asset.key, asset); }
    this.bundles.set(name, { name, assets: assetMap, loaded: false, loading: false });
  }

  async loadBundle(bundleName: string, onProgress?: (progress: number) => void): Promise<boolean> {
    const bundle = this.bundles.get(bundleName);
    if (!bundle) { console.error(`Bundle not found: ${bundleName}`); return false; }
    if (bundle.loaded) return true;
    if (bundle.loading) { while (bundle.loading) { await new Promise(r => setTimeout(r, 10)); } return bundle.loaded; }
    bundle.loading = true;
    const assets = Array.from(bundle.assets.values());
    const total = assets.length;
    let loaded = 0;
    try {
      await Promise.all(assets.map(async (asset) => { await this.loadAsset(asset); loaded++; onProgress?.(loaded / total); }));
      bundle.loaded = true;
      this.events.emit('bundle:loaded', { bundleName });
      return true;
    } catch (error) { console.error(`Failed to load bundle ${bundleName}:`, error); return false; }
    finally { bundle.loading = false; }
  }

  async loadAsset<T = unknown>(definition: AssetDefinition): Promise<T> {
    const { key, url, type, options = {} } = definition;
    if (this.cache.has(key)) { return this.cache.get(key) as T; }
    if (this.loadPromises.has(key)) { return this.loadPromises.get(key) as Promise<T>; }
    const loadPromise = this.performLoad<T>(key, url, type, options);
    this.loadPromises.set(key, loadPromise);
    try {
      const result = await loadPromise;
      this.cache.set(key, result); this.totalLoaded++;
      this.events.emit('asset:loaded', { key, type });
      return result;
    } catch (error) { this.totalFailed++; this.events.emit('asset:failed', { key, error }); throw error; }
    finally { this.loadPromises.delete(key); }
  }

  private async performLoad<T>(key: string, url: string, type: string, options: AssetLoadOptions): Promise<T> {
    const { retryCount = 3, timeout = 30000 } = options;
    let lastError: Error | undefined;
    for (let attempt = 0; attempt < retryCount; attempt++) {
      try { return await this.loadWithTimeout(key, url, type, timeout); }
      catch (error) { lastError = error as Error; if (attempt < retryCount - 1) { await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); } }
    }
    throw lastError || new Error(`Failed to load ${key} after ${retryCount} attempts`);
  }

  private loadWithTimeout<T>(key: string, url: string, type: string, timeout: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { reject(new Error(`Timeout loading ${key}`)); }, timeout);
      this.loadByType(key, url, type).then(result => { clearTimeout(timer); resolve(result as T); }).catch(error => { clearTimeout(timer); reject(error); });
    });
  }

  private loadByType(_key: string, url: string, type: string): Promise<unknown> {
    switch (type) {
      case 'image': return this.loadImage(url);
      case 'audio': return this.loadAudio(url);
      case 'json': return this.loadJSON(url);
      case 'blob': return this.loadBlob(url);
      case 'text': return this.loadText(url);
      default: throw new Error(`Unknown asset type: ${type}`);
    }
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img); img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  private loadAudio(url: string): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(); audio.crossOrigin = 'anonymous';
      audio.oncanplaythrough = () => resolve(audio); audio.onerror = () => reject(new Error(`Failed to load audio: ${url}`));
      audio.src = url; audio.load();
    });
  }

  private async loadJSON(url: string): Promise<unknown> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
  }

  private async loadBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.blob();
  }

  private async loadText(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.text();
  }

  get<T>(key: string): T | undefined { return this.cache.get(key) as T | undefined; }
  has(key: string): boolean { return this.cache.has(key); }

  async preload(assets: AssetDefinition[], onProgress?: (progress: number) => void): Promise<void> {
    const total = assets.length; let loaded = 0;
    await Promise.all(assets.map(async (asset) => {
      try { await this.loadAsset(asset); } catch (error) { console.warn(`Failed to preload ${asset.key}:`, error); }
      loaded++; onProgress?.(loaded / total);
    }));
  }

  async createTextureAtlas(images: Map<string, HTMLImageElement>): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const sorted = Array.from(images.entries()).sort((a, b) => b[1].height - a[1].height);
    let x = 0, y = 0, rowHeight = 0;
    const padding = 2, atlasWidth = 2048;
    canvas.width = atlasWidth; canvas.height = 2048;
    const atlasData: Map<string, { x: number; y: number; w: number; h: number }> = new Map();
    for (const [key, img] of sorted) {
      if (x + img.width > atlasWidth) { x = 0; y += rowHeight + padding; rowHeight = 0; }
      ctx.drawImage(img, x, y); atlasData.set(key, { x, y, w: img.width, h: img.height });
      x += img.width + padding; rowHeight = Math.max(rowHeight, img.height);
    }
    canvas.height = y + rowHeight;
    this.cache.set('atlas:data', atlasData);
    return canvas;
  }

  getStats(): { loaded: number; failed: number; queued: number; cacheSize: number } {
    return { loaded: this.totalLoaded, failed: this.totalFailed, queued: this.totalQueued, cacheSize: this.cache.size };
  }

  clear(): void { this.cache.clear(); this.loadPromises.clear(); this.totalLoaded = 0; this.totalFailed = 0; this.totalQueued = 0; }
  unload(key: string): boolean { return this.cache.delete(key); }
}

export const Assets = AssetManager.getInstance();
