import { toast } from 'sonner';
export { toast };
export function showNotification(title: string, description?: string) { toast(title, { description }); }