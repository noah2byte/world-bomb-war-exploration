// ─────────────────────────────────────────────────────────
// PlaceholderScene
//
// 탐험 프로토타입 3단계: Kenney "Tiny Farm" 팩(CC0 라이선스, 16x16
// 픽셀아트)을 사용해 잔디/흙 바닥 + 캐릭터 + 나무/바위/꽃 장식을 그린다.
// 색깔 사각형 placeholder는 여기서 끝 — 실제 스프라이트 기반이다.
//
// 바닥과 장식 모두 GROUND_POOL / DECORATION_POOL 가중치 목록에서
// 고른다 — 다양성을 늘리려면 이 목록에 프레임 하나만 추가하면 된다.
//
// 에셋 출처: https://kenney.nl/assets/tiny-farm (License.txt 동봉)
// 이 팩은 이름 그대로 "농장" 테마라 헛간/작물 위주라, 도시(서울) 전용
// 타일(건물/도로/폐허)은 나중에 별도 팩으로 보강해야 한다.
//
// city 데이터는 이 Scene이 직접 모르고, Phaser의 registry(게임 전역
// 데이터 저장소)를 통해 ExplorationView.jsx로부터 전달받는다
// (React state -> registry -> Scene, 단방향).
//
// destroyed 표현: 별도 폐허 타일 에셋이 없어서, 타일마다 미리 정해둔
// 그을림 정도(tileBurn/decorationBurn)에 따라 회색~검정 3단계로 어둡게
// 칠하고(균일하지 않게, "군데군데 탄" 느낌), 몇 군데에 불꽃 파티클을
// 띄운다. 불꽃 텍스처는 에셋 없이 Graphics로 코드에서 직접 생성한다.
// 캐릭터가 destroyed 상태에서 불꽃에 가까이 가면 게임오버(GAME OVER
// 화면 + Space로 재시작).
//
// 걷기 프레임이 없어서(정지 포즈 1개) 이동 중엔 squash&stretch로
// "걷는 느낌"을 흉내내고, 풀 덤불 근처를 지나가면 그 덤불이 흔들린다.
// 추가로 그림자(발밑에 항상 붙어다님), 발자국 먼지 파티클, 카메라
// lerp(부드럽게 따라오기)로 이동감을 보강했다.
//
// 배회하는 동물(양/소/닭)을 도시마다 8마리 흩뿌려서 세계가 비어있지
// 않다는 느낌을 준다 — 각자 spawn 지점 근처에서만 랜덤하게 움직인다.
// 캐릭터와는 물리 충돌(collider)이 있어서 서로 부딪히면 밀린다.
//
// Y좌표 기반 깊이 정렬(setDepth) — 캐릭터/동물/장식 모두 y값을 depth로
// 써서, 화면 위쪽에 있을 땐 나무/덤불 뒤로 가려지고 아래로 내려오면
// 앞으로 나온다. 수풀을 헤치고 지나가는 느낌을 위한 장치.
//
// 집(오두막): 우물 반대쪽 고정 위치에 벽 + 지붕 + 문으로 지어져 있다
// (HOUSE_LAYOUT). 벽은 정적 물리 바디(staticGroup)라 실제로 못 지나가고,
// 문 자리만 뚫려있어서 거길 통해서만 안쪽 침대까지 갈 수 있다. 침대
// 근처(안쪽)에서 R을 누르면 잠깐 못 움직이는 "쉬는 중" 연출 후
// game.events로 'rest'를 쏜다 — ExplorationView.jsx가 받아서 onRest
// (다음 날 진행, T 테스트 키와 같은 효과)를 호출한다.
//
// 도시별 맵: city.id로 만든 고정 시드로 지형을 생성한다 — 도시마다
// 다르지만 매번 같은 배치. 장식 비중도 도시마다 달라서(CITY_DECORATION_
// WEIGHTS) 숲/꽃밭/돌밭처럼 조금씩 다른 인상을 준다. ExplorationView가
// registry의 'city'를 바꾸면, id가 달라진 경우(다른 도시로 이동)엔
// scene.restart()로 통째로 다시 만들고, id가 같은 경우(같은 도시의
// destroyed만 바뀜)엔 applyCityState()로 가볍게 갱신만 한다.
//
// 우물(포털): 스폰 지점에서 몇 칸 떨어진 고정된 자리에 우물 타일이
// 하나 있고, 캐릭터가 닿으면 game.events로 'portal-enter'를 쏜다.
// 이건 registry와 반대 방향(Scene -> React)이라 registry 대신
// game.events를 쓴다 — ExplorationView.jsx가 이걸 구독해서
// onTravel(WorldState.player.location 갱신)을 호출한다. 다음 도시는
// 고정된 순환 순서(CITY_ORDER)로 정한다 — 진짜 세계지도가 생기기 전까지의
// 임시 방편.
//
// 동반자 NPC: 청혼하기 전엔 고정된 자리에 서 있다가, 가까이서 E를
// 누르면 프로포즈 — 이 프로토타입에서는 항상 수락된다. 결혼하면
// 플레이어의 발자취(playerTrail, 150ms마다 기록)를 그대로 따라오는
// 방식으로 뒤따라다닌다. 결혼 여부는 registry에 저장해서 도시를
// 옮겨도(scene.restart) 유지되지만, WorldState(React)까지는 아직
// 연결 안 됨 — Tiny Farm 팩엔 성별 구분 스프라이트가 없어서 다른
// 머리색의 같은 캐릭터를 쓴다.
//
// 다음 단계에서 여기에 추가할 것:
// - 도시(서울) 전용 타일(건물/도로/실제 폐허 잔해)
// - 진짜 걷기 스프라이트 애니메이션 (매칭되는 캐릭터 시트가 생기면)
// - 좌표 기반 진짜 세계지도 (지금 우물 순환은 임시)
// - 결혼 상태를 WorldState(player.married)로 옮기기
// ─────────────────────────────────────────────────────────

