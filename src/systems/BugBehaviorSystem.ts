import type { System, Vec2 } from '@typedefs/index';
import { BehaviorType } from '@typedefs/index';
import { ECSWorld } from '@core/ECS';

export class BugBehaviorSystem implements System {
  name = 'BugBehaviorSystem';
  priority: 'normal' = 'normal';
  enabled = true;

  constructor(private world: ECSWorld, private targetPos: Vec2) {}

  update(deltaTime: number): void {
    const bugs = this.world.query('bug_behavior', 'transform', 'velocity');
    
    for (const entity of bugs) {
      if (!entity.active) continue;

      const behavior = entity.components.get('bug_behavior') as any;
      const transform = entity.components.get('transform') as any;
      const velocity = entity.components.get('velocity') as any;

      if (!behavior || !transform || !velocity) continue;

      // Keep it simple: always chase target for now.
      // Evolve logic to use behavior.behaviors (WANDER, DASH, ZIGZAG) later.

      // Chase specific center target
      const dx = this.targetPos.x - transform.position.x;
      const dy = this.targetPos.y - transform.position.y;
      
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        // Normalize and scale by speed
        const dirX = dx / dist;
        const dirY = dy / dist;
        velocity.velocity.x = dirX * behavior.speed;
        velocity.velocity.y = dirY * behavior.speed;

        // Rotate bug towards walking direction (offset by PI/2 depending on sprite asset orientation)
        transform.rotation = Math.atan2(dirY, dirX) + Math.PI / 2;
      }
    }
  }

  setTarget(pos: Vec2): void {
    this.targetPos = pos;
  }
}
