interface VoteButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function VoteButton({
  label,
  onClick,
  disabled,
  variant = 'primary',
}: VoteButtonProps) {
  const baseClasses =
    'px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400';

  return (
    <button
      className={`${baseClasses} ${variantClasses}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
