import React from 'react';
import { cn } from '../utils/cn';

const Table = ({ headers, children, className }) => {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-6 py-4">{header}</th>
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
