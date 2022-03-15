import React from 'react'
import { HiOutlineLightBulb } from 'react-icons/hi'

export const Box: React.FC<{
  className?: string | undefined
  title?: string | undefined
  icon?: JSX.Element | undefined
}> = ({ className, icon, title, children }) => {
  return (
    <div className={className ? `box ${className}` : 'box'}>
      {icon && <div className='icon'>{icon}</div>}
      <div className='content'>
        {title && <p className='title'>{title}</p>}
        <div className='children'>{children}</div>
      </div>
    </div>
  )
}
