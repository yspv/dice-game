import { isNumber, isNumberInRange } from "./helpers.js";
import { createInterface } from "readline/promises";

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

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

export class CliCommand {
  constructor(title, command) {
    this.title = title;
    this.command = command;
  }

  execute() {
    this.command();
  }
}

export class Cli {
  constructor(commands = {}) {
    this.commands = commands;
  }

  async promptNumber(message, range) {
    while (true) {
      const data = await readline.question(message + " ");
      if (this.commands.hasOwnProperty(data)) {
        this.commands[data].execute();
        continue;
      }
      if (!isNumberInRange(data, 0, range)) {
        continue;
      }
      return data;
    }
  }

  printHmac(hmac) {
    console.log("HMAC:", hmac);
  }

  printFairNumberResult(range, secret, random, selected, result) {
    console.log(`Result: (${selected} + ${random}) % ${range} = ${result}`);
    console.log(`Your choice: ${selected}`);
    console.log(`My choice: ${random}`);
    console.log(`Result: (${selected} + ${random}) % ${range} = ${result}`);
    console.log(`KEY: ${secret}`);
  }

  printMenu(options) {
    console.log(options.reduce((str, o, i) => str + `\n${i} - ${o}`, ""));
    this.printCommands();
  }

  printCommands() {
    const commands = Object.entries(this.commands).reduce(
      (str, [key, command]) => str + `\n${key} - ${command.title}`,
      ""
    );
    console.log(commands);
  }
}
