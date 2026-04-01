import type { System } from '@typedefs/index';
import { ECSWorld } from '@core/ECS';

export class MovementSystem implements System {
  name = 'MovementSystem';
  priority = 'high' as const;
  enabled = true;

  constructor(private world: ECSWorld) {}

  update(deltaTime: number): void {
    const entities = this.world.query('transform', 'velocity');
    for (const entity of entities) {
      const transform = entity.components.get('transform') as any;
      const velocity = entity.components.get('velocity') as any;

      if (!transform || !velocity) continue;

      transform.position.x += velocity.velocity.x * deltaTime;
      transform.position.y += velocity.velocity.y * deltaTime;
      transform.rotation += velocity.angularVelocity * deltaTime;
    }
  }
}
