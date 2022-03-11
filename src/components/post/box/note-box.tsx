import React from 'react'
import { TiPencil } from 'react-icons/ti'

import { Box } from './box'

export const NoteBox: React.FC = ({ children }) => {
  return (
    <Box className='note-box' icon={<TiPencil />}>
      {children}
    </Box>
  )
}
