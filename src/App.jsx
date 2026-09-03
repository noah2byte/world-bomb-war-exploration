import { useState, useCallback } from 'react';
import { createInitialState } from './world/worldState.js';
import { dispatchEvent } from './events/eventBus.js';
import { createNuclearStrikeEvent } from './events/nuclearStrike.js';
import './events/nuclearStrike.js'; // 핸들러를 eventBus에 등록하기 위한 side-effect import
import { generateNewsForEvent } from './news/newsGenerator.js';
import { simulateTick } from './simulation/tick.js';
import ExplorationView from './exploration/ExplorationView.jsx';
import './App.css';

// ─────────────────────────────────────────────────────────
// MVP 1단계 디버그 화면.
//
// 이 컴포넌트는 최종 UI가 아니다. 목적은 "WorldState -> WorldEvent ->
// 상태 변화 -> 뉴스 생성"이라는 데이터 흐름 하나가 실제로 동작하는지
// 확인하는 것 (CLAUDE.md의 MVP 로드맵 1단계).
//
// 다음 단계에서 여기를 세계지도 + 탐험 UI로 교체한다.
// ─────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState('debug'); // 'debug' | 'exploration'
  const [state, setState] = useState(() => createInitialState());
  const [news, setNews] = useState([]);

  const handleStrike = useCallback((regionId) => {
    setState((prev) => {
      const event = createNuclearStrikeEvent(regionId, prev.day, prev.time);
      const next = dispatchEvent(prev, event);

      const article = generateNewsForEvent(event, next);
      if (article) setNews((prevNews) => [article, ...prevNews]);

      return next;
    });
  }, []);

  const handleNextDay = useCallback(() => {
    setState((prev) => simulateTick(prev));
  }, []);

  return (
    <div className="debug-view">
      <h1>WORLD BOMB WAR — DAY {state.day}</h1>

      <div className="view-tabs">
        <button className={view === 'debug' ? 'active' : ''} onClick={() => setView('debug')}>
          디버그
        </button>
        <button
          className={view === 'exploration' ? 'active' : ''}
          onClick={() => setView('exploration')}
        >
          탐험 (프로토타입)
        </button>
      </div>

      {view === 'debug' ? (
        <>
          <p className="debug-note">
            WorldState 모델 검증용 디버그 화면입니다. 실제 탐험 UI는 다음 단계에서 만듭니다.
          </p>

          <button onClick={handleNextDay}>[테스트] 다음 날로 진행</button>

          <h2>지역 상태</h2>
          <div className="region-list">
            {Object.values(state.regions).map((region) => (
              <div className="region-card" key={region.id}>
                <strong>
                  {region.name} ({region.country})
                </strong>
                <div className="region-stats">
                  인구 {region.population.toLocaleString()} · 경제 {region.economy} · 치안{' '}
                  {region.security} · 방사능 {region.radiationLevel}
                </div>
                <button onClick={() => handleStrike(region.id)}>
                  [테스트] NuclearStrikeEvent 발생
                </button>
              </div>
            ))}
          </div>

          <h2>뉴스</h2>
          <ul className="news-list">
            {news.length === 0 && <li className="news-empty">아직 뉴스가 없습니다.</li>}
            {news.map((n) => (
              <li key={n.id}>
                DAY {n.day} {n.time} — {n.text}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <p className="debug-note">
            Seoul 지역의 destroyed 상태와 연동됩니다. 디버그 탭에서 Seoul에 핵공격을 발생시킨
            뒤 이 탭으로 돌아오면 맵이 폐허 색상으로 바뀝니다.
          </p>
          <ExplorationView city={state.regions.seoul} />
        </>
      )}
    </div>
  );
}
