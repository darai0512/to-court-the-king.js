// @ts-nocheck
'use client'

import Image from "next/image"
import {useState} from "react";
import {Step} from '~/src/const'
import { RadioGroup } from '@headlessui/react'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export function Card({card, count}) {
  let onField
  if (count) {
    onField = (
      <span>
        <br/>条件: {card.cost.desc.ja}<br/>残り: {count}枚
      </span>
    )
  }
  return (
    <div key={`card-${card.name.en}`} className="group relative">
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
        <Image
          src={`/cards/${card.image}`}
          alt={`cards-${card.name.ja}`}
          className={`h-full w-full object-cover object-center lg:h-full lg:w-full`}
          width={120}
          height={182}
          priority
        />
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">
            <span aria-hidden="true" className="absolute inset-0" />
            名称: {card.name.ja}<br/>
            能力: {card.ability.desc.ja}
            {onField}
          </h3>
        </div>
      </div>
    </div>
  )
}
export function Dice({dice, index, onClick, selected}) {
  return (
    <div className="group relative" key={`${index}-dice-${dice}`}>
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75">
        <Image
          src={`/dices/${dice}.png`}
          alt={dice}
          className={`${selected ? 'border-4 border-indigo-500/75 ' : ''}h-full w-full object-cover object-center lg:h-full lg:w-full`}
          onClick={onClick ? (e) => onClick(index) : null}
          width={40}
          height={40}
          priority
        />
      </div>
    </div>
  )
}

export function activeDiceElms(activeDices: number[], onClick = null, fixes: boolean[] = []) {
  const images = []
  for (const [index, dice] of activeDices.entries()) {
    images.push(Dice({dice, index, onClick, selected: fixes[index]}))
  }
  return images
}

export function Fix({field, params}) {
  const [fixes, setFixes] = useState(
    field.activePlayer.activeDices.map(_ => false)
  )
  const onClick = (index) => {
     const updatedFixes = fixes.map((v, i) =>
      index === i ? !v : v
    );
    setFixes(updatedFixes)
    const diceIdxes: number[] = []
    for (const [i, v] of updatedFixes.entries()) {
      if (v) diceIdxes.push(i)
    }
    params.diceIdxes = diceIdxes
  }
  return activeDiceElms(field.activePlayer.activeDices, onClick, fixes)
}

export function Ability({field, params}) {
  const [selectedCard, setSelectedCard] = useState(-1)
  const [selectedDice, setSelectedDice] = useState(-1)
  const [change, setChange] = useState(0)
  const onClick = (cardIdx) => {
    setSelectedCard(cardIdx)
    const card = field.activePlayer.cardCandidates[cardIdx]
    const {dice, changes, valid} = card.ability.select
    // dice/change選択
    params.cardIdx = cardIdx
  }
  return (
    <div>
    <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
      {activeDiceElms(field.activePlayer.activeDices)}
    </div>
    <RadioGroup value={selectedCard} onChange={onClick} className="mt-4">
      <RadioGroup.Label className="sr-only">Choose a card</RadioGroup.Label>
      <div className="grid grid-cols-4 gap-4">
        {field.activePlayer.cardCandidates.map((card, index) => (
          <RadioGroup.Option
            key={`card-${card.name.en}`}
            value={index}
            className={({ active }) =>
              classNames(
                'cursor-pointer bg-white text-gray-900 shadow-sm',
                active ? 'ring-2 ring-indigo-500/75' : '',
                'group relative flex item-center justify-center rounded-md border py-3 px-4 hover:bg-gray-50 focus:outline-none sm:flex-1'
              )
            }
          >
            {({ active, checked}) => (
              <>
                <RadioGroup.Label as={Card} card={card} step={field.step}></RadioGroup.Label>
                  <span
                    className={classNames(
                      active ? 'border' : 'border-2',
                      checked ? 'border-indigo-500' : 'border-transparent',
                      'pointer-events-none absolute -inset-px rounded-md'
                    )}
                    aria-hidden="true"
                  />
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
    </div>
  )
}

export function Choice({field, params, isAvailable}) {
  const [selectedCard, setSelectedCard] = useState(-1)
  const onClick = (cardIdx) => {
    setSelectedCard(cardIdx)
    params.cardIdx = cardIdx
  }
  return (
    <RadioGroup value={selectedCard} onChange={onClick} className="mt-4">
      <RadioGroup.Label className="sr-only">Choose a card</RadioGroup.Label>
      <div className="grid grid-cols-4 gap-4">
        {field.cards.map((card, index) => (
          <RadioGroup.Option
            key={`card-${card.name.en}`}
            value={index}
            disabled={!isAvailable(card, field)}
            className={({ active }) =>
              classNames(
                card.count > 0 ? 'cursor-pointer bg-white text-gray-900 shadow-sm' : 'cursor-not-allowed bg-gray-50 text-gray-200',
                active ? 'ring-2 ring-indigo-500/75' : '',
                'group relative flex item-center justify-center rounded-md border py-3 px-4 hover:bg-gray-50 focus:outline-none sm:flex-1'
              )
            }
          >
            {({ active, checked, disabled }) => (
              <>
                <RadioGroup.Label as={Card} card={card} step={field.step} count={field.remainingCards[card.name.en]}></RadioGroup.Label>
                {!disabled ? (
                  <span
                    className={classNames(
                      active ? 'border' : 'border-2',
                      checked ? 'border-indigo-500' : 'border-transparent',
                      'pointer-events-none absolute -inset-px rounded-md'
                    )}
                    aria-hidden="true"
                  />
                ) : (
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
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  )
}
