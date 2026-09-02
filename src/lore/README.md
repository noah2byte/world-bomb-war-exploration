# lore/

세계관 데이터 전용 폴더. **로직을 넣지 않는다** — 순수 데이터(배열/객체)만.

마스터 프롬프트 15번 섹션 원칙: 세계관이 바뀌어도 게임 코드(`src/world`,
`src/events`, `src/simulation`)를 수정하지 않아도 되게 하기 위한 분리다.

## 앞으로 채울 파일들 (아직 미구현)

- `countries.js` — 국가 목록. 기존 `world-bomb-war-game/src/data/countries.js`의
  `cx, cy` 좌표 스키마를 그대로 재사용할 것.
- `cities.js` — `src/world/worldState.js`의 `INITIAL_CITIES`를 이 파일로
  옮기고 도시 수를 늘려나갈 곳.
- `factions.js` — 세력/진영 데이터.
- `historicalEvents.js` — `world-bomb-war-game`(기존 게임)에서 일어난
  사건을 이 새 게임의 뉴스/NPC 대사로 재활용할 때 참조할 타임라인.
- `timeline.js` — 두 게임이 공유하는 세계 연표.

지금 당장은 만들지 않는다 — MVP 1단계(도시 3개)에서는
`src/world/worldState.js`에 인라인으로 두고, 도시 수가 늘어나는 시점에
이 폴더로 옮긴다.
