import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function PageHeader({ icon: Icon, title, description }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="inline-flex size-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <Icon className="size-6" />
      </div>
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
          {description}
        </p>
      </div>
    </div>
  );
}

