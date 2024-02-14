import {Step, cardCounts, FIRST_STEP} from './const'
import Player from './player'
import cards, {Card} from './card'

interface FieldData {
  players: Player[] // index = play order todo linked list is better?
  activePlayer: Player
  initialRoll: boolean
  cards: Card[]
  remainingCards: Record<string, number>
  step: Step
  round: number
  final: number | null
  winner: Player | null
}

export default class Field {
  data: FieldData

  constructor(players: Player[]) {
    this.data = {} as any
    this.data.players = players

    const playerNum = this.data.players.length
    if (!cardCounts[playerNum]) throw new Error('invalid playerNum')
    const cardCount = cardCounts[playerNum]
    this.data.cards = Object.values(cards)
    this.data.remainingCards = {}
    for (const card of this.data.cards) {
      this.data.remainingCards[card.name.en] = cardCount[card.level]
    }

    this.data.activePlayer = this.data.players[0]
    this.data.step = FIRST_STEP
    this.data.round = 1
    this.data.final = null
    this.data.winner = null
    this.data.initialRoll = true
  }

  _win(me: number[], old: number[]) {
    const [aPoint, aMax] = this._getPoint(me)
    const [bPoint, bMax] = this._getPoint(old)
    if (aPoint > bPoint) return true
    else if (aPoint === bPoint) return aMax > bMax
    return false
  }

  _getPoint(dice: number[]): [number, number] {
    const set = new Set(dice)
    /* @ts-ignore */
    return [dice.length - set.size + 1, Math.max(...set)]
  }

  /* action(ユーザーインタラクション)後の処理を行い次のステップに状態を進める
   * 疑似コード
   * const field = new Field([new Player('a'), new Player('b')])
   * while (true) {
   *   for (const player of field.players) {
   *     while (true) {
   *       player.roll()
   *       while (true) {
   *         const params: any = readline()
   *         if (!params) break
   *         player.useAbility(params)
   *       }
   *       const params: any = readline()
   *       player.fix(params)
   *       if (player.diceNum === 0) break
   *     }
   *     if (field.final === field.round) field._battle(player)
   *     else {
   *       const params: any = readline()
   *       player.choose(params)
   *       field._chosen(params)
   *       if (player.hasQueen()) field._goFinal(player)
   *     }
   *   }
   *   field.players.reverse()
   *   ++field.round
   * }
   */
  next(data: FieldData, params: {cardIdx?: number, diceIdxes?: number[], changes?: number[]}): FieldData {
    console.log('next', data, params)
    switch (data.step) {
      case Step.roll:
        data.activePlayer.roll(data.initialRoll)
        data.initialRoll = false
        data.step++
        break
      case Step.ability:
        /* @ts-ignore */
        if (typeof params.cardIdx === 'number') data.activePlayer.useAbility(params)
        else data.step++
        break
      case Step.fix:
        /* @ts-ignore */
        data.activePlayer.fix(params.diceIdxes)
        if (data.activePlayer.diceNum === 0) {
          if (data.final === data.round) {
            if (data.winner === null || this._win(data.activePlayer.fixedDices, data.winner.fixedDices)) {
              data.winner = data.activePlayer
            }
            this._nextPlayer(data)
          }
          else data.step++
        } else {
          data.step = Step.roll
        }
        break
      case Step.choice:
        /* @ts-ignore */
        const card = this._chosen(data.cards[params.cardIdx], data.remainingCards)
        data.activePlayer.choose(card)
        if (data.activePlayer.hasQueen()) {
          data.winner = data.activePlayer
          data.final = data.round + 1
        }
        this._nextPlayer(data)
        break
      default:
        break
    }
    this.data = data
    return data
  }

  _chosen(card: Card, remainingCards: Record<string, number>) {
    if (!card || typeof remainingCards[card.name.en] !== 'number' || remainingCards[card.name.en] <= 0) throw new Error('invalid card index')
    remainingCards[card.name.en]--
    return card
  }

  _nextPlayer(data: FieldData) {
    const i = data.players.indexOf(data.activePlayer)
    if (i < 0) throw new Error('invalid statement')
    else if (i === data.players.length - 1) this._nextRound(data)
    else data.activePlayer = data.players[i + 1]
    data.step = FIRST_STEP
    data.initialRoll = true
  }

  _nextRound(data: FieldData) {
    if (data.final === data.round) return
    data.round++
    data.players.reverse()
    if (data.final === data.round) {
      const i = data.players.findIndex(v => v.hasQueen())
      const player = data.players[i]
      data.players.splice(i, 1)
      data.players.push(player)
    }
    data.activePlayer = data.players[0]
  }

  isAvailable(card: Card, data: FieldData) {
    return data.round >= card.level &&
      data.remainingCards[card.name.en] > 0 &&
      !data.activePlayer.cards.includes(card) &&
      card.cost.valid(data.activePlayer)
  }
}