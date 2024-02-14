// @ts-nocheck
'use client'

import Field from '~/src/field'
import Player from '~/src/player'
import {Step} from '~/src/const'
import {useState} from "react"
import Image from "next/image"
import {Fix, activeDiceElms, Choice, Ability} from "./images"

export default function Home() {
  const field = new Field([new Player('you'), new Player('cpu')])

  const [fieldData, setField] = useState(field.data)
  let params = {}
  let elms
  let buttonValue: string
  const onSubmit = (e) => {
    console.log('fieldData on Home',fieldData)
    setField({...field.next(fieldData, params)})
    field.data = fieldData
  }
  switch (fieldData.step) {
    case Step.roll:
      buttonValue = `Let's roll!`
      elms = (<Image
        src={`/dices/dice.gif`}
        alt={`Roll your dices`}
        width={357}
        height={330}
        onClick={onSubmit}
        priority
      />)
      break
    case Step.ability:
      if (fieldData.activePlayer.cardCandidates.length === 0) {
        return onSubmit(null)
      }
      buttonValue = 'use ability or skip'
      elms = (
          <Ability field={fieldData} params={params}></Ability>
      )
      break
    case Step.fix:
      buttonValue = 'fix dices'
      elms = (
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          <Fix field={fieldData} params={params}></Fix>
        </div>
      )
      break
    case Step.choice:
      buttonValue = 'choose the card'
      elms = (
        <Choice field={fieldData} params={params} isAvailable={field.isAvailable}></Choice>
      )
      break
    default:
      break
  }
  let fixedDices = ''
  if (fieldData.activePlayer.fixedDices.length > 0) {
    fixedDices = (
    <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
      Fixed Dices: {fieldData.activePlayer.fixedDices.join('-')}
    </p>
    )
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Round{`: ${fieldData.round}, Step: ${fieldData.step}, Player: ${fieldData.activePlayer.name}`}&nbsp;
        </p>
        {fixedDices}
        <button
          type="submit"
          onClick={onSubmit}
          className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {buttonValue}
        </button>
      </div>
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        {elms}
      </div>
    </main>
  );
}
