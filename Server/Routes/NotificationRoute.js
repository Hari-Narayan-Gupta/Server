import express from 'express';
import { createNotification, getActivity, getData, getNotificationsForUser, getReact, getUnreadNotificationCount, markNotificationAsRead } from '../Controllers/NotificationController.js';

const router = express.Router();

// Route for creating a notification
router.post('/notifications/:id', createNotification);
router.get('/notify?userId', getNotificationsForUser);
router.get('/reactions?:userId', getReact)
router.get('/:notificationId',getData)
router.get('/unread/count', getUnreadNotificationCount);
router.put('/notifications/read?:userId', markNotificationAsRead)
router.get("/activity/:userId", getActivity);
export default router;