import Phaser from 'phaser';
import tinyFarmUrl from '../assets/tiny-farm/tilemap_packed.png';

export const TILE_SIZE = 32;
export const MAP_TILES = { width: 80, height: 50 };

const SOURCE_TILE_SIZE = 16; // Tiny Farm 팩의 원본 타일 크기
const TILE_SCALE = TILE_SIZE / SOURCE_TILE_SIZE;

// tilemap_packed.png 안에서의 프레임 인덱스 (12열 x 11행, 0부터 시작)
const PLAYER_FRAME = 109;

// weight가 클수록 더 자주 나온다. 흙 패치는 색이 튀어서(초록 위 주황)
// 조금만 섞어도 눈에 잘 띄기 때문에 비중을 낮게 잡았다.
const GROUND_POOL = [
  { frame: 119, weight: 47 }, // 잔디
  { frame: 105, weight: 47 }, // 잔디(반점 무늬)
  { frame: 0, weight: 3 }, // 흙 패치
  { frame: 1, weight: 3 }, // 흙 패치
];
const GRASS_TUFT_FRAME = 80; // 캐릭터가 가까이 지나가면 흔들리는 장식
const TREE_FRAME = 15;
const SUNFLOWER_FRAME = 83;
const BERRY_BUSH_FRAME = 78;
const ROCK_FRAME = 89;

// 도시마다 장식 비중을 다르게 줘서 "이 도시는 뭔가 다르다"는 느낌을
// 낸다 — 같은 팩(Tiny Farm) 안에서 할 수 있는 최소한의 차별화다.
// 진짜 도시별 에셋이 생기기 전까지의 임시 방편.
const CITY_DECORATION_WEIGHTS = {
  seoul: { [TREE_FRAME]: 45, [GRASS_TUFT_FRAME]: 20, [SUNFLOWER_FRAME]: 10, [BERRY_BUSH_FRAME]: 15, [ROCK_FRAME]: 10 }, // 숲이 빽빽함
  tokyo: { [TREE_FRAME]: 15, [GRASS_TUFT_FRAME]: 20, [SUNFLOWER_FRAME]: 35, [BERRY_BUSH_FRAME]: 20, [ROCK_FRAME]: 10 }, // 꽃이 화사함
  london: { [TREE_FRAME]: 20, [GRASS_TUFT_FRAME]: 15, [SUNFLOWER_FRAME]: 5, [BERRY_BUSH_FRAME]: 10, [ROCK_FRAME]: 50 }, // 돌/황량함
};
const DEFAULT_DECORATION_WEIGHTS = {
  [TREE_FRAME]: 35,
  [GRASS_TUFT_FRAME]: 25,
  [SUNFLOWER_FRAME]: 15,
  [BERRY_BUSH_FRAME]: 15,
  [ROCK_FRAME]: 10,
};

function decorationPoolFor(cityId) {
  const weights = CITY_DECORATION_WEIGHTS[cityId] ?? DEFAULT_DECORATION_WEIGHTS;
  return Object.entries(weights).map(([frame, weight]) => ({ frame: Number(frame), weight }));
}

const DECORATION_COUNT = 80;
const FIRE_COUNT = 10;
const FIRE_HIT_DISTANCE = TILE_SIZE * 0.5;
const RUSTLE_DISTANCE = TILE_SIZE * 0.8;

// 우물(포털) — 캐릭터가 닿으면 다음 도시로 이동한다. 정식 세계지도가
// 생기기 전까지의 임시 이동 수단: 고정된 순환 순서(seoul -> tokyo ->
// london -> seoul)로 다음 도시를 정한다.
const WELL_FRAME = 85;
const CITY_ORDER = ['seoul', 'tokyo', 'london'];
const PORTAL_HIT_DISTANCE = TILE_SIZE * 0.6;
const PORTAL_OFFSET_TILES = { x: 4, y: 2 }; // 스폰 지점에서 이 정도 떨어진 곳에 배치

