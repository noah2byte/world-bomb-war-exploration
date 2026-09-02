// ─────────────────────────────────────────────────────────
// World Simulation tick
//
// MVP 3단계: 아주 단순한 수학 모델 하나만 적용한다 — 파괴되지 않은
// 도시는 매 틱마다 RECOVERY_RATES에 정의된 만큼 서서히 회복된다.
//
// 확장 방법: RECOVERY_RATES에 필드를 하나 추가하면(예: infrastructure: 1)
// 그 스탯도 자동으로 회복 대상에 포함된다. 이 파일의 다른 부분은
// 건드릴 필요 없음 (worldState.js의 INITIAL_CITIES와 같은 패턴).
//
// 다음 단계에서 여기에 추가할 것:
// - time(시:분) 진행 로직
// - 랜덤 이벤트 트리거 확률 계산
// ─────────────────────────────────────────────────────────

const RECOVERY_RATES = {
  economy: 1,
};

function recoverCity(city) {
  if (city.destroyed) return city;

  const recovered = { ...city };
  for (const [stat, rate] of Object.entries(RECOVERY_RATES)) {
    recovered[stat] = Math.min(100, city[stat] + rate);
  }
  return recovered;
}

export function simulateTick(state) {
  const regions = {};
  for (const [id, city] of Object.entries(state.regions)) {
    regions[id] = recoverCity(city);
  }

  return {
    ...state,
    day: state.day + 1,
    regions,
  };
}
