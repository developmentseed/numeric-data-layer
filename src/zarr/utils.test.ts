import { expect, test } from "vitest";
import { encodeUsingMaximumRange } from "./utils.js";

test("encode max range 1", () => {
  const inputNumber = 3;
  expect(encodeUsingMaximumRange(inputNumber)).toEqual([0, 0, 3]);
});

test("encode max range 2", () => {
  const inputNumber = 258;
  expect(encodeUsingMaximumRange(inputNumber)).toEqual([0, 1, 3]);
});

test("encode max range 3", () => {
  const inputNumber = 65300;
  expect(encodeUsingMaximumRange(inputNumber)).toEqual([1, 1, 20]);
});
