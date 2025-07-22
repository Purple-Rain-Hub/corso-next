'use client'
import React from 'react'

const ButtonComponent = () => {
  return (
    <div className='inline bg-blue-500 hover:bg-blue-700 text-white font-bold text-sm py-1 px-3 rounded-full'>
        <button onClick={() => console.log('clicked')}>Click me</button>
    </div>
  )
}

export default ButtonComponent