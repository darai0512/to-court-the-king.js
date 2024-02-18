'use client'

import Field, {FieldData} from '~/src/field'
import Player from '~/src/player'
import {Step} from '~/src/const'
import {useState, ReactNode} from "react"
import Image from "next/image"
import {Fix, Choice, Ability, Card} from "./images"
import {Players} from "./inputs"
import Modal from "./modal"
import Info from "./popover"

const field = new Field()

function Navigation({info, children}: {info: string, children?: ReactNode}) {
  return (
    <div
      className="fixed left-0 top-0 flex w-full justify-center border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
      {info}
      {children}
    </div>
  )
}

function Header({fieldData, buttonValue, onSubmit, isAvailable}: {fieldData: FieldData, buttonValue: string, onSubmit: any, isAvailable: any}) {
  const [isOpen, setIsOpen] = useState(false)
  let navi1, navi2, navi3
  if (fieldData.step !== Step.initialize) {
    const round = typeof fieldData.round === 'string' ? '' : (' -> Round ' + (fieldData.top ? 'Final' : fieldData.round+1))
    const next = fieldData.players.slice(
      fieldData.players.findIndex((v: Player) => v===fieldData.activePlayer)
    ).map((v: Player) => v.name).join(' -> ') + round
    navi1 = (
      <Navigation info={`Round ${fieldData.round}, Player`}>&nbsp;
        <Info title={fieldData.activePlayer.name}>
          {next}
        </Info>
      </Navigation>
    )
    if (fieldData.winner) navi1 = Navigation({info: `Winner: ${fieldData.winner.name}`})
    else if (fieldData.activePlayer.fixedDices.length > 0) navi2 = Navigation({info: `Fixed Dices: ${fieldData.activePlayer.fixedDices.join('-')}`})
    if (fieldData.top) navi3 = Navigation({info: `Top Dices: ${fieldData.top.dices.join('-')}, Top Player: ${fieldData.top.player.name}`})
  }
  return (
    <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
      {navi1}
      {navi2}
      {navi3}
      <div className="fixed top-16 w-full max-w-sm px-4">
      </div>
      <button
        className="flex items-center justify-center rounded-md border border-transparent bg-gray-800 px-3 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <a href="/images/UmkroneundKragen.pdf" target="_blank">
          Rule
        </a>
      </button>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center rounded-md border border-transparent bg-gray-800 px-3 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Cards
      </button>
      <button
        onClick={onSubmit}
        className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        {buttonValue}
      </button>
      <Modal isOpen={isOpen} onClose={()=>setIsOpen(false)}>
        <div className="grid grid-cols-4 gap-4">
          {field.cards.map(card => (
            <div
              key={`card-${card.name.en}`}
              className="bg-white group relative item-center justify-center rounded-md border py-3 px-4 hover:bg-gray-50 focus:outline-none"
            >
              <Card card={card} count={fieldData.remainingCards[card.name.en]}/>
              {!isAvailable(card, field) && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-px rounded-md border-2 border-gray-200"
                >
                  <svg
                    className="absolute inset-0 h-full w-full stroke-2 text-gray-200"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    stroke="currentColor"
                  >
                    <line x1={0} y1={100} x2={100} y2={0} vectorEffect="non-scaling-stroke" />
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="flex mt-4 justify-center">
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            onClick={()=>setIsOpen(false)}
          >
            done
          </button>
        </div>
      </Modal>
    </div>
  )
}


export default function Home() {
  const [fieldData, setField] = useState(field.data)
  const [error, setError] = useState('')
  let params = {}
  let elms
  let buttonValue = 'game start!'
  const onSubmit = (_: any) => {
    try {
      setField({...field.next(fieldData, params)})
      field.data = fieldData
      params = {}
    } catch(e) {
      setError(e as string)
    }
  }
  switch (fieldData.step) {
    case Step.initialize:
      elms = (
        <Players field={fieldData} params={params}></Players>
      )
      break
    case Step.roll:
      buttonValue = 'Roll!'
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
      if (fieldData.activePlayer.cards.filter(({available}) => available).length === 0) return onSubmit(null)
      buttonValue = 'use ability or skip'
      elms = (<Ability field={fieldData} params={params}></Ability>)
      break
    case Step.fix:
      buttonValue = 'fix dices'
      elms = (<Fix field={fieldData} params={params}></Fix>)
      break
    case Step.choice:
      buttonValue = 'choose a card'
      elms = (
        <Choice field={fieldData} params={params} isAvailable={field.isAvailable}></Choice>
      )
      break
    default:
      break
  }
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <Header fieldData={fieldData} buttonValue={buttonValue} onSubmit={onSubmit} isAvailable={field.isAvailable}></Header>
      {elms}
      <Modal isOpen={error !== ''} onClose={()=>setError('')} title={error}>
      </Modal>
    </main>
  );
}
