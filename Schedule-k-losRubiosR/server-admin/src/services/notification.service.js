import Notification from "../models/notification.model.js";

class NotificationService {

    static async createBroadcast(title, message, coordinatorId) {
        const notification = await Notification.create({
            title,
            message,
            coordinatorId,
            isBroadcast: true
        });

        return notification;
    }

    static async getAllBroadcasts() {
        return await Notification.find({ isBroadcast: true })
            .sort({ createdAt: -1 });
    }

    static async getByCoordinator(coordinatorId) {
        return await Notification.find({ coordinatorId })
            .sort({ createdAt: -1 });
    }
}

export default NotificationService;