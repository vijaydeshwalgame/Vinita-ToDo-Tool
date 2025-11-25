export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  category?: 'wellness' | 'work' | 'home' | 'other';
}

export type TodoMap = Record<string, Todo[]>;

export enum FilterType {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export interface RoutineSuggestion {
  title: string;
  tasks: string[];
}