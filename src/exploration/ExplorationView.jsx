// ─────────────────────────────────────────────────────────
// ExplorationView
//
// Phaser 게임 인스턴스를 React 컴포넌트 트리 안에 마운트하는
// 얇은 래퍼. Phaser 쪽 로직(Scene)은 이 컴포넌트를 모르고,
// 이 컴포넌트도 Phaser 내부 로직을 모른다 — 마운트/언마운트만 담당.
// ─────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import PlaceholderScene, { TILE_SIZE, VIEWPORT_TILES } from './scenes/PlaceholderScene.js';

export default function ExplorationView() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return undefined;

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: VIEWPORT_TILES.width * TILE_SIZE,
      height: VIEWPORT_TILES.height * TILE_SIZE,
      backgroundColor: '#111',
      physics: {
        default: 'arcade',
        arcade: { debug: false },
      },
      scene: [PlaceholderScene],
    });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div className="exploration-view" ref={containerRef} />;
}
