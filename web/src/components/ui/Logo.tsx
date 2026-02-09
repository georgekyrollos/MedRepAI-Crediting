interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 32, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      {/* Circular peach/orange background */}
      <circle cx="24" cy="24" r="24" fill="#FAE0C8" />

      {/* Geometric "R" shape - light blue left piece */}
      <path
        d="M14 10 L14 38 L24 24 Z"
        fill="#7ABEEF"
      />

      {/* Geometric "R" shape - dark blue right piece */}
      <path
        d="M14 10 L34 10 L24 24 L34 38 L24 24 L14 10"
        fill="#0269F7"
      />
      <path
        d="M14 10 L34 10 L24 24 Z"
        fill="#0269F7"
      />
      <path
        d="M24 24 L34 38 L24 38 Z"
        fill="#0269F7"
      />
    </svg>
  )
}

export function LogoMark({ size = 32, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      {/* Circular peach/orange background */}
      <circle cx="24" cy="24" r="24" fill="#FAE0C8" />

      {/* Stylized R - left vertical bar (light blue) */}
      <path
        d="M15 10 L15 38 L21 38 L21 26 L15 10"
        fill="#7ABEEF"
      />

      {/* Stylized R - top arc and leg (primary blue) */}
      <path
        d="M21 10 L21 22 L28 22 C32 22 34 19 34 16 C34 13 32 10 28 10 L21 10"
        fill="#0269F7"
      />

      {/* Stylized R - diagonal leg */}
      <path
        d="M24 22 L34 38 L28 38 L21 26 L24 22"
        fill="#0269F7"
      />
    </svg>
  )
}
