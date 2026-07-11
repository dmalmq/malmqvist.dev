import { readFileSync } from "node:fs";

const en = JSON.parse(readFileSync("src/i18n/en.json", "utf8"));
const ja = JSON.parse(readFileSync("src/i18n/ja.json", "utf8"));
const sv = JSON.parse(readFileSync("src/i18n/sv.json", "utf8"));

const enKeys = Object.keys(en).sort();
const jaKeys = Object.keys(ja).sort();
const svKeys = Object.keys(sv).sort();

function assertPair(aName, aKeys, bName, bKeys) {
  if (aKeys.length !== bKeys.length) {
    console.error(`count mismatch ${aName}=${aKeys.length} ${bName}=${bKeys.length}`);
    process.exit(1);
  }
  for (let index = 0; index < aKeys.length; index += 1) {
    if (aKeys[index] !== bKeys[index]) {
      console.error(
        `key mismatch ${aName}↔${bName} at ${index}: ${aName}=${aKeys[index]} ${bName}=${bKeys[index]}`,
      );
      process.exit(1);
    }
  }
}

assertPair("en", enKeys, "ja", jaKeys);
assertPair("en", enKeys, "sv", svKeys);

console.log(`parity OK ${enKeys.length} keys over 3 locales`);
