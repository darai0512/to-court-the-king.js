'use client'

import Image from "next/image"
import {useState, useEffect, memo, forwardRef, ReactNode, ChangeEvent} from "react";
import { RadioGroup, Switch, Transition } from '@headlessui/react'
import Modal from "./modal"
import cards, {isAvailable} from "~/src/card";
import {buttonClassName} from "~/app/const";
import {ArrowRightIcon} from "@heroicons/react/16/solid";
import {useIntl} from "react-intl";
import {Tooltip} from "flowbite-react";
import type {FieldData, Player} from '~/src/index'

const dicesClass = "my-2 grid sm:grid-cols-8 gap-y-2 gap-x-4 grid-cols-6"
const newDiceClass = "rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
export const Card = memo(function Card({name, disabled, remaining}: {name: string, disabled?: boolean, remaining?: number}) {
  const {formatMessage} = useIntl()
  let costElm = null
  let remainingElm = null
  if (typeof remaining === 'number') {
    costElm = (<div>
      <span className="font-semibold">{formatMessage({id: 'cost'})}</span>: {formatMessage({id: `${name}.cost`})}
    </div>)
    if (remaining > -1) {
      remainingElm = (<div>
        <span className="font-semibold">{formatMessage({id: 'remaining'})}</span>: {remaining}
      </div>)
    }
  }
  return (
    <>
      <figure className="relative w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75">
        <Image
          src={`/cards/${name}.webp`}
          alt={name}
          className={`h-full w-full object-cover object-center`}
          width={120}
          height={120}
          priority
        />
        <figcaption className="absolute px-2 bg-white/50 text-gray-700 text-sm bottom-2">{formatMessage({id: name})}</figcaption>
      </figure>
      <div className="mt-4 text-sm text-gray-700">
        <div><span className="font-semibold">{formatMessage({id: 'ability'})}</span>: {formatMessage({id: `${name}.ability`})}</div>
        {costElm}
        {remainingElm}
      </div>
      {disabled &&
      <span aria-hidden="true" className="absolute -inset-px">
        <svg
          className="absolute inset-0 h-full w-full stroke-2 text-gray-200"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          stroke="currentColor"
        >
          <line x1={1} y1={99} x2={99} y2={1} vectorEffect="non-scaling-stroke" />
        </svg>
      </span>
      }
    </>
  )
})

const DiceBase = memo(function DiceBase({}) {
  return (
    <>
      <div className='side one'>
        <div className="dot one-1"></div>
      </div>
      <div className='side two'>
        <div className="dot two-1"></div>
        <div className="dot two-2"></div>
      </div>
      <div className='side three'>
        <div className="dot three-1"></div>
        <div className="dot three-2"></div>
        <div className="dot three-3"></div>
      </div>
      <div className='side four'>
        <div className="dot four-1"></div>
        <div className="dot four-2"></div>
        <div className="dot four-3"></div>
        <div className="dot four-4"></div>
      </div>
      <div className='side five'>
        <div className="dot five-1"></div>
        <div className="dot five-2"></div>
        <div className="dot five-3"></div>
        <div className="dot five-4"></div>
        <div className="dot five-5"></div>
      </div>
      <div className='side six'>
        <div className="dot six-1"></div>
        <div className="dot six-2"></div>
        <div className="dot six-3"></div>
        <div className="dot six-4"></div>
        <div className="dot six-5"></div>
        <div className="dot six-6"></div>
      </div>
    </>
  )
})

const diceElm = forwardRef(function diceElm({cName, onClick, children}: {cName: string, onClick: any, children: ReactNode}, ref: any) {
  return (
    <div className={cName} onClick={onClick} ref={ref}>
      {children}
    </div>
  )
})

function AnimeDice({dice, selected = false, onClick = null}: {dice: number, selected?: boolean, onClick?: any}) {
  // todo 同じ数字だとアニメがでない: leaveとunmountで制御できるかも?
  // todo not working Transition.entered={`dice show-${dice}` + (selected ? ' selected' : '')
  return (
    <Transition appear show={true}
                as={diceElm}
                onClick={onClick}
                cName={`dice show-${dice}` + (selected ? ' selected' : '')}
                enter=""
                enterFrom="anime"
                enterTo="">
      <DiceBase />
    </Transition>
  )
}

function Dice({dice, selected = false, onClick = null}: {dice: number, selected?: boolean, onClick?: any}) {
  return (
    <div onClick={onClick} className={`dice show-${dice}` + (selected ? ' selected' : '')}>
      <DiceBase />
    </div>
  )
}

function Dices({dices, selects = {}, onClick = null, anime = false}: {dices: number[], selects?: Record<number, number>, onClick?: any, anime?: boolean}) {
  const [len, setLen] = useState(dices.length)
  useEffect(() => {
    if (anime && len > dices.length) return setLen(dices.length)
  }, [dices.length])
  const outputs = []
  const Elm = anime ? AnimeDice : Dice
  for (const [i, dice] of dices.entries()) {
    outputs.push(
      <Elm key={`dice-${i}-${anime ? len : dice}`} dice={dice} selected={!!selects[i]} onClick={onClick ? (e: any) => onClick(e, i) : null} />
    )
  }
  return (
    <div className={dicesClass}>
      {outputs}
    </div>
  )
}

function FixedDices({dices}: {dices: number[]}) {
  if (dices.length === 0) return null
  return (
    <div className="flex items-center text-indigo-600">
      Fixed:&nbsp;&nbsp;
      <Dices dices={dices} />
    </div>
  )
}

