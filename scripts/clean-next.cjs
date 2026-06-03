const fs = require("fs");
const path = require("path");

const targets = [
  path.join(process.cwd(), ".next"),
  path.join(process.cwd(), "out"),
  path.join(process.cwd(), "node_modules", ".cache", "next"),
];

for (const dir of targets) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log("Removed:", dir);
  } catch {
    // ignore
  }
}
