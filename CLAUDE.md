# CLAUDE.md

이 파일은 Claude Code가 이 프로젝트에서 작업을 재개할 때 가장 먼저 읽는 문서다.
새 세션을 열 때마다 이 파일을 읽고 "지금 진행 상태 → 원칙 → 다음 할 일" 순으로
파악한 뒤 작업을 시작할 것.

---

## 0. 이 프로젝트가 무엇인가

**World Bomb War Universe** 세계관 속에서, 플레이어 한 명이 세계를 돌아다니며
핵전쟁으로 무너지는 세계를 직접 경험하는 탐험 게임.

플레이어는 전쟁의 지휘관이 아니라 세계를 돌아다니는 개인이다. 플레이어의 행동과
무관하게 세계에서 사건이 계속 발생하고(전쟁, 핵공격, 경제붕괴, 난민 발생 등),
플레이어는 이를 직접 목격하거나 뉴스/NPC를 통해 알게 된다.

핵심 경험 한 줄: **"내가 아무것도 하지 않아도 세계가 계속 변한다."**

### 기존 레포와의 관계 — 반드시 지킬 것

- 기존 레포: https://github.com/noah2byte/world-bomb-war-game
  (손 인식 기반 폭탄 해체 아케이드 게임. MediaPipe Hands + Canvas 2D.
  장르, 게임 루프, 아키텍처가 이 프로젝트와 완전히 다르다.)
- 이 프로젝트는 기존 게임의 **리메이크도, 확장도 아니다.** 같은 세계관을
  공유하는 **별개의 게임**이다.
- 기존 게임의 코드/게임플레이/장르를 그대로 가져오지 않는다.
- 두 게임은 국가/세력/역사/전쟁/핵공격 같은 세계관 데이터만 공유할 수 있다
  (지금 당장 공유 레포를 만들지는 않는다 — `src/lore/` 폴더가 나중에
  분리될 지점).

---

## 1. 지금까지 진행 상태 (마지막 갱신: 2026-09-02)

MVP 로드맵의 **1~3단계**가 구현되어 있다:

- [x] `WorldState` 모델 정의 (`src/world/worldState.js`)
- [x] 도시 3개 정적 데이터 (Seoul, Tokyo, London — `INITIAL_CITIES`)
- [x] `WorldEvent` 디스패치 구조 (`src/events/eventBus.js`, 레지스트리 패턴)
- [x] 첫 이벤트 `NuclearStrikeEvent` 완전 구현 (`src/events/nuclearStrike.js`)
- [x] `WorldEvent → NewsArticle` 자동 생성기 (`src/news/newsGenerator.js`)
- [x] 위 흐름을 눈으로 확인할 수 있는 디버그 화면 (`src/App.jsx`) —
      도시 카드에서 버튼을 누르면 NuclearStrikeEvent가 발생하고,
      CityState가 바뀌고, 뉴스가 생성되는 것을 실시간으로 볼 수 있다.
- [x] World Simulation 틱 하나 (`src/simulation/tick.js`) — 파괴 안 된
      도시의 economy를 매 틱 +1 회복 (`RECOVERY_RATES` 설정 객체 기반,
      필드 추가만으로 확장 가능). "다음 날로 진행" 버튼으로 확인.
- [x] 탐험 방향 결정 + 최소 프로토타입: **타일 기반 2D 걷기 RPG로 확정**
      (Phaser 3 엔진 계열 API 사용 — 실제 설치된 패키지는 최신 메이저
      버전인 **Phaser 4.2.1**이었고 API가 대체로 호환됐다). 화살표키로
      걸어다니는 캐릭터 + 카메라 추적만 되는 최소 Scene이
      `src/exploration/`에 있다 (`ExplorationView.jsx`가 React쪽 마운트
      래퍼, `scenes/PlaceholderScene.js`가 Phaser Scene). `App.jsx`에
      "탐험 (프로토타입)" 탭으로 붙어있다. **아직 WorldState와 연동되지
      않은 순수 프로토타입** — 폐허 표시, 도시별 맵, NPC 등은 전부 다음
      단계.

**아직 구현 안 됨** (의도적으로 비워둠):

- 탐험 프로토타입과 WorldState 연동 (파괴된 도시 → 폐허 타일 표시 등)
- 도시별 실제 타일맵 / 에셋 (지금은 색깔 사각형 placeholder)
- 세계지도 화면 (도시 간 이동)
- NPC 대사 시스템 (`src/npc/`는 README만 있음)
- `src/lore/`, `src/player/` — 폴더와 방향성 메모만 있고 실제 데이터/로직 없음
- 랜덤 세계 사건, 뉴스 UI, 플레이어 선택지 시스템

동작 확인 방법:
```bash
npm install
npm run dev
```
- "디버그" 탭: 도시 카드의 "[테스트] NuclearStrikeEvent 발생" 버튼을 누르면
  인구/경제/치안 등이 즉시 감소하고 하단에 뉴스가 뜨는 것을 확인할 수 있다.
  "[테스트] 다음 날로 진행" 버튼으로 day가 늘고 economy가 서서히 회복되는
  것도 볼 수 있다.
- "탐험 (프로토타입)" 탭: 화살표키로 캐릭터를 움직여볼 수 있다.

---

## 2. 바이브 코딩 작업 규칙 (반드시 지킬 것)

작업하는 사람은 게임 개발 전문가가 아니다. 따라서:

1. **절대 한 번에 거대한 기능을 구현하지 않는다.**
2. 항상 이 순서로 진행한다:
   ```
   분석 → 설계 → 작은 기능 구현 → 실행 → 테스트 → 수정 → Commit
   ```
