
interface TaskListEmptyStateProps {
  filter: 'all' | 'pending' | 'completed';
}

export const TaskListEmptyState = ({ filter }: TaskListEmptyStateProps) => {
  return (
    <div className="text-center p-6 text-gray-500">
      {filter === 'all' ? 'No hay tareas registradas' : 
       filter === 'pending' ? 'No hay tareas pendientes' : 'No hay tareas completadas'}
    </div>
  );
};
