import { expect, test, vi } from "vitest";
import cards from "./card";
import Player from "./player";

const {
  Fool,
  Charlatan,
  Farmer,
  Philosopher,
  Laborer,
  Guard,
  Maid,
  Merchant,
  Astronomer,
  Hunter,
  PawnBroker,
  Noblewoman,
  Magician,
  Knight,
  Bishop,
  Alchemist,
  General,
  Nobleman,
  King,
} = cards

const player = new Player('test')
test.each`
  model | dices | expected
  ${Fool}| ${[]} | ${true}
  ${Farmer}| ${[1, 1, 1]}| ${true}
  ${Farmer}| ${[1, 1, 2]}| ${true}
  ${Farmer}| ${[1, 2, 1, 2]}| ${true}
  ${Farmer}| ${[1, 2, 3]}| ${false}
  ${Philosopher}| ${[2, 2, 2]}| ${true}
  ${Philosopher}| ${[2, 4, 6]}| ${true}
  ${Philosopher}| ${[2, 4, 6, 2]}| ${true}
  ${Philosopher}| ${[1, 2, 4]}| ${false}
  ${Laborer}| ${[5, 5, 5]}| ${true}
  ${Laborer}| ${[1, 2, 3, 4]}| ${false}
  ${Guard}| ${[5, 5, 5]}| ${true}
  ${Guard}| ${[5, 5, 5, 5]}| ${true}
  ${Guard}| ${[5, 5, 1, 5]}| ${true}
  ${Guard}| ${[5, 5, 2, 2]}| ${false}
  ${Maid}| ${[1, 1, 1]}| ${true}
  ${Maid}| ${[1, 3, 5]}| ${true}
  ${Maid}| ${[1, 1, 3, 5]}| ${true}
  ${Maid}| ${[1, 2, 3]}| ${false}
  ${Merchant}| ${[5, 5, 5, 6]}| ${true}
  ${Merchant}| ${[5, 5, 5, 4]}| ${false}
  ${Astronomer}| ${[1, 1, 1, 1]}| ${true}
  ${Astronomer}| ${[1, 3, 3, 2, 1]}| ${true}
  ${Astronomer}| ${[1, 1, 1, 1, 2, 2]}| ${true}
  ${Astronomer}| ${[1, 1, 1, 5, 5]}| ${true}
  ${Astronomer}| ${[1, 1, 1, 5]}| ${false}
  ${Hunter}| ${[1, 1, 1, 1]}| ${true}
  ${Hunter}| ${[1, 1, 1, 1, 2]}| ${true}
  ${Hunter}| ${[1, 1, 1, 1, 1]}| ${true}
  ${Hunter}| ${[1, 1, 1, 5]}| ${false}
  ${PawnBroker}| ${[6, 6, 6, 6, 6]}| ${true}
  ${PawnBroker}| ${[5, 5, 5, 5, 5, 5]}| ${true}
  ${PawnBroker}| ${[1, 2, 3]}| ${false}
  ${Noblewoman}| ${[1, 1, 1, 2, 3, 3]}| ${true}
  ${Noblewoman}| ${[1, 1, 1, 1, 1]}| ${true}
  ${Noblewoman}| ${[1, 1, 1, 1, 2, 2]}| ${true}
  ${Noblewoman}| ${[1, 1, 2, 2, 3]}| ${false}
  ${Noblewoman}| ${[1, 1, 2, 2, 3, 3]}| ${false}
  ${Magician}| ${[1, 2, 3, 4, 5]}| ${true}
  ${Magician}| ${[2, 3, 4, 5, 6]}| ${true}
  ${Magician}| ${[1, 2, 3, 4]}| ${false}
  ${Magician}| ${[2, 3, 4, 1, 6]}| ${false}
  ${Knight}| ${[1, 1, 1, 1, 1]}| ${true}
  ${Knight}| ${[2, 1, 1, 1, 1, 1, 1]}| ${true}
  ${Knight}| ${[1, 1, 1, 1, 2]}| ${false}
  ${Bishop}| ${[1, 1, 2, 2, 3, 3]}| ${true}
  ${Bishop}| ${[1, 1, 1, 1, 1, 1]}| ${true}
  ${Bishop}| ${[1, 1, 1, 1, 4, 4]}| ${true}
  ${Bishop}| ${[1, 1, 1, 1, 1, 2]}| ${false}
  ${Alchemist}| ${[1, 2]}| ${false}
  ${Alchemist}| ${[1, 2, 3, 5, 4, 6]}| ${true}
  ${Alchemist}| ${[1, 1, 2, 3, 5, 4, 6]}| ${true}
  ${Alchemist}| ${[1, 1, 2, 3, 5, 4]}| ${false}
  ${General}| ${[1, 1, 1, 1, 1, 1]}| ${true}
  ${General}| ${[1, 1, 1, 1, 1, 1, 1]}| ${true}
  ${General}| ${[2, 1, 1, 1, 1, 1, 1]}| ${true}
  ${General}| ${[1, 1, 1, 1, 1, 3]}| ${false}
  ${Nobleman}| ${[1, 1, 1, 2, 2, 2]}| ${true}
  ${Nobleman}| ${[1, 1, 1, 1, 1, 1]}| ${true}
  ${Nobleman}| ${[1, 1, 1, 2, 2, 4]}| ${false}
  ${King}| ${[1, 1, 1, 1, 1, 1, 1]}| ${true}
  ${King}| ${[1, 1, 1, 1, 1, 1, 2]}| ${false}
`('$model.name.en cost.valid($dices) -> $expected', ({model, dices, expected}) => {
  player.fixedDices = dices
  expect(model.cost.valid(player)).toBe(expected);
})

