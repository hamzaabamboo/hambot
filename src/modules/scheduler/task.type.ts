export interface Task {
  title: string;
  start?: Date;
  end?: Date;
}
export interface TaskList {
  title: string;
  tasks: Task[];
}
