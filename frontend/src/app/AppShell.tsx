import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import { useCart } from '../features/cart/useCart'

type AppShellProps = {
  children: ReactNode
}

const navigationItems = [
  { label: 'Studio', to: '/' },
  { label: 'Collection', to: '/shop' },
]

function BrandMark() {
  return (
    <NavLink className="brand-mark" to="/" aria-label="JW Studio home">
      <span className="brand-mark__symbol" aria-hidden="true">
        <span />
      </span>
      <span className="brand-mark__words">
        <strong>JW Studio</strong>
        <small>Frame by Frame</small>
      </span>
    </NavLink>
  )
}

function Navigation({ onNavigate }: { onNavigate: () => void }) {
  const { itemCount } = useCart()

  return (
    <nav className="site-nav" id="primary-navigation" aria-label="Primary navigation">
      {navigationItems.map((item) => (
        <NavLink
          className={({ isActive }) =>
            `site-nav__link${isActive ? ' site-nav__link--active' : ''}`
          }
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          onClick={onNavigate}
        >
          {item.label}
        </NavLink>
      ))}
      <NavLink
        className={({ isActive }) =>
          `site-nav__link site-nav__link--cart${isActive ? ' site-nav__link--active' : ''}`
        }
        to="/cart"
        onClick={onNavigate}
        aria-label={`Cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
      >
        Cart <span className="cart-count" aria-hidden="true">{itemCount}</span>
      </NavLink>
    </nav>
  )
}

export function AppShell({ children }: AppShellProps) {
  const [openMenuPath, setOpenMenuPath] = useState<string | null>(null)
  const location = useLocation()
  const isMenuOpen = openMenuPath === location.pathname

  useEffect(() => {
    if (!isMenuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenuPath(null)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="page-container site-header__inner">
          <BrandMark />
          <button
            className="menu-toggle"
            type="button"
            aria-controls="primary-navigation"
            aria-expanded={isMenuOpen}
            onClick={() => setOpenMenuPath(isMenuOpen ? null : location.pathname)}
          >
            <span className="menu-toggle__label">Menu</span>
            <span className="menu-toggle__icon" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
          <div className={`site-header__nav${isMenuOpen ? ' site-header__nav--open' : ''}`}>
            <Navigation onNavigate={() => setOpenMenuPath(null)} />
          </div>
        </div>
      </header>

      <div className="studio-strip" aria-label="Studio status">
        <div className="page-container studio-strip__inner">
          <span className="studio-strip__signal" aria-hidden="true" />
          <span>Progress is a practice.</span>
          <span className="studio-strip__meta">JW / 02.0 / LEARNING DEMO</span>
        </div>
      </div>

      <main className="app-shell__main">{children}</main>

      <footer className="site-footer">
        <div className="page-container site-footer__inner">
          <span>JW Studio / Frame by Frame</span>
          <span>English-first synthetic learning demo</span>
        </div>
      </footer>
    </div>
  )
}
