'use client'
import {useState, useEffect, useRef, ChangeEvent} from 'react'
import {MAX_PLAYER} from "~/src/const"
import type {Peer, DataConnection, PeerError} from "peerjs"
import {QuestionMarkCircleIcon, Bars3Icon, UsersIcon} from "@heroicons/react/16/solid";
import { Tooltip } from 'flowbite-react';
import {buttonClassName, toolTipTheme} from "./const"
import {useIntl} from "react-intl";
import type {PlayerInit} from '~/src/index'

export interface RTCData {
  action: 'players' | 'name' | 'data'
  [key: string]: any
}
const PEER_ID_LENGTH = 36
export const PEER_ID_PATTERN = `^[0-9a-zA-Z_\\- ]{${PEER_ID_LENGTH}}$`

export function playerSort(a: PlayerInit, b: PlayerInit) {
  if (a.name.length === 0 && b.name.length > 0) return 1
  else if (a.name.length > 0 && b.name.length === 0) return -1
  return 0
}

const initPlayers = Array.from({length: MAX_PLAYER}, (_, i) => {
  if (i === 0) return {name: 'you', id: `${i}`}
  else if (i === 1) return {name: 'opponent', id: `${i}`}
  else return {name: '', id: `${i}`}
})
const inputClassName = "block flex-1 border-0 border-white bg-transparent py-1.5 pl-1 " +
  "placeholder-gray-400 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6"

function isRTCData(data: unknown): data is RTCData {
  return typeof data === 'object' && typeof (data as RTCData).action === 'string'
}

function Loading({text}: {text: string}) {
  text = !!text ? text : 'loading'
  return (
    <div className="flex items-center h-60 flex-col justify-center">
      <div className="px-3 py-1 text-xs font-medium leading-none text-center text-blue-800 bg-blue-200 rounded-full animate-pulse dark:bg-blue-900 dark:text-blue-200">{text}...</div>
    </div>
  )
}

export function multiSend(peer: Peer, data: RTCData, skipId: string) {
  if (!peer.connections) return
  for (const id of Object.keys(peer.connections)) { // 自分自身は含まれない
    if (id === skipId) continue
    let sent = false
    // @ts-ignore
    for (const conn of peer.connections[id]) {
      if (conn.open && !sent) {
        conn.send(data)
        sent = true
        continue
      }
      conn.close()
    }
  }
}

