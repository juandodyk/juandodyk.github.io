#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";

const outputRoot = resolve(process.argv[2] || "docs");
const htmlFiles = [];

function walk(directory) {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else if (
      extname(path).toLowerCase() === ".html" &&
      !path.startsWith(join(outputRoot, "files"))
    ) {
      htmlFiles.push(path);
    }
  }
}

function localTarget(fromFile, reference) {
  const withoutFragment = reference.split("#", 1)[0].split("?", 1)[0];
  if (!withoutFragment || withoutFragment.includes("${")) return null;

  let decoded;
  try {
    decoded = decodeURIComponent(withoutFragment);
  } catch {
    decoded = withoutFragment;
  }

  if (
    /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(decoded) ||
    decoded.startsWith("data:")
  ) {
    return null;
  }

  const candidate = decoded.startsWith("/")
    ? join(outputRoot, decoded)
    : resolve(dirname(fromFile), decoded);
  const safeCandidate = normalize(candidate);

  if (!safeCandidate.startsWith(outputRoot)) return null;
  if (existsSync(safeCandidate) && statSync(safeCandidate).isDirectory()) {
    return join(safeCandidate, "index.html");
  }
  return safeCandidate;
}

walk(outputRoot);
const failures = [];
const pattern = /\b(?:href|src)=["']([^"'<>]+)["']/gi;

for (const htmlFile of htmlFiles) {
  const html = readFileSync(htmlFile, "utf8");
  for (const match of html.matchAll(pattern)) {
    const target = localTarget(htmlFile, match[1]);
    if (target && !existsSync(target)) {
      failures.push({
        page: htmlFile.slice(outputRoot.length + 1),
        reference: match[1],
      });
    }
  }
}

if (failures.length) {
  for (const failure of failures) {
    console.error(`${failure.page}: ${failure.reference}`);
  }
  console.error(`\n${failures.length} broken internal reference(s).`);
  process.exit(1);
}

console.log(
  `Checked ${htmlFiles.length} HTML pages; all internal file references resolve.`,
);
