import React from 'react'
import { HiBan } from 'react-icons/hi'

import { Box } from './box'

export const ErrorBox: React.FC = ({ children }) => {
  return (
    <Box className='error-box' icon={<HiBan />}>
      {children}
    </Box>
  )
}
