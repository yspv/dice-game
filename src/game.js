import chalk from "chalk";
import Table from "cli-table";
import { FairNumberGenerator, RandomNumberGenerator } from "./random.js";
import { Cli } from "./cli.js";

export class DiceProbabilityCalculator {
  static calculateProbability(dice1, dice2) {
    let wins = 0;
    for (const d1 of dice1) {
      for (const d2 of dice2) {
        if (d1 > d2) wins += 1;
      }
    }
    return wins / (dice1.length * dice2.length);
  }
}

export class DiceTableGenerator {
  constructor(dices) {
    this.dices = dices;
  }

  generateTable() {
    const table = new Table({
      head: ["User dice v", ...this.dices.map((d) => d)],
    });
    for (const d1 of this.dices) {
      const row = [d1];
      for (const d2 of this.dices) {
        const result = DiceProbabilityCalculator.calculateProbability(d1, d2);
        row.push(result.toFixed(2));
      }
      table.push(row);
    }
    return table;
  }
}

export class DiceGame {
  constructor(dices, cli = new Cli()) {
    this.tableGenerator = new DiceTableGenerator(dices);
    this.dices = dices;
    this.cli = cli;
    this.fairNumberGenerator = new FairNumberGenerator(this.cli);
  }

  async execute() {
    const dices = [...this.dices];
    console.log(this.tableGenerator.generateTable().toString());
    console.log("Let's determine who makes first move.");
    this.cli.printMenu([0, 1]);
    let { user: userDice, pc: pcDice } = await this.selectDice(dices);
    console.log(`I selected: ${pcDice}`);
    console.log(`You selected: ${userDice}`);
    console.log(chalk.bold.blue("\nMy turn to roll"));
    const pcResult = await this.roll(pcDice);
    console.log(`My result: ${pcResult}`);
    console.log(`\nYour turn to roll`);
    const userResult = await this.roll(userDice);
    console.log(`Your result: ${userResult}`);
    this.determineWinner(pcResult, userResult);
  }

  async roll(dice) {
    this.cli.printMenu(dice);
    const roll = await this.fairNumberGenerator.generate(dice.length);
    return dice[roll];
  }

  async selectDice(dices) {
    let user, pc;
    const isUser = await this.fairNumberGenerator.generate(2);
    if (isUser) {
      console.log(chalk.bold.green("The first move is yours"));
      user = await this.selectUserDice(dices);
      pc = this.selectPcDice(dices);
    } else {
      pc = this.selectPcDice(dices);
      console.log(chalk.bold.blue(`The first move is mine: ${pc}`));
      user = await this.selectUserDice(dices);
    }
    return { user, pc };
  }

  selectPcDice(dices) {
    const pcDiceIndex = RandomNumberGenerator.generate(dices.length - 1);
    const pcDice = dices[pcDiceIndex];
    dices.splice(pcDiceIndex, 1);
    return pcDice;
  }

  async selectUserDice(dices) {
    this.cli.printMenu(dices);
    const userDiceIndex = await this.cli.promptNumber(
      `Select number in a range [0, ${dices.length - 1}]:`,
      dices.length
    );
    const userDice = dices[userDiceIndex];
    dices.splice(userDiceIndex, 1);
    return userDice;
  }

  determineWinner(pcRoll, userRoll) {
    if (pcRoll > userRoll) {
      console.log(chalk.bold.red("You lose!", `(${userRoll} < ${pcRoll})`));
    } else if (pcRoll < userRoll) {
      console.log(chalk.bold.green("You win!", `(${userRoll} > ${pcRoll})`));
    } else {
      console.log(
        chalk.bold.yellow("It's a tie!", `(${pcRoll} = ${userRoll})`)
      );
    }
    process.exit(0);
  }
}
