import type { System, Vec2 } from '@typedefs/index';
import { ECSWorld } from '@core/ECS';
import { WAVE_CONFIGS } from '@config/GameConfig';
import { spawnBug } from '@entities/Bug';

export class BugSpawnerSystem implements System {
  name = 'BugSpawnerSystem';
  priority = 'normal' as const;
  enabled = true;

  private currentWaveIndex = 0;
  private waveTimer = 0;
  private spawnTimer = 0;
  private bugsSpawnedInWave = 0;

  constructor(private world: ECSWorld, private screenWidth: number, private screenHeight: number) {}

  update(deltaTime: number): void {
    if (this.currentWaveIndex >= WAVE_CONFIGS.length) return; // All waves processed

    const config = WAVE_CONFIGS[this.currentWaveIndex];
    this.waveTimer += deltaTime * 1000;
    this.spawnTimer += deltaTime * 1000;

    // Check if wave is over
    if (this.waveTimer >= config.duration && this.bugsSpawnedInWave >= config.bugCount) {
      if (this.world.getEntitiesByTag('bug').length === 0) {
        this.currentWaveIndex++;
        this.waveTimer = 0;
        this.bugsSpawnedInWave = 0;
        this.spawnTimer = 0;
        
        if (this.currentWaveIndex >= WAVE_CONFIGS.length) {
          this.world.getEvents().emit('game:victory', {});
        } else {
          this.world.getEvents().emit('game:wave_complete', { wave: this.currentWaveIndex });
        }
        return;
      }
    }

    // Spawn bugs if needed
    if (this.spawnTimer >= config.spawnRate && this.bugsSpawnedInWave < config.bugCount) {
      this.spawnTimer = 0;
      this.spawnRandomBug(config);
      this.bugsSpawnedInWave++;
    }
  }

  private spawnRandomBug(config: typeof WAVE_CONFIGS[0]): void {
    // Pick random bug from allowed types
    const type = config.bugTypes[Math.floor(Math.random() * config.bugTypes.length)];
    
    // Spawn position: randomly around the edges
    const pos = this.getRandomEdgePosition();

    // Scale stats by wave implicitly if needed, currently 1.0 + wave base
    const multiplier = 1.0 + (this.currentWaveIndex * 0.2); 
    
    spawnBug(this.world, type, pos, multiplier);
  }

  private getRandomEdgePosition(): Vec2 {
    const margin = 50;
    const edge = Math.floor(Math.random() * 4);
    
    switch (edge) {
      case 0: return { x: Math.random() * this.screenWidth, y: -margin }; // Top
      case 1: return { x: this.screenWidth + margin, y: Math.random() * this.screenHeight }; // Right
      case 2: return { x: Math.random() * this.screenWidth, y: this.screenHeight + margin }; // Bottom
      default: return { x: -margin, y: Math.random() * this.screenHeight }; // Left
    }
  }
}
