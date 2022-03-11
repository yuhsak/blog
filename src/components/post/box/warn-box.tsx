import React from 'react'
import { BiError } from 'react-icons/bi'

import { Box } from './box'

export const WarnBox: React.FC = ({ children }) => {
  return (
    <Box className='warn-box' icon={<BiError />}>
      {children}
    </Box>
  )
}
