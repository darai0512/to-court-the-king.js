import {Timing, Step} from './const'

type Selected = Record<string, number> // diceIdx: newDiceValue
type AssertSelected = (player:Player, selected: unknown) => asserts selected is Selected

interface I18n {
  en: string,
  ja: string,
}
interface Card {
  name: I18n,
  level: number,
  cost: {
    visual: string,
    description: I18n,
    valid: (player: Player, dryRun?: boolean) => boolean,
  },
  ability: {
    description: I18n,
    timing: typeof Timing[keyof typeof Timing],
    select?: { // このプロパティがない場合は即時発動
      dice: number, // 選択するダイス数の最大値
      new: boolean, // 新たなダイスの値を指定するか否か
      valid: AssertSelected, // 選択内容の妥当性確認(throwで違反内容を伝える)
    },
    on: ((player: Player, selected?: Selected) => void),
  },
}

interface PlayerInit {
  name: string,
  id: string,
}
interface UseCard {
  cardIdx: number,
  selected?: Selected
}

interface PlayerCard {
  name: string
  available: boolean
}

interface Player {
  cards: PlayerCard[]
  name: string
  id: string
  diceNum: number
  activeDices: number[]
  fixedDices: number[]
}

interface FieldData {
  players: Player[] // index = play order
  activePlayer: number // players index
  remainingCards: Record<string, number>
  step: Step
  round: number | typeof Final
  top: {
    playerId: string | null
    dices: number[]
  }
  _lastPlayerId: string
}
interface NextParams extends UseCard {
  cardIdx?: UseCard['cardIdx']
  players?: PlayerInit[]
  dices?: number[]
  card?: string
}

