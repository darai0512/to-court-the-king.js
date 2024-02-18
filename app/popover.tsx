import { Popover, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Fragment, ReactNode } from 'react'

export default function Info(props: {title: string, children: ReactNode}) {
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={`
              ${open ? 'text-white' : 'text-white/90'}
              group inline-flex items-center rounded-md bg-orange-700 px-3 text-base hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75`}
          >
            <span>{props.title}</span>
            <ChevronDownIcon
              className={`${open ? 'text-orange-300' : 'text-orange-300/70'}
                ml-2 h-5 w-5 transition duration-150 ease-in-out group-hover:text-orange-300/80`}
              aria-hidden="true"
            />
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute left-1/2 z-10 mt-3 w-screen -translate-x-1/2 transform sm:px-0 lg:max-w-xl">
              <div className="rounded-lg shadow-lg ring-1">
                <div className="bg-black opacity-50 p-6">
                  {props.children}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}