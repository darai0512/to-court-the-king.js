// @ts-nocheck
'use client'

import Image from "next/image"
import {ReactDOM, useState} from "react";
import { RadioGroup, Switch } from '@headlessui/react'
import Modal from "./modal"
import {FieldData} from "~/src/field";
import cards from "~/src/card";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const dicesClass = "mt-3 mb-3 grid grid-cols-4 gap-x-4"

export function Card({card, count}: {card: any, count?: number}) {
  let onField
  if (count) {
    onField = (
      <span>
        <br/>条件: {card.cost.description.ja}<br/>残り: {count}枚
      </span>
    )
  }
  return (
    <div key={`card-${card.name.en}`} className="group relative">
      <div className="w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
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
            能力: {card.ability.description.ja}
            {onField}
          </h3>
        </div>
      </div>
    </div>
  )
}
function Dice({dice, index, onClick, selected, children}: {dice: number, index: number, onClick: (i: number) => void, selected: boolean, children?: ReactDOM}) {
  return (
    <div className="group relative" key={`${index}-dice-${dice}`}>
      <div className="w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75">
        <Image
          src={`/dices/${dice}.png`}
          alt={dice}
          className={`${selected ? 'border-4 border-indigo-500/75 ' : ''}h-full w-full object-cover object-center lg:h-full lg:w-full`}
          onClick={(e) => onClick(index)}
          width={40}
          height={40}
          priority
        />
      </div>
      {children}
    </div>
  )
}

export function Ability({field, params}) {
  const [cardIdx, setCardIdx] = useState(-1)
  const [selected, setSelected] = useState({})
  const [modal, setModal] = useState({open: false, index: -1})
  const onClose = () => setModal({open: false, index: modal.index})
  const diceClick = (index) => {
    if (cardIdx === -1) return
    const {card} = field.activePlayer.cards[cardIdx]
    if (typeof card.ability.select === 'undefined') return

    const newDice = selected[index]
    if (newDice) delete selected[index]
    else if (Object.keys(selected).length === card.ability.select.dice) return
    else {
      selected[index] = 1
      if (card.ability.select.new) setModal({open: true, index})
    }
    setSelected({...selected})
    params.selected = selected
  }
  const changeCard = (_cardIdx, checked) => {
    if (checked) {
      setCardIdx(_cardIdx)
      params.cardIdx = _cardIdx
      const {card} = field.activePlayer.cards[_cardIdx]
      if (typeof card.ability.select !== 'undefined' &&
        card.ability.select.dice === 0 &&
        card.ability.select.new) {
        setModal({open: true, index: 0})
      }
    } else {
      if (cardIdx === _cardIdx) {
        setCardIdx(-1)
        delete params.cardIdx
      }
    }
    delete params.selected
  }
  const onDiceChange = (e) => {
    selected[modal.index] = Number(e.target.value)
    setSelected({...selected})
    params.selected = selected
  }

  const dices = []
  for (const [i, dice] of field.activePlayer.activeDices.entries()) {
    const _selected = Object.keys(selected).map(v=>Number(v)).includes(i)
    dices.push(
      <Dice key={`dice-${i}`} dice={dice} index={i} onClick={diceClick} selected={_selected}>
        {selected[i] ? selected[i] : null}
      </Dice>
    )
  }
  return (
    <>
      <div className={dicesClass}>
        {dices}
      </div>
      <Modal isOpen={modal.open} onClose={onClose}>
        <div className="mt-2">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Change dice {field.activePlayer.activeDices[modal.index]} into&nbsp;
            <input
              type="number"
              min={1}
              max={6}
              value={selected[modal.index] || 1}
              onChange={onDiceChange}
              className="rounded-md border-0 py-1.5 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </label>
        </div>
        <div className="flex mt-4 justify-center">
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            onClick={onClose}
          >
            done
          </button>
        </div>
      </Modal>
      <Switch.Group>
        <div className="grid grid-cols-4 gap-4">
          {field.activePlayer.cards.map(({card, available}, index) => available ? (
            <Switch
              key={`card-${index}`}
              checked={cardIdx === index}
              onChange={(checked) => changeCard(index, checked)}
              className={({ checked }) =>
                classNames(
                  'bg-white',
                  'cursor-pointer',
                  checked ? 'ring-2 ring-indigo-500/75' : '',
                  'group relative item-center justify-center rounded-md border py-3 px-4 hover:bg-gray-50 focus:outline-none'
                )
              }
            >
              <Switch.Label as={Card} card={card}></Switch.Label>
            </Switch>
          ) : (
            <div
              key={`card-${index}`}
              className="bg-white cursor-not-allowed group relative item-center justify-center rounded-md border py-3 px-4 hover:bg-gray-50 focus:outline-none"
            >
              <Switch.Label as={Card} card={card}></Switch.Label>
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
            </div>
          ))}
        </div>
      </Switch.Group>
    </>
  )
}

export function Fix({field, params}: {field: FieldData, params: Object}) {
  const [diceIdxes, setDiceIdxes] = useState([])
  const onClick = (index) => {
    let _diceIdxes
    if (diceIdxes.includes(index)) _diceIdxes = diceIdxes.filter((v) => v !== index)
    else _diceIdxes = diceIdxes.concat(index)
    setDiceIdxes(_diceIdxes)
    params.diceIdxes = _diceIdxes
  }

  const dices = []
  for (const [i, dice] of field.activePlayer.activeDices.entries()) {
    dices.push(
      <Dice key={`dice-${i}`} dice={dice} index={i} onClick={onClick} selected={diceIdxes.includes(i)} />
    )
  }
  return (
    <div className={dicesClass}>
      {dices}
    </div>
  )
}

export function Choice({field, params, isAvailable}) {
  const [cardIdx, setCardIdx] = useState(-1)
  const onChange = (_cardIdx) => {
    setCardIdx(_cardIdx)
    params.cardIdx = _cardIdx
  }
  return (
    <RadioGroup value={cardIdx} onChange={onChange} className="mt-4">
      <RadioGroup.Label className="sr-only">Choose a card</RadioGroup.Label>
      <div className="grid grid-cols-4 gap-4">
        {Object.values(cards).map((card, index) => (
          <RadioGroup.Option
            key={`card-${card.name.en}`}
            value={index}
            disabled={!isAvailable(card, field)}
            className={({ active }) =>
              classNames(
                'bg-white',
                isAvailable(card, field) ? 'cursor-pointer' : 'cursor-not-allowed',
                active ? 'ring-2 ring-indigo-500/75' : '',
                'group relative item-center justify-center rounded-md border py-3 px-4 hover:bg-gray-50 focus:outline-none'
              )
            }
          >
            {({ active, checked, disabled }) => (
              <>
                <RadioGroup.Label as={Card} card={card} count={field.remainingCards[card.name.en]}></RadioGroup.Label>
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
