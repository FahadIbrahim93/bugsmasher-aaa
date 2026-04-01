/**
 * Audio Manager
 * Enterprise-grade audio system using Web Audio API with spatial audio support
 */

import type { SoundType, SoundConfig, Vec2 } from '@typedefs/index';
import { AUDIO_CONFIG } from '@config/GameConfig';
import { EventManager } from '@core/EventManager';

interface SoundInstance { id: string; buffer: AudioBuffer; source: AudioBufferSourceNode | null; gainNode: GainNode; pannerNode: PannerNode | null; startTime: number; config: SoundConfig; loop: boolean; playing: boolean; }
interface AudioTrack { name: string; buffer: AudioBuffer; source: AudioBufferSourceNode | null; gainNode: GainNode; playing: boolean; loop: boolean; }

export class AudioManager {
  private static instance: AudioManager;
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private events: EventManager;
  private soundBuffers: Map<SoundType, AudioBuffer> = new Map();
  private activeSounds: Map<string, SoundInstance> = new Map();
  private musicTracks: Map<string, AudioTrack> = new Map();
  private currentMusic: string | null = null;
  private listenerPosition: Vec2 = { x: 0, y: 0 };
  private soundIdCounter: number = 0;
  private maxConcurrentSounds: number = AUDIO_CONFIG.maxConcurrentSounds;

