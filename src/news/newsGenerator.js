// ─────────────────────────────────────────────────────────
// NewsGenerator
//
// 왜 템플릿 딕셔너리인가:
// 마스터 프롬프트 10번 섹션 — "뉴스는 직접 작성하는 방식만 사용하지
// 않는다. WorldEvent를 기반으로 자동 생성할 수 있어야 한다"를 만족시키기
// 위해, 이벤트 타입 -> 텍스트 생성 함수 매핑으로 분리했다.
// 향후 AI 뉴스 생성으로 교체할 때 이 파일의 TEMPLATES만 AI 호출로
// 바꾸면 되고, 호출부(App.jsx 등)는 변경할 필요가 없다.
// ─────────────────────────────────────────────────────────

const TEMPLATES = {
  NuclearStrike: (event, state) => {
    const region = state.regions[event.regionId];
    return `[속보] ${region.name} 지역에서 대규모 폭발이 발생했습니다. 현지 정부는 아직 공식 입장을 발표하지 않았습니다.`;
  },
};

export function generateNewsForEvent(event, state) {
  const template = TEMPLATES[event.type];
  if (!template) return null;

  return {
    id: `news-${event.id}`,
    day: event.timestamp.day,
    time: event.timestamp.time,
    text: template(event, state),
  };
}
