import type { System } from '@typedefs/index';
import { ECSWorld } from '@core/ECS';
import { WebGLRenderer } from '@renderers/WebGLRenderer';

export class RenderSystem implements System {
  name = 'RenderSystem';
  priority: 'low' = 'low'; // Renders at the end of the frame
  enabled = true;

  constructor(private world: ECSWorld, private renderer: WebGLRenderer) {}

  update(deltaTime: number): void {
    // Game loop handles calling world.render(interpolation) separately
  }

  render(interpolation: number): void {
    const drawables = this.world.query('transform', 'sprite');
    
    // Sort by Y position for depth (poor man's Z sorting for top down)
    const sorted = [...drawables].sort((a, b) => {
      const ta = a.components.get('transform') as any;
      const tb = b.components.get('transform') as any;
      return ta.position.y - tb.position.y;
    });

    for (const entity of sorted) {
      if (!entity.active) continue;
      
      const transform = entity.components.get('transform') as any;
      const sprite = entity.components.get('sprite') as any;

      this.renderer.drawSprite(
        transform.position.x,
        transform.position.y,
        sprite.width * transform.scale.x,
        sprite.height * transform.scale.y,
        sprite.spriteKey,
        sprite.color,
        transform.rotation
      );
    }
  }
}
