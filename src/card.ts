import Player from './player'
import { Timing, i11n  } from './const'


export type Selected = Record<string, number> // diceIdx: newDiceValue
type AssertSelected = (player:Player, selected: unknown) => asserts selected is Selected

export interface Card {
  name: i11n,
  image: string,
  level: number,
  cost: {
    description: i11n,
    valid: (player: Player, dryRun?: boolean) => boolean,
  },
  ability: {
    description: i11n,
    timing: typeof Timing[keyof typeof Timing],
    select?: { // このプロパティがない場合は即時発動
      dice: number, // 選択するダイス数の最大値
      new: boolean, // 新たなダイスの値を指定するか否か
      valid: AssertSelected, // 選択内容の妥当性確認(throwで違反内容を伝える)
    },
    on: ((player: Player, selected?: Selected) => void),
  },
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
  if (typeof selected !== 'object' || selected === null) throw 'invalid select'
  const selectedKeys = Object.keys(selected)
  if (length > -1 && selectedKeys.length !== length) throw 'invalid select'
  for (const idx of Object.keys(selected)) {
    const v = (selected as Selected)[idx]
    if (Number(idx) < 0 || Number(idx) >= diceNum || !diceRange.includes(v)) throw 'invalid select'
  }
}

const Queen: Card = {
  name: {
    en: 'Queen',
    ja: '王妃',
  },
  image: 'Queen.png',
  level: 5,
  cost: {
    description: {
      en: '',
      ja: '国王を獲得している',
    },
    valid: (_, __) => true,
  },
  ability: {
    description: {
      en: '',
      ja: '任意の出目のダイスを1個追加',
    },
    timing: Timing.ability,
    select: {
      dice: 0,
      new: true,
      valid: (player, selected) => isSelected(selected, 1, 1),
    },
    on: (player, selected): void => {
      const valid: AssertSelected = Queen.ability.select!.valid
      valid(player, selected)
      player.activeDices.push(Object.values(selected)[0])
    },
  },
}

