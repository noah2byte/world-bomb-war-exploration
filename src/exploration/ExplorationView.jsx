// ─────────────────────────────────────────────────────────
// ExplorationView
//
// Phaser 게임 인스턴스를 React 컴포넌트 트리 안에 마운트하는
// 얇은 래퍼. Phaser 쪽 로직(Scene)은 이 컴포넌트를 모르고,
// 이 컴포넌트도 Phaser 내부 로직을 모른다 — 마운트/언마운트만 담당.
//
// city prop(WorldState의 CityState)은 Phaser의 registry(게임 전역
// 데이터 저장소)에 넣어서 전달한다. Scene은 registry를 구독해서
// city.destroyed 같은 값이 바뀌면 스스로 타일을 다시 칠한다
// (React -> registry -> Scene, 단방향).
//
// 반대 방향(Scene -> React)은 registry가 아니라 Phaser의 game.events로
// 처리한다 — 캐릭터가 포털(우물)에 닿으면 Scene이 'portal-enter'
// 이벤트를 쏘고, 여기서 그걸 받아 onTravel(React state 갱신)을 호출한다.
// 집(침대)에서 쉬면 같은 방식으로 'rest' 이벤트를 쏘고, onRest(다음
// 날로 진행)를 호출한다.
// ─────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import PlaceholderScene from './scenes/PlaceholderScene.js';

export default function ExplorationView({ city, onTravel, onRest }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const onTravelRef = useRef(onTravel);
  const onRestRef = useRef(onRest);

  useEffect(() => {
    onTravelRef.current = onTravel;
    onRestRef.current = onRest;
  }, [onTravel, onRest]);

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
    game.events.on('portal-enter', (cityId) => onTravelRef.current?.(cityId));
    game.events.on('rest', () => onRestRef.current?.());
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
