import {Step, cardCounts} from './const'
import Player from './player'
import cards, {Card, Selected} from './card'

const Final = 'final'

export interface FieldData {
  MAX_PLAYER_NUM: number
  players: Player[] // index = play order todo linked list is better?
  activePlayer: Player
  remainingCards: Record<string, number>
  step: Step
  round: number | typeof Final
  top: {
    player: Player
    dices: number[]
  } | null
  winner: Player | null
}
interface NextParams {
  cardIdx?: number
  selected?: Selected
  diceIdxes?: number[]
  players?: string[]
}

export default class Field {
  data: FieldData
  cards: Card[]

  constructor() {
    this.cards = Object.values(cards)
    this.data = {} as any
    this.data.players = []
    this.data.remainingCards = {}
    this.data.step = Step.initialize
    this.data.round = 1
    this.data.top = null
    this.data.winner = null
    this.data.MAX_PLAYER_NUM = Math.max(...Object.keys(cardCounts).map(v => Number(v)))
  }

  _initialize(players: string[], data: FieldData) {
    data.players = players.filter(v => !!v).map(v => new Player(v))
    data.activePlayer = data.players[0]
    const playerNum = data.players.length
    if (!cardCounts[playerNum]) throw new Error('invalid player number')
    const cardCount = cardCounts[playerNum]
    for (const card of this.cards) data.remainingCards[card.name.en] = cardCount[card.level]
  }

  _win(me: number[], old: number[]) {
    const {same: aSame, dice: aNum} = this._getPoint(me)
    const {same: bSame, dice: bNum} = this._getPoint(old)
    if (aSame > bSame) return 1
    else if (aSame === bSame) {
      if (aNum > bNum) return 1
      else if (aNum === bNum) return 0
    }
    return -1
  }

  _getPoint(dices: number[]) {
    const counts: Record<number, number> = {}
    const max = {dice: 0, same: 0}
    for (const v of dices) {
      counts[v] = (counts[v] || 0) + 1
      if (max.same < counts[v]) {
        max.same = counts[v]
        max.dice = v
      } else if (max.same === counts[v]) {
        max.dice = Math.max(max.dice, v)
      }
    }
    return max
  }

  /* action(ユーザーインタラクション)後の処理を行い次のステップに状態を進める
   * 疑似コード
   * while (true) {
   *   for (const player of field.players) {
   *     while (true) {
   *       player.roll()
   *       while (true) {
   *         player.useAbility(readline()) or break
   *       }
   *       player.fix(readline()) or break
   *     }
   *     const card = readline()
   *     player.choose(card)
   *     field._chosen(card)
   *     if (player.hasQueen) break // final round
   *   }
   *   field.players.reverse()
   *   ++field.round
   * }
   */
  next(data: FieldData, params: NextParams): FieldData {
    switch (data.step) {
      case Step.initialize:
        this._initialize(params.players!, data)
        data.step++
        break
      case Step.roll:
        data.activePlayer.roll()
        data.step++
        break
      case Step.ability:
        /* @ts-ignore */
        if (typeof params.cardIdx === 'number') data.activePlayer.useAbility(params)
        else data.step++
        break
      case Step.fix:
        data.activePlayer.fix(params.diceIdxes!)
        if (data.activePlayer.diceNum === 0) {
          if (data.round === Final) {
            const win = this._win(data.activePlayer.fixedDices, data.top!.dices)
            if (win === 1 || (win === 0 && data.activePlayer.hasQueen)) {
              data.top = {player: data.activePlayer, dices: data.activePlayer.fixedDices}
            }
            this._nextPlayer(data)
          }
          else data.step++
        } else {
          data.step = Step.roll
        }
        break
      case Step.choice:
        let card
        if (typeof params.cardIdx !== 'number' ||
          !(card = this.cards[params.cardIdx]) ||
          typeof data.remainingCards[card.name.en] !== 'number' ||
          data.remainingCards[card.name.en] === 0) throw 'invalid card index'
        card.cost.valid(data.activePlayer, false)
        data.remainingCards[card.name.en]--
        const dices = data.activePlayer.choose(card)
        if (data.activePlayer.hasQueen) data.top = {player: data.activePlayer, dices}
        this._nextPlayer(data)
        break
      default:
        break
    }
    this.data = data
    return data
  }

  _nextPlayer(data: FieldData) {
    const i = data.players.indexOf(data.activePlayer)
    if (i < 0) throw new Error('invalid statement')
    if (data.round === Final &&
      (i === data.players.length - 1 || data.top!.player === data.players[i + 1])) {
      return data.winner = data.top!.player
    }
    if (i === data.players.length - 1) this._nextRound(data)
    else data.activePlayer = data.players[i + 1]
    data.step = Step.roll
  }

  _nextRound(data: FieldData) {
    data.players.reverse()
    if (data.top) {
      data.round = Final
      const i = data.players.findIndex(v => v.hasQueen)
      const player = data.players[i]
      data.players.splice(i, 1)
      data.players.push(player)
    } else (data.round as number)++
    data.activePlayer = data.players[0]
  }

  isAvailable(card: Card, data: FieldData) {
    return data.round !== Final && data.round >= card.level &&
      data.remainingCards[card.name.en] > 0 &&
      !data.activePlayer.cards.some(({card: v}) => card.level > 0 && v === card) &&
      (data.step !== Step.choice || card.cost.valid(data.activePlayer))
  }
}