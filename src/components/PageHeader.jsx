import React from 'react';
import { cn } from '../utils/cn';

/**
 * Responsive page header: title stacks above actions on mobile.
 */
const PageHeader = ({ title, description, actions, className }) => (
  <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4', className)}>
    <div className="min-w-0">
      <h1 className="page-title">{title}</h1>
      {description && <p className="page-description">{description}</p>}
    </div>
    {actions && (
      <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
    )}
  </div>
);

export default PageHeader;
