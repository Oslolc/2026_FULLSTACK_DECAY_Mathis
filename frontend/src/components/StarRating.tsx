interface Props {
  value: number | null;
  onChange?: (val: number) => void;
  readonly?: boolean;
}

export default function StarRating({ value, onChange, readonly = false }: Props) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div style={{ display: 'inline-flex', gap: 3 }}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          style={{
            background: 'none',
            border: 'none',
            cursor: readonly ? 'default' : 'pointer',
            padding: '2px',
            fontSize: '1.1rem',
            color: value && star <= value ? '#f59e0b' : 'var(--text-dark)',
            transition: 'color 0.15s, transform 0.15s',
            transform: 'scale(1)',
          }}
          onMouseEnter={(e) => {
            if (!readonly) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.2)';
          }}
          onMouseLeave={(e) => {
            if (!readonly) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          }}
          aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
        >
          {value && star <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
}
