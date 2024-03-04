'use client'

import { Fragment} from "react"
import { Dialog, Transition } from '@headlessui/react'

export default function Modal({isOpen, onClose, title, opacity, children}: {isOpen: boolean, onClose: any, title?: string, opacity?: string, children?: any}) {
  opacity = opacity || 'bg-opacity-50'
  return (
    <Transition unmount={false} show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose} unmount={false}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center">
          <Transition.Child
            as={Fragment}
            unmount={false}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className={`w-300 overflow-y-auto max-h-[80vh] max-w-4xl transform rounded-2xl
              bg-white ${opacity} p-4 text-left align-middle shadow-xl transition-all`}>
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                {title}
              </Dialog.Title>
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
