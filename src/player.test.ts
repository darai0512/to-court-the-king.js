import { expect, test } from "vitest";
import Player from "./player";
import cards from "./card";

const player = new Player('test')

test("player.roll", () => {
  player.roll(false)
  expect(player.activeDices).toEqual([])
  player.roll(true)
  expect(player.activeDices.length).toEqual(3)
});

test("player.useAbility", () => {
  player.activeDices = []
  player.cardCandidates = [cards.Laborer]
  player.useAbility({cardIdx: 0})
  expect(player.cardCandidates).toEqual([])
  expect(player.activeDices).toEqual([1])
});

test("player.fix", () => {
  player.activeDices = [1, 2, 3]
  player.fixedDices = [1]
  player.fix([0, 1])
  expect(player.fixedDices).toEqual([1, 1, 2])
})

test("player.choose", () => {
  player.cards = []
  player.cardCandidates = []
  player.diceNum = 3
  player.choose(cards.Farmer)
  expect(player.cards).toEqual([cards.Farmer])
  expect(player.diceNum).toEqual(4)
  expect(player.cardCandidates).toEqual([])
});

test("player.hasQueen", () => {
  expect(player.hasQueen()).toBe(false)
  player.cards = [cards.King]
  expect(player.hasQueen()).toBe(true)
});

