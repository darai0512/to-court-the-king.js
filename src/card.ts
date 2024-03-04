import {Timing, Step} from './const'
import {FieldError} from './util'
import type {PlayerCard, FieldData, Player, Card, Selected, AssertSelected} from "~/src/index";

export function rollDice() {
  return Math.floor(Math.random() * 6) + 1
}

const diceRange = [1, 2, 3, 4, 5, 6]

const sameDicePair = (fixedDices: number[], expected: number): boolean => {
  const counts: Record<number, boolean> = {}
  let count = 0
  for (const v of fixedDices) {
    if (counts[v]) {
      count += 1
      counts[v] = false
    } else counts[v] = true
  }
  return count >= expected
}

const sameDiceCount = (fixedDices: number[], expected: number): boolean => {
  const counts: Record<number, number> = {}
  for (const v of fixedDices) {
    if (counts[v]) {
      counts[v] += 1
      if (counts[v] === expected) return true
    } else counts[v] = 1
  }
  return false
}

type IsSelected = (selected: unknown, diceNum: number, length?: number) => asserts selected is Selected
const isSelected: IsSelected = (selected: unknown, diceNum: number, length: number = -1) => {
  if (typeof selected !== 'object' || selected === null) throw new FieldError('invalid_data')
  const selectedKeys = Object.keys(selected)
  if (length > -1 && selectedKeys.length !== length) throw new FieldError('invalid_data')
  for (const idx of Object.keys(selected)) {
    const v = (selected as Selected)[idx]
    if (Number(idx) < 0 || Number(idx) >= diceNum || !diceRange.includes(v)) throw new FieldError('invalid_data')
  }
}