test.each([
  [Charlatan, [Maid], false],
  [Charlatan, [Maid, Fool], true],
])('cost.valid()', (model, cards, expected) => {
  player.cards = cards
  expect(model.cost.valid(player)).toBe(expected);
})

test.each([
  [Laborer, [1]],
  [Guard, [2]],
  [Hunter, [3]],
  [PawnBroker, [4]],
  [Knight, [5]],
  [Bishop, [6]],
])('ability.on() add activeDices', (model, expected) => {
  player.activeDices = []
  model.ability.on(player)
  expect(player.activeDices).toEqual(expected)
})

test.each([
  [Charlatan, 1],
  [Farmer, 2],
  [General, 4],
])('ability.on() immediately', (model, expected) => {
  model.ability.on(player, {})
  expect(player.diceNum).toEqual(expected)
})

test('King & Queen ability.on()', () => {
  player.activeDices = []
  King.ability.on(player, {})
  const Queen = player.cards.find(v => v.name.en === 'Queen')
  expect(!!Queen).toEqual(true)
  Queen!.ability.on(player, {changes: [6]})
  expect(player.activeDices).toEqual([6])
})

test.each([
  [Philosopher, [0, 5], [3, -3], [4, 2, 3, 4, 5, 3]],
  [Philosopher, [1, 4], [1, -1], [1, 3, 3, 4, 4, 6]],
  [Philosopher, [1, 4], [2, -1], null],
  [Alchemist, [2, 3, 4], [1, 0, -1], [1, 2, 4, 4, 4, 6]],
  [Alchemist, [0, 1, 5], [3, 2, -5], [4, 4, 3, 4, 5, 1]],
  [Maid, [0], [1], [2, 2, 3, 4, 5, 6]],
  [Maid, [1], [3], [1, 5, 3, 4, 5, 6]],
  [Astronomer, [0], [3], [3, 2, 3, 4, 5, 6]],
  [Astronomer, [1], [4], [1, 4, 3, 4, 5, 6]],
  [Noblewoman, undefined, [1, 0, 1, 0, 1, 0], [2, 2, 4, 4, 6, 6]],
  [Magician, [0], [6], [6, 2, 3, 4, 5, 6]],
  [Nobleman, undefined, [2, 0, 2, 2, 0, 0], [3, 2, 5, 6, 5, 6]],
])('model.ability.on()', (model, diceIdxes, changes, expected) => {
  player.activeDices = [1, 2, 3, 4, 5, 6]
  player.fixedDices = [3, 4]
  const selected = {diceIdxes, changes}
  if (expected === null) expect(() => model.ability.on(player, selected)).toThrowError(/invalid select/)
  else {
    model.ability.on(player, selected)
    expect(player.activeDices).toEqual(expected)
  }
})

const reRolledNum = 2
test.each([
  [Fool, [0], [1], [reRolledNum, 1, 1]],
  [Merchant, undefined, [1, 1, 0], [reRolledNum, reRolledNum, 1]],
])('ability.on() re-roll dices', (model, diceIdxes, changes, expected) => {
  const spy = vi.spyOn(player, '_rollDice')
  expect(spy.getMockName()).toEqual('_rollDice')
  spy.mockImplementation(() => reRolledNum)
  player.activeDices = [1, 1, 1]
  model.ability.on(player, {diceIdxes, changes})
  expect(player.activeDices).toEqual(expected)
})