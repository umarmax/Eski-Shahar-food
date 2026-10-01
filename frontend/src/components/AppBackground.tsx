/**
 * Retro paper background: grain + fibres, faint aged blotches, darkened edges.
 * Static on purpose — the menu is the focus.
 */
export function AppBackground() {
  return (
    <div className="app-bg" aria-hidden="true">
      <div className="app-bg__stains" />
      <div className="app-bg__grain" />
      <div className="app-bg__vignette" />
    </div>
  )
}
