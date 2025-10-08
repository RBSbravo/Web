# MITO Frontend Web App

## Recent Improvements (July 2024)

- **Task Update Requires Remarks:** When updating a task, users must provide remarks. These remarks are automatically added as a highlighted comment in the comment section.
- **Highlighted Task Update Comments:** Task update comments are visually highlighted with an emoji, color, and border for easy identification.
- **Ticket Attachments in Task Details:** Ticket details in the task details modal now include ticket attachments, which are clickable for download or view (with authentication).
- **Received Pending Tickets in Create Task:** Only received (assigned) pending tickets are shown in the create task form for linking.
- **Success Messages and Loading States:** Success messages (green Snackbar) and loading states are shown for create/delete task actions.
- **Maturity Chips for Tasks:** Task maturity (due date) chips are displayed below the due date in task lists and details.
- **Correct Comment Author Display:** Comment author names are now correctly displayed in all comment sections.

---

This is the frontend for the MITO Task & Ticket Management System, built with React and Vite.

## Features

- **Modern, Responsive UI**: Built with React, Material-UI, and Vite for fast development and HMR.
- **Professional Dashboard**: Department heads see a visually rich dashboard with department-specific stats, recent tickets/tasks, and team performance cards, all with icons, color, and responsive design.
- **Live Data**: All dashboard data is fetched in real time from the backend database, including recent activity and team metrics.
- **Authentication & Authorization**: Role-based access for Admins, Department Heads, and Employees.
- **Task Management**: Create, edit, assign, comment, and upload files to tasks. Bulk actions, quick status/priority updates, and robust filtering.
- **Ticket Management**: Create, send, receive, edit, and delete tickets. Department heads and admins can manage tickets across departments. Employees see only their tickets.
  - **Desired Action Field**: When creating or editing a ticket, users must select a desired action from a dropdown (see options below).
  - **Forwarding UI**: Tickets can be forwarded to other users. The UI shows forwarding actions and history. Forwarded tickets can be updated by the receiver.
- **Comments**: Add, view, and delete comments on both tasks and tickets.
  - **Comment Types**: comment, forward, response, update. Forwarded and update comments are visually highlighted and structured for clarity.
- **File Attachments**: Upload, preview, download, and delete files for both tasks and tickets. File selection UI with pre-submit removal.
- **User & Department Management**: Department heads can manage employees in their department. Admins have full user management.
- **Notifications**: Real-time updates and notifications for assignments, status changes, comments, and all forwarded ticket activities. All users involved in a forwarded ticket (sender, receiver, creator, assignee) receive notifications for all activities (forward, update, response).
- **Mobile-Friendly**: Fully responsive layouts and card views for small screens.
- **Robust Error Handling**: User-friendly error dialogs and validation throughout the app.
- **Advanced Theming**: Uses Material-UI icons and advanced theming for a modern, professional look.

## Currently Implemented Features

- **Login, registration, and role-based authentication**
- **Task CRUD** (create, read, update, delete) with:
  - Assigning tasks to users
  - Bulk status/priority updates
  - File upload and removal before submit
  - Comments (add, view, delete)
- **Ticket CRUD** (create, read, update, delete) with:
  - Send/receive tickets by department head/admin
  - Assign tickets to department heads/admins
  - File upload and removal before submit
  - Comments (add, view, delete)
  - **Desired Action**: Selectable from a dropdown when creating or editing a ticket (see options below)
  - **Forwarding**: Tickets can be forwarded, and the receiver can update the ticket. Forwarding actions and history are shown in the UI.
- **File Attachments**
  - Upload, preview, download, and delete for both tasks and tickets
  - File selection UI with ability to remove before upload
- **User & Department Management**
  - Department heads can view, add, edit, and remove employees in their department
  - Admins can manage all users and departments
- **Notifications**
  - Real-time updates for assignments, status changes, comments, and all forwarded ticket activities
  - Notification badge, modal, delete, and mark-as-read
  - All users involved in a forwarded ticket (sender, receiver, creator, assignee) receive notifications for all activities (forward, update, response)
- **Professional Dashboard**
  - Department heads see department-specific stats, recent tickets/tasks, and team performance
  - All dashboard data is live from the backend database
  - Modern UI with icons, color, and responsive design
  - Secure backend filtering for department data
  - Improved error handling and empty states
- **Responsive Design**
  - Table and card views for desktop and mobile
- **Error Handling**
  - User-friendly error dialogs and validation
- **Modern UI/UX**
  - Material-UI components, iconography, theme support, and clean layouts

## Desired Action Options (for Tickets)

- Approval/Signature
- Comments/Recommendation
- Re-Write/Re-Draft
- Information/Notation
- Dispatch
- File
- Mis routed
- Return to office of origin
- Photocopy file
- Study
- Staff action
- See me/ Call me

## Tech Stack

- **React** (with hooks and context)
- **Vite** (for fast dev/build)
- **Material-UI** (MUI) for UI components and icons
- **Axios** for API requests
- **React Router** for navigation
- **Custom Contexts** for user and theme management

## Development

- Start the dev server: `npm run dev`
- Build for production: `npm run build`
- Lint: `npm run lint`

## Notes

- This app is designed to work with the MITO backend (Node.js/Express/Sequelize).
- For full functionality, ensure the backend is running and up-to-date with the latest schema and endpoints.
- For more details, see the `/docs` folder and in-code comments.
