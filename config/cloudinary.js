import { cloudinaryManager } from './cloudinaryManager.js';

// Re-export the manager's active instance getter
export const getCloudInstance = async () => {
    return await cloudinaryManager.getActiveAccountInstance();
};

export const Cloud = await getCloudInstance(); // Keep for backward compatibility or initial setup