// receiver(conn, onlineRef.current.name)
export function Lobby({setError, peer, setPeer, onSubmit}: {setError: any, peer: any, setPeer: any, onSubmit: any}) {
  const [players, _setPlayers] = useState(initPlayers)
  const [online, _setOnline] = useState<{name: string, host: boolean}|null>(null)
  const {formatMessage, locale} = useIntl()

  const playersRef = useRef(players)
  const onlineRef = useRef(online)
  const setPlayers = (newPlayers: (typeof players)) => {
    playersRef.current = newPlayers
    _setPlayers(newPlayers)
  }
  const setOnline = (newOnline: (typeof online)) => {
    onlineRef.current = newOnline
    _setOnline(newOnline)
  }
  const isOnline = online !== null
  const isHost = !!online?.host
  const fixed = !!players[0].name

  useEffect(() => { // 初回レンダリング後必ず呼ばれる
    console.log('connection for non-host', peer)
    if (!peer.id) return
    peer.on('connection', (conn: DataConnection) => {
      console.log('non-host peer.connected', conn.label, conn, peer)
      // non-host(Receiver) connection
      conn.on('open', () => {
        console.log('non-host conn.open', conn.label, conn, peer)
        if (onlineRef.current?.host) return conn.close()
        const peerId = peer.id
        peer.disconnect()
        conn.on('data', (data) => {
          console.log('non-host conn.data', data, conn.label, conn, peer)
          if (!isRTCData(data) || conn.metadata === peerId || data.origin === peerId) return
          if (data.action === 'players' && Array.isArray(data.players)) {
            let toHost = false
            const name = onlineRef.current?.name
            const newPlayers = data.players.map(v => {
              if (v.id === peerId) {
                toHost = v.name !== name
                return {...v, name}
              }
              return v
            })
            newPlayers.sort(playerSort)
            setPlayers(newPlayers)
            if (toHost) conn.send({action: 'name', name})
          }
          if (data.action === 'data') onSubmit(data.data, data.origin, false)
        })
        conn.on('error', (err) => {
          console.error('conn.error', err, conn, peer)
          setError(formatMessage({id: err.type}))
        })
      })
      conn.on('close', () => { // hostがリロードした時
        setError(formatMessage({id: 'non_host_connection_close'}))
        // peer.connections[id].length ===0
        // setPeer(null)で一人回しに
      })
    })
    return () => {}
  }, [peer])
  const handleInput = (idx: number, e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.name !== 'name' && e.target.name !== 'id') return
    const newPlayers = players.map((v, i) => {
      if (i === idx) return {...v, [e.target.name]: e.target.value || ''}
      return v
    })
    setPlayers(newPlayers)
    if (!e.target.checkValidity()) return e.target.reportValidity()
    if (!isHost || !peer.id) return
    const id = e.target.value
    if (peer.connections[id]) return setError(formatMessage({id: 'duplex_player_id'}))

    // host(sender) connection
    const conn = peer.connect(id, {metadata: peer.id})
    console.log('connect', conn.label, conn, peer)
    conn.on('open', () => {
      console.log('conn.open', conn.label, conn, peer)
      const peerId = peer.id
      conn.on('data', (data: RTCData) => {
        console.log('conn.data', data, conn.label, conn, peer)
        if (!isRTCData(data) || data.origin === peerId) return
        if (data.action === 'name' && typeof data.name === 'string') {
          const newPlayers = playersRef.current.map((v, i) => {
            if (v.id === id) return {...v, name: data.name}
            return v
          })
          setPlayers(newPlayers)
          newPlayers.sort(playerSort)
          return multiSend(peer, {action: 'players', players: playersRef.current}, id)
        }
        if (data.action === 'data') return onSubmit(data.data, data.origin, true)
      })
      conn.on('error', (err: {type: string}) => {
        console.error('conn.error', err, conn.label, peer)
        setError(formatMessage({id: err.type}))
      })
      conn.send({action: 'players', players: playersRef.current})
    })
    conn.on('close', () => {
      console.error('close', conn, peer)
      setError(formatMessage({id: 'host_connection_close'}))
    })
  }

  const handleIsOnline = (e: ChangeEvent<HTMLInputElement>) => {
    if (online !== null) {
      if (peer && typeof peer.destroy === 'function') {
        peer.destroy()
        setPeer({})
      }
      setOnline(null)
      return setPlayers(initPlayers)
    }
    setPlayers(playersRef.current.map((v, i) => ({id: '', name: ''})))
    setOnline({name: '', host: false})
    try {
      // @ts-ignore
      const _peer = new Peer()
      _peer.on('open', (id) => {
        setPlayers(playersRef.current.map((v, i) => i===0 ? ({id, name: v.name}) : ({id: '', name: ''})))
        setPeer(_peer)
      })
      _peer.on('error', (err: PeerError<any>) => {
        console.error('peer.error', err, _peer, err.type)
        setError(formatMessage({id: err.type}, {br: <br/>}))
      })
    } catch(e: any) {
      setError(e.message)
    }
  }

  const handleDragStart = (e: any, from: string) => {
    e.dataTransfer.setData('from', from)
    e.target.classList.add('cursor-grabbing')
  }
  const handleDragOver = (e: any) => e.preventDefault() // for emitting drop event
  const handleDragEnd = (e: any) => {
    e.target.classList.remove('cursor-grabbing')
  }
  const handleDrop = (e: any, toStr: string) => {
    e.preventDefault()
    const from = parseInt(e.dataTransfer.getData('from'), 10)
    const to = parseInt(toStr, 10)
    if (from > MAX_PLAYER || to > MAX_PLAYER || from < 0 || to < 0) return
    const newPlayers = [...playersRef.current]
    newPlayers[to] = playersRef.current[from]
    newPlayers[from] = playersRef.current[to]
    newPlayers.sort(playerSort)
    setPlayers(newPlayers)
  }
  let inputs: any = []
  const playerNum = players.filter(v => !!v.name && !!v.id).length
  if (isOnline && (players[0].id.length < PEER_ID_LENGTH || !players[0].name)) inputs = <Loading text='Waiting' />
  else {
    for (let i = 0; i < MAX_PLAYER; i++) {
      if (isHost) {
        inputs.push(
          <tr key={`player-${i}`}
              className="touch-none border-b border-gray-700 cursor-grab"
              draggable
              onDragStart={(e) => handleDragStart(e, String(i))}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, String(i))}
          >
            <td><Bars3Icon className="h-4"/></td>
            <td className="px-3 py-3">{players[i].name}</td>
            <td className="px-3 py-3">
              {players[i].id !== peer.id && players[i].name.length === 0 ? (
              <div
                className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                <input
                  type="text"
                  name="id"
                  placeholder="put another ID"
                  value={players[i].id || ''}
                  pattern={PEER_ID_PATTERN}
                  className={inputClassName}
                  title={formatMessage({id: 'peer_id_title'}, {len: PEER_ID_LENGTH})}
                  onChange={(e) => handleInput(i, e)}
                  onBlur={(e) => !e.target.checkValidity() && e.target.reportValidity()}
                />
              </div>
              ) : players[i].id}
            </td>
          </tr>
        )
      } else if (isOnline) {
        let elm: any = players[i].id
        if (elm === peer.id) elm = <div ref={node => {node && node.click()}}>{players[i].id}</div>
        inputs.push(
          <tr key={`player-${i}`} className="h-[45px] border-b border-gray-700">
            <td className="px-3 py-3">{players[i].name}</td>
            <td className="px-3 py-3">
              <Tooltip content={formatMessage({id: 'online_id'}, {br: <br/>})}
                       placement="bottom" trigger="click">
                {elm}
              </Tooltip>
            </td>
          </tr>
        )
      } else {
        inputs.push(
          <tr key={`player-${i}`}
              className="touch-none border-b border-gray-700 cursor-grab"
              draggable
              onDragStart={(e) => handleDragStart(e, String(i))}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, String(i))}
          >
            <td><Bars3Icon className="h-4"/></td>
            <td className="px-3 py-3">
              <div
                className="flex w-290 rounded-md shadow-sm ring-1 ring-inset ring-black/50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                <input
                  type="text"
                  name="name"
                  value={players[i].name || ''}
                  maxLength={10}
                  className={inputClassName}
                  placeholder="put name within 10"
                  onChange={(e) => handleInput(i, e)}
                />
              </div>
            </td>
          </tr>
        )
      }
    }
  }
  let onClick = null
  if (isOnline && !players[0].name) {
    onClick = () => {
      const name = online.name as string
      if (name.length > 0 && name.length < 11) {
        return setPlayers(players.map((v, i) => i===0 ? ({id: v.id, name: online.name as string}) : v))
      }
      return setError(formatMessage({id: 'online_name'}))
    }
  } else if ((!isOnline || isHost) && playerNum > 1) onClick = () => onSubmit({players})
  return (
    <>
      <Tooltip content={formatMessage({id: 'rule'}, {br: <br/>})} theme={toolTipTheme} placement="bottom">
        <h1 className={'relative -z-10 text-[32px]/[32px] sm:text-[46px]/[46px] ' +
          (locale === 'ja' ? "font-['hibiwaremoji']" : "font-['Zapfino']")}>
          {formatMessage({id: 'title'})}
        </h1>
      </Tooltip>
      <button
        onClick={onClick===null ? ()=>{} : onClick}
        className={"my-2 " + buttonClassName}
        disabled={onClick===null}
      >
        {isOnline && !fixed ? 'Set' : 'Play'}
      </button>
      <div className="flex mb-4">
        <label className="inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={isOnline} className="sr-only peer" onChange={handleIsOnline} />
          <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-400"></div>
          <span className="ms-2 text-sm font-medium text-gray-600">
            Online
          </span>
        </label>
        <Tooltip content={formatMessage({id: 'online'}, {br: <br/>})} placement="bottom">
          <QuestionMarkCircleIcon className="pl-1 h-5 flex-none" />
        </Tooltip>
      </div>
      {isOnline && !fixed && (<>
      <div className="flex w-290 rounded-md shadow-sm ring-1 ring-inset ring-indigo-600/30 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
        <input
          type="text"
          value={online.name}
          maxLength={10}
          className={inputClassName}
          placeholder="put your name within 10"
          onChange={(e)=>setOnline({...online, name: e.target.value})}
        />
      </div>
      <div className="mt-1 text-sm leading-6 text-gray-600 flex items-center mb-4">
        <input id="host"
               checked={isHost}
               onChange={() => setOnline({...online, host: !online.host})}
               type="checkbox"
               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label htmlFor="host" className="ms-2 text-sm font-medium">as a host</label>
      </div>
      </>)}
      {Array.isArray(inputs) ? (<>
      <div className="text-base text-center font-semibold leading-7 text-gray-900 mt-2">
        <UsersIcon/>{playerNum} / {MAX_PLAYER}
      </div>
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right">
          <thead className="text-xs text-black">
          <tr>
            {(!isOnline || isHost) &&
            <th scope="col">
              <Tooltip content={formatMessage({id: 'order'})} placement="bottom">
                Order
              </Tooltip>
            </th>
            }
            <th scope="col" className="px-3">
              Name
            </th>
            {isOnline &&
            <th scope="col" className="px-3">
              ID
            </th>
            }
          </tr>
          </thead>
          <tbody>
          {inputs}
          </tbody>
        </table>
      </div>
      </>) : inputs}
    </>
  )
}