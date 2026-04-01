/**
 * BugSmasher AAA — Entry Point
 * Enterprise-grade HTML5 bug-smashing game
 */

import { GameInstance } from '@core/Game';
import { GameState } from '@typedefs/index';

async function main(): Promise<void> {
  try {
    // Initialize the game engine
    await GameInstance.initialize();

    // Start the game loop
    GameInstance.start();

    // Transition through boot sequence
    const sm = GameInstance.getStateMachine();
    await sm.transitionTo(GameState.LOADING);

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Go to main menu
    await sm.transitionTo(GameState.MENU);

  } catch (error) {
    console.error('Failed to start BugSmasher:', error);

    // Show error fallback
    const container = document.getElementById('game-container');
    if (container) {
      container.innerHTML = `
        <div style="
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          height: 100%; color: #ff3366; font-family: 'Inter', sans-serif; text-align: center; padding: 2rem;
        ">
          <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ Initialization Error</h1>
          <p style="color: rgba(255,255,255,0.6); max-width: 500px;">
            BugSmasher could not start. Please ensure your browser supports WebGL 2.0.
          </p>
          <pre style="
            margin-top: 1rem; padding: 1rem; background: rgba(255,255,255,0.05);
            border-radius: 8px; font-size: 0.8rem; color: #ff6b6b; max-width: 600px; overflow-x: auto;
          ">${error instanceof Error ? error.message : String(error)}</pre>
        </div>
      `;
    }
  }
}

// Boot when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
