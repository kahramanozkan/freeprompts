import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  homeHref?: string;
}

export default function Breadcrumbs({
  items,
  className = '',
  showHome = true,
  homeHref = '/'
}: BreadcrumbsProps) {
  const breadcrumbItems = [
    ...(showHome ? [{ label: 'Home', href: homeHref }] : []),
    ...items
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.href || undefined
    }))
  };

  return (
    <nav
      className={`flex items-center space-x-2 text-sm text-gray-600 overflow-x-auto whitespace-nowrap scrollbar-hide ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2 flex-shrink-0">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center flex-shrink-0">
            {index > 0 && (
              <svg
                className="w-4 h-4 text-gray-400 mx-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            
            {item.href && !item.current ? (
              <Link
                href={item.href}
                className="hover:text-black transition-colors duration-200 flex items-center flex-shrink-0"
                aria-label={`Go to ${item.label}`}
              >
                {index === 0 && (
                  <svg
                    className="w-4 h-4 mr-1 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                )}
                <span className="flex-shrink-0">{item.label}</span>
              </Link>
            ) : (
              <span
                className={`flex items-center flex-shrink-0 ${
                  item.current ? 'text-black font-medium' : 'text-gray-600'
                }`}
                aria-current={item.current ? 'page' : undefined}
              >
                {index === 0 && (
                  <svg
                    className="w-4 h-4 mr-1 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                )}
                <span className="flex-shrink-0">{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
      
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </nav>
  );
}

// Specialized breadcrumb for prompt pages
export function PromptBreadcrumbs({ 
  promptTitle, 
  promptId, 
  slug,
  className = '' 
}: {
  promptTitle: string;
  promptId: string;
  slug?: string;
  className?: string;
}) {
  const items: BreadcrumbItem[] = [
    { label: 'Prompts', href: '/prompts' },
    { 
      label: promptTitle.length > 50 ? `${promptTitle.substring(0, 47)}...` : promptTitle,
      href: `/prompt/${promptId}/${slug || promptTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      current: true
    }
  ];

  return (
    <Breadcrumbs 
      items={items}
      className={className}
      showHome={true}
    />
  );
}

// Specialized breadcrumb for list pages
export function ListBreadcrumbs({ 
  listName, 
  listId, 
  slug,
  className = '' 
}: {
  listName: string;
  listId: string;
  slug?: string;
  className?: string;
}) {
  const items: BreadcrumbItem[] = [
    { label: 'Lists', href: '/lists' },
    { 
      label: listName.length > 50 ? `${listName.substring(0, 47)}...` : listName,
      href: `/list/${listId}/${slug}`,
      current: true
    }
  ];

  return (
    <Breadcrumbs 
      items={items}
      className={className}
      showHome={true}
    />
  );
}

// Generic page breadcrumbs
export function PageBreadcrumbs({
  pageName,
  parentName,
  parentHref = '/',
  className = ''
}: {
  pageName: string;
  parentName?: string;
  parentHref?: string;
  className?: string;
}) {
  const items: BreadcrumbItem[] = [];
  
  if (parentName) {
    items.push({ label: parentName, href: parentHref });
  }
  
  items.push({ label: pageName, current: true });

  return (
    <Breadcrumbs 
      items={items}
      className={className}
      showHome={!parentName}
    />
  );
}