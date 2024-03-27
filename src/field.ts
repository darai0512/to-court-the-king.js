import {Step, cardCounts, Timing, INITIAL_DICE_NUM} from './const'
import cards, {rollDice, isAvailable} from './card'
import {FieldError} from './util'
import type {FieldData, PlayerInit, Player, UseCard, NextParams} from './index.d'

const Final = 'final'

export default class Field {
  data: FieldData

  constructor() {
    this.data = {} as any
    this.data.players = []
    this.data.remainingCards = {}
    this.data.step = Step.initialize
    this.data.round = 1
    this.data.top = {
      playerId: null,
      dices: [],
    }
    this.data.activePlayer = 0
    this.data._lastPlayerId = ''
  }

  /* like Player class */
  _player_constructor({name, id}: PlayerInit): Player {
    return {
      cards: [],
      name,
      id,
      diceNum: INITIAL_DICE_NUM,
      fixedDices: [],
      activeDices: [],
    }
  }
  roll(self: Player) {
    self.activeDices = Array.from({ length: self.diceNum }, rollDice)
  }
  useCard(self: Player, {cardIdx, selected}: UseCard) {
    const v = self.cards[cardIdx]
    if (!v.available) throw new FieldError('not_available_card')
    cards[v.name].ability.on(self, selected)
    v.available = false
  }
  fix(self: Player, diceIdxes?: number[]) {
    if (!Array.isArray(diceIdxes) || diceIdxes.length === 0) throw new FieldError('require_at_least_1_dice')
    const dices = diceIdxes.map(v => self.activeDices[v])
    self.fixedDices.push(...dices)
    self.diceNum = self.activeDices.length - diceIdxes.length
  }
  choose(self: Player, data: FieldData, cardName?: string) {
    let c
    if (typeof cardName === 'string' && (c = cards[cardName]) && isAvailable(data, c)) {
      c.cost.valid(self, false)
      self.cards.push({name: c.name.en, available: c.ability.timing === Timing.ability})
    }

    // cleanup: add Queen/gain diceNum, available PlayerCard, reset fixedDices
    self.diceNum = INITIAL_DICE_NUM
    for (const v of self.cards) {
      const card = cards[v.name]
      if (card.ability.timing === Timing.immediate) card.ability.on(self)
      else v.available = true
    }
    self.fixedDices = []
  }
  _hasQueen(self: Player) {
    return self.cards.some(v => v.name === cards.Queen.name.en)
  }
  /* Player class end */

  _initialize(data: FieldData, players: PlayerInit[]) {
    const idMap: Record<string, boolean> = {}
    const _players: Player[] = []
    for (const p of players) {
      if (!p.id || !p.name || idMap[p.id]) continue
      idMap[p.id] = true
      _players.push(this._player_constructor(p))
    }
    const playerNum = Object.keys(idMap).length
    if (!cardCounts[playerNum]) throw new FieldError('invalid_player_number')
    data.players = _players
    const cardCount = cardCounts[playerNum]
    for (const c of Object.values(cards)) data.remainingCards[c.name.en] = cardCount[c.level]
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
   *         player.UseCard(readline()) or break
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
    const activePlayer = data.players[data.activePlayer]
    switch (data.step) {
      case Step.initialize:
        this._initialize(data, params.players!)
        data.step++
        break
      case Step.roll:
        this.roll(activePlayer)
        data.step++
        break
      case Step.fix:
        if (typeof params.cardIdx === 'number') this.useCard(activePlayer, params as UseCard)
        else {
          this.fix(activePlayer, params.dices)
          if (activePlayer.diceNum === 0) {
            if (data.round === Final) {
              const win = this._win(activePlayer.fixedDices, data.top.dices)
              if (win === 1 || (win === 0 && this._hasQueen(activePlayer))) {
                data.top = {playerId: activePlayer.id, dices: activePlayer.fixedDices}
              }
              this._nextPlayer(data)
            } else data.step++
          } else data.step = Step.roll
        }
        break
      case Step.choice:
        const dices = [...activePlayer.fixedDices]
        this.choose(activePlayer, data, params.card)
        let card
        if (card = cards[params.card || '']) {
          data.remainingCards[card.name.en]--
          if (card.name.en === cards.King.name.en) {
            data.remainingCards[cards.Queen.name.en]--
            data.top = {playerId: activePlayer.id, dices}
          }
        }
        this._nextPlayer(data)
        break
      default:
        break
    }
    return this.data = data
  }

  _nextPlayer(data: FieldData) {
    const activePlayer = data.players[data.activePlayer]
    const i = data.players.findIndex((v) => v.id === activePlayer.id)
    if (i < 0) throw new FieldError('invalid_data')
    data._lastPlayerId = activePlayer.id
    // 終了判定
    if (data.round === Final &&
      (i === data.players.length - 1 || data.top.playerId === data.players[i + 1].id)) {
      return data.step = Step.end
    }
    data.step = Step.roll
    if (i === data.players.length - 1) this._nextRound(data)
    else data.activePlayer = i + 1
  }

  _nextRound(data: FieldData) {
    data.players.reverse()
    if (data.top.playerId) {
      data.round = Final
      const i = data.players.findIndex(v => this._hasQueen(v))
      const player = data.players[i]
      data.players.splice(i, 1)
      data.players.push(player)
    } else (data.round as number)++
    data.activePlayer = 0
  }
}