export function getLocalDateString(date: any): string {
  if (!date) return '';
  if (typeof date === 'string') {
    return date.substring(0, 10);
  }
  const offset = new Date().getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().split('T')[0];
};