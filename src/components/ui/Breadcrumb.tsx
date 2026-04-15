import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  items: {
    label: string;
    href?: string;
  }[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm font-sans mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
      <Link href="/dashboard" className="text-on-surface-variant hover:text-primary transition-colors flex items-center">
        <Home className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-outline-variant" />
          {item.href ? (
            <Link 
              href={item.href} 
              className="text-on-surface-variant hover:text-primary transition-colors font-medium tracking-wide uppercase text-[10px]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-primary font-bold tracking-widest uppercase text-[10px]">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
