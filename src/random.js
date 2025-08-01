import crypto from "crypto";

const RANDOM_BYTES = 32;
const ENCODE = "hex";

export class RandomSecretGenerator {
  static generate() {
    return crypto.randomBytes(RANDOM_BYTES).toString(ENCODE);
  }
}

export class RandomNumberGenerator {
  static generate(max) {
    return crypto.randomInt(max);
  }
}

export class HmacGenerator {
  static generate(key, message) {
    const hmac = crypto.createHmac("sha3-256", key);
    hmac.update(message.toString());
    return hmac.digest(ENCODE);
  }
}

export class FairNumberGenerator {
  constructor(cli) {
    this.cli = cli;
  }

  async generate(range) {
    const secret = RandomSecretGenerator.generate();
    const random = RandomNumberGenerator.generate(range);
    const hmac = HmacGenerator.generate(secret, random);

    console.log(`I selected a random value in a range [0, ${range - 1}]`);
    this.cli.printHmac(hmac);
    const selected = await this.cli.promptNumber(
      `Select a value in range [0, ${range - 1}]:`,
      range
    );

    const result = (selected + random) % range;
    this.cli.printFairNumberResult(range, secret, random, selected, result);
    return result;
  }
}
