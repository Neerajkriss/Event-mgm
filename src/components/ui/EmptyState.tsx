import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        {icon}
      </div>
      <h3 className="font-display text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-gray-500">{description}</p>
    </div>
  );
}
