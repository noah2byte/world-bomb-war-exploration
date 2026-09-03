// ─────────────────────────────────────────────────────────
// NuclearStrikeEvent
//
// MVP 1호 이벤트. 이 파일 하나가 "새 이벤트 추가 = 파일 하나"의
// 레퍼런스 구현이다. 다음 이벤트(예: MarketCrashEvent)를 추가할 때는
// 이 파일을 복사해서 팩토리 함수와 핸들러 로직만 바꾸면 된다.
//
// 수치는 임시 값이다. 밸런싱은 나중 단계에서 조정한다 — 지금은
// "이벤트 하나가 CityState 여러 필드에 연쇄적으로 영향을 준다"는
// 구조 자체를 검증하는 게 목적이다 (마스터 프롬프트 4번 섹션).
// ─────────────────────────────────────────────────────────

import { registerEventHandler } from './eventBus.js';

export function createNuclearStrikeEvent(regionId, day, time) {
  return {
    id: `nuclear-strike-${regionId}-${Date.now()}`,
    type: 'NuclearStrike',
    timestamp: { day, time },
    regionId,
    payload: {},
  };
}

registerEventHandler('NuclearStrike', (state, event) => {
  const region = state.regions[event.regionId];
  if (!region || region.destroyed) return state;

  const updatedRegion = {
    ...region,
    population: Math.floor(region.population * 0.85),
    infrastructure: Math.max(0, region.infrastructure - 60),
    economy: Math.max(0, region.economy - 50),
    security: Math.max(0, region.security - 40),
    foodSupply: Math.max(0, region.foodSupply - 45),
    communication: Math.max(0, region.communication - 30),
    radiationLevel: Math.min(100, region.radiationLevel + 40),
    stockIndex: Math.max(0, region.stockIndex - 45),
    politicalStability: Math.max(0, region.politicalStability - 35),
    transportationStatus: 'blocked',
    destroyed: true,
  };

  return {
    ...state,
    regions: {
      ...state.regions,
      [event.regionId]: updatedRegion,
    },
    globalIndices: {
      ...state.globalIndices,
      globalTension: Math.min(100, state.globalIndices.globalTension + 20),
      globalStockIndex: Math.max(0, state.globalIndices.globalStockIndex - 10),
    },
  };
});
