export function isOverdue(deadline: string, completed: boolean): boolean {
  if (!deadline || completed) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(`${deadline}T00:00:00`);
  return dueDate < today;
}