const cards: Record<string, Card> = {
  Fool: {
    name: {
      en: 'Fool',
      ja: '道化師',
    },
    image: 'Fool.png',
    level: 0,
    cost: {
      description: {
        en: 'Free',
        ja: '出目合計0以上',
      },
      valid: (player: Player, _): boolean => true,
    },
    ability: {
      description: {
        en: '',
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
        player.activeDices[Number(Object.keys(selected)[0])] = player._rollDice()
      },
    },
  },
  Charlatan: {
    name: {
      en: 'Charlatan',
      ja: 'ペテン師',
    },
    image: 'Charlatan.png',
    level: 0,
    cost: {
      description: {
        en: '',
        ja: '道化師を所持(何枚でも所持可能)',
      },
      valid: (player, dryRun = true) => {
        const i = player.cards.findIndex(v => v.card === cards.Fool)
        if (i === -1) return false
        if (!dryRun) player.cards.splice(i, 1)
        return true
      },
    },
    ability: {
      description: {
        en: '',
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
    image: 'Farmer.png',
    level: 1,
    cost: {
      description: {
        en: '',
        ja: '同じ出目2つ :x: = :x:',
      },
      valid: (player, _) => sameDiceCount(player.fixedDices, 2),
    },
    ability: {
      description: {
        en: '',
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
    image: 'Philosopher.png',
    level: 1,
    cost: {
      description: {
        en: '',
        ja: '出目全てが偶数 ALL :2: / :4: / :6:',
      },
      valid: (player, _) => player.fixedDices.every(v => v % 2 === 0),
    },
    ability: {
      description: {
        en: '',
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
          if (sum !== 0) throw 'invalid select'
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
    image: 'Laborer.png',
    level: 1,
    cost: {
      description: {
        en: '',
        ja: '出目合計15以上 15+',
      },
      valid: (player, _) => player.fixedDices.reduce((a, b) => a + b, 0) >= 15,
    },
    ability: {
      description: {
        en: 'add a dice with a roll of "1"',
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
    image: 'Guard.png',
    level: 1,
    cost: {
      description: {
        en: '',
        ja: '同じ出目3つ :x: = x: = :x:',
      },
      valid: (player, _) => sameDiceCount(player.fixedDices, 3),
    },
    ability: {
      description: {
        en: 'add a dice with a roll of "2"',
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
    image: 'Maid.png',
    level: 1,
    cost: {
      description: {
        en: 'tbd',
        ja: '出目全てが奇数 ALL :1: / :3: / :5:',
      },
      valid: (player, _) => player.fixedDices.every((v) => [1, 3, 5].includes(v)),
    },
    ability: {
      description: {
        en: 'add "3" dice',
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
            if (diff > 3 || diff < 1) throw 'invalid select'
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
    image: 'Merchant.png',
    level: 2,
    cost: {
      description: {
        en: '',
        ja: '出目合計20以上 20+',
      },
      valid: (player, _) => player.fixedDices.reduce((a, b) => a + b, 0) >= 20,
    },
    ability: {
      description: {
        en: '',
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
          player.activeDices[Number(idx)] = player._rollDice()
        }
      },
    },
  },
  Astronomer: {
    name: {
      en: 'Astronomer',
      ja: '天文学者',
    },
    image: 'Astronomer.png',
    level: 2,
    cost: {
      description: {
        en: 'tbd',
        ja: '同じ出目2つが2組 :x: = :x: & :x: = :x:',
      },
      valid: (player, _) => sameDicePair(player.fixedDices, 2),
    },
    ability: {
      description: {
        en: '',
        ja: 'ダイス1個の出目を確定済ダイスの出目と同じ目に変更',
      },
      timing: Timing.ability,
      select: {
        dice: 1,
        new: true,
        valid: (player, selected) => {
          isSelected(selected, player.activeDices.length, cards.Astronomer.ability.select!.dice)
          for (const v of Object.values(selected)) if (!player.fixedDices.includes(v)) throw 'invalid select'
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
    image: 'Hunter.png',
    level: 2,
    cost: {
      description: {
        en: 'tbd',
        ja: '同じ出目4つ :x: = :x: = :x: = :x:',
      },
      valid: (player, _) => sameDiceCount(player.fixedDices, 4),
    },
    ability: {
      description: {
        en: 'add a dice with a roll of "3"',
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
    image: 'PawnBroker.png',
    level: 3,
    cost: {
      description: {
        en: '',
        ja: '出目合計30以上 30+',
      },
      valid: (player, _) => player.fixedDices.reduce((a, b) => a + b, 0) >= 30,
    },
    ability: {
      description: {
        en: 'add a dice with a roll of "4"',
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
    image: 'Noblewoman.png',
    level: 3,
    cost: {
      description: {
        en: '',
        ja: '同じ出目2つと同じ出目3つ :x: = :x: & :x: = :x: = :x:',
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
        en: '',
      },
      timing: Timing.ability,
      select: {
        dice: Infinity,
        new: false,
        valid: (player, selected) => {
          isSelected(selected, player.activeDices.length)
          for (const idx of Object.keys(selected)) {
            if (player.activeDices[Number(idx)] === 6) throw 'invalid select'
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
    image: 'Magician.png',
    level: 3,
    cost: {
      description: {
        en: '',
        ja: '連続した出目5つ (:1:) :2: :3: :4: :5: (:6:)',
      },
      valid: (player, _) => {
        const set = new Set(player.fixedDices)
        return set.size >= 5 && set.has(2) && set.has(3) && set.has(4) && set.has(5)
      }
    },
    ability: {
      description: {
        en: '',
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
    image: 'Knight.png',
    level: 3,
    cost: {
      description: {
        en: 'tbd',
        ja: '同じ出目5つ :x: = :x: = :x: = :x: = :x:',
      },
      valid: (player, _) => sameDiceCount(player.fixedDices, 5),
    },
    ability: {
      description: {
        en: 'add a dice with a roll of "5"',
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
    image: 'Bishop.png',
    level: 4,
    cost: {
      description: {
        en: 'tbd',
        ja: '同じ出目2つが3組 :x: = :x:, :x: = :x:, :x: = :x:',
      },
      valid: (player, _) => sameDicePair(player.fixedDices, 3),
    },
    ability: {
      description: {
        en: 'add a dice with a roll of "6"',
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
    image: 'Alchemist.png',
    level: 4,
    cost: {
      description: {
        en: 'tbd',
        ja: '連続した出目6つ :1: :2: :3: :4: :5: :6:',
      },
      valid: (player, _) => new Set(player.fixedDices).size === 6,
    },
    ability: {
      description: {
        en: 'When you roll a 6, you may pay 2 to gain 1 VP.',
        ja: 'ダイス3個の間で出目を-Xし、他のダイスを+Xする。3個の出目合計は同じに',
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
          if (sum !== 0) throw 'invalid select'
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
    image: 'General.png',
    level: 4,
    cost: {
      description: {
        en: '',
        ja: '同じ出目6つ :x: = :x: = :x: = :x: = :x: = :x:',
      },
      valid: (player, _) => sameDiceCount(player.fixedDices, 6)
    },
    ability: {
      description: {
        en: '',
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
    image: 'Nobleman.png',
    level: 4,
    cost: {
      description: {
        en: '',
        ja: '同じ出目3つが2組 :x: = :x: = :x: & :x: = :x: = :x:',
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
        en: '',
        ja: '任意の個数のダイスの出目に+2',
      },
      timing: Timing.ability,
      select: {
        dice: Infinity,
        new: true,
        valid: (player, selected) => {
          isSelected(selected, player.activeDices.length)
          for (const idx of Object.keys(selected)) {
            if ([5,6].includes(player.activeDices[Number(idx)])) throw 'invalid select'
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
    image: 'King.png',
    level: 5,
    cost: {
      description: {
        en: '',
        ja: '同じ出目7つ :x: = :x: = :x: = :x: = :x: = :x: = :x:',
      },
      valid: (player, _) => sameDiceCount(player.fixedDices, 7),
    },
    ability: {
      description: {
        en: '',
        ja: '王妃を獲得',
      },
      timing: Timing.immediate,
      on: (player, _) => {
        player.cards.push({card: Queen, available: true})
      },
    },
  },
}

export default cards