import React from 'react'
import { BiErrorCircle } from 'react-icons/bi'

import { Box } from './box'

export const WarnBox: React.FC<{ title?: string }> = ({ title, children }) => {
  return (
    <Box className='warn-box' title={title} icon={<BiErrorCircle />}>
      {children}
    </Box>
  )
}
