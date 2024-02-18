import {Timing, INITIAL_DICE_NUM} from './const'
import cards, {Card, Selected} from './card'

interface PlayerCard {
  card: Card
  available: boolean
}

export default class Player {
  cards: PlayerCard[]
  name: string
  diceNum: number
  activeDices: number[]
  fixedDices: number[]
  hasQueen: boolean

  constructor(name: string) {
    this.cards = []
    this.name = name
    this.diceNum = INITIAL_DICE_NUM
    this.fixedDices = []
    this.activeDices = []
    this.hasQueen = false
  }

  _rollDice() {
    return Math.floor(Math.random() * 6) + 1
  }

  roll() {
    this.activeDices = Array.from({ length: this.diceNum }, this._rollDice)
  }

  useAbility({cardIdx, selected}: {cardIdx: number, selected?: Selected}) {
    const v = this.cards[cardIdx]
    if (!v.available) throw '使用不可のカード'
    v.card.ability.on(this, selected)
    v.available = false
  }

  fix(diceIdxes: number[]): void {
    if (!Array.isArray(diceIdxes)) throw '最低一つのダイスfixが必要'
    const dices = diceIdxes.map(v => this.activeDices[v])
    this.fixedDices.push(...dices)
    this.diceNum = this.activeDices.length - diceIdxes.length
  }

  choose(card: Card) {
    if (!card) throw '最低1枚のcard選択が必要'
    this.cards.push({card, available: card.ability.timing === Timing.ability})

    if (card === cards.King) this.hasQueen = true
    this.diceNum = INITIAL_DICE_NUM
    for (const v of this.cards) {
      if (v.card.ability.timing === Timing.immediate) v.card.ability.on(this)
      else v.available = true
    }
    const dices = [...this.fixedDices]
    this.fixedDices = []
    return dices
  }
}