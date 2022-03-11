import React from 'react'
import { HiOutlineLightBulb } from 'react-icons/hi'

export const Box: React.FC<{ className?: string; icon?: JSX.Element }> = ({
  className,
  icon,
  children,
}) => {
  return (
    <div className={className ? `box ${className}` : 'box'}>
      <div className='icon'>{icon}</div>
      <div className='content'>{children}</div>
    </div>
  )
}
