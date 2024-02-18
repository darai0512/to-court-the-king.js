import { expect, test } from "vitest";
import Player from "./player";
import cards from "./card";


test("player.roll", () => {
  const player = new Player('test')
  player.fixedDices = [1]
  player.roll()
  expect(player.fixedDices).toEqual([1])
  expect(player.activeDices.length).toEqual(3)
});

test("player.useAbility", () => {
  const player = new Player('test')
  player.cards = [{card: cards.Laborer, available: true}]
  player.useAbility({cardIdx: 0})
  expect(player.activeDices).toEqual([1])
  expect(player.cards[0].available).toEqual(false)
});

test("player.fix", () => {
  const player = new Player('test')
  player.activeDices = [1, 2, 3]
  player.fixedDices = [1]
  player.fix([0, 1])
  expect(player.fixedDices).toEqual([1, 1, 2])
  expect(player.diceNum).toEqual(1)
})

test("player.choose", () => {
  const player = new Player('test')
  player.diceNum = 0
  player.choose(cards.Farmer)
  expect(player.cards).toEqual([{card: cards.Farmer, available: false}])
  expect(player.diceNum).toEqual(4)
});