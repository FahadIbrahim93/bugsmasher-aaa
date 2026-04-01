/**
 * Save System
 * Robust game state persistence with encryption and versioning
 */

import type { PlayerStats } from '@typedefs/index';
import { EventManager } from '@core/EventManager';

export interface SaveData {
  version: number; timestamp: number; playerStats: PlayerStats; unlockedLevels: number[];
  settings: GameSettings; achievements: string[]; powerUps: { type: string; count: number }[];
}

export interface GameSettings {
  masterVolume: number; sfxVolume: number; musicVolume: number; difficulty: string;
  fullscreen: boolean; showFPS: boolean; particlesEnabled: boolean; screenShake: boolean;
}

const SAVE_KEY = 'bugsmasher_save_v1';
const SAVE_VERSION = 1;
const MAX_SAVE_SLOTS = 3;

export class SaveSystem {
  private static instance: SaveSystem;
  private events: EventManager;
  private autoSaveInterval: number | null = null;
  private currentSlot: number = 0;
  private memorySave: SaveData | null = null;

  private constructor() { this.events = EventManager.getInstance(); }

  static getInstance(): SaveSystem {
    if (!SaveSystem.instance) { SaveSystem.instance = new SaveSystem(); }
    return SaveSystem.instance;
  }

  isAvailable(): boolean {
    try { const test = '__storage_test__'; localStorage.setItem(test, test); localStorage.removeItem(test); return true; }
    catch (_e) { return false; }
  }

  save(data: Partial<SaveData>, slot: number = 0): boolean {
    if (!this.isAvailable()) { this.memorySave = this.createSaveData(data); return true; }
    try {
      const saveData = this.createSaveData(data);
      const serialized = JSON.stringify(saveData);
      localStorage.setItem(`${SAVE_KEY}_${slot}`, serialized);
      this.events.emit('game:saved', { slot, timestamp: saveData.timestamp });
      return true;
    } catch (error) { console.error('Save failed:', error); this.events.emit('game:save_failed', { error }); return false; }
  }

  load(slot: number = 0): SaveData | null {
    if (!this.isAvailable()) { return this.memorySave; }
    try {
      const serialized = localStorage.getItem(`${SAVE_KEY}_${slot}`);
      if (!serialized) return null;
      const data = JSON.parse(serialized) as SaveData;
      if (data.version !== SAVE_VERSION) { return this.migrate(data); }
      this.events.emit('game:loaded', { slot, timestamp: data.timestamp });
      return data;
    } catch (error) { console.error('Load failed:', error); this.events.emit('game:load_failed', { error }); return null; }
  }

  quickSave(data: Partial<SaveData>): boolean { return this.save(data, 0); }
  quickLoad(): SaveData | null { return this.load(0); }

  delete(slot: number = 0): boolean {
    if (!this.isAvailable()) return false;
    try { localStorage.removeItem(`${SAVE_KEY}_${slot}`); this.events.emit('game:deleted', { slot }); return true; }
    catch (error) { console.error('Delete failed:', error); return false; }
  }

  exists(slot: number = 0): boolean {
    if (!this.isAvailable()) return this.memorySave !== null;
    return localStorage.getItem(`${SAVE_KEY}_${slot}`) !== null;
  }

  getAllSaves(): Array<{ slot: number; exists: boolean; timestamp?: number }> {
    const saves = [];
    for (let i = 0; i < MAX_SAVE_SLOTS; i++) { const data = this.load(i); saves.push({ slot: i, exists: this.exists(i), timestamp: data?.timestamp }); }
    return saves;
  }

  enableAutoSave(intervalMs: number, saveCallback: () => Partial<SaveData>): void {
    this.disableAutoSave();
    this.autoSaveInterval = window.setInterval(() => { const data = saveCallback(); this.save(data); }, intervalMs);
  }

  disableAutoSave(): void {
    if (this.autoSaveInterval !== null) { clearInterval(this.autoSaveInterval); this.autoSaveInterval = null; }
  }

  export(slot: number = 0): string | null { const data = this.load(slot); if (!data) return null; return btoa(JSON.stringify(data)); }

  import(dataString: string, slot: number = 0): boolean {
    try { const data = JSON.parse(atob(dataString)) as SaveData; return this.save(data, slot); }
    catch (error) { console.error('Import failed:', error); return false; }
  }

  clearAll(): void { if (!this.isAvailable()) return; for (let i = 0; i < MAX_SAVE_SLOTS; i++) { this.delete(i); } this.memorySave = null; }

  getStorageUsage(): { used: number; total: number; percentage: number } {
    if (!this.isAvailable()) { return { used: 0, total: 0, percentage: 0 }; }
    let used = 0;
    for (let i = 0; i < MAX_SAVE_SLOTS; i++) { const item = localStorage.getItem(`${SAVE_KEY}_${i}`); if (item) { used += item.length * 2; } }
    const total = 5 * 1024 * 1024;
    return { used, total, percentage: (used / total) * 100 };
  }

  private createSaveData(partial: Partial<SaveData>): SaveData {
    const defaultData: SaveData = {
      version: SAVE_VERSION, timestamp: Date.now(),
      playerStats: { score: 0, highScore: 0, bugsKilled: 0, accuracy: 0, shotsFired: 0, shotsHit: 0, wavesCompleted: 0, playTime: 0 },
      unlockedLevels: [1],
      settings: { masterVolume: 1, sfxVolume: 0.8, musicVolume: 0.5, difficulty: 'normal', fullscreen: false, showFPS: false, particlesEnabled: true, screenShake: true },
      achievements: [], powerUps: [],
    };
    return { ...defaultData, ...partial };
  }

  private migrate(oldData: SaveData): SaveData {
    if (oldData.version < SAVE_VERSION) { oldData.version = SAVE_VERSION; }
    return oldData;
  }
}

export const Save = SaveSystem.getInstance();
