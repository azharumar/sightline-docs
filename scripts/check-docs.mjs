// Checks that keep the single source of truth clean. Runs in CI and in `npm run check`.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const walk = (dir, out = []) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};
const problems = [];
const frontmatter = (text) => (text.startsWith("---\n") ? text.slice(4, text.indexOf("\n---", 4)) : null);

for (const file of walk("src/content/docs").filter((f) => [".md", ".mdx"].includes(extname(f)))) {
  const fm = frontmatter(readFileSync(file, "utf8"));
  if (!fm || !/^title:/m.test(fm)) problems.push(`${file}: missing frontmatter title`);
}
for (const file of walk("agents/skills").filter((f) => f.endsWith("SKILL.md"))) {
  const fm = frontmatter(readFileSync(file, "utf8"));
  if (!fm || !/^name:/m.test(fm) || !/^description:/m.test(fm)) problems.push(`${file}: skill needs name and description`);
}
for (const file of [...walk("src/content/docs"), ...walk("agents"), "AGENTS.md", "CLAUDE.md", "README.md"]) {
  if (![".md", ".mdx", ".yml", ".sh", ""].includes(extname(file)) && !file.endsWith(".md")) continue;
  readFileSync(file, "utf8").split("\n").forEach((line, i) => {
    if (line.includes("—")) problems.push(`${file}:${i + 1}: em dash`);
  });
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("docs check passed");
