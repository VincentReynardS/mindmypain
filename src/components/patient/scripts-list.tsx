"use client";

import { useState } from 'react';
import { JournalEntry } from '@/types/database';
import { formatDateDDMMYYYY } from '@/lib/utils/date-helpers';

interface ScriptsListProps {
  entries: JournalEntry[];
  onToggleFilled: (id: string, isFilled: boolean) => Promise<void>;
}

interface ScriptData {
  Name?: string;
  'Date Prescribed'?: string;
  Filled?: boolean;
  Notes?: string;
}

function parseContent(content: string): ScriptData {
  try {
    return JSON.parse(content || '{}');
  } catch {
    return { Notes: content }; // Fallback to raw text if not JSON
  }
}

export function ScriptsList({ entries, onToggleFilled }: ScriptsListProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = async (id: string, currentFilled: boolean) => {
    try {
      setTogglingId(id);
      await onToggleFilled(id, !currentFilled);
    } catch (error) {
       console.error("Failed to toggle script status", error);
    } finally {
      setTogglingId(null);
    }
  };

  if (!entries || entries.length === 0) {
    return (
      <div className="rounded-lg border border-calm-border border-dashed p-8 text-center bg-calm-surface">
         <p className="text-sm text-calm-text-muted">No pending scripts or referrals found.</p>
         <p className="text-xs text-calm-text-muted mt-2">Speak an entry like &quot;I need a referral for Dr. Smith&quot; into your journal.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-calm-surface-raised overflow-hidden shadow-sm border border-calm-border">
      <div className="min-w-full divide-y divide-calm-border">
        {entries.map((entry) => {
          const data = parseContent(entry.content);
          const name = data.Name || "Unnamed Script/Referral";
          const isFilled = data.Filled === true;
          const isToggling = togglingId === entry.id;

          return (
            <div 
              key={entry.id} 
              className={`p-4 flex items-center justify-between transition-colors ${isFilled ? 'bg-calm-background/50' : 'bg-white'}`}
            >
              <div className="flex items-start gap-4 flex-1">
                <button
                  type="button"
                  onClick={() => handleToggle(entry.id, isFilled)}
                  disabled={isToggling}
                  className="mt-1 shrink-0 flex items-center justify-center w-11 h-11 rounded hover:bg-calm-surface-raised cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={isFilled ? "Mark as To Be Filled" : "Mark as Filled"}
                >
                  <div className={`flex flex-col items-center justify-center w-6 h-6 rounded border ${
                    isFilled 
                      ? 'bg-calm-green border-calm-green text-white' 
                      : 'border-calm-border bg-white text-transparent'
                  }`}>
                    {isFilled && !isToggling && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {isToggling && (
                      <svg className="animate-spin w-4 h-4 text-calm-text" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                  </div>
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-medium ${isFilled ? 'text-calm-text-muted line-through' : 'text-calm-text'}`}>
                      {name}
                    </h3>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-blue-100 text-calm-blue capitalize">
                      {entry.entry_type}
                    </span>
                  </div>
                  
                  {data['Date Prescribed'] && (
                     <div className="text-xs text-calm-text-muted mb-1">
                       Prescribed: {formatDateDDMMYYYY(data['Date Prescribed'])}
                     </div>
                  )}
                  
                  {data.Notes && (
                    <p className={`text-sm mt-2 ${isFilled ? 'text-calm-text-muted/70' : 'text-calm-text-muted'}`}>
                      {data.Notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="ml-4 flex flex-col items-end">
                 <span className={`text-xs font-medium px-2 py-1 rounded inline-flex ${
                    isFilled 
                      ? 'bg-calm-green/10 text-calm-green' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isFilled ? 'Filled' : 'To Be Filled'}
                 </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
