// ─────────────────────────────────────────────────────────
// EventBus
//
// 왜 레지스트리 패턴인가:
// 마스터 프롬프트 9번/19번 원칙 — "새로운 이벤트를 추가할 때 기존 코드를
// 대규모로 수정하지 않아도 되게 만든다"를 지키기 위해, 각 이벤트 타입이
// 자기 자신의 핸들러를 스스로 등록하는 방식을 쓴다.
// 새 이벤트를 추가할 때 이 파일은 절대 건드릴 필요가 없고,
// events/ 아래에 새 파일 하나만 만들면 된다 (예: events/marketCrash.js).
// ─────────────────────────────────────────────────────────

const handlers = {};

/**
 * 이벤트 타입별 핸들러를 등록한다.
 * 각 이벤트 정의 파일(예: nuclearStrike.js)에서 모듈 로드 시점에 호출한다.
 */
export function registerEventHandler(type, handler) {
  handlers[type] = handler;
}

/**
 * WorldEvent를 WorldState에 적용하고, 적용 결과와 eventLog가 갱신된
 * 새 WorldState를 반환한다. 원본 state는 변경하지 않는다(불변성 유지).
 */
export function dispatchEvent(state, event) {
  const handler = handlers[event.type];
  if (!handler) {
    console.warn(`[EventBus] "${event.type}" 타입에 등록된 핸들러가 없습니다.`);
    return state;
  }

  const nextState = handler(state, event);
  return {
    ...nextState,
    eventLog: [...state.eventLog, event],
  };
}
