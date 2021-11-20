import Phaser from "phaser";
import { IPosition } from "../types/position.interface";
import Card from "./Card";

// this.sys.game.config

const ROWS = 2;
const COLS = 5;
const CARDS = [1, 2, 3, 4, 5];

export default class MainScene extends Phaser.Scene {
  private cards: Card[] = [];
  private openedCard: Card | null = null;
  private openedPairs = 0;

  constructor() {
    super("main");
  }

  preload(): void {
    this.load.image("bg", "assets/background.png");
    this.load.image("card", "assets/card.png");
    this.load.image("card1", "assets/card1.png");
    this.load.image("card2", "assets/card2.png");
    this.load.image("card3", "assets/card3.png");
    this.load.image("card4", "assets/card4.png");
    this.load.image("card5", "assets/card5.png");
  }

  create(): void {
    this.createBackground();
    this.createCards();
    // this.openedCard = null;
    this.start();
  }

  start(): void {
    this.openedCard = null;
    this.openedPairs = 0;
    this.initCards();
  }

  initCards(): void {
    const positions = this.getCardsPositions();

    this.cards.forEach((card) => {
      const position = positions.pop();
      card.close();
      card.setPosition(position?.x, position?.y);
    });
  }

  createBackground(): void {
    this.add.sprite(0, 0, "bg").setOrigin(0, 0);
  }

  createCards(): void {
    for (const cardIdx of CARDS) {
      for (let i = 0; i < 2; i++) {
        this.cards.push(new Card(this, cardIdx));
      }
    }

    this.input.on("gameobjectdown", this.onCardClicked, this);
  }

  onCardClicked(pointer: unknown, card: Card): void {
    if (card.isOpened) {
      return;
    }

    if (this.openedCard) {
      if (this.openedCard.value === card.value) {
        // Картинки одинаковые, запомнить
        this.openedCard = null;
        this.openedPairs++;
      } else {
        // Картинки разные, закрыть
        this.openedCard.close();
        this.openedCard = card;
      }
    } else {
      this.openedCard = card;
    }
    card.open();

    if (this.openedPairs === this.cards.length / 2) {
      this.start();
    }
  }

  getCardsPositions(): IPosition[] {
    const cardTexture = this.textures.get("card").getSourceImage();
    const cardWidth = cardTexture.width + 4;
    const cardHeight = cardTexture.height + 4;
    const positions: IPosition[] = [];

    const offSetX =
      ((this.sys.game.config.width as number) - cardWidth * COLS) / 2 +
      cardWidth / 2;
    const offSetY =
      ((this.sys.game.config.height as number) - cardHeight * ROWS) / 2 +
      cardHeight / 2;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        positions.push({
          x: col * cardWidth + offSetX,
          y: row * cardHeight + offSetY,
        });
      }
    }

    return Phaser.Utils.Array.Shuffle(positions);
  }
}
