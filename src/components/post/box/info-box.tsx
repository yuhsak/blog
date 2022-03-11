import React from 'react'
import { HiOutlineLightBulb } from 'react-icons/hi'

import { Box } from './box'

export const InfoBox: React.FC<{ title?: string }> = ({ title, children }) => {
  return (
    <Box className='info-box' title={title} icon={<HiOutlineLightBulb />}>
      {children}
    </Box>
  )
}
