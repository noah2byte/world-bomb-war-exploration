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
//
// 다음 단계에서 여기에 추가할 것:
// - 도시(서울) 전용 타일(건물/도로/실제 폐허 잔해)
// - 도시별 맵 전환
// - 진짜 걷기 스프라이트 애니메이션 (매칭되는 캐릭터 시트가 생기면)
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
const DECORATION_POOL = [
  { frame: 15, weight: 35 }, // 나무
  { frame: GRASS_TUFT_FRAME, weight: 25 }, // 풀 덤불
  { frame: 83, weight: 15 }, // 해바라기
  { frame: 78, weight: 15 }, // 열매 덤불
  { frame: 89, weight: 10 }, // 바위
];
const DECORATION_COUNT = 80;
const FIRE_COUNT = 10;
const FIRE_HIT_DISTANCE = TILE_SIZE * 0.5;
const RUSTLE_DISTANCE = TILE_SIZE * 0.8;

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
    // 고정된 의사난수 시드를 써서 매번 같은 배치가 나온다
    // (매 create()마다 지형이 바뀌면 디버깅하기 불편해서).
    let seed = 42;
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

    // 나무/바위/꽃 등 장식 — 지형 위에 흩뿌린다.
    this.decorations = [];
    this.decorationBurn = [];
    this.grassTufts = []; // 캐릭터가 가까이 가면 흔들릴 대상만 따로 모아둠
    for (let i = 0; i < DECORATION_COUNT; i++) {
      const tx = Math.floor(nextRandom() * MAP_TILES.width);
      const ty = Math.floor(nextRandom() * MAP_TILES.height);
      const frame = weightedPick(DECORATION_POOL, nextRandom);
      const decoration = this.add.image(
        tx * TILE_SIZE + TILE_SIZE / 2,
        ty * TILE_SIZE + TILE_SIZE / 2,
        'tinyFarm',
        frame,
      );
      decoration.setScale(TILE_SCALE);
      this.decorations.push(decoration);
      this.decorationBurn.push(nextRandom());
      if (frame === GRASS_TUFT_FRAME) this.grassTufts.push(decoration);
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

    this.gameOver = false;
    this.walkTime = 0;
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.gameOver) this.scene.restart();
    });

    this.applyCityState(this.registry.get('city'));
    this.registry.events.on('changedata-city', (_parent, city) => this.applyCityState(city));

    this.player = this.add.sprite(
      (MAP_TILES.width / 2) * TILE_SIZE,
      (MAP_TILES.height / 2) * TILE_SIZE,
      'tinyFarm',
      PLAYER_FRAME,
    );
    this.player.setScale(TILE_SCALE);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    const mapWidthPx = MAP_TILES.width * TILE_SIZE;
    const mapHeightPx = MAP_TILES.height * TILE_SIZE;

    this.physics.world.setBounds(0, 0, mapWidthPx, mapHeightPx);
    this.cameras.main.setBounds(0, 0, mapWidthPx, mapHeightPx);
    this.cameras.main.startFollow(this.player);

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update(time, delta) {
    if (this.gameOver) return;

    const speed = 150;
    this.player.body.setVelocity(0);
    let moving = false;

    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
      this.player.setFlipX(true);
      moving = true;
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
      this.player.setFlipX(false);
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
    this.updateGrassRustle();
    this.checkFireCollision();
  }

  // 걷기 프레임이 없는 대신, 이동 중일 때 캐릭터를 살짝 눌렀다 늘렸다
  // 해서(squash & stretch) "걷는 느낌"을 낸다.
  updateWalkBounce(delta, moving) {
    if (!moving) {
      this.walkTime = 0;
      this.player.setScale(TILE_SCALE);
      return;
    }
    this.walkTime += delta;
    const bounce = Math.sin(this.walkTime / 80) * 0.12;
    this.player.setScale(TILE_SCALE * (1 - bounce * 0.5), TILE_SCALE * (1 + bounce));
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

    this.add.rectangle(cx, cy, cam.width, cam.height, 0x000000, 0.7).setScrollFactor(0).setDepth(1000);
    this.add
      .text(cx, cy - 16, 'GAME OVER', { fontSize: '32px', color: '#ff4433', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1001);
    this.add
      .text(cx, cy + 20, '불길에 휩싸였습니다 — Space를 눌러 다시 시작', {
        fontSize: '14px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1001);
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

    for (const emitter of this.fireEmitters) {
      if (destroyed) emitter.start();
      else emitter.stop();
    }
  }
}
