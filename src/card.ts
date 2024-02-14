import Player from './player'
import { Timing, i11n } from './const'


interface Selected {
  diceIdxes?: number[]
  changes?: number[]
}
interface CheckedSelected {
  diceIdxes: number[]
  changes: number[]
}
type AssertSelected = (player:Player, selected?: Selected) => asserts selected is CheckedSelected

export interface Card {
  name: i11n,
  image: string,
  level: number,
  cost: {
    desc: i11n,
    valid: (player: Player) => boolean,
  },
  ability: {
    desc: i11n,
    timing: typeof Timing[keyof typeof Timing],
    select: {
      dice?: number,
      change?: number[],
      valid: AssertSelected,
    },
    on: (player: Player, selected?: Selected) => void,
  },
}

const noSelect: AssertSelected = (player, selected) => {}

const checkDices = (player: Player): void => {
  for (const dice of player.activeDices) {
    if (dice < 1 || dice > 6) throw 'invalid select'
  }
}

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

const oneTo6 = [1, 2, 3, 4, 5, 6]
const changeDiceRange = [...Array(11)].map((_, i) => i - 6) // [-5,-4,-3,-2,-1,0,1,2,3,4,5]

const Queen: Card = {
  name: {
    en: 'Queen',
    ja: '王妃',
  },
  image: 'Queen.png',
  level: 5,
  cost: {
    desc: {
      en: '',
      ja: '国王を獲得している',
    },
    valid: (player) => player.cards.some(card => card.name.en === 'King'),
  },
  ability: {
    desc: {
      en: '',
      ja: '任意の出目のダイスを1個追加',
    },
    timing: Timing.ability,
    select: {
      change: oneTo6,
      valid: (player, selected) => {
        const {change} = Queen.ability.select
        if (!selected || !Array.isArray(selected.changes) ||
          selected.changes.length !== 1 ||
          !change!.includes(selected.changes[0])
        ) throw 'invalid select'
      }
    },
    on: (player, selected): void => {
      const valid: AssertSelected = Queen.ability.select.valid
      valid(player, selected)
      player.activeDices.push(selected.changes[0])
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
      desc: {
        en: 'Free',
        ja: '出目合計0以上',
      },
      valid: (player: Player): boolean => true,
    },
    ability: {
      desc: {
        en: '',
        ja: 'ダイス1個を振り直す',
      },
      timing: Timing.ability,
      select: {
        dice: 1,
        valid: (player, selected) => {
          if (!selected || !Array.isArray(selected.diceIdxes) ||
            selected.diceIdxes.length !== cards.Fool.ability.select.dice) throw 'invalid diceIdxes'
        },
      },
      on: (player, selected) => {
        const valid: AssertSelected = cards.Fool.ability.select.valid
        valid(player, selected)
        player.activeDices[selected.diceIdxes[0]] = player._rollDice()
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
      desc: {
        en: '',
        ja: '道化師を所持(何枚でも所持可能)',
      },
      valid: (player) => (player.cards as Card[]).includes(cards.Fool),
    },
    ability: {
      desc: {
        en: '',
        ja: '手番開始時にダイス1個追加',
      },
      timing: Timing.immediate,
      select: {
        valid: noSelect,
      },
      on: (player, _) => {
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
      desc: {
        en: '',
        ja: '同じ出目2つ :x: = :x:',
      },
      valid: (player) => sameDiceCount(player.fixedDices, 2),
    },
    ability: {
      desc: {
        en: '',
        ja: '手番開始時にダイス1個追加',
      },
      timing: Timing.immediate,
      select: {
        valid: noSelect,
      },
      on: (player, _) => {
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
      desc: {
        en: '',
        ja: '出目全てが偶数 ALL :2: / :4: / :6:',
      },
      valid: (player) => player.fixedDices.every(v => v % 2 === 0),
    },
    ability: {
      desc: {
        en: '',
        ja: 'ダイス1個の出目を-Xし、他のダイス1個に+Xする',
      },
      timing: Timing.ability,
      select: {
        dice: 2,
        change: changeDiceRange,
        valid: (player, selected) => {
          const {dice} = cards.Philosopher.ability.select
          if (!selected || !Array.isArray(selected.changes) ||
            !Array.isArray(selected.diceIdxes) ||
            selected.changes.length !== dice ||
            selected.diceIdxes.length !== dice ||
            selected.changes.reduce((v, p) => v + p, 0) !== 0
          ) throw 'invalid select'
        },
      },
      on: (player, selected): void => {
        const valid: AssertSelected = cards.Philosopher.ability.select.valid
        valid(player, selected)
        player.activeDices[selected.diceIdxes[0]] += selected.changes[0]
        player.activeDices[selected.diceIdxes[1]] += selected.changes[1]
        checkDices(player)
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
      desc: {
        en: '',
        ja: '出目合計15以上 15+',
      },
      valid: (player) => player.fixedDices.reduce((a, b) => a + b, 0) >= 15,
    },
    ability: {
      desc: {
        en: 'add a dice with a roll of "1"',
        ja: '出目「1」のダイスを1個追加',
      },
      select: {
        valid: noSelect,
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
      desc: {
        en: '',
        ja: '同じ出目3つ :x: = x: = :x:',
      },
      valid: (player) => sameDiceCount(player.fixedDices, 3),
    },
    ability: {
      desc: {
        en: 'add a dice with a roll of "2"',
        ja: '出目「2」のダイスを1個追加',
      },
      timing: Timing.ability,
      select: {
        valid: noSelect,
      },
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
      desc: {
        en: 'tbd',
        ja: '出目全てが奇数 ALL :1: / :3: / :5:',
      },
      valid: (player) => {
        return player.fixedDices.every((v) => [1, 3, 5].includes(v))
      },
    },
    ability: {
      desc: {
        en: 'add "3" dice',
        ja: 'ダイス1個の出目に1か2か3を加える',
      },
      timing: Timing.ability,
      select: {
        dice: 1,
        change: [1, 2, 3],
        valid: (player, selected) => {
          const {dice, change} = cards.Maid.ability.select
          if (!selected || !Array.isArray(selected.changes) ||
            !Array.isArray(selected.diceIdxes) ||
            selected.changes.length !== dice ||
            selected.diceIdxes.length !== dice ||
            !change!.includes(selected.changes[0])
          ) throw 'invalid select'
        },
      },
      on: (player, selected): void => {
        const valid: AssertSelected = cards.Maid.ability.select.valid
        valid(player, selected)
        player.activeDices[selected.diceIdxes[0]] += selected.changes[0]
        checkDices(player)
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
      desc: {
        en: '',
        ja: '出目合計20以上 20+',
      },
      valid: (player) => player.fixedDices.reduce((a, b) => a + b, 0) >= 20,
    },
    ability: {
      desc: {
        en: '',
        ja: '任意の個数のダイスを振り直す',
      },
      timing: Timing.ability,
      select: {
        change: [0, 1],
        valid: (player, selected) => {
          if (!selected || !Array.isArray(selected.changes) ||
            selected.changes.length !== player.activeDices.length
          ) throw 'invalid select'
        }
      },
      on: (player, selected): void => {
        const valid: AssertSelected = cards.Merchant.ability.select.valid
        valid(player, selected)
        player.activeDices = player.activeDices.map((v, i) => {
          if (selected.changes[i] === 0) return v
          return player._rollDice()
        })
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
      desc: {
        en: 'tbd',
        ja: '同じ出目2つが2組 :x: = :x: & :x: = :x:',
      },
      valid: (player) => sameDicePair(player.fixedDices, 2),
    },
    ability: {
      desc: {
        en: '',
        ja: 'ダイス1個の出目を確定済ダイスの出目と同じ目に変更',
      },
      timing: Timing.ability,
      select: {
        dice: 1,
        change: oneTo6,
        valid: (player, selected) => {
          const {dice} = cards.Astronomer.ability.select
          if (!selected || !Array.isArray(selected.changes) ||
            !Array.isArray(selected.diceIdxes) ||
            selected.diceIdxes.length !== dice ||
            selected.changes.length !== dice ||
            !player.fixedDices.includes(selected.changes[0])
          ) throw 'invalid select'
        }
      },
      on: (player, selected): void => {
        const valid: AssertSelected = cards.Astronomer.ability.select.valid
        valid(player, selected)
        player.activeDices[selected.diceIdxes[0]] = selected.changes[0]
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
      desc: {
        en: 'tbd',
        ja: '同じ出目4つ :x: = :x: = :x: = :x:',
      },
      valid: (player) => sameDiceCount(player.fixedDices, 4),
    },
    ability: {
      desc: {
        en: 'add a dice with a roll of "3"',
        ja: '出目「3」ダイスを1個追加',
      },
      timing: Timing.ability,
      select: {
        valid: noSelect,
      },
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
      desc: {
        en: '',
        ja: '出目合計30以上 30+',
      },
      valid: (player) => player.fixedDices.reduce((a, b) => a + b, 0) >= 30,
    },
    ability: {
      desc: {
        en: 'add a dice with a roll of "4"',
        ja: '出目「4」のダイスを1個追加',
      },
      timing: Timing.ability,
      select: {
        valid: noSelect,
      },
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
      desc: {
        en: '',
        ja: '同じ出目2つと同じ出目3つ :x: = :x: & :x: = :x: = :x:',
      },
      valid: (player) => {
        const counts: Record<number, number> = {}
        let flag2 = false
        let flag3 = false
        for (const v of player.fixedDices) {
          if (counts[v]) {
            counts[v] += 1
            if (counts[v] === 3) {
              flag3 = true
              counts[v] = 0
            } else if (counts[v] === 2) flag2 = true
            if (flag2 && flag3) return true
          } else counts[v] = 1
        }
        return false
      },
    },
    ability: {
      desc: {
        ja: '任意の個数のダイスの出目に+1',
        en: '',
      },
      timing: Timing.ability,
      select: {
        change: [0, 1],
        valid: (player, selected) => {
          const {change} = cards.Noblewoman.ability.select
          if (!selected || !Array.isArray(selected.changes) ||
            selected.changes.length !== player.activeDices.length ||
            !selected.changes.every(v => change!.includes(v))
          ) throw 'invalid select'
        },
      },
      on: (player, selected): void => {
        const valid: AssertSelected = cards.Noblewoman.ability.select.valid
        valid(player, selected)
        player.activeDices = player.activeDices.map((v, i) => v + selected.changes[i])
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
      desc: {
        en: '',
        ja: '連続した出目5つ (:1:) :2: :3: :4: :5: (:6:)',
      },
      valid: (player) => {
        const set = new Set(player.fixedDices)
        return set.size >= 5 && set.has(2) && set.has(3) && set.has(4) && set.has(5)
      }
    },
    ability: {
      desc: {
        en: '',
        ja: 'ダイス1個の出目を、任意の出目に変更',
      },
      timing: Timing.ability,
      select: {
        dice: 1,
        change: oneTo6,
        valid: (player, selected) => {
          const {dice, change} = cards.Magician.ability.select
          if (!selected || !Array.isArray(selected.changes) ||
            !Array.isArray(selected.diceIdxes) ||
            selected.changes.length !== dice ||
            selected.diceIdxes.length !== dice ||
            !change!.includes(selected.changes[0])
          ) throw 'invalid select'
        }
      },
      on: (player, selected): void => {
        const valid: AssertSelected = cards.Magician.ability.select.valid
        valid(player, selected)
        player.activeDices[selected.diceIdxes[0]] = selected.changes[0]
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
      desc: {
        en: 'tbd',
        ja: '同じ出目5つ :x: = :x: = :x: = :x: = :x:',
      },
      valid: (player) => sameDiceCount(player.fixedDices, 5),
    },
    ability: {
      desc: {
        en: 'add a dice with a roll of "5"',
        ja: '出目「5」ダイスを1個追加',
      },
      timing: Timing.ability,
      select: {
        valid: noSelect,
      },
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
      desc: {
        en: 'tbd',
        ja: '同じ出目2つが3組 :x: = :x:, :x: = :x:, :x: = :x:',
      },
      valid: (player) => sameDicePair(player.fixedDices, 3),
    },
    ability: {
      desc: {
        en: 'add a dice with a roll of "6"',
        ja: '出目「6」ダイスを1個追加',
      },
      timing: Timing.ability,
      select: {
        valid: noSelect,
      },
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
      desc: {
        en: 'tbd',
        ja: '連続した出目6つ :1: :2: :3: :4: :5: :6:',
      },
      valid: (player) => new Set(player.fixedDices).size === 6,
    },
    ability: {
      desc: {
        en: 'When you roll a 6, you may pay 2 to gain 1 VP.',
        ja: 'ダイス3個の間で出目を-Xし、他のダイスを+Xする。3個の出目合計は同じに',
      },
      timing: Timing.ability,
      select: {
        dice: 3,
        change: changeDiceRange,
        valid: (player, selected) => {
          const {dice} = cards.Alchemist.ability.select
          if (!selected || !Array.isArray(selected.changes) ||
            !Array.isArray(selected.diceIdxes) ||
            selected.changes.length !== dice ||
            selected.diceIdxes.length !== dice ||
            selected.changes.reduce((v, p) => v + p, 0) !== 0
          ) throw 'invalid select'
        },
      },
      on: (player, selected): void => {
        const valid: AssertSelected = cards.Alchemist.ability.select.valid
        valid(player, selected)
        player.activeDices[selected.diceIdxes[0]] += selected.changes[0]
        player.activeDices[selected.diceIdxes[1]] += selected.changes[1]
        player.activeDices[selected.diceIdxes[2]] += selected.changes[2]
        checkDices(player)
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
      desc: {
        en: '',
        ja: '同じ出目6つ :x: = :x: = :x: = :x: = :x: = :x:',
      },
      valid: (player) => sameDiceCount(player.fixedDices, 6)
    },
    ability: {
      desc: {
        en: '',
        ja: '手番開始時にダイス2個追加',
      },
      timing: Timing.immediate,
      select: {
        valid: noSelect,
      },
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
      desc: {
        en: '',
        ja: '同じ出目3つが2組 :x: = :x: = :x: & :x: = :x: = :x:',
      },
      valid: (player) => {
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
      desc: {
        en: '',
        ja: '任意の個数のダイスの出目に+2',
      },
      timing: Timing.ability,
      select: {
        change: [0, 2],
        valid: (player, selected) => {
          const {change} = cards.Nobleman.ability.select
          if (!selected || !Array.isArray(selected.changes) ||
            selected.changes.length !== player.activeDices.length ||
            !selected.changes.every(v => change!.includes(v))
          ) throw 'invalid select'
        },
      },
      on: (player, selected): void => {
        const valid: AssertSelected = cards.Nobleman.ability.select.valid
        valid(player, selected)
        player.activeDices = player.activeDices.map((v, i) => v + selected.changes[i])
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
      desc: {
        en: '',
        ja: '同じ出目7つ :x: = :x: = :x: = :x: = :x: = :x: = :x:',
      },
      valid: (player) => sameDiceCount(player.fixedDices, 7),
    },
    ability: {
      desc: {
        en: '',
        ja: '王妃を獲得',
      },
      timing: Timing.immediate,
      select: {
        valid: noSelect,
      },
      on: (player, _) => {
        player.cards.push(Queen)
      },
    },
  },
}

export default cards