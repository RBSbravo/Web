import * as realAPI from './api';

// Export all APIs from the real API (database-based)
export const authAPI = realAPI.authAPI;
export const departmentAPI = realAPI.departmentAPI;
export const userAPI = realAPI.userAPI;
export const taskAPI = realAPI.taskAPI;
export const ticketAPI = realAPI.ticketAPI;
export const analyticsAPI = realAPI.analyticsAPI;
export const reportsAPI = realAPI.reportsAPI;
export const notificationAPI = realAPI.notificationAPI;
export const fileAPI = realAPI.fileAPI;
export const commentAPI = realAPI.commentAPI;
export const connectWebSocket = realAPI.connectWebSocket; 