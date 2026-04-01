import type { System, TransformComponent, SpriteComponent } from '@typedefs/index';
import { ECSWorld } from '@core/ECS';
import { WebGLRenderer } from '@renderers/WebGLRenderer';
import { Camera } from '@core/Camera';

export class RenderSystem implements System {
  name = 'RenderSystem';
  priority: 'low' = 'low';
  enabled = true;

  constructor(private world: ECSWorld, private renderer: WebGLRenderer, private camera: Camera) {}

  update(deltaTime: number): void {
    // Game loop handles calling world.render(interpolation) separately
  }

  render(interpolation: number): void {
    const drawables = this.world.query('transform', 'sprite');
    
    // Simple Z-sorting by Y position
    const sorted = [...drawables].sort((a, b) => {
      const ta = this.world.getComponentFromEntity<TransformComponent>(a, 'transform');
      const tb = this.world.getComponentFromEntity<TransformComponent>(b, 'transform');
      return (ta?.position.y || 0) - (tb?.position.y || 0);
    });

    for (const entity of sorted) {
      if (!entity.active) continue;
      
      const transform = this.world.getComponentFromEntity<TransformComponent>(entity, 'transform');
      const sprite = this.world.getComponentFromEntity<SpriteComponent>(entity, 'sprite');

      if (!transform || !sprite) continue;

      // Transform world position to screen position via camera
      const screenPos = this.camera.worldToScreen(transform.position);
      const scale = this.camera.getZoom();

      this.renderer.drawSprite(
        screenPos.x,
        screenPos.y,
        sprite.width * transform.scale.x * scale,
        sprite.height * transform.scale.y * scale,
        sprite.spriteKey,
        sprite.color,
        transform.rotation
      );
    }
  }
}
