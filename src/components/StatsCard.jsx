import React from 'react';
import { cn } from '../utils/cn';

const StatsCard = ({ title, value, subtext, trend, color, icon: Icon }) => {
  const isPositive = trend?.startsWith('+');
  const isNegative = trend?.startsWith('-');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          color || "bg-purple-50 text-purple-600"
        )}>
          {Icon && <Icon size={20} />}
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-bold px-2 py-1 rounded-full",
            isPositive ? "bg-emerald-50 text-emerald-600" : 
            isNegative ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-600"
          )}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 leading-none">{value}</h3>
        {subtext && <p className="text-xs text-slate-400 mt-2 font-medium">{subtext}</p>}
      </div>
    </div>
  );
};

export default StatsCard;

