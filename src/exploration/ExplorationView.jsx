// ─────────────────────────────────────────────────────────
// ExplorationView
//
// Phaser 게임 인스턴스를 React 컴포넌트 트리 안에 마운트하는
// 얇은 래퍼. Phaser 쪽 로직(Scene)은 이 컴포넌트를 모르고,
// 이 컴포넌트도 Phaser 내부 로직을 모른다 — 마운트/언마운트만 담당.
//
// city prop(WorldState의 CityState)은 Phaser의 registry(게임 전역
// 데이터 저장소)에 넣어서 전달한다. Scene은 registry를 구독해서
// city.destroyed 같은 값이 바뀌면 스스로 타일을 다시 칠한다.
// ─────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import PlaceholderScene from './scenes/PlaceholderScene.js';

export default function ExplorationView({ city }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return undefined;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      backgroundColor: '#111',
      scale: {
        mode: Phaser.Scale.RESIZE,
        parent: containerRef.current,
        width: '100%',
        height: '100%',
      },
      render: {
        pixelArt: true, // 나중에 실제 픽셀아트 타일셋을 넣을 때 흐려지지 않게
      },
      physics: {
        default: 'arcade',
        arcade: { debug: false },
      },
      scene: [PlaceholderScene],
    });
    game.registry.set('city', city);
    gameRef.current = game;

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    gameRef.current?.registry.set('city', city);
  }, [city]);

  return <div className="exploration-view" ref={containerRef} />;
}
