export const INITIAL_DICE_NUM = 3

export enum Step {
  // step, display info
  initialize, // set players
  roll, // skip可能。Resultフェーズとして使っても良い
  fix, // 自分のカード(済み区別)、アクティブダイス、確定ダイス、場のカード、他プレイヤーのカード、順番
  choice, // 自分のカード、確定ダイス、場のカード、他プレイヤーのカード、順番
  end,
}

export const Timing = {
  ability: Step.fix,
  immediate: Step.roll,
} as const

export const cardCounts: Record<number, number[]> = {
  // playerNum: <cardLevel, cardNum>
  2: [2, 2, 1, 1, 1, 1],
  3: [3, 2, 2, 2, 2, 1],
  4: [4, 3, 3, 2, 2, 1],
  5: [5, 4, 3, 3, 3, 1],
}
export const MAX_PLAYER = Math.max(...Object.keys(cardCounts).map(v => Number(v)))