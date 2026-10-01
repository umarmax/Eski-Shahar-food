import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function base({ size = 24, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...props,
  }
}

export const HomeIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" fill="currentColor" stroke="none" /></svg>
)

export const MenuIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 11h16a8 8 0 0 1-16 0zM3 18h18M12 7V4M8 8 7 6M16 8l1-2" /></svg>
)

export const CartIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 5h2l2.2 10.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L20 8H6.2" /><circle cx="9" cy="19.5" r="1.3" fill="currentColor" /><circle cx="17" cy="19.5" r="1.3" fill="currentColor" /></svg>
)

export const ProfileIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="4" fill="currentColor" stroke="none" /><path d="M4 20c0-3.6 3.6-6 8-6s8 2.4 8 6z" fill="currentColor" stroke="none" /></svg>
)

export const SearchIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
)

export const ClockIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
)

export const ChevronDownIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>
)

export const ArrowUpIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="m6 14 6-6 6 6" /></svg>
)

export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="m5 12 4.5 4.5L19 7" /></svg>
)

export const CloseIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>
)

export const InstagramIcon = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" /></svg>
)

export const FacebookIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5z" fill="currentColor" stroke="none" /></svg>
)

export const StarIcon = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <svg {...base(p)}><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill={filled ? 'currentColor' : 'none'} /></svg>
)

export const SunIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
)

export const MoonIcon = (p: IconProps) => (
  <svg {...base(p)}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></svg>
)

export const AboutIcon = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" fill="currentColor" stroke="none" /><path d="M12 11v5" stroke="var(--paper-card)" strokeWidth="2.4" /><circle cx="12" cy="7.8" r="1.4" fill="var(--paper-card)" stroke="none" /></svg>
)

/** Brand lock-up: Chorsu dome artwork + name + retro slogan. */
export function Logo({ slogan }: { slogan?: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2" style={{ color: 'var(--brand-ink)' }}>
      <img src="/brand/dome.webp" alt="" width={360} height={110} className="h-[clamp(22px,7.5vw,30px)] w-auto shrink-0" />
      <span className="flex min-w-0 flex-col">
        <span className="whitespace-nowrap font-serif text-[clamp(20px,6.4vw,25px)] font-bold leading-none tracking-tight">Eski Shahar</span>
        {slogan && (
          <span
            className="mt-1 whitespace-nowrap font-serif text-[12.5px] italic leading-none"
            style={{ color: 'var(--tg-theme-hint-color)' }}
          >
            {slogan}
          </span>
        )}
      </span>
    </span>
  )
}
