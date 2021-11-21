import Phaser from "phaser";
import { IPosition } from "../types/position.interface";
// this.sys.game.config

const OPEN_SPEED = 100; // milliseconds

interface IMoveArgs {
  x: string | number;
  y: string | number;
  delay: number;
  callback?: () => void;
}

export default class Card extends Phaser.GameObjects.Sprite {
  public value: number;
  public isOpened: boolean;
  public position: IPosition;

  constructor(scene: Phaser.Scene, value: number) {
    super(scene, 0, 0, "card");

    this.scene = scene;
    this.value = value;
    this.scene.add.existing(this);
    this.setInteractive();
    this.isOpened = false;
  }

  init(position?: IPosition): void {
    this.position = position || { x: 0, y: 0, delay: 0 };
    this.close();
    this.setPosition(-this.width, -this.height);
  }

  flip(callback?: () => void): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      ease: "Linear",
      duration: OPEN_SPEED,
      onComplete: () => this.show(callback),
    });
  }

  show(callback?: () => void): void {
    const texture: string = this.isOpened ? "card" + this.value : "card";
    this.setTexture(texture);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      ease: "Linear",
      duration: OPEN_SPEED,
      onComplete: () => {
        callback && callback();
      },
    });
  }

  move(params: IMoveArgs): void {
    this.scene.tweens.add({
      targets: this,
      x: params.x,
      y: params.y,
      delay: params.delay,
      ease: "Linear",
      duration: 250,
      onComplete: () => {
        params.callback && params.callback();
      },
    });
  }

  open(callback: () => void): void {
    this.isOpened = true;
    this.flip(callback);
  }

  close(callback?: () => void): void {
    if (this.isOpened) {
      this.setTexture("card");
      this.isOpened = false;
      this.flip(callback);
    }
  }
}
