import { expect, test } from "vitest";
import Field from "./field";
import cards from "./card";
import {FieldError} from "~/src/util"
import {Step} from './const'
import type {Player} from './index'

function init(): [Field, Player] {
  const field: Field = new Field()
  field.next(field.data, {players: [{
      name: 'name',
      id: 'id',
    }, {
      name: 'name2',
      id: 'id2',
    }]})
  return [field, field.data.players[field.data.activePlayer]]
}

test("Error field.initialize", () => {
  const field: Field = new Field()
  expect(() => field.next(field.data, {players: [{
      name: 'name',
      id: 'id',
    }]})).toThrowError(/invalid_player_number/)
})

test("field.initialize", () => {
  const [field, _] = init()
  const data = field.data

  expect(data.step).toEqual(Step.roll)
  expect(data.players.length).toEqual(2)
})

test("field.initialize with order", () => {
  const field: Field = new Field()
  field.next(field.data, {players: [{
      name: '0',
      id: '0',
    }, {
      name: '2',
      id: '2',
    }, {
      name: '3',
      id: '3',
    }, {
      name: '4',
      id: '4',
    }, {
      name: '1',
      id: '1',
    }]})
  expect(field.data.step).toEqual(Step.roll)
  expect(field.data.players.length).toEqual(5)
  expect(field.data.players.map(v => v.id)).toEqual(['0', '2', '3', '4', '1'])
})

test.each`
  me | old | expected
  ${[3,3,3,4,5]}| ${[4,4,1,2,3]} | ${1}
  ${[3,3,3,4,5,4,5]}| ${[6,6,6,6,3]} | ${-1}
  ${[3,3,3,4,5]}| ${[3,3,4,6,3,4,6]} | ${0}
  ${[3,3,3,3,5]}| ${[2,2,2,2,1,1,1,1]} | ${1}
  ${[3,3,3,3,5]}| ${[2,2,2,2,1,1,1,1,1]} | ${-1}
`('field._win($me, $old) -> $expected', ({me, old, expected}) => {
  const field: Field = new Field()
  expect(field._win(me, old)).toEqual(expected)
});

test("player.roll", () => {
  const [field, player] = init()
  field.roll(player)
  expect(player.activeDices.length).toEqual(3)
});

test("player.UseCard", () => {
  const [field, player] = init()
  player.cards = [{name: cards.Laborer.name.en, available: true}]
  field.useCard(player, {cardIdx: 0})
  expect(player.activeDices.pop()).toEqual(1)
  expect(player.cards[0].available).toEqual(false)
});

test("Error player.UseCard", () => {
  const [field, player] = init()
  try {
    player.cards = [{name: cards.Laborer.name.en, available: false}]
    field.useCard(player, {cardIdx: 0})
    expect(true).toBe(false)
  } catch(e) {
    expect(e).toBeInstanceOf(Error)
    expect((e as FieldError).code).toBe('not_available_card')
    expect((e as FieldError).message).toBe('not_available_card')
  }
})

test("player.fix", () => {
  const [field, player] = init()
  player.activeDices = [1, 2, 3]
  player.fixedDices = [1]
  field.fix(player, [0, 1])
  expect(player.fixedDices).toEqual([1, 1, 2])
  expect(player.diceNum).toEqual(1)
})

test("Error player.fix", () => {
  const [field, player] = init()
  try {
    field.fix(player, [])
    expect(true).toBe(false)
  } catch(e) {
    expect((e as FieldError).code).toBe('require_at_least_1_dice')
    expect((e as FieldError).message).toBe('require_at_least_1_dice')
  }
})

test("player.choose", () => {
  const [field, player] = init()
  player.diceNum = 0
  player.fixedDices = [1,1,1]
  field.data.remainingCards.Farmer = 1
  field.choose(player, field.data, cards.Farmer.name.en)
  expect(player.cards.at(-1)).toEqual({name: cards.Farmer.name.en, available: false})
  expect(player.diceNum).toEqual(4)
});

test("player.choose no card", () => {
  const [field, player] = init()
  field.choose(player, field.data, undefined)
  expect(player.cards.length).toEqual(0)
  expect(player.diceNum).toEqual(3)
})

test("field._nextRound final", () => {
  const [field, player] = init()
  let data = field.data
  // 2playerでfinal前の最初から再現
  data.step = Step.roll
  data.round = 10
  data.activePlayer = 0
  data = field.next(data, {})
  expect(data.step).toBe(Step.fix)
  data = field.next(data, {dices: data.players[data.activePlayer].activeDices.map((v,i)=>i)})
  expect(data.step).toBe(Step.choice)
  data = field.next(data, {card: undefined})
  expect(data.players[data.activePlayer].diceNum).toBeGreaterThanOrEqual(3)
  expect(data.step).toBe(Step.roll)

  data.step = Step.choice
  const activePlayer = data.players[data.activePlayer]
  activePlayer.fixedDices = [1,1,1,1,1,1,1]
  data = field.next(data, {card: 'King'})

  const lastPlayer = data.players.at(-1)
  function check(p: any): asserts p is Player {
    expect(p.id).toEqual(activePlayer.id) // King player become last
  }
  check(lastPlayer)
  expect(field._hasQueen(lastPlayer)).toBe(true)
  expect(data.top.playerId).toBe(lastPlayer.id)
  expect(data.top.dices).toEqual([1,1,1,1,1,1,1])
  expect(data.round).toBe('final')
  expect(data.step).toBe(Step.roll)
  expect(data.players[data.activePlayer].diceNum).toBeGreaterThanOrEqual(3)
})