function nextCityId(currentId) {
  const idx = CITY_ORDER.indexOf(currentId);
  if (idx === -1) return CITY_ORDER[0];
  return CITY_ORDER[(idx + 1) % CITY_ORDER.length];
}

// 집(오두막) — 벽으로 둘러싸여 있고 문으로만 들어갈 수 있다. 안쪽에
// 침대가 있고, 거기서 쉬면 하루가 지나간다(T 테스트 키와 같은 효과 —
// simulateTick 트리거). 문 타일 위치를 기준(상대 0,0)으로 나머지를
// 배치한다: 뒷벽(y=-2), 내부/침대(y=-1), 문이 있는 앞벽(y=0).
const BED_FRAME = 111;
const WALL_FRAME = 114;
const WINDOW_FRAME = 128;
const DOOR_FRAME = 103;
const ROOF_FRAMES = [93, 94, 95];
const HOUSE_DOOR_OFFSET_TILES = { x: -4, y: -2 }; // 스폰 지점 기준 문 가운데 칸 위치
// 문을 처음엔 1칸, 그다음 2칸으로 했는데도 캐릭터가 키 입력 타이밍에 따라
// 옆벽에 걸리는 경우가 있어서(테스트 중 발견) 3칸으로 넉넉하게 넓혔다.
const HOUSE_LAYOUT = [
  // { dx, dy, frame, solid } — dx,dy는 문 가운데 칸(0,0) 기준 상대 좌표
  { dx: -2, dy: -3, frame: ROOF_FRAMES[0], solid: false },
  { dx: -1, dy: -3, frame: ROOF_FRAMES[1], solid: false },
  { dx: 0, dy: -3, frame: ROOF_FRAMES[1], solid: false },
  { dx: 1, dy: -3, frame: ROOF_FRAMES[1], solid: false },
  { dx: 2, dy: -3, frame: ROOF_FRAMES[2], solid: false },
  { dx: -2, dy: -2, frame: WALL_FRAME, solid: true },
  { dx: -1, dy: -2, frame: WINDOW_FRAME, solid: true },
  { dx: 0, dy: -2, frame: WINDOW_FRAME, solid: true },
  { dx: 1, dy: -2, frame: WINDOW_FRAME, solid: true },
  { dx: 2, dy: -2, frame: WALL_FRAME, solid: true },
  { dx: -2, dy: -1, frame: WALL_FRAME, solid: true },
  { dx: 2, dy: -1, frame: WALL_FRAME, solid: true },
  { dx: -2, dy: 0, frame: WALL_FRAME, solid: true },
  { dx: -1, dy: 0, frame: DOOR_FRAME, solid: false }, // 문
  { dx: 0, dy: 0, frame: DOOR_FRAME, solid: false }, // 문(가운데)
  { dx: 1, dy: 0, frame: DOOR_FRAME, solid: false }, // 문
  { dx: 2, dy: 0, frame: WALL_FRAME, solid: true },
];
const REST_DISTANCE = TILE_SIZE * 1.2;
const REST_DURATION = 1300; // ms — "쉬는 중" 연출 시간

// 배회하는 동물들 — 세계가 비어있지 않다는 느낌을 주기 위한 장식용
// 생명체. 자기 집(spawn 지점) 근처를 벗어나지 않고 랜덤하게 어슬렁거린다.
const CRITTER_FRAMES = [120, 121, 122]; // 양, 소, 닭
const CRITTER_COUNT = 8;
const CRITTER_SPEED = 28;
const CRITTER_WANDER_RADIUS = TILE_SIZE * 3;

const STEP_INTERVAL = 220; // ms — 이동 중 이 주기로 발자국 먼지를 하나씩 남긴다

// 동반자 NPC — 프로포즈를 수락하면 캐릭터를 뒤따라다닌다.
// 결혼 여부는 registry에 저장해서 도시를 옮겨도(scene.restart) 유지된다
// (WorldState까지 연결하는 건 나중 단계 — 지금은 Phaser 쪽에서만 기억함).
const COMPANION_FRAME = 108; // Tiny Farm 팩엔 성별 구분 스프라이트가 없어서 다른 머리색의 같은 캐릭터를 쓴다
const COMPANION_OFFSET_TILES = { x: 0, y: 6 }; // 청혼하기 전, 스폰 지점 기준 위치
const PROPOSE_DISTANCE = TILE_SIZE * 1.2;
const PROPOSE_DURATION = 1200; // ms — "청혼 중..." 연출 시간
const TRAIL_SAMPLE_INTERVAL = 150; // ms마다 플레이어 위치를 발자취로 기록
const TRAIL_MAX_LENGTH = 12; // 발자취를 얼마나 오래 따라오게 할지(칸 수)
const COMPANION_SPEED = 140;
const COMPANION_CATCH_UP_DISTANCE = 6; // 이 거리 안에 들어오면 다음 발자취로 넘어간다

