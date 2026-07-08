interface StatusBadgeProps {
  status: string
  variant?: 'default' | 'success' | 'warning' | 'error'
}

export function StatusBadge({
  status,
  variant = 'default',
}: StatusBadgeProps) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  }

  const getVariant = (status: string) => {
    if (status === 'paid' || status === 'shipped' || status === 'active' || status === 'published') {
      return 'success'
    }
    if (status === 'pending' || status === 'draft') {
      return 'warning'
    }
    if (status === 'cancelled' || status === 'inactive') {
      return 'error'
    }
    return 'default'
  }

  const selectedVariant = variant === 'default' ? getVariant(status) : variant

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${variantStyles[selectedVariant]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
