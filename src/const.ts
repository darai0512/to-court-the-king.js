export const INITIAL_DICE_NUM = 3

export enum Step {
  // step, display info
  roll, // nothing
  ability, // 自分のカード(済み区別)、アクティブダイス、確定ダイス、場のカード、他プレイヤーのカード、順番
  fix, // 同上
  choice, // 自分のカード、確定ダイス、場のカード、他プレイヤーのカード、順番
}
export const FIRST_STEP = Step.roll

export const Timing = {
  ability: Step.ability,
  immediate: Step.roll,
} as const

export const cardCounts: Record<number, number[]> = {
  // playerNum: <cardLevel, cardNum>
  2: [99, 2, 1, 1, 1, 1],
  3: [99, 2, 2, 2, 2, 1],
  4: [99, 3, 3, 2, 2, 1],
  5: [99, 4, 3, 3, 3, 1],
}

export interface i11n {
  en: string,
  ja: string,
}