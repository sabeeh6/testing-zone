import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
dotenv.config();

class CloudinaryManager {
    constructor() {
        this.accounts = this.loadAccounts();
        this.activeAccountIndex = 0;
        this.cachedUsage = new Map(); // Store usage for each account to avoid frequent API calls
        this.lastChecked = new Map();
        this.THRESHOLD = 95; // 95% threshold for rotation
        this.CACHE_TTL = 3600000; // 1 hour cache TTL for usage stats
    }

    loadAccounts() {
        const accounts = [];
        let i = 1;

        while (process.env[`Cloudinary_${i}_CLOUD_NAME`]) {
            accounts.push({
                name: process.env[`Cloudinary_${i}_NAME`] || `Account ${i}`,
                cloud_name: process.env[`Cloudinary_${i}_CLOUD_NAME`],
                api_key: process.env[`Cloudinary_${i}_API_KEY`],
                api_secret: process.env[`Cloudinary_${i}_API_SECRET`]
            });
            i++;
        }

        if (accounts.length === 0) {
            // Ultimate fallback to the legacy single keys if they exist, or an empty array
            const legacyAccount = {
                name: 'Legacy Primary',
                cloud_name: process.env.Cloudinary_Key_Name_456,
                api_key: process.env.Cloudinary_API_Key_Name_456,
                api_secret: process.env.Cloudinary_Secret_Key_Name_456
            };
            if (legacyAccount.cloud_name) return [legacyAccount];
            console.warn("No Cloudinary accounts found in environment variables!");
        }

        return accounts;
    }

    async getActiveAccountInstance() {
        for (let i = 0; i < this.accounts.length; i++) {
            const account = this.accounts[i];
            const usage = await this.getAccountUsage(i);

            if (!usage || usage.used_percent < this.THRESHOLD) {
                this.activeAccountIndex = i;
                return this.configureInstance(account);
            }
        }

        // If all accounts are full, return the last one (or throw error)
        console.warn("ALL Cloudinary accounts are over the threshold!");
        return this.configureInstance(this.accounts[this.accounts.length - 1]);
    }

    configureInstance(account) {
        cloudinary.config({
            cloud_name: account.cloud_name,
            api_key: account.api_key,
            api_secret: account.api_secret
        });
        return cloudinary;
    }

    async getAccountUsage(index) {
        const now = Date.now();
        const account = this.accounts[index];

        // Return cached usage if valid
        if (this.cachedUsage.has(index) && (now - this.lastChecked.get(index)) < this.CACHE_TTL) {
            return this.cachedUsage.get(index);
        }

        try {
            const instance = this.configureInstance(account);
            const usageResults = await instance.api.usage();
            const credits = usageResults.credits || { used_percent: 0 };

            this.cachedUsage.set(index, credits);
            this.lastChecked.set(index, now);
            return credits;
        } catch (error) {
            console.error(`Error fetching usage for account ${account.name || index}:`, error);
            return null; // Assume available if error (to avoid breaking uploads)
        }
    }

    async getAllUsage() {
        const usages = [];
        for (let i = 0; i < this.accounts.length; i++) {
            try {
                const account = this.accounts[i];
                const instance = this.configureInstance(account);

                // Fetch full usage results
                const usageResults = await instance.api.usage();
                const credits = usageResults.credits || { used_percent: 0 };

                // Update cache while we're at it
                this.cachedUsage.set(i, credits);
                this.lastChecked.set(i, Date.now());

                usages.push({
                    accountName: account.name || `Account ${i + 1}`,
                    isActive: i === this.activeAccountIndex,
                    usedStorage: (usageResults.storage.usage / (1024 * 1024)).toFixed(2) + " MB",
                    credits: {
                        used: credits?.usage || 0,
                        limit: credits?.limit || 0,
                        usedPercentage: (credits?.used_percent || 0).toFixed(2) + "%"
                    },
                    lastUpdated: usageResults.last_updated
                });
            } catch (error) {
                console.warn(`[Cloudinary] ${this.accounts[i].name} usage check skipped:`, error.message || "Invalid credentials provided in .env");
                usages.push({
                    accountName: this.accounts[i].name || `Account ${i + 1}`,
                    status: "Unavailable (Check Credentials)",
                    isActive: i === this.activeAccountIndex
                });
            }
        }
        return usages;
    }
}

export const cloudinaryManager = new CloudinaryManager();
