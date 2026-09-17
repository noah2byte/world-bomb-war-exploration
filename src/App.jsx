import { useState, useCallback, useEffect } from 'react';
import { createInitialState } from './world/worldState.js';
import { dispatchEvent } from './events/eventBus.js';
import { createNuclearStrikeEvent } from './events/nuclearStrike.js';
import './events/nuclearStrike.js'; // 핸들러를 eventBus에 등록하기 위한 side-effect import
import { simulateTick } from './simulation/tick.js';
import ExplorationView from './exploration/ExplorationView.jsx';
import './App.css';

// ─────────────────────────────────────────────────────────
// 게임 화면 하나만 보여주는 최상위 컴포넌트. 디버그 탭은 없앴고,
// 테스트용 조작은 게임 화면 안 키보드 단축키로 대체했다:
// N = 현재 위치한 도시에 NuclearStrikeEvent 발생, T = 다음 날로 진행.
// ─────────────────────────────────────────────────────────

export default function App() {
  const [state, setState] = useState(() => createInitialState());

  const handleStrike = useCallback((regionId) => {
    setState((prev) => dispatchEvent(prev, createNuclearStrikeEvent(regionId, prev.day, prev.time)));
  }, []);

  const handleNextDay = useCallback(() => {
    setState((prev) => simulateTick(prev));
  }, []);

  const handleTravel = useCallback((cityId) => {
    setState((prev) => ({ ...prev, player: { ...prev.player, location: cityId } }));
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'n' || event.key === 'N') handleStrike(state.player.location);
      else if (event.key === 't' || event.key === 'T') handleNextDay();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [state.player.location, handleStrike, handleNextDay]);

  const city = state.regions[state.player.location];

  return (
    <div className="game-root">
      <div className="hud">
        <span className="hud-day">DAY {state.day}</span>
        <span className="hud-city">{city.name}</span>
        <span className="hud-hint">
          방향키 이동 · R 집에서 쉬기 · E 프로포즈 · N 핵공격(테스트) · T 다음날(테스트)
        </span>
      </div>
      <ExplorationView city={city} onTravel={handleTravel} onRest={handleNextDay} />
    </div>
  );
}
