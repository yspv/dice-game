import chalk from "chalk";
import Table from "cli-table";
import { FairNumberGenerator, RandomNumberGenerator } from "./random.js";
import { Cli } from "./cli.js";

export class ProbabilityCalculator {
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

export class TableGenerator {
  static generateTable(dices) {
    const table = new Table({
      head: ["User dice v", ...dices.map((d) => d)],
    });
    for (const d1 of dices) {
      const row = [d1];
      for (const d2 of dices) {
        const result = ProbabilityCalculator.calculateProbability(d1, d2);
        row.push(result.toFixed(2));
      }
      table.push(row);
    }
    return table;
  }
}

export class DiceGame {
  constructor(dices) {
    this.dices = dices;
    this.cli = new Cli({
      q: () => this.quit(),
      h: () => this.help(),
    });
    this.fairNumberGenerator = new FairNumberGenerator(this.cli);
  }

  async execute() {
    const dices = [...this.dices];
    let userDice, pcDice;

    this.help();
    console.log("Let's determine who makes first move.");
    this.menu([0, 1]);

    const isUser = await this.fairNumberGenerator.generate(2);

    if (!isUser) {
      console.log(chalk.bold.green("The first move is yours"));
      userDice = await this.selectUserDice(dices);
      pcDice = this.selectPcDice(dices);
    } else {
      pcDice = this.selectPcDice(dices);
      console.log(chalk.bold.blue(`The first move is mine: ${pcDice}`));
      userDice = await this.selectUserDice(dices);
    }

    console.log(`I selected: ${pcDice}`);
    console.log(`You selected: ${userDice}`);

    console.log(chalk.bold.blue("\nMy turn to roll"));

    this.menu(pcDice);
    const pcRoll = await this.fairNumberGenerator.generate(pcDice.length);
    const pcResult = pcDice[pcRoll];

    console.log(`My result: ${pcResult}`);
    console.log(chalk.bold.green("\nYour turn to roll"));

    this.menu(userDice);
    const userRoll = await this.fairNumberGenerator.generate(userDice.length);
    const userResult = userDice[userRoll];

    console.log(`Your result: ${userResult}`);

    this.determineWinner(pcResult, userResult);
  }

  menu(options) {
    console.log(options.reduce((str, o, i) => str + `\n${i} - ${o}`, ""));
    console.log(`q - quit`);
    console.log(`h - help`);
    console.log();
  }

  selectPcDice(dices) {
    const pcDiceIndex = RandomNumberGenerator.generate(dices.length - 1);
    const pcDice = dices[pcDiceIndex];
    dices.splice(pcDiceIndex, 1);
    return pcDice;
  }

  async selectUserDice(dices) {
    this.menu(dices);
    const userDiceIndex = await this.cli.promptNumber(
      `Select number in a range [0, ${dices.length - 1}]:`,
      dices.length
    );
    const userDice = dices[userDiceIndex];
    dices.splice(userDiceIndex, 1);
    return userDice;
  }

  quit() {
    console.log("Goodbye!");
    process.exit(0);
  }

  help() {
    const table = TableGenerator.generateTable(this.dices);
    console.log(`\n${table.toString()}`);
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
  }
}
