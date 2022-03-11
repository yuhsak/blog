import React from 'react'
import { TiPencil } from 'react-icons/ti'

import { Box } from './box'

export const NoteBox: React.FC<{ title?: string }> = ({ title, children }) => {
  return (
    <Box className='note-box' title={title} icon={<TiPencil />}>
      {children}
    </Box>
  )
}
