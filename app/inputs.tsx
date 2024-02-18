'use client'
import { ChangeEvent, useState} from 'react'
import {FieldData} from '~/src/field'

export function Players({field, params}: {field: FieldData, params: any}) {
  const [players, setPlayers] = useState([
    'me',
    'opponent A',
    '',
    '',
    '',
  ])
  params.players = players.filter((v) => !!v)
  const max = field.MAX_PLAYER_NUM
  const handleInput = (idx: number, e: ChangeEvent<HTMLInputElement>) => {
    console.log('hoge')
    const newPlayers = players.map((v, i) => i === idx ? e.target.value : v)
    setPlayers(newPlayers)
    params.players = newPlayers.filter((v) => !!v)
  }
  let inputs = []
  for (let i = 0; i < max; i++) {
    inputs.push(
      <div className="mt-2" key={`player-name-input-${i}`}>
        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
          <input
            type="text"
            name="players[]"
            value={players[i]}
            className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
            placeholder="player A"
            onChange={(e) => handleInput(i, e)}
          />
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-12">
      <div className="pb-12">
        <h2 className="text-base font-semibold leading-7 text-gray-900">Set 2 ~ {max} player&apos;s name</h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          now, {params.players.length} players
        </p>
        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-4">
            {inputs}
          </div>
        </div>
      </div>
    </div>
  )
}