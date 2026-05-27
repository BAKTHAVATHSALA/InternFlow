import React from 'react';
import { cn } from '../utils/cn';

const Table = ({ headers, children, className, compact }) => {
  return (
    <div className={cn('table-responsive', className)}>
      <table className="w-full text-left min-w-[640px]">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className={cn(compact ? 'px-3 py-3 sm:px-4 sm:py-3' : 'px-4 py-3 sm:px-6 sm:py-4')}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