const cards: Record<string, Card> = {
  Fool: {
    name: {
      en: 'Fool',
      ja: '道化師',
    },
    level: 0,
    cost: {
      visual: '',
      description: {
        en: 'Can get with any dice result',
        ja: '出目合計0以上',
      },
      valid: (player: Player, _): boolean => true,
    },
    ability: {
      description: {
        en: 'Re-roll 1 active dice',
        ja: 'ダイス1個を振り直す',
      },
      timing: Timing.ability,
      select: {
        dice: 1,
        new: false,
        valid: (player, selected) => isSelected(selected, player.activeDices.length, cards.Fool.ability.select!.dice),
      },
      on: (player, selected) => {
        const valid: AssertSelected = cards.Fool.ability.select!.valid
        valid(player, selected)
        player.activeDices[Number(Object.keys(selected)[0])] = rollDice()
      },
    },
  },
  Charlatan: {
    name: {
      en: 'Charlatan',
      ja: 'ペテン師',
    },
    level: 0,
    cost: {
      visual: '',
      description: {
        en: 'Has a clown (can possess any number of clowns)',
        ja: '道化師を所持(何枚でも所持可能)',
      },
      valid: (player, dryRun = true) => {
        const i = player.cards.findIndex(v => v.name === cards.Fool.name.en)
        if (i === -1) return false
        if (!dryRun) player.cards.splice(i, 1)
        return true
      },
    },
    ability: {
      description: {
        en: 'Add 1 additional dice at the beginning of your turn',
        ja: '手番開始時にダイス1個追加',
      },
      timing: Timing.immediate,
      on: (player: Player) => {
        player.diceNum += 1
      },
    },
  },
  Farmer: {
    name: {
      en: 'Farmer',
      ja: '農夫',
    },
    level: 1,
    cost: {
      visual: ':x: = :x:',
      description: {
        en: '2 dice with the same number of pips',
        ja: '同じ出目2つ',
      },
      valid: (player, _) => sameDiceCount(player.fixedDices, 2),
    },
    ability: {
      description: {
        en: 'Add 1 additional dice at the beginning of your turn',
        ja: '手番開始時にダイス1個追加',
      },
      timing: Timing.immediate,
      on: (player: Player) => {
        player.diceNum += 1
      },
    },
  },
  Philosopher: {
    name: {
      en: 'Philosopher',
      ja: '哲学者',
    },
    level: 1,
    cost: {
      visual: 'ALL :2: / :4: / :6:',
      description: {
        en: 'Each dice show an even number of pips',
        ja: '出目全てが偶数',
      },
      valid: (player, _) => player.fixedDices.every(v => v % 2 === 0),
    },
    ability: {
      description: {
        en: '-X to the 1 dice and +X to another dice',
        ja: 'ダイス1個の出目を-Xし、他のダイス1個に+Xする',
      },
      timing: Timing.ability,
      select: {
        dice: 2,
        new: true,
        valid: (player, selected) => {
          isSelected(selected, player.activeDices.length, cards.Philosopher.ability.select!.dice)
          let sum = 0
          for (const idx of Object.keys(selected)) {
            sum += selected[idx] - player.activeDices[Number(idx)]
          }
          if (sum !== 0) throw new FieldError('invalid_data')
        },
      },
      on: (player, selected): void => {
        const valid: AssertSelected = cards.Philosopher.ability.select!.valid
        valid(player, selected)
        for (const idx of Object.keys(selected)) player.activeDices[Number(idx)] = selected[idx]
      },
    },
  },
  Laborer: {
    name: {
      en: 'Laborer',
      ja: '職人',
    },
    level: 1,
    cost: {
      visual: '15+',
      description: {
        en: 'Total number of dices 15 or higher',
        ja: '出目合計15以上',
      },
      valid: (player, _) => player.fixedDices.reduce((a, b) => a + b, 0) >= 15,
    },
    ability: {
      description: {
        en: 'Add a dice with a roll of "1"',
        ja: '出目「1」のダイスを1個追加',
      },
      timing: Timing.ability,
      on: (player, selected): void => {
        player.activeDices.push(1)
      },
    },
  },
  Guard: {
    name: {
      en: 'Guard',
      ja: '衛兵',
    },
    level: 1,
    cost: {
      visual: ':x: = x: = :x:',
      description: {
        en: '3 dice with the same number of pips',
        ja: '同じ出目3つ',
      },
      valid: (player, _) => sameDiceCount(player.fixedDices, 3),
    },
    ability: {
      description: {
        en: 'Add a dice with a roll of "2"',
        ja: '出目「2」のダイスを1個追加',
      },
      timing: Timing.ability,
      on: (player, selected): void => {
        player.activeDices.push(2)
      },
    },
  },
  Maid: {
    name: {
      en: 'Maid',
      ja: 'メイド',
    },
    level: 1,
    cost: {
      visual: 'ALL :1: / :3: / :5:',
      description: {
        en: 'Each dice show an odd number of pips',
        ja: '出目全てが奇数',
      },
      valid: (player, _) => player.fixedDices.every((v) => [1, 3, 5].includes(v)),
    },
    ability: {
      description: {
        en: 'Add 1, 2 or 3 to the roll of 1 dice',
        ja: 'ダイス1個の出目に1か2か3を加える',
      },
      timing: Timing.ability,
      select: {
        dice: 1,
        new: true,
        valid: (player, selected) => {
          isSelected(selected, player.activeDices.length, cards.Maid.ability.select!.dice)
          for (const idx of Object.keys(selected)) {
            const diff = selected[idx] - player.activeDices[Number(idx)]
            if (diff > 3 || diff < 1) throw new FieldError('invalid_data')
          }
        },
      },
      on: (player, selected): void => {
        const valid: AssertSelected = cards.Maid.ability.select!.valid
        valid(player, selected)
        for (const idx of Object.keys(selected)) player.activeDices[Number(idx)] = selected[idx]
      },
    },
  },
  Merchant: {
    name: {
      en: 'Merchant',
      ja: '商人',
    },
    level: 2,
    cost: {
      visual: '20+',
      description: {
        en: 'Total number of dices 20 or higher',
        ja: '出目合計20以上',
      },
      valid: (player, _) => player.fixedDices.reduce((a, b) => a + b, 0) >= 20,
    },
    ability: {
      description: {
        en: 'Re-roll any number of active dice',
        ja: '任意の個数のダイスを振り直す',
      },
      timing: Timing.ability,
      select: {
        dice: Infinity,
        new: false,
        valid: (player, selected) => isSelected(selected, player.activeDices.length),
      },
      on: (player, selected): void => {
        const valid: AssertSelected = cards.Merchant.ability.select!.valid
        valid(player, selected)
        for (const idx of Object.keys(selected)) {
          player.activeDices[Number(idx)] = rollDice()
        }
      },
    },
  },
  Astronomer: {
    name: {
      en: 'Astronomer',
      ja: '天文学者',
    },
    level: 2,
    cost: {
      visual: ':x: = :x: & :x: = :x:',
      description: {
        en: '2 sets of 2 dice with the same number of pips',
        ja: '同じ出目2つが2組',
      },
      valid: (player, _) => sameDicePair(player.fixedDices, 2),
    },
    ability: {
      description: {
        en: 'Adjust 1 active dice value to be the same as 1 of fixed dices',
        ja: 'ダイス1個の出目を確定済ダイスの出目と同じ目に変更',
      },
      timing: Timing.ability,
      select: {
        dice: 1,
        new: true,
        valid: (player, selected) => {
          isSelected(selected, player.activeDices.length, cards.Astronomer.ability.select!.dice)
          for (const v of Object.values(selected)) if (!player.fixedDices.includes(v)) throw new FieldError('invalid_data')
        }
      },
      on: (player, selected): void => {
        const valid: AssertSelected = cards.Astronomer.ability.select!.valid
        valid(player, selected)
        for (const idx of Object.keys(selected)) player.activeDices[Number(idx)] = selected[idx]
      },
    },
  },
  Hunter: {
    name: {
      en: 'Hunter',
      ja: '狩人',
    },
    level: 2,
    cost: {
      visual: ':x: = :x: = :x: = :x:',
      description: {
        en: '4 dice with the same number of pips',
        ja: '同じ出目4つ',
      },
      valid: (player, _) => sameDiceCount(player.fixedDices, 4),
    },
    ability: {
      description: {
        en: 'Add a dice with a roll of "3"',
        ja: '出目「3」ダイスを1個追加',
      },
      timing: Timing.ability,
      on: (player, selected): void => {
        player.activeDices.push(3)
      },
    },
  },
  PawnBroker: {
    name: {
      en: 'PawnBroker',
      ja: '質屋',
    },
    level: 3,
    cost: {
      visual: '30+',
      description: {
        en: 'Total number of dices 30 or higher',
        ja: '出目合計30以上',
      },
      valid: (player, _) => player.fixedDices.reduce((a, b) => a + b, 0) >= 30,
    },
    ability: {
      description: {
        en: 'Add a dice with a roll of "4"',
        ja: '出目「4」のダイスを1個追加',
      },
      timing: Timing.ability,
      on: (player, selected): void => {
        player.activeDices.push(4)
      },
    },
  },
  Noblewoman: {
    name: {
      en: 'Noblewoman',
      ja: '貴婦人',
    },
    level: 3,
    cost: {
      visual: ':x: = :x: & :x: = :x: = :x:',
      description: {
        en: 'Include 1 pair and 1 triplet',
        ja: '同じ出目2つと同じ出目3つ',
      },
      valid: (player, _) => {
        const counts: Record<number, number> = {}
        let flag2 = 0
        let flag3 = 0
        for (const v of player.fixedDices) {
          if (counts[v]) {
            counts[v] += 1
            if (counts[v] === 5) return true
            else if (counts[v] === 3) {
              flag3 = v
              if (flag2 === v) flag2 = 0
            } else if (counts[v] === 2) flag2 = v
            if (flag2 && flag3) return true
          } else counts[v] = 1
        }
        return false
      },
    },
    ability: {
      description: {
        ja: '任意の個数のダイスの出目に+1',
        en: 'Add 1 pip each to any number of active dices',
      },
      timing: Timing.ability,
      select: {
        dice: Infinity,
        new: false,
        valid: (player, selected) => {
          isSelected(selected, player.activeDices.length)
          for (const idx of Object.keys(selected)) {
            if (player.activeDices[Number(idx)] === 6) throw new FieldError('invalid_data')
          }
        },
      },
      on: (player, selected): void => {
        const valid: AssertSelected = cards.Noblewoman.ability.select!.valid
        valid(player, selected)
        for (const idx of Object.keys(selected)) {
          player.activeDices[Number(idx)] += 1
        }
      },
    },
  },
  Magician: {
    name: {
      en: 'Magician',
      ja: '魔術師',
    },
    level: 3,
    cost: {
      visual: '(:1:) :2: :3: :4: :5: (:6:)',
      description: {
        en: 'Include a straight of length 5',
        ja: '連続した出目5つ',
      },
      valid: (player, _) => {
        const set = new Set(player.fixedDices)
        return set.size >= 5 && set.has(2) && set.has(3) && set.has(4) && set.has(5)
      }
    },
    ability: {
      description: {
        en: 'Adjust 1 active dice to any value',
        ja: 'ダイス1個の出目を、任意の出目に変更',
      },
      timing: Timing.ability,
      select: {
        dice: 1,
        new: true,
        valid: (player, selected) => isSelected(selected, player.activeDices.length, cards.Magician.ability.select!.dice),
      },
      on: (player, selected): void => {
        const valid: AssertSelected = cards.Magician.ability.select!.valid
        valid(player, selected)
        for (const idx of Object.keys(selected)) player.activeDices[Number(idx)] = selected[idx]
      },
    },
  },
  Knight: {
    name: {
      en: 'Knight',
      ja: '騎士',
    },
    level: 3,
    cost: {
      visual: ':x: = :x: = :x: = :x: = :x:',
      description: {
        en: '5 dice with the same number of pips',
        ja: '同じ出目5つ',
      },
      valid: (player, _) => sameDiceCount(player.fixedDices, 5),
    },
    ability: {
      description: {
        en: 'Add a dice with a roll of "5"',
        ja: '出目「5」ダイスを1個追加',
      },
      timing: Timing.ability,
      on: (player, selected): void => {
        player.activeDices.push(5)
      },
    },
  },
  Bishop: {
    name: {
      en: 'Bishop',
      ja: '司教',
    },
    level: 4,
    cost: {
      visual: ':x: = :x:, :x: = :x:, :x: = :x:',
      description: {
        en: 'Include a 3 pairs',
        ja: '同じ出目2つが3組',
      },
      valid: (player, _) => sameDicePair(player.fixedDices, 3),
    },
    ability: {
      description: {
        en: 'Add a dice with a roll of "6"',
        ja: '出目「6」ダイスを1個追加',
      },
      timing: Timing.ability,
      on: (player, selected): void => {
        player.activeDices.push(6)
      },
    },
  },
  Alchemist: {
    name: {
      en: 'Alchemist',
      ja: '錬金術士',
    },
    level: 4,
    cost: {
      visual: ':1: :2: :3: :4: :5: :6:',
      description: {
        en: 'Include a straight of length 6',
        ja: '連続した出目6つ',
      },
      valid: (player, _) => new Set(player.fixedDices).size === 6,
    },
    ability: {
      description: {
        en: 'Move the pips among 3 active dices (total values are the same)',
        ja: 'ダイス3個の間で、出目を-Xし、他のダイスを+Xする(出目合計は同じ)',
      },
      timing: Timing.ability,
      select: {
        dice: 3,
        new: true,
        valid: (player, selected) => {
          isSelected(selected, player.activeDices.length, cards.Alchemist.ability.select!.dice)
          let sum = 0
          for (const idx of Object.keys(selected)) {
            sum += selected[idx] - player.activeDices[Number(idx)]
          }
          if (sum !== 0) throw new FieldError('invalid_data')
        },
      },
      on: (player, selected): void => {
        const valid: AssertSelected = cards.Alchemist.ability.select!.valid
        valid(player, selected)
        for (const idx of Object.keys(selected)) player.activeDices[Number(idx)] = selected[idx]
      },
    },
  },
  General: {
    name: {
      en: 'General',
      ja: '将軍',
    },
    level: 4,
    cost: {
      visual: ':x: = :x: = :x: = :x: = :x: = :x:',
      description: {
        en: '6 dice with the same number of pips',
        ja: '同じ出目6つ',
      },
      valid: (player, _) => sameDiceCount(player.fixedDices, 6)
    },
    ability: {
      description: {
        en: 'Add 2 additional dice at the beginning of your turn',
        ja: '手番開始時にダイス2個追加',
      },
      timing: Timing.immediate,
      on: (player, selected): void => {
        player.diceNum += 2
      }
    },
  },
  Nobleman: {
    name: {
      en: 'Nobleman',
      ja: '貴族',
    },
    level: 4,
    cost: {
      visual: ':x: = :x: = :x: & :x: = :x: = :x:',
      description: {
        en: 'Include a 2 triplets',
        ja: '同じ出目3つが2組',
      },
      valid: (player, _) => {
        const counts: Record<number, number> = {}
        let flag3 = 0
        for (const v of player.fixedDices) {
          if (counts[v]) {
            counts[v] += 1
            if (counts[v] === 3) {
              counts[v] = 0
              if (++flag3 > 1) return true
            }
          } else counts[v] = 1
        }
        return false
      },
    },
    ability: {
      description: {
        en: '+2 on any number of dices',
        ja: '任意の個数のダイスの出目に+2',
      },
      timing: Timing.ability,
      select: {
        dice: Infinity,
        new: false,
        valid: (player, selected) => {
          isSelected(selected, player.activeDices.length)
          for (const idx of Object.keys(selected)) {
            if ([5,6].includes(player.activeDices[Number(idx)])) throw new FieldError('invalid_data')
          }
        },
      },
      on: (player, selected): void => {
        const valid: AssertSelected = cards.Nobleman.ability.select!.valid
        valid(player, selected)
        for (const idx of Object.keys(selected)) player.activeDices[Number(idx)] += 2
      },
    },
  },
  King: {
    name: {
      en: 'King',
      ja: '国王',
    },
    level: 5,
    cost: {
      visual: ':x: = :x: = :x: = :x: = :x: = :x: = :x:',
      description: {
        en: '7 dice with the same number of pips',
        ja: '同じ出目7つ',
      },
      valid: (player, _) => sameDiceCount(player.fixedDices, 7),
    },
    ability: {
      description: {
        en: 'Gain a Queen',
        ja: '王妃を獲得',
      },
      timing: Timing.immediate,
      on: (player, _) => {
        player.cards.push({name: cards.Queen.name.en, available: true})
      },
    },
  },
  Queen: {
    name: {
      en: 'Queen',
      ja: '王妃',
    },
    level: 5,
    cost: {
      visual: '',
      description: {
        en: 'Got a King',
        ja: '国王を獲得している',
      },
      valid: (_, __) => false,
    },
    ability: {
      description: {
        en: 'Add a dice with a roll of any number',
        ja: '任意の出目のダイスを1個追加',
      },
      timing: Timing.ability,
      select: {
        dice: 0,
        new: true,
        valid: (player, selected) => isSelected(selected, 1, 1),
      },
      on: (player, selected): void => {
        const valid: AssertSelected = cards.Queen.ability.select!.valid
        valid(player, selected)
        player.activeDices.push(Object.values(selected)[0])
      },
    },
  },
}

export function isAvailable(data: FieldData, card: Card) {
  const activePlayer = data.players[data.activePlayer]
  return typeof data.round === 'number' && data.round >= card.level &&
    data.remainingCards[card.name.en] > 0 &&
    !activePlayer.cards.some((p: PlayerCard) => p.name !== cards.Charlatan.name.en && p.name === card.name.en) &&
    card.cost.valid(activePlayer, true)
}

export default cards