export function Fix({activePlayer, available, onSubmit}: {activePlayer: Player, available: boolean, onSubmit: any}) {
  const [cardIdx, setCardIdx] = useState(-1)
  const [diceIdxes, setDiceIdxes] = useState<Record<number, number>>({})
  const {formatMessage} = useIntl()

  useEffect(()=>{
    setCardIdx(-1)
    setDiceIdxes({})
  }, [activePlayer])

  const pCard = activePlayer.cards[cardIdx]
  const select = cards[pCard?.name]?.ability.select
  const diceClick = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    if (!available) return
    if (diceIdxes[index]) delete diceIdxes[index]
    else if (Object.keys(diceIdxes).length === select?.dice) return
    else diceIdxes[index] = 1
    return setDiceIdxes({...diceIdxes})
  }
  const changeCard = (_cardIdx: number, checked: boolean) => {
    if (!available) return
    if (checked) setCardIdx(_cardIdx)
    else if (cardIdx === _cardIdx) setCardIdx(-1)
    setDiceIdxes({})
  }
  const onDiceChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    diceIdxes[index] = Number(e.target.value)
    setDiceIdxes({...diceIdxes})
  }
  const onClose = () => {
    setCardIdx(-1)
    setDiceIdxes({})
  }
  const onClick = () => onSubmit({cardIdx, selected: diceIdxes}) || onClose()
  return (<>
    <button
      onClick={() => available && onSubmit({dices: Object.keys(diceIdxes)})}
      className={"my-2 " + buttonClassName}
      disabled={!available}
    >Fix dices</button>
    <div className="flex items-center">
      <Tooltip content={formatMessage({id: 'fix'}, {br: <br/>})}>
        <span className="underline">Active</span>:&nbsp;&nbsp;
      </Tooltip>
      <Dices dices={activePlayer.activeDices} selects={diceIdxes} onClick={diceClick} anime={true} />
    </div>
    <FixedDices dices={activePlayer.fixedDices} />
    <Switch.Group>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {activePlayer.cards.map(({name, available}, index) => (
          <Switch
            key={`card-${index}`}
            checked={cardIdx === index}
            onChange={(checked) => changeCard(index, checked)}
            disabled={!available}
            className={({ checked }) => 'text-left relative py-3 px-2 rounded-md ' +
              (available ? 'cursor-pointer hover:bg-gray-50 ' + (checked ? 'bg-[color:tomato]' : 'bg-white/50 hover:bg-gray-50') : 'cursor-not-allowed bg-white/50')
            }
          >
            <Switch.Label as={Card} name={name} disabled={!available} />
          </Switch>
        ))}
      </div>
    </Switch.Group>
    <Modal isOpen={cardIdx >= 0}
           onClose={onClose}
           opacity={'bg-opacity-80'}
           title={pCard ? formatMessage({id: `${pCard.name}.ability`}) : ''}>
      {select && select.dice > 0 && <Dices dices={activePlayer.activeDices} selects={diceIdxes} onClick={diceClick} />}
      {select && select.new && (select.dice === 0 ? (
        <input type="number"
               min={1}
               max={6}
               value={diceIdxes[0] || 1}
               onChange={(e) => onDiceChange(e, 0)}
               className={newDiceClass}
        />
      ) : Object.keys(diceIdxes).map((v: string) => (
        <div key={`new-dice-${v}`} className="flex justify-center items-center my-1">
          <Dice dice={activePlayer.activeDices[Number(v)]} />
          <ArrowRightIcon className="text-[color:black] mr-1 ml-1 h-5 w-5"/>
          <Dice dice={diceIdxes[Number(v)]} />
          <input type="number"
                 min={1}
                 max={6}
                 value={diceIdxes[Number(v)]}
                 onChange={(e: ChangeEvent<HTMLInputElement>) => onDiceChange(e, Number(v))}
                 className={"ml-2 " + newDiceClass}
          />
        </div>
      )))}
      <div className="flex flex-wrap mt-4 justify-center">
        <button className={buttonClassName}
                onClick={onClick}
        >Use</button>
        <button className="ml-5 justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                onClick={onClose}
        >Cancel</button>
      </div>
    </Modal>
  </>)
}

export function Choice({fieldData, available, onSubmit}: {fieldData: FieldData, available: boolean, onSubmit: any}) {
  const [card, setCard] = useState('')
  const {formatMessage} = useIntl()
  const onClick = () => {
    if (!available || (!card && !window.confirm(formatMessage({id: 'choose_no_card'})))) return
    onSubmit({card})
  }
  return (<>
    <button onClick={onClick}
            className={"my-2 " + buttonClassName}
            disabled={!available}
    >Get a card</button>
    <FixedDices dices={fieldData.players[fieldData.activePlayer].fixedDices}/>
    <RadioGroup value={card} onChange={setCard} className="mt-4">
      <RadioGroup.Label className="sr-only">Choose a card</RadioGroup.Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Object.values(cards).map(card => {
          const ok = isAvailable(fieldData, card)
          return (
            <RadioGroup.Option
              key={`card-${card.name.en}`}
              value={card.name.en}
              disabled={!ok}
              className={({active}) => 'relative py-3 px-2 rounded-md ' +
                (ok ? 'cursor-pointer ' + (active ? 'bg-[color:tomato]' : 'bg-white/50 hover:bg-gray-50') : 'cursor-not-allowed bg-white/50')
              }
            >
              {({active, checked, disabled}) => (
                <>
                  <RadioGroup.Label as={Card} name={card.name.en} disabled={disabled}
                                    remaining={fieldData.remainingCards[card.name.en]}/>
                </>
              )}
            </RadioGroup.Option>
          )
        })}
      </div>
    </RadioGroup>
  </>)
}