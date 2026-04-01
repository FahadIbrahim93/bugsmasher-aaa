/**
 * Camera System
 * 2D camera with smooth following, shake effects, and viewport management
 */

import type { Vec2, Rect, Camera as CameraType } from '@typedefs/index';

export class Camera {
  private position: Vec2 = { x: 0, y: 0 };
  private target: Vec2 | null = null;
  private viewport: Rect = { x: 0, y: 0, width: 1920, height: 1080 };
  private worldBounds: Rect | null = null;

  // Camera properties
  private zoom: number = 1;
  private rotation: number = 0;
  private smoothSpeed: number = 5;

  // Shake effect
  private shakeIntensity: number = 0;
  private shakeDuration: number = 0;
  private shakeDecay: number = 0;
  private shakeOffset: Vec2 = { x: 0, y: 0 };

  // Dead zone (for smooth following)
  private deadZone: Vec2 = { x: 100, y: 100 };

  // Bounds
  private minZoom: number = 0.5;
  private maxZoom: number = 3;

  constructor(viewportWidth: number, viewportHeight: number) {
    this.viewport.width = viewportWidth;
    this.viewport.height = viewportHeight;
  }

  follow(target: Vec2, smooth: boolean = true): void {
    this.target = target;
    if (!smooth) {
      this.position = { ...target };
    }
  }

  setWorldBounds(bounds: Rect): void {
    this.worldBounds = bounds;
  }

  update(deltaTime: number): void {
    if (this.target) {
      const dx = this.target.x - this.position.x;
      const dy = this.target.y - this.position.y;

      if (Math.abs(dx) > this.deadZone.x || Math.abs(dy) > this.deadZone.y) {
        const factor = 1 - Math.exp(-this.smoothSpeed * deltaTime);
        this.position.x += dx * factor;
        this.position.y += dy * factor;
      }
    }

    if (this.shakeDuration > 0) {
      this.shakeDuration -= deltaTime;
      this.shakeIntensity *= this.shakeDecay;

      if (this.shakeDuration <= 0) {
        this.shakeIntensity = 0;
        this.shakeOffset = { x: 0, y: 0 };
      } else {
        this.shakeOffset = {
          x: (Math.random() - 0.5) * this.shakeIntensity,
          y: (Math.random() - 0.5) * this.shakeIntensity,
        };
      }
    }

    this.constrainToBounds();
  }

  shake(intensity: number, duration: number): void {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeDecay = Math.pow(0.01, 1 / (duration * 60));
  }

  setZoom(zoom: number): void {
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
  }

  getZoom(): number {
    return this.zoom;
  }

  move(deltaX: number, deltaY: number): void {
    this.position.x += deltaX / this.zoom;
    this.position.y += deltaY / this.zoom;
    this.constrainToBounds();
  }

  setPosition(x: number, y: number): void {
    this.position = { x, y };
    this.constrainToBounds();
  }

  getPosition(): Vec2 {
    return {
      x: this.position.x + this.shakeOffset.x,
      y: this.position.y + this.shakeOffset.y,
    };
  }

  worldToScreen(worldPos: Vec2): Vec2 {
    const camPos = this.getPosition();
    return {
      x: (worldPos.x - camPos.x) * this.zoom + this.viewport.width / 2,
      y: (worldPos.y - camPos.y) * this.zoom + this.viewport.height / 2,
    };
  }

  screenToWorld(screenPos: Vec2): Vec2 {
    const camPos = this.getPosition();
    return {
      x: (screenPos.x - this.viewport.width / 2) / this.zoom + camPos.x,
      y: (screenPos.y - this.viewport.height / 2) / this.zoom + camPos.y,
    };
  }

  isVisible(worldPos: Vec2, margin: number = 0): boolean {
    const screenPos = this.worldToScreen(worldPos);
    return (
      screenPos.x >= -margin &&
      screenPos.x <= this.viewport.width + margin &&
      screenPos.y >= -margin &&
      screenPos.y <= this.viewport.height + margin
    );
  }

  getViewFrustum(): Rect {
    const halfWidth = this.viewport.width / (2 * this.zoom);
    const halfHeight = this.viewport.height / (2 * this.zoom);
    const pos = this.getPosition();

    return {
      x: pos.x - halfWidth,
      y: pos.y - halfHeight,
      width: halfWidth * 2,
      height: halfHeight * 2,
    };
  }

  setViewport(width: number, height: number): void {
    this.viewport.width = width;
    this.viewport.height = height;
  }

  getViewport(): Rect {
    return { ...this.viewport };
  }

  getState(): CameraType {
    return {
      position: this.getPosition(),
      zoom: this.zoom,
      rotation: this.rotation,
      viewport: { ...this.viewport },
      shakeIntensity: this.shakeIntensity,
      shakeDecay: this.shakeDecay,
    };
  }

  private constrainToBounds(): void {
    if (!this.worldBounds) return;

    const halfWidth = this.viewport.width / (2 * this.zoom);
    const halfHeight = this.viewport.height / (2 * this.zoom);

    this.position.x = Math.max(
      this.worldBounds.x + halfWidth,
      Math.min(this.worldBounds.x + this.worldBounds.width - halfWidth, this.position.x)
    );

    this.position.y = Math.max(
      this.worldBounds.y + halfHeight,
      Math.min(this.worldBounds.y + this.worldBounds.height - halfHeight, this.position.y)
    );
  }

  reset(): void {
    this.position = { x: 0, y: 0 };
    this.target = null;
    this.zoom = 1;
    this.rotation = 0;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeOffset = { x: 0, y: 0 };
  }
}
