export interface Task {
  title: string;
  date?: Date;
}
export interface TaskList {
  title: string;
  tasks: Task[];
}
