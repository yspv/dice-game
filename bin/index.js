#!/usr/bin/env node
import { program } from "commander";
import { DiceGame } from "../src/game.js";
import { CliParser } from "../src/cli.js";

program
  .version("1.0.0")
  .name("dice-game")
  .description("Dice Game")
  .arguments("<dices...>")
  .action(async (args) => {
    const dices = CliParser.parse(args);
    const game = new DiceGame(dices);
    await game.execute();
  });

program.parse(process.argv);
