import React from 'react'
import { HiOutlineLightBulb } from 'react-icons/hi'

import { Box } from './box'

export const InfoBox: React.FC = ({ children }) => {
  return (
    <Box className='info-box' icon={<HiOutlineLightBulb />}>
      {children}
    </Box>
  )
}
