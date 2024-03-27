'use client'
import Field from '~/src/field'
import cards from '~/src/card'
import {Step} from '~/src/const'
import {useState, useEffect, memo, useMemo, Fragment, useRef} from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import {Fix, Choice, Card} from "./elements"
import {Lobby, multiSend} from "./lobby"
import Modal from "./modal"
import {ArrowRightIcon} from "@heroicons/react/16/solid"
import {CustomFlowbiteTheme, Tooltip} from 'flowbite-react';
import {next} from './server'
import {useIntl} from "react-intl";
import type {FieldData} from '~/src/index'
import type {Peer} from "peerjs"


const initData = (new Field()).data
const infoClassName = "flex flex-wrap font-mono text-sm text-[color:black] bg-transparent sm:p-4 p-2 border-neutral-800 rounded-xl border"
const playerClassName =  "underline decoration-indigo-600"
const activeClassName = "text-[color:tomato] font-bold"

const Crown = memo(function Crown({dices}: {dices: number[]}) {
  return (
    <Tooltip content={dices.join('-')}>
      <span className="crown ml-1"></span>
    </Tooltip>
  )
})

const cardToolTipTheme: CustomFlowbiteTheme['tooltip'] = {
  arrow: {
    base: "absolute z-10 h-2 w-2 rotate-[135deg] tri",
  },
  style: {
    dark: "bg-gray-700/50",
  }
}

const Info = memo(function Info({data}: {data: FieldData}) {
  const players = []
  for (const [i, p] of data.players.entries()) {
    let elm: any = 'No Cards'
    if (p.cards.length > 0) {
      elm = (
        <div className="grid grid-cols-8 gap-1">
          {p.cards.map((c, i) => (
            <Image
              key={`${p.id}-card-${i}`}
              src={`/cards/${c.name}.webp`}
              alt={c.name}
              className={`h-full w-full object-cover object-center`}
              width={48}
              height={48}
              priority
            />
          ))}
        </div>
      )
    }
    const show = data._lastPlayerId === p.id && data.players[data.activePlayer].fixedDices.length === 0
    players.push(<Fragment key={p.id}>
      <Tooltip content={elm} theme={cardToolTipTheme} style="dark" trigger={show ? 'click' : 'hover'}>
        <span className={'cursor-pointer ' + (i === data.activePlayer ? activeClassName : playerClassName)}
              ref={node=>{show && node && (node as HTMLSpanElement).click()}}
        >{p.name}</span>
      </Tooltip>
      {data.top.playerId === p.id && <Crown dices={data.top.dices} />}
    </Fragment>)
    players.push(<ArrowRightIcon key={`next-${i}`} className="mx-1 h-5 w-5" />)
  }
  players.pop()
  return (
    <div className={infoClassName}>
      Round {data.round}:&nbsp;{players}
    </div>
  )
})

const Cards = memo(function Cards({remainingCards}: {remainingCards: FieldData['remainingCards']}) {
  const [isOpen, setIsOpen] = useState(false)

  const urlParams = useParams()
  const router = useRouter()
  useEffect(() => {
    if (window.location.hash === '#cards') setIsOpen(true)
  }, [urlParams])
  const onClose = () => {
    setIsOpen(false)
    // window.location.hash = '' // -:#が残ってしまう +:レンダリングが減る
    router.push('')
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} opacity="bg-opacity-80">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 h-[50%]">
        {Object.keys(cards).map(c => (
          <div
            key={`card-${c}`}
            className="bg-white/50 relative rounded-md py-3 px-4"
          >
            <Card name={c}
                  disabled={remainingCards[c]===0}
                  remaining={typeof remainingCards[c] === 'number' ? remainingCards[c] : -1}
            />
          </div>
        ))}
      </div>
      <div className="flex mt-4 justify-center">
        <button
          type="button"
          className="rounded-md border bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200"
          onClick={onClose}
        >
          done
        </button>
      </div>
    </Modal>
  )
})

function Error({message, onClose}: {message: string, onClose: () => void}) {
  return (
  <Modal isOpen={message !== ''} onClose={onClose} title={message}>
    <div className="flex mt-4 justify-center">
      <button
        type="button"
        className="rounded-md border bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200"
        onClick={onClose}
      >
        ok
      </button>
    </div>
  </Modal>
  )
}

export default function Main() {
  const [data, _setData] = useState(initData)
  const [error, setError] = useState('')
  const [peer, setPeer] = useState({} as Peer)
  const peerId = useMemo(() => peer.id, [peer])
  const dataRef = useRef(data)
  const setData = (newData: (typeof data)) => {
    dataRef.current = newData
    _setData(newData)
  }

  const {formatMessage} = useIntl()
  const onSubmit = async (params?: any, origin: null|string = null, send = true) => {
    console.log('submit',params)
    try {
      let newData = params
      if (origin === null) newData = {...await next(dataRef.current, params)}
      setData(newData)
      if (send && peerId) {
        if (!peer.disconnected) peer.disconnect()
        origin = origin === null ? peerId : origin
        multiSend(peer, {action: 'data', data: newData, origin}, origin)
      }
    } catch(e: any) {
      setError(formatMessage({id: e.message})) // todo Result型handling
    }
  }
  const activePlayer = data.players[data.activePlayer]
  const available = !peerId || !activePlayer || peerId === activePlayer.id // todo 引き継ぎ

  let elms
  switch (data.step) {
    case Step.initialize:
      elms = (
        <Lobby setError={setError}
               peer={peer}
               setPeer={setPeer}
               onSubmit={onSubmit}
        ></Lobby>
      )
      break
    case Step.fix:
      elms = (<>
        <Info data={data}></Info>
        <Fix activePlayer={activePlayer} available={available} onSubmit={onSubmit}></Fix>
      </>)
      break
    case Step.choice:
      elms = (<>
        <Info data={data}></Info>
        <Choice fieldData={data} available={available} onSubmit={onSubmit}></Choice>
      </>)
      break
    case Step.end:
      document.body.classList.add('before:animate-[smooth_5s_linear_1_normal_forwards]')
      const winner = data.players.find(v => v.id===data.top!.playerId)
      elms = (<>
        <div className={infoClassName + ' mb-4 font-bold'}>
          Winner:&nbsp;{winner?.name}<Crown dices={data.top?.dices} />
        </div>
        <Image
          src={`/images/logo.png`}
          alt={`logo for winner`}
          className="animate-[logo-up_5s_linear_1_normal_forwards] cursor-pointer"
          onClick={() => {
            if (typeof peer.destroy === 'function') peer.destroy()
            return window.location.reload()
          }}
          width={395}
          height={395}
          priority
        />
      </>)
      break
    default:
      break
  }
  return (<>
    {elms}
    {error !== '' ? <Error message={error} onClose={()=>setError('')}/> : null}
    <Cards remainingCards={data.remainingCards}/>
  </>)
}