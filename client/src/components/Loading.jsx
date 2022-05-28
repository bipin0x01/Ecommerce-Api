import { CircularProgress } from '@mui/material'
import React from 'react'
import "./../styles/global.css"

function Loading() {
  return (
    <div className='loading-container'>
        <div className=''>
            <CircularProgress />
        </div>
    </div>
  )
}

export default Loading