// 세계 좌표에 떠 있는 라벨/이펙트용 depth. 캐릭터/장식은 y값을 depth로
// 쓰기 때문에(최대 MAP_TILES.height*TILE_SIZE 정도) 그보다 훨씬 큰
// 고정값을 써야 라벨이 캐릭터한테 가려지지 않는다.
const LABEL_DEPTH = 2000;
const GAME_OVER_DEPTH = 3000;

const NORMAL_TINT = 0xffffff;
// 그을림 정도(0~1)에 따른 3단계 팔레트 — 균일하지 않은 "군데군데 탄" 느낌을 위해
const BURN_TINTS = [0x555555, 0x333333, 0x1a1a1a];

function burnTintFor(intensity) {
  if (intensity > 0.8) return BURN_TINTS[2];
  if (intensity > 0.5) return BURN_TINTS[1];
  return BURN_TINTS[0];
}

function weightedPick(pool, rand) {
  const total = pool.reduce((sum, item) => sum + item.weight, 0);
  let r = rand() * total;
  for (const item of pool) {
    if (r < item.weight) return item.frame;
    r -= item.weight;
  }
  return pool[pool.length - 1].frame;
}

// city.id로부터 고정 시드를 만든다 — 도시마다 다른(하지만 매번 똑같은) 지형이 나오게.
function hashSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0x7fffffff;
  }
  return hash || 1; // 0이면 LCG가 계속 0만 반환하므로 피한다
}

export default class PlaceholderScene extends Phaser.Scene {
  constructor() {
    super('PlaceholderScene');
  }

  preload() {
    this.load.spritesheet('tinyFarm', tinyFarmUrl, {
      frameWidth: SOURCE_TILE_SIZE,
      frameHeight: SOURCE_TILE_SIZE,
    });
  }

  create() {
    const city = this.registry.get('city');
    this.currentCityId = city?.id;

    // city.id 기반 고정 시드 — 도시마다 다른 지형이 나오지만, 같은
    // 도시는 항상 같은 배치로 재생성된다(디버깅 편의 + 재시작 시 일관성).
    let seed = hashSeed(city?.id ?? 'default');
    const nextRandom = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };

    this.tiles = [];
    this.tileBurn = [];
    for (let y = 0; y < MAP_TILES.height; y++) {
      const row = [];
      const burnRow = [];
      for (let x = 0; x < MAP_TILES.width; x++) {
        const tile = this.add.image(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          'tinyFarm',
          weightedPick(GROUND_POOL, nextRandom),
        );
        tile.setScale(TILE_SCALE);
        row.push(tile);
        burnRow.push(nextRandom()); // 이 타일이 destroyed일 때 얼마나 탄 것처럼 보일지
      }
      this.tiles.push(row);
      this.tileBurn.push(burnRow);
    }

    // 나무/바위/꽃 등 장식 — 지형 위에 흩뿌린다. 도시마다 비중이 다르다.
    const decorationPool = decorationPoolFor(city?.id);
    this.decorations = [];
    this.decorationBurn = [];
    this.grassTufts = []; // 캐릭터가 가까이 가면 흔들릴 대상만 따로 모아둠
    for (let i = 0; i < DECORATION_COUNT; i++) {
      const tx = Math.floor(nextRandom() * MAP_TILES.width);
      const ty = Math.floor(nextRandom() * MAP_TILES.height);
      const frame = weightedPick(decorationPool, nextRandom);
      const decoration = this.add.image(
        tx * TILE_SIZE + TILE_SIZE / 2,
        ty * TILE_SIZE + TILE_SIZE / 2,
        'tinyFarm',
        frame,
      );
      decoration.setScale(TILE_SCALE);
      decoration.setDepth(decoration.y); // Y가 클수록(화면 아래) 위에 그려짐 — 캐릭터가 뒤/앞으로 지나가는 느낌
      this.decorations.push(decoration);
      this.decorationBurn.push(nextRandom());
      if (frame === GRASS_TUFT_FRAME) this.grassTufts.push(decoration);
    }

    // 배회하는 동물들 — 각자 집 근처(homeX, homeY)에서만 어슬렁거린다.
    this.critters = [];
    for (let i = 0; i < CRITTER_COUNT; i++) {
      const homeX = Math.floor(nextRandom() * MAP_TILES.width) * TILE_SIZE + TILE_SIZE / 2;
      const homeY = Math.floor(nextRandom() * MAP_TILES.height) * TILE_SIZE + TILE_SIZE / 2;
      const frame = CRITTER_FRAMES[Math.floor(nextRandom() * CRITTER_FRAMES.length)];

      const critter = this.add.sprite(homeX, homeY, 'tinyFarm', frame);
      critter.setScale(TILE_SCALE);
      this.physics.add.existing(critter);
      critter.body.setCollideWorldBounds(true);
      critter.homeX = homeX;
      critter.homeY = homeY;
      critter.nextMoveAt = 0;
      this.critters.push(critter);
    }

