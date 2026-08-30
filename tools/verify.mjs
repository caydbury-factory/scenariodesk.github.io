import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { spawnSync } from "node:child_process";

const files = ["index.html", "styles.css", "script.js", "writers-room-v4.js"];

for (const file of files) {
  await access(file, constants.R_OK);
  if (!(await readFile(file, "utf8")).trim()) throw new Error(`${file} is empty.`);
}

for (const file of ["script.js", "writers-room-v4.js"]) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("static build checks passed");
