// ─────────────────────────────────────────────────────────
// World Simulation tick
//
// 지금은 의도적으로 아무 것도 하지 않는다. MVP 1단계 목표는
// "WorldEvent가 WorldState를 바꾸는 구조"를 검증하는 것이지
// 자동 시뮬레이션이 아니다 (마스터 프롬프트 20번 MVP 순서상
// World Simulation은 5단계, 랜덤 세계 사건은 6단계).
//
// 다음 단계에서 여기에 추가할 것:
// - day/time 진행 로직
// - 파괴되지 않은 도시의 서서히 회복(infrastructure, economy 등)
// - 랜덤 이벤트 트리거 확률 계산
// ─────────────────────────────────────────────────────────

export function simulateTick(state) {
  return state;
}
