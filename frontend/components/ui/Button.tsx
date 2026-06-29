'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'emerald' | 'outline'

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-walnut text-white shadow-glow hover:bg-walnut-dark',
  secondary: 'bg-sand text-text shadow-soft hover:bg-sand-light',
  ghost: 'bg-transparent text-walnut hover:bg-cream-dark',
  emerald: 'bg-emerald text-white shadow-soft hover:bg-emerald-light',
  outline: 'bg-transparent border border-border text-text hover:bg-cream-dark',
}

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3 text-base rounded-2xl',
  lg: 'px-8 py-4 text-lg rounded-2xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, className = '', children, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-colors duration-200 cursor-pointer
        disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  )
)
Button.displayName = 'Button'
