const { promisify } = require("util");
const fs = require("fs");
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

async function standardBenchmark(filePath) {
  const now = Date.now();
  await writeFileAsync(filePath, now.toString(), { encoding: "utf8" });
  return await readFileAsync(filePath, { encoding: "utf8" });
}

module.exports = {
  standardBenchmark
};
