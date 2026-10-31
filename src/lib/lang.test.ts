import { expect, test } from "vitest";

import { textLang } from "./lang";

test.each([
  ["Приключения Шерлока Холмса", "ru"],
  ["Мастер и Margarita", "ru"],
  ["Mērnieku laiki", "lv"],
  ["ĀBOLS", "lv"],
  ["Dvēseļu putenis", "lv"],
  ["The Hobbit", undefined],
  ["Zen and the Art of Motorcycle Maintenance", undefined],
  ["", undefined],
  ["1984", undefined],
])("%s", (text, lang) => {
  expect(textLang(text)).toBe(lang);
});

test("Cyrillic wins over Latvian letters", () => {
  expect(textLang("Šis ir Привет")).toBe("ru");
});
