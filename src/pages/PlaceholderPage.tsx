import { Construction } from 'lucide-react';

interface PlaceholderProps {
  title: string;
  description: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
        <Construction className="h-8 w-8" />
      </div>
      <h1 className="font-display text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-gray-600">{description}</p>
      <p className="mt-4 text-xs text-gray-400">
        This section is ready for feature development. The centralized data, navigation, and layout are all wired up.
      </p>
    </div>
  );
}
