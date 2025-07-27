#!/usr/bin/env node
import { program } from "commander";
import { DiceGame, DiceTableGenerator } from "../src/game.js";
import { Cli, CliCommand, CliParser } from "../src/cli.js";

program
  .version("1.0.0")
  .name("dice-game")
  .description("Dice Game")
  .arguments("<dices...>")
  .action(async (args) => {
    const dices = CliParser.parse(args);
    const table = new DiceTableGenerator(dices);
    const commands = {
      q: new CliCommand("quit", () => process.exit(0)),
      h: new CliCommand("help", () =>
        console.log(table.generateTable().toString())
      ),
    };
    const cli = new Cli(commands);
    const game = new DiceGame(dices, cli);
    await game.execute();
  });

program.parse(process.argv);
