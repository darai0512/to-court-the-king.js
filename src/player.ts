import {Timing, INITIAL_DICE_NUM, Step} from './const'
import {Card} from './card'

export default class Player {
  cards: Card[]
  cardCandidates: Card[]
  name: string
  diceNum: number
  activeDices: number[]
  fixedDices: number[]

  constructor(name: string) {
    this.cards = []
    this.name = name
    this.diceNum = 0
    this.fixedDices = []
    this.activeDices = []
    this.cardCandidates = []
  }

  _rollDice() {
    return Math.floor(Math.random() * 6) + 1
  }

  roll(initialRoll: boolean) {
    if (initialRoll) {
      this.diceNum += INITIAL_DICE_NUM
      this.fixedDices = []
    }
    this.activeDices = Array.from({ length: this.diceNum }, this._rollDice)
  }

  useAbility(params: {cardIdx: number, diceIdxes?: number[], changes?: number[]}) {
    const card = this.cardCandidates[params.cardIdx]
    if (card.ability.timing !== Timing.ability) return
    card.ability.on(this, params)
    this.cardCandidates.splice(params.cardIdx, 1)
  }

  fix(diceIdxes: number[]): void {
    if (!Array.isArray(diceIdxes)) throw '最低一つのダイスfixが必要'
    const dices = diceIdxes.map(v => this.activeDices[v])
    this.fixedDices.push(...dices)
    this.diceNum = this.activeDices.length - diceIdxes.length
  }

  choose(card: Card) {
    if (!card) throw '最低1枚のcard選択が必要'
    this.cards.push(card)
    for (const card of this.cards) {
      if (card.ability.timing === Timing.immediate) card.ability.on(this, {})
    }
    this.cardCandidates = this.cards.filter(card => card.ability.timing === Timing.ability)
  }

  hasQueen() {
    return this.cards.some(card => card.name.en === 'King')
  }
}