    // 불꽃 파티클 — 에셋 없이 코드로 작은 원형 텍스처를 만들어 쓴다.
    const fireGraphics = this.add.graphics();
    fireGraphics.fillStyle(0xffffff, 1);
    fireGraphics.fillCircle(4, 4, 4);
    fireGraphics.generateTexture('fireParticle', 8, 8);
    fireGraphics.destroy();

    this.fireEmitters = [];
    this.firePositions = [];
    for (let i = 0; i < FIRE_COUNT; i++) {
      const fx = Math.floor(nextRandom() * MAP_TILES.width) * TILE_SIZE + TILE_SIZE / 2;
      const fy = Math.floor(nextRandom() * MAP_TILES.height) * TILE_SIZE + TILE_SIZE / 2;
      const emitter = this.add.particles(fx, fy, 'fireParticle', {
        speed: { min: 8, max: 24 },
        angle: { min: 260, max: 280 },
        scale: { start: 1.2, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 500,
        frequency: 90,
        tint: [0xffcc33, 0xff6622, 0xff3300],
      });
      emitter.stop(); // 평소엔 꺼져 있다가 destroyed일 때만 타오른다
      this.fireEmitters.push(emitter);
      this.firePositions.push({ x: fx, y: fy });
    }

    // 발자국 먼지 — 걸을 때마다 살짝씩 튀어서 땅을 밟는 느낌을 준다.
    const dustGraphics = this.add.graphics();
    dustGraphics.fillStyle(0xd8cfa8, 1);
    dustGraphics.fillCircle(3, 3, 3);
    dustGraphics.generateTexture('dustParticle', 6, 6);
    dustGraphics.destroy();

    this.dustEmitter = this.add.particles(0, 0, 'dustParticle', {
      speed: { min: 4, max: 14 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.45, end: 0 },
      lifespan: 300,
      emitting: false,
    });
    this.stepTimer = 0;

    // 우물(포털) — 여기 닿으면 다음 도시로 이동한다.
    this.portalTargetId = nextCityId(city?.id);
    const portalX = (MAP_TILES.width / 2 + PORTAL_OFFSET_TILES.x) * TILE_SIZE + TILE_SIZE / 2;
    const portalY = (MAP_TILES.height / 2 + PORTAL_OFFSET_TILES.y) * TILE_SIZE + TILE_SIZE / 2;
    this.portalPosition = { x: portalX, y: portalY };
    this.add.image(portalX, portalY, 'tinyFarm', WELL_FRAME).setScale(TILE_SCALE);
    this.add
      .text(portalX, portalY - TILE_SIZE, `→ ${this.portalTargetId}`, {
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5)
      .setDepth(LABEL_DEPTH);
    this.portalTriggered = false;

    // 집(오두막) — 문으로만 드나들 수 있게 벽으로 둘러싼다.
    const doorX = (MAP_TILES.width / 2 + HOUSE_DOOR_OFFSET_TILES.x) * TILE_SIZE + TILE_SIZE / 2;
    const doorY = (MAP_TILES.height / 2 + HOUSE_DOOR_OFFSET_TILES.y) * TILE_SIZE + TILE_SIZE / 2;
    this.houseWalls = this.physics.add.staticGroup();
    for (const part of HOUSE_LAYOUT) {
      const px = doorX + part.dx * TILE_SIZE;
      const py = doorY + part.dy * TILE_SIZE;
      if (part.solid) {
        const wall = this.houseWalls.create(px, py, 'tinyFarm', part.frame);
        wall.setScale(TILE_SCALE).setDepth(py).refreshBody();
      } else {
        this.add.image(px, py, 'tinyFarm', part.frame).setScale(TILE_SCALE).setDepth(py);
      }
    }
    // 침대는 문에서 한 칸 안쪽(내부)에 둔다 — 벽을 거치지 않고는 닿을 수 없다.
    const homeX = doorX;
    const homeY = doorY - TILE_SIZE;
    this.homePosition = { x: homeX, y: homeY };
    this.add.image(homeX, homeY, 'tinyFarm', BED_FRAME).setScale(TILE_SCALE).setDepth(homeY);
    this.homeHint = this.add
      .text(homeX, homeY - TILE_SIZE, 'R: 쉬기', {
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5)
      .setDepth(LABEL_DEPTH)
      .setVisible(false);
    this.resting = false;
    this.input.keyboard.on('keydown-R', () => {
      if (this.canRest) this.startResting();
    });

    this.gameOver = false;
    this.walkTime = 0;
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.gameOver) this.scene.restart();
    });

    // this.registry는 Scene이 아니라 Game 전체가 공유하는 객체라서,
    // 여기서 등록한 리스너는 scene.restart()로도 저절로 없어지지 않는다.
    // shutdown 시점에 직접 떼어내지 않으면 재시작할 때마다 리스너가 쌓인다.
    const onCityChange = (_parent, nextCity) => {
      if (nextCity?.id !== this.currentCityId) {
        // 다른 도시로 이동 — 지형 자체가 바뀌어야 하므로 Scene을 통째로 재생성
        this.scene.restart();
        return;
      }
      this.applyCityState(nextCity);
    };
    this.registry.events.on('changedata-city', onCityChange);
    this.events.once('shutdown', () => {
      this.registry.events.off('changedata-city', onCityChange);
    });