  private constructor() { this.events = EventManager.getInstance(); }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) { AudioManager.instance = new AudioManager(); }
    return AudioManager.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.context.createGain(); this.sfxGain = this.context.createGain(); this.musicGain = this.context.createGain();
      this.sfxGain.connect(this.masterGain); this.musicGain.connect(this.masterGain); this.masterGain.connect(this.context.destination);
      this.setMasterVolume(AUDIO_CONFIG.masterVolume); this.setSFXVolume(AUDIO_CONFIG.sfxVolume); this.setMusicVolume(AUDIO_CONFIG.musicVolume);
      this.events.emit('audio:initialized', {}); return true;
    } catch (error) { console.error('Failed to initialize audio:', error); return false; }
  }

  async resume(): Promise<void> { if (this.context?.state === 'suspended') { await this.context.resume(); } }

  async loadSound(type: SoundType, url: string): Promise<void> {
    if (!this.context) return;
    try {
      const response = await fetch(url); const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.soundBuffers.set(type, audioBuffer); this.events.emit('audio:loaded', { type, url });
    } catch (error) { console.error(`Failed to load sound ${type}:`, error); }
  }

  async loadSounds(sounds: { type: SoundType; url: string }[]): Promise<void> { await Promise.all(sounds.map(s => this.loadSound(s.type, s.url))); }

  play(type: SoundType, config: Partial<SoundConfig> = {}): string | null {
    if (!this.context || !AUDIO_CONFIG.audioEnabled) return null;
    const buffer = this.soundBuffers.get(type); if (!buffer) { console.warn(`Sound not loaded: ${type}`); return null; }
    if (this.activeSounds.size >= this.maxConcurrentSounds) { this.removeOldestSound(); }
    const soundId = `sound_${++this.soundIdCounter}`;
    const fullConfig: SoundConfig = { volume: 1, loop: false, playbackRate: 1, spatial: false, ...config };
    const source = this.context.createBufferSource(); source.buffer = buffer; source.playbackRate.value = fullConfig.playbackRate;
    const gainNode = this.context.createGain(); gainNode.gain.value = fullConfig.volume;
    let pannerNode: PannerNode | null = null;
    if (fullConfig.spatial && fullConfig.position) { pannerNode = this.createPannerNode(fullConfig.position); source.connect(pannerNode); pannerNode.connect(gainNode); }
    else { source.connect(gainNode); }
    gainNode.connect(this.sfxGain!); source.loop = fullConfig.loop; source.start(0);
    const instance: SoundInstance = { id: soundId, buffer, source, gainNode, pannerNode, startTime: this.context.currentTime, config: fullConfig, loop: fullConfig.loop, playing: true };
    this.activeSounds.set(soundId, instance);
    source.onended = () => { if (!instance.loop) { this.stop(soundId); } };
    return soundId;
  }

  playAt(type: SoundType, position: Vec2, volume: number = 1): string | null {
    return this.play(type, { volume, spatial: AUDIO_CONFIG.spatialAudio, position });
  }

  stop(soundId: string): void {
    const sound = this.activeSounds.get(soundId); if (!sound) return;
    try { sound.source?.stop(); } catch (_e) { /* Already stopped */ }
    this.cleanupSound(soundId);
  }

  stopAll(type?: SoundType): void {
    for (const [id, sound] of this.activeSounds) {
      if (!type || this.getSoundType(sound) === type) { this.stop(id); }
    }
  }

  setVolume(soundId: string, volume: number): void {
    const sound = this.activeSounds.get(soundId);
    if (sound && this.context) { sound.gainNode.gain.setTargetAtTime(volume, this.context.currentTime, 0.1); }
  }

  fade(soundId: string, toVolume: number, duration: number): void {
    const sound = this.activeSounds.get(soundId);
    if (sound && this.context) { sound.gainNode.gain.linearRampToValueAtTime(toVolume, this.context.currentTime + duration / 1000); }
  }

  playMusic(trackName: string, loop: boolean = true, crossfade: number = 1000): void {
    if (!this.context) return;
    const track = this.musicTracks.get(trackName); if (!track) { console.warn(`Music track not found: ${trackName}`); return; }
    if (this.currentMusic && this.currentMusic !== trackName) {
      const currentTrack = this.musicTracks.get(this.currentMusic);
      if (currentTrack) { this.fadeOut(currentTrack, crossfade); }
    }
    if (!track.playing) {
      const source = this.context.createBufferSource(); source.buffer = track.buffer; source.loop = loop;
      track.source = source; track.playing = true; track.loop = loop;
      source.connect(track.gainNode); track.gainNode.connect(this.musicGain!);
      track.gainNode.gain.setValueAtTime(0, this.context.currentTime);
      track.gainNode.gain.linearRampToValueAtTime(1, this.context.currentTime + crossfade / 1000);
      source.start(0); source.onended = () => { track.playing = false; };
    }
    this.currentMusic = trackName;
  }

  stopMusic(fadeOutMs: number = 1000): void {
    if (!this.currentMusic) return;
    const track = this.musicTracks.get(this.currentMusic);
    if (track) { this.fadeOut(track, fadeOutMs); }
    this.currentMusic = null;
  }

  pauseMusic(): void {
    if (this.currentMusic) { const track = this.musicTracks.get(this.currentMusic); if (track?.source) { track.source.stop(); track.playing = false; } }
  }

  resumeMusic(): void { if (this.currentMusic) { this.playMusic(this.currentMusic, true, 500); } }

  async loadMusic(name: string, url: string): Promise<void> {
    if (!this.context) return;
    try {
      const response = await fetch(url); const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      const gainNode = this.context.createGain();
      this.musicTracks.set(name, { name, buffer: audioBuffer, source: null, gainNode, playing: false, loop: false });
    } catch (error) { console.error(`Failed to load music ${name}:`, error); }
  }

  setMasterVolume(volume: number): void { if (this.masterGain && this.context) { this.masterGain.gain.setTargetAtTime(volume, this.context.currentTime, 0.1); } }
  setSFXVolume(volume: number): void { if (this.sfxGain && this.context) { this.sfxGain.gain.setTargetAtTime(volume, this.context.currentTime, 0.1); } }
  setMusicVolume(volume: number): void { if (this.musicGain && this.context) { this.musicGain.gain.setTargetAtTime(volume, this.context.currentTime, 0.1); } }

  setListenerPosition(position: Vec2): void {
    this.listenerPosition = position;
    if (this.context?.listener) { this.context.listener.positionX.value = position.x; this.context.listener.positionY.value = position.y; this.context.listener.positionZ.value = 0; }
  }

  mute(): void { if (this.masterGain && this.context) { this.masterGain.gain.setValueAtTime(0, this.context.currentTime); } }
  unmute(): void { if (this.masterGain && this.context) { this.masterGain.gain.setValueAtTime(AUDIO_CONFIG.masterVolume, this.context.currentTime); } }
  toggleMute(): boolean { if (!this.masterGain) return false; const isMuted = this.masterGain.gain.value === 0; if (isMuted) this.unmute(); else this.mute(); return !isMuted; }

  update(): void {
    const now = this.context?.currentTime || 0;
    for (const [id, sound] of this.activeSounds) {
      if (!sound.loop && sound.source) {
        const duration = sound.buffer.duration / sound.config.playbackRate;
        if (now - sound.startTime > duration) { this.cleanupSound(id); }
      }
    }
  }

  private createPannerNode(position: Vec2): PannerNode {
    if (!this.context) throw new Error('Audio context not initialized');
    const panner = this.context.createPanner();
    panner.panningModel = 'HRTF'; panner.distanceModel = 'inverse';
    panner.refDistance = 1; panner.maxDistance = AUDIO_CONFIG.audioRange; panner.rolloffFactor = 1;
    panner.coneInnerAngle = 360; panner.coneOuterAngle = 0; panner.coneOuterGain = 0;
    panner.positionX.value = position.x; panner.positionY.value = position.y; panner.positionZ.value = 0;
    return panner;
  }

  private removeOldestSound(): void {
    let oldestId: string | null = null; let oldestTime = Infinity;
    for (const [id, sound] of this.activeSounds) { if (sound.startTime < oldestTime) { oldestTime = sound.startTime; oldestId = id; } }
    if (oldestId) { this.stop(oldestId); }
  }

  private cleanupSound(soundId: string): void {
    const sound = this.activeSounds.get(soundId); if (!sound) return;
    sound.playing = false;
    try { sound.source?.disconnect(); sound.pannerNode?.disconnect(); sound.gainNode.disconnect(); } catch (_e) { /* Ignore */ }
    this.activeSounds.delete(soundId);
  }

  private fadeOut(track: AudioTrack, duration: number): void {
    if (!this.context) return;
    track.gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + duration / 1000);
    setTimeout(() => { if (track.source) { try { track.source.stop(); } catch (_e) { /* Already stopped */ } } track.playing = false; }, duration);
  }

  private getSoundType(sound: SoundInstance): SoundType | null {
    for (const [type, buffer] of this.soundBuffers) { if (buffer === sound.buffer) return type; }
    return null;
  }

  getStats(): { activeSounds: number; loadedSounds: number; musicTracks: number; currentMusic: string | null } {
    return { activeSounds: this.activeSounds.size, loadedSounds: this.soundBuffers.size, musicTracks: this.musicTracks.size, currentMusic: this.currentMusic };
  }

  destroy(): void { this.stopAll(); this.stopMusic(0); if (this.context?.state !== 'closed') { this.context?.close(); } }
}

export const Audio = AudioManager.getInstance();
