import React from 'react'
import { BiError } from 'react-icons/bi'

import { Box } from './box'

export const ErrorBox: React.FC<{ title?: string }> = ({ title, children }) => {
  return (
    <Box className='error-box' title={title} icon={<BiError />}>
      {children}
    </Box>
  )
}