    // 캐릭터 그림자 — 발밑에 깔아서 공중에 뜬 느낌이 아니라 땅을 딛고
    // 있는 느낌을 준다. player보다 먼저 추가해야 아래에 그려진다.
    const shadowGraphics = this.add.graphics();
    shadowGraphics.fillStyle(0x000000, 0.35);
    shadowGraphics.fillEllipse(8, 4, 14, 7);
    shadowGraphics.generateTexture('playerShadow', 16, 8);
    shadowGraphics.destroy();
    this.playerShadow = this.add.image(0, 0, 'playerShadow').setScale(TILE_SCALE);

    // player는 Container다 — 물리 바디는 컨테이너에 붙이고, 실제 보이는
    // 스프라이트(playerSprite)는 그 안의 자식으로 분리했다. 이렇게 안
    // 하고 스프라이트에 직접 물리 바디를 붙이면, 걷기 애니메이션
    // (squash&stretch로 setScale을 매 프레임 바꾸는 것)이 충돌 박스
    // 크기까지 같이 흔들어서 문처럼 좁은 통로에서 애니메이션 타이밍에
    // 따라 벽에 끼는 버그가 있었다(테스트 중 발견).
    this.player = this.add.container((MAP_TILES.width / 2) * TILE_SIZE, (MAP_TILES.height / 2) * TILE_SIZE);
    this.playerSprite = this.add.sprite(0, 0, 'tinyFarm', PLAYER_FRAME).setScale(TILE_SCALE);
    this.player.add(this.playerSprite);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setSize(SOURCE_TILE_SIZE * TILE_SCALE * 0.6, SOURCE_TILE_SIZE * TILE_SCALE * 0.6, true);

    // 동물과 캐릭터가 서로 통과하지 못하고 부딪히게(밀어내게) 한다.
    this.physics.add.collider(this.player, this.critters);
    // 집 벽은 문 자리만 빼고 전부 막혀있다 — 캐릭터/동물 모두 문으로만 드나든다.
    this.physics.add.collider(this.player, this.houseWalls);
    this.physics.add.collider(this.critters, this.houseWalls);

    // 동반자 NPC — 결혼 여부는 registry에 저장돼 있어서 도시를 옮겨도 유지된다.
    this.married = this.registry.get('married') ?? false;
    this.playerTrail = [];
    this.trailTimer = 0;

