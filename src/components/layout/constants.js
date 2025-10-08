import {
  Dashboard as DashboardIcon,
  Assignment as TaskIcon,
  ConfirmationNumber as TicketIcon,
  Analytics as AnalyticsIcon,
  Assessment as ReportsIcon,
  People as PeopleIcon,
  ViewKanban as KanbanIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

export const DRAWER_WIDTH = 280;
export const MOBILE_DRAWER_WIDTH = 260;

export const navigationItems = [
  {
    text: 'Dashboard',
    iconName: 'Dashboard',
    path: '/app/dashboard',
    icon: DashboardIcon,
  },
  {
    text: 'Tasks',
    iconName: 'Task',
    path: '/app/tasks',
    icon: TaskIcon,
  },
  {
    text: 'Tickets',
    iconName: 'Ticket',
    path: '/app/tickets',
    icon: TicketIcon,
  },
  {
    text: 'Kanban Board',
    iconName: 'Kanban',
    path: '/app/kanban',
    icon: KanbanIcon,
  },
  {
    text: 'Analytics',
    iconName: 'Analytics',
    path: '/app/analytics',
    icon: AnalyticsIcon,
  },
  {
    text: 'Reports',
    iconName: 'Reports',
    path: '/app/reports',
    icon: ReportsIcon,
  },
  {
    text: 'Employees',
    iconName: 'People',
    path: '/app/employees',
    icon: PeopleIcon,
  },
  {
    text: 'Settings',
    iconName: 'Settings',
    path: '/app/settings',
    icon: SettingsIcon,
  },
]; 