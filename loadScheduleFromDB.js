// ===========================================================
// 📦 LOAD SCHEDULE HELPER (for /api/schedule/load/day route)
// ===========================================================
import { Schedule } from '../models/schedule.model.js';

export async function loadScheduleFromDB(projectId, dayId) {
    try {
        // ⚙️ Schedule find karo
        const schedule = await Schedule.findOne({ projectId });

        if (!schedule) {
            return { error: true, message: `⚠️ No schedule found for projectId: ${projectId}` };
        }

        // 🔍 Day data extract karo
        const day = schedule.scheduledDays.find((d) => d.id === dayId);
        if (!day) {
            return { error: true, message: `⚠️ Day ID "${dayId}" not found in schedule.` };
        }

        // 🧩 Day ke scenes nikal lo (containerData se)
        const sceneIds = schedule.containerData?.[dayId] || [];

        const scenes = schedule.allScenes.filter(scene =>
            sceneIds.includes(scene.id)
        );

        // ✅ Return formatted data
        return {
            error: false,
            data: {
                projectId,
                dayId,
                dayName: day.name,
                date: day.date,
                scenes
            }
        };
    } catch (error) {
        console.error('💥 Error in loadScheduleFromDB:', error);
        return { error: true, message: 'Internal error while loading schedule.' };
    }
}