    this.companion = this.add.sprite(0, 0, 'tinyFarm', COMPANION_FRAME).setScale(TILE_SCALE);
    this.physics.add.existing(this.companion);
    this.companion.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.companion, this.houseWalls);

    if (this.married) {
      // 이미 결혼한 상태로 이 도시에 왔다면, 캐릭터 옆에서 시작한다.
      this.companion.setPosition(this.player.x - TILE_SIZE, this.player.y);
      this.proposeHint = null;
    } else {
      const proposeX = (MAP_TILES.width / 2 + COMPANION_OFFSET_TILES.x) * TILE_SIZE + TILE_SIZE / 2;
      const proposeY = (MAP_TILES.height / 2 + COMPANION_OFFSET_TILES.y) * TILE_SIZE + TILE_SIZE / 2;
      this.companion.setPosition(proposeX, proposeY);
      this.proposeHint = this.add
        .text(proposeX, proposeY - TILE_SIZE, 'E: 프로포즈', {
          fontSize: '12px',
          color: '#ffffff',
          backgroundColor: '#000000aa',
          padding: { x: 4, y: 2 },
        })
        .setOrigin(0.5)
        .setDepth(LABEL_DEPTH)
        .setVisible(false);
    }
    this.canPropose = false;
    this.proposing = false;
    this.input.keyboard.on('keydown-E', () => {
      if (this.canPropose && !this.married && !this.proposing) this.propose();
    });

    // 여기서부터는 그을림 효과가 참조하는 오브젝트(critters, companion 등)가
    // 전부 만들어진 뒤라 안전하게 초기 상태를 칠할 수 있다.
    this.applyCityState(city);

    const mapWidthPx = MAP_TILES.width * TILE_SIZE;
    const mapHeightPx = MAP_TILES.height * TILE_SIZE;

    this.physics.world.setBounds(0, 0, mapWidthPx, mapHeightPx);
    this.cameras.main.setBounds(0, 0, mapWidthPx, mapHeightPx);
    // 카메라가 캐릭터에 딱 붙지 않고 부드럽게 따라오도록 lerp를 준다.
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update(time, delta) {
    this.player.setDepth(this.player.y);
    this.playerShadow.setDepth(this.player.y - 1);

    if (this.gameOver || this.resting) {
      this.player.body.setVelocity(0);
      this.companion.body.setVelocity(0);
      this.updateCritters(time);
      return;
    }

    const speed = 150;
    this.player.body.setVelocity(0);
    let moving = false;

    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
      this.playerSprite.setFlipX(true);
      moving = true;
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
      this.playerSprite.setFlipX(false);
      moving = true;
    }

    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-speed);
      moving = true;
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(speed);
      moving = true;
    }

    this.updateWalkBounce(delta, moving);
    this.updateFootsteps(delta, moving);
    this.playerShadow.setPosition(this.player.x, this.player.y + TILE_SIZE * 0.3);
    this.updateGrassRustle();
    this.updateCritters(time);
    this.updateHomeProximity();
    this.updateCompanion(time, delta, moving);
    if (this.checkPortal()) return;
    this.checkFireCollision();
  }

  // 결혼 전: 동반자 근처에 있으면 "E: 프로포즈" 힌트를 보여준다.
  // 결혼 후: 플레이어의 발자취를 기록하고, 동반자가 그 발자취를 따라온다.
  updateCompanion(time, delta, moving) {
    this.companion.setDepth(this.companion.y);

    if (!this.married) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.companion.x,
        this.companion.y,
      );
      this.canPropose = dist < PROPOSE_DISTANCE;
      this.proposeHint?.setVisible(this.canPropose && !this.proposing);
      return;
    }

    // 결혼 후: 플레이어가 지나온 자리를 발자취로 기록 — 동반자가 딱 그
    // 자리를 순서대로 따라오게 해서, 실제로 "뒤따라오는" 느낌을 낸다.
    if (moving) {
      this.trailTimer += delta;
      if (this.trailTimer >= TRAIL_SAMPLE_INTERVAL) {
        this.trailTimer = 0;
        this.playerTrail.push({ x: this.player.x, y: this.player.y });
        if (this.playerTrail.length > TRAIL_MAX_LENGTH) this.playerTrail.shift();
      }
    }

    const target = this.playerTrail[0];
    if (!target) {
      this.companion.body.setVelocity(0);
      return;
    }
    const distToTarget = Phaser.Math.Distance.Between(this.companion.x, this.companion.y, target.x, target.y);
    if (distToTarget < COMPANION_CATCH_UP_DISTANCE) {
      this.playerTrail.shift();
      this.companion.body.setVelocity(0);
    } else {
      this.physics.moveTo(this.companion, target.x, target.y, COMPANION_SPEED);
      this.companion.setFlipX(target.x < this.companion.x);
    }
  }

  // 프로포즈 — 이 프로토타입에서는 항상 수락된다.
  propose() {
    this.proposing = true;
    this.proposeHint?.setVisible(false);

    const heart = this.add
      .text(this.companion.x, this.companion.y - TILE_SIZE, '💍 청혼 중...', { fontSize: '14px', color: '#ffffff' })
      .setOrigin(0.5)
      .setDepth(LABEL_DEPTH);

    this.time.delayedCall(PROPOSE_DURATION, () => {
      heart.setText('수락했습니다!');
      this.time.delayedCall(800, () => heart.destroy());

      this.married = true;
      this.registry.set('married', true);
      this.proposing = false;
    });
  }

  // 집(침대) 근처에 있으면 "R: 쉬기" 힌트를 보여주고 R키를 받아들인다.
  updateHomeProximity() {
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.homePosition.x, this.homePosition.y);
    this.canRest = dist < REST_DISTANCE;
    this.homeHint.setVisible(this.canRest);
  }

  // 집에서 쉬면 하루가 지나간다 — T 테스트 키와 같은 효과
  // (simulateTick 트리거)를 실제 "잠자기" 상호작용으로 만든 것.
  startResting() {
    this.resting = true;
    this.player.body.setVelocity(0);
    this.homeHint.setVisible(false);

    const zzzText = this.add
      .text(this.player.x, this.player.y - TILE_SIZE, 'Zzz...', { fontSize: '16px', color: '#ffffff' })
      .setOrigin(0.5)
      .setDepth(LABEL_DEPTH);

    this.time.delayedCall(REST_DURATION, () => {
      zzzText.destroy();
      this.resting = false;
      this.game.events.emit('rest');
    });
  }

  // 이동 중일 때 일정 주기로 발밑에 먼지를 살짝 터뜨린다.
  updateFootsteps(delta, moving) {
    if (!moving) {
      this.stepTimer = 0;
      return;
    }
    this.stepTimer += delta;
    if (this.stepTimer >= STEP_INTERVAL) {
      this.stepTimer = 0;
      this.dustEmitter.explode(2, this.player.x, this.player.y + TILE_SIZE * 0.3);
    }
  }

  // 동물들이 각자 집 근처에서 랜덤하게 어슬렁거리게 한다.
  updateCritters(time) {
    for (const critter of this.critters) {
      critter.setDepth(critter.y); // 캐릭터와 마찬가지로 Y 기준 앞/뒤 정렬

      if (time > critter.nextMoveAt) {
        const willMove = Math.random() < 0.6;
        if (willMove) {
          const angle = Math.random() * Math.PI * 2;
          critter.body.setVelocity(Math.cos(angle) * CRITTER_SPEED, Math.sin(angle) * CRITTER_SPEED);
          critter.setFlipX(Math.cos(angle) < 0);
        } else {
          critter.body.setVelocity(0, 0);
        }
        critter.nextMoveAt = time + 800 + Math.random() * 1500;
      }

      // 집에서 너무 멀어지면 다시 집 쪽으로 유도 — 한 자리에서만 배회하게.
      const distFromHome = Phaser.Math.Distance.Between(critter.x, critter.y, critter.homeX, critter.homeY);
      if (distFromHome > CRITTER_WANDER_RADIUS) {
        const angle = Phaser.Math.Angle.Between(critter.x, critter.y, critter.homeX, critter.homeY);
        critter.body.setVelocity(Math.cos(angle) * CRITTER_SPEED, Math.sin(angle) * CRITTER_SPEED);
        critter.setFlipX(Math.cos(angle) < 0);
      }
    }
  }

  // 캐릭터가 우물에 닿으면 다음 도시로 이동한다. 이동이 트리거됐으면
  // true를 반환한다(같은 프레임에서 이후 체크를 건너뛰기 위함).
  checkPortal() {
    if (this.portalTriggered) return false;

    const dist = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.portalPosition.x,
      this.portalPosition.y,
    );
    if (dist < PORTAL_HIT_DISTANCE) {
      this.portalTriggered = true;
      this.player.body.setVelocity(0);
      this.game.events.emit('portal-enter', this.portalTargetId);
      return true;
    }
    return false;
  }

  // 걷기 프레임이 없는 대신, 이동 중일 때 캐릭터를 살짝 눌렀다 늘렸다
  // 해서(squash & stretch) "걷는 느낌"을 낸다.
  updateWalkBounce(delta, moving) {
    if (!moving) {
      this.walkTime = 0;
      this.playerSprite.setScale(TILE_SCALE);
      return;
    }
    this.walkTime += delta;
    const bounce = Math.sin(this.walkTime / 80) * 0.12;
    this.playerSprite.setScale(TILE_SCALE * (1 - bounce * 0.5), TILE_SCALE * (1 + bounce));
  }

  // 캐릭터가 풀 덤불에 가까이 가면 그 덤불이 잠깐 흔들린다 —
  // 수풀을 헤치고 지나가는 느낌을 주기 위함.
  updateGrassRustle() {
    for (const tuft of this.grassTufts) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, tuft.x, tuft.y);
      if (dist < RUSTLE_DISTANCE && !this.tweens.isTweening(tuft)) {
        this.tweens.add({
          targets: tuft,
          scaleX: TILE_SCALE * 1.3,
          scaleY: TILE_SCALE * 0.8,
          duration: 120,
          yoyo: true,
        });
      }
    }
  }

  // destroyed 상태에서 캐릭터가 불꽃에 닿으면 게임오버.
  checkFireCollision() {
    const city = this.registry.get('city');
    if (!city?.destroyed) return;

    for (const pos of this.firePositions) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, pos.x, pos.y);
      if (dist < FIRE_HIT_DISTANCE) {
        this.triggerGameOver();
        return;
      }
    }
  }

  triggerGameOver() {
    this.gameOver = true;
    this.player.body.setVelocity(0);

    const cam = this.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    this.add
      .rectangle(cx, cy, cam.width, cam.height, 0x000000, 0.7)
      .setScrollFactor(0)
      .setDepth(GAME_OVER_DEPTH);
    this.add
      .text(cx, cy - 16, 'GAME OVER', { fontSize: '32px', color: '#ff4433', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(GAME_OVER_DEPTH + 1);
    this.add
      .text(cx, cy + 20, '불길에 휩싸였습니다 — Space를 눌러 다시 시작', {
        fontSize: '14px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(GAME_OVER_DEPTH + 1);
  }

  applyCityState(city) {
    const destroyed = city?.destroyed ?? false;

    for (let y = 0; y < MAP_TILES.height; y++) {
      for (let x = 0; x < MAP_TILES.width; x++) {
        const tint = destroyed ? burnTintFor(this.tileBurn[y][x]) : NORMAL_TINT;
        this.tiles[y][x].setTint(tint);
      }
    }
    this.decorations.forEach((decoration, i) => {
      const tint = destroyed ? burnTintFor(this.decorationBurn[i]) : NORMAL_TINT;
      decoration.setTint(tint);
    });
    // 동물/동반자도 폐허가 되면 그을린 색으로 — 도망치는 로직은 아직 없음(다음 단계 과제).
    for (const critter of this.critters) {
      critter.setTint(destroyed ? BURN_TINTS[1] : NORMAL_TINT);
    }
    this.companion.setTint(destroyed ? BURN_TINTS[1] : NORMAL_TINT);

    for (const emitter of this.fireEmitters) {
      if (destroyed) emitter.start();
      else emitter.stop();
    }
  }
}
