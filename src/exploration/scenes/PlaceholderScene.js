// ─────────────────────────────────────────────────────────
// PlaceholderScene
//
// 탐험 프로토타입 1단계: WorldState 연동 없이, 화살표키로 걸어다니는
// 것만 확인하는 최소 Scene. 타일은 아직 그래픽 에셋이 아니라
// 색깔 사각형이다.
//
// 다음 단계에서 여기에 추가할 것:
// - 실제 타일맵/스프라이트 에셋
// - WorldState의 destroyed 상태를 폐허 타일로 표시
// - 도시별 맵 전환
// ─────────────────────────────────────────────────────────

import Phaser from 'phaser';

export const TILE_SIZE = 32;
export const VIEWPORT_TILES = { width: 10, height: 7 };
export const MAP_TILES = { width: 30, height: 20 };

export default class PlaceholderScene extends Phaser.Scene {
  constructor() {
    super('PlaceholderScene');
  }

  create() {
    // 체크무늬로 칠하는 이유: 카메라 스크롤이 실제로 일어나는지 눈으로
    // 구분하기 위함 (단색이면 스크롤돼도 화면이 똑같아 보임).
    for (let y = 0; y < MAP_TILES.height; y++) {
      for (let x = 0; x < MAP_TILES.width; x++) {
        const color = (x + y) % 2 === 0 ? 0x2d5a3d : 0x244d33;
        this.add.rectangle(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          TILE_SIZE - 1,
          TILE_SIZE - 1,
          color,
        );
      }
    }

    this.player = this.add.rectangle(
      (MAP_TILES.width / 2) * TILE_SIZE,
      (MAP_TILES.height / 2) * TILE_SIZE,
      TILE_SIZE - 8,
      TILE_SIZE - 8,
      0xffcc00,
    );
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    const mapWidthPx = MAP_TILES.width * TILE_SIZE;
    const mapHeightPx = MAP_TILES.height * TILE_SIZE;

    this.physics.world.setBounds(0, 0, mapWidthPx, mapHeightPx);
    this.cameras.main.setBounds(0, 0, mapWidthPx, mapHeightPx);
    this.cameras.main.startFollow(this.player);

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    const speed = 150;
    this.player.body.setVelocity(0);

    if (this.cursors.left.isDown) this.player.body.setVelocityX(-speed);
    else if (this.cursors.right.isDown) this.player.body.setVelocityX(speed);

    if (this.cursors.up.isDown) this.player.body.setVelocityY(-speed);
    else if (this.cursors.down.isDown) this.player.body.setVelocityY(speed);
  }
}
