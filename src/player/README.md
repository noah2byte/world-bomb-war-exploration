# player/

플레이어 이동/인벤토리/선택지 로직 (마스터 프롬프트 5, 12번 섹션).

## 아직 미구현

현재 플레이어 상태는 `src/world/worldState.js`의 `player` 필드
(`{ location, inventory }`)로 최소한만 존재한다.

이동 기능을 구현할 때 이 폴더에 `movePlayer(state, targetRegionId)`
같은 순수 함수부터 추가할 것 — UI(지도 클릭 등)는 이 함수를 호출만
하도록 분리한다.
