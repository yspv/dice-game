import { input } from "@inquirer/prompts";
import { isNumber } from "./helpers.js";

export class CliParser {
  static DICES_MIN_LENGTH = 3;
  static FACES_MIN_LENGTH = 6;

  static validateFaceValue(faces) {
    if (!faces.every((face) => face > 0)) {
      throw new Error("Faces must be positive");
    }
  }

  static validateFaces(faces) {
    if (!faces.every((face) => isNumber(face))) {
      throw new Error("Faces must be numbers");
    }
  }

  static validateFacesLength(faces) {
    if (faces.length < this.FACES_MIN_LENGTH) {
      throw new Error(`Faces length must be at least ${this.FACES_MIN_LENGTH}`);
    }
  }

  static validateDicesFacesLength(dices) {
    const set = new Set();
    dices.forEach((dice) => set.add(dice.length));
    if (set.size > 1) {
      throw new Error("Dices must have the same length");
    }
  }

  static validateDicesLength(dices) {
    if (dices.length < this.DICES_MIN_LENGTH) {
      throw new Error(`Dices length must be at least ${this.DICES_MIN_LENGTH}`);
    }
  }

  static validate(dices) {
    const faces = dices.flat();
    this.validateDicesFacesLength(dices);
    dices.forEach((d) => this.validateFacesLength(d));
    this.validateDicesLength(dices);
    this.validateFaces(faces);
    this.validateFaceValue(faces);
  }

  static parse(args) {
    const dices = args.map((arg) => arg.split(","));

    try {
      this.validate(dices);
      return dices;
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  }
}

export class Cli {
  constructor(commands) {
    this.commands = commands;
  }
  async promptNumber(message, range) {
    while (true) {
      const data = await input({
        message: message,
        validate: (value) =>
          !!this.commands[value] ||
          (isNumber(value) && value >= 0 && value < range),
      });

      const command = this.commands[data];
      if (command) command();
      else return data;
    }
  }
}
