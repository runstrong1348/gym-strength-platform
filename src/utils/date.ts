export const getDayOfWeek = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'monday' }).toLowerCase();
};

export const isScheduledWorkoutDay = (date: Date, workoutDays: string[] = ['monday', 'wednesday', 'friday']): boolean => {
  const dayOfWeek = getDayOfWeek(date);
  return workoutDays.includes(dayOfWeek);
};

export const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
