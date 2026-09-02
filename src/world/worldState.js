// ─────────────────────────────────────────────────────────
// WorldState 모델
//
// 왜 이런 구조인가:
// - regions를 배열이 아닌 dictionary(id -> CityState)로 둔 이유는
//   "도시 하나 추가 = 데이터 하나 추가"를 만족시키기 위함.
//   배열이면 검색/갱신 시 순회가 필요하지만 dictionary는 O(1) 접근이 가능하다.
// - eventLog를 따로 두는 이유는 향후 뉴스 재구성, NPC 대사 분기,
//   "왜 이 도시가 이렇게 됐는가"를 플레이어에게 설명할 때
//   원인이 된 과거 이벤트를 참조해야 하기 때문.
// ─────────────────────────────────────────────────────────

/**
 * CityState — 도시 하나의 상태.
 * 필드는 마스터 프롬프트 7번 섹션의 정의를 그대로 따른다.
 */
export function createCity({ id, name, country, cx, cy, population }) {
  return {
    id,
    name,
    country,
    cx, // 세계지도 위 정규화 x 좌표 (0~1) — 기존 world-bomb-war-game의 countries.js 좌표 스키마 재사용
    cy,

    population,
    infrastructure: 100,
    economy: 100,
    security: 90,
    foodSupply: 90,
    waterSupply: 90,
    communication: 100,

    radiationLevel: 0,
    stockIndex: 100,
    politicalStability: 90,
    transportationStatus: 'normal', // 'normal' | 'restricted' | 'blocked'

    destroyed: false,
  };
}

/**
 * MVP 단계: 도시 3개로 시작한다 (프롬프트 20번 MVP 순서 3단계).
 * 좌표는 기존 world-bomb-war-game/src/data/countries.js 에서 그대로 가져왔다.
 * 새 도시를 추가하려면 이 배열에 한 줄만 추가하면 된다.
 */
const INITIAL_CITIES = [
  { id: 'seoul', name: 'Seoul', country: 'South Korea', cx: 0.778, cy: 0.35, population: 9_400_000 },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', cx: 0.793, cy: 0.34, population: 13_960_000 },
  { id: 'london', name: 'London', country: 'United Kingdom', cx: 0.455, cy: 0.27, population: 8_980_000 },
];

export function createInitialState() {
  const regions = {};
  for (const cityDef of INITIAL_CITIES) {
    regions[cityDef.id] = createCity(cityDef);
  }

  return {
    day: 1,
    time: '09:00',
    regions,
    globalIndices: {
      globalStockIndex: 100,
      globalTension: 0,
      refugeeTotal: 0,
    },
    activeEvents: [],
    eventLog: [],
    player: {
      location: 'seoul',
      inventory: [],
    },
  };
}
