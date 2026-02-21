export function isMedicationAgenda(parsedContent: any): boolean {
  return parsedContent && (typeof parsedContent === 'object') && ('Brand Name' in parsedContent || 'Dosage' in parsedContent);
}

export function isAppointmentAgenda(parsedContent: any): boolean {
  return parsedContent && (typeof parsedContent === 'object') && ('Practitioner Name' in parsedContent || 'Visit Type' in parsedContent);
}