3. **코드를 작성하기 전에 변경 범위를 먼저 설명한다.** 어떤 파일을 왜
   건드리는지 말하고 나서 코드를 쓴다.
4. 사용자가 승인하기 전에는 대규모 코드를 작성하지 않는다. 확신이 없으면
   먼저 계획만 제시하고 확인받는다.
5. 매 작업 단위가 끝나면 실제로 `npm run dev` / `npm run build` /
   `npm run lint` 로 검증 가능한 상태로 남긴다 — "코드는 썼는데 돌아가는지
   모르는" 상태로 끝내지 않는다.

## 3. 코드 작성 원칙

1. **Game Logic과 UI를 분리한다.** React 컴포넌트가 게임 로직을 직접
   처리하지 않는다. UI는 `src/world`, `src/events`, `src/simulation` 등이
   만든 상태를 구독/호출만 한다.
2. **WorldState 중심 설계.** 세계 상태는 `src/world/worldState.js`의
   `createInitialState()`가 만드는 하나의 명확한 객체로 관리한다.
3. **Event 기반 설계.** 세계의 주요 변화는 반드시 `WorldEvent` +
   `eventBus.registerEventHandler`를 통해 일어난다. 컴포넌트에서 직접
   `state.regions[x].population -= 1000` 같은 식으로 상태를 바꾸지 않는다.
4. **Data Driven.** 도시/국가/세력/이벤트 관련 데이터는 로직과 분리해서
   `src/lore/`, `src/world/worldState.js`의 데이터 배열에 둔다.
5. **확장 가능성이 최우선.** "새 도시 추가 = 데이터 한 줄 추가",
   "새 이벤트 추가 = `src/events/`에 파일 하나 추가"가 항상 성립해야 한다.
   이 원칙이 깨지는 방향으로 리팩터링해야 한다면, 먼저 사용자에게 알린다.

## 4. 아키텍처 폴더 구조

```
src/
├── world/        # WorldState 모델. 유일한 진실의 원천(source of truth).
├── events/        # WorldEvent 정의 + eventBus(레지스트리 패턴).
│                   새 이벤트 = 이 폴더에 파일 하나 추가.
├── simulation/     # World Simulation 틱 루프. economy 회복 하나만 구현됨.
├── lore/          # 세계관 데이터. 로직 없음. 아직 비어있음(README만 존재).
├── news/          # WorldEvent -> NewsArticle 변환 (템플릿 딕셔너리 패턴).
├── npc/           # NPC 대사 시스템. 아직 비어있음.
├── player/         # 플레이어 이동/인벤토리. 아직 비어있음.
├── exploration/    # Phaser 기반 타일 걷기 RPG 레이어. React는 마운트만
│                   담당(ExplorationView.jsx), 게임 로직은 scenes/ 아래
│                   Phaser Scene 클래스에 있음. 아직 WorldState 미연동
│                   (순수 프로토타입 — placeholder 타일/캐릭터).
└── App.jsx         # 현재는 MVP 디버그 뷰 + 탐험 프로토타입 탭. 다음
                     단계에서 실제 탐험 UI로 교체.
```

## 5. MVP 로드맵 (다음 할 일 순서)

1. ~~WorldState 모델 + 도시 3개 + 콘솔/화면 상태 출력~~ (완료)
2. ~~WorldEvent 1종(NuclearStrike) 완전 동작~~ (완료)
3. ~~World Simulation 틱 하나 추가~~ (완료 — `simulation/tick.js`,
   파괴 안 된 도시 economy +1/틱)
4. ~~탐험 방식 결정 + Phaser 프로토타입~~ (완료 — 타일 기반 2D 걷기 RPG로
   확정, `src/exploration/`에 화살표키 이동 + 카메라 추적만 되는 최소
   Scene. **아직 WorldState 미연동**)
5. **도시 타일맵 하나에 WorldState 연동** — Seoul 같은 도시 하나를 대상으로,
   `city.destroyed`/`radiationLevel` 등이 바뀌면 타일맵에 폐허/파편이
   실시간으로 반영되게 한다. "RPG 탐험 + WorldState"가 처음 만나는 지점.
   placeholder 사각형이 아니라 실제 타일 이미지로 바꾸는 것도 이 근처에서
   같이 다룰 수 있음.
6. 도시 간 이동 — 세계지도(또는 유사한 선택 화면)에서 다른 도시를 고르면
   그 도시의 타일맵으로 전환, `player.location` 갱신.
7. 랜덤 세계 사건 — 틱마다 낮은 확률로 `NuclearStrikeEvent` 같은 이벤트가
   자동 발생하도록.
8. 뉴스 UI 정리 — 지금은 디버그 리스트 수준이니 실제 "속보" 느낌으로.
9. NPC 대사 시스템 착수 — `npc/dialogue.js`에
   `(npcId, worldState) => string` 함수부터.

각 단계는 반드시 "분석 → 설계 → 구현 → 테스트 → Commit" 사이클로 쪼개서
진행한다. 한 세션에 여러 단계를 한 번에 하지 않는다.

## 6. 세계관 연결 원칙 (참고용, MVP 이후 단계에서 본격 적용)

기존 게임(`world-bomb-war-game`)에서 일어난 사건을, 이 게임에서는 다른
시점(개인 플레이어)에서 뉴스/소문으로 접하는 형태로 표현한다.

예:
- 기존 게임: "국가 A와 국가 B가 전쟁을 시작했다"
- 이 게임의 뉴스: `[뉴스] 국가 A와 국가 B의 전면전이 시작되었습니다.
  국경 지역으로 이동하는 민간인의 숫자가 급격하게 증가하고 있습니다.`

이 매핑을 실제로 구현하는 건 MVP 이후 — `src/lore/historicalEvents.js`가
만들어지는 시점에 착수한다.
