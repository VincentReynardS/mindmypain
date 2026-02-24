interface Props {
  aiResponse: Record<string, unknown>;
}

function flattenValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.map(flattenValue).filter(Boolean).join('; ');
  if (typeof val === 'object') {
    return Object.entries(val as Record<string, unknown>)
      .map(([k, v]) => {
        const flat = flattenValue(v);
        return flat ? `${k}: ${flat}` : '';
      })
      .filter(Boolean)
      .join('. ');
  }
  return String(val);
}

const fields = [
  { key: 'chief_complaint', label: 'Chief Complaint' },
  { key: 'medication_review', label: 'Medication Review' },
  { key: 'patient_goal', label: 'Patient Goal' },
];

export function SafeClinicalSummaryRender({ aiResponse }: Props) {
  return (
    <div className="space-y-2">
      {fields.map(({ key, label }) => {
        const val = flattenValue(aiResponse[key]);
        if (!val) return null;
        return (
          <div key={key} className="text-calm-text">
            <span className="font-medium text-calm-primary block text-[10px] uppercase tracking-wider mb-0.5">{label}</span>
            <div className="text-sm whitespace-pre-wrap">{val}</div>
          </div>
        );
      })}
    </div>
  );
}
