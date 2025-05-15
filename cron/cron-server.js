const cron = require('node-cron');
const axios = require('axios');
const Request = require('./lib/request');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const socket = require('./socket');


dotenv.config();

// Configuration
const deviceIp = process.env.DEVICE_IP || "192.168.100.44";
const targetServerUrl = process.env.TARGET_SERVER_URL || "http://localhost:3000/api/records/upload";
const cronSchedule = process.env.CRON_SCHEDULE || "*/5 * * * *"; // Every 5 minutes by default
let request = null;

// Failed records storage
const FAILED_RECORDS_FILE = path.join(__dirname, 'failed_records.json');

// Function to load failed records
function loadFailedRecords() {
    try {
        if (fs.existsSync(FAILED_RECORDS_FILE)) {
            const data = fs.readFileSync(FAILED_RECORDS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading failed records:', error);
    }
    return [];
}

// Function to save failed records
function saveFailedRecords(records) {
    try {
        fs.writeFileSync(FAILED_RECORDS_FILE, JSON.stringify(records, null, 2));
    } catch (error) {
        console.error('Error saving failed records:', error);
    }
}

// Function to fetch new records
async function fetchNewRecords() {
    const records = [];
    
    const loadRecords = async (op) => {
        try {
            const result = await request.execute("downloadAttendanceRecords", 1, [op, 25]);
            if (result.length === 0) {
                return records;
            }
            records.push(...result);
            return await loadRecords(0);
        } catch (error) {
            if (error.message.includes('Invalid operation')) {
                return records; // No more records to fetch
            }
            throw error;
        }
    };

    return await loadRecords(2); // 2 for new records only
}

// Function to push records to target server
async function pushRecordsToServer(records) {
    try {
        const response = await axios.post(targetServerUrl, { records });
        console.log(`Successfully pushed ${records.length} records to server`);
        return response.data;
    } catch (error) {
        console.error(`Failed to push records to server: ${error.message}`);
        // Save failed records for retry
        const failedRecords = loadFailedRecords();
        failedRecords.push(...records);
        saveFailedRecords(failedRecords);
        throw error;
    }
}

// Function to clear the new records flag
async function clearNewRecordsFlag() {
    try {
        await request.execute("eraseNewRecordsFlag");
        console.log('Successfully cleared new records flag');
    } catch (error) {
        throw new Error(`Failed to clear new records flag: ${error.message}`);
    }
}

// Main cron job function
async function cronJob() {
    try {
        console.log('Starting cron job at:', new Date().toISOString());
        
        // Create new request instance for each job
        request = new Request(deviceIp);
        
        // Try to send any previously failed records first
        const failedRecords = loadFailedRecords();
        if (failedRecords.length > 0) {
            console.log(`Attempting to send ${failedRecords.length} previously failed records`);
            try {
                await pushRecordsToServer(failedRecords);
                // Clear failed records file after successful push
                saveFailedRecords([]);
            } catch (error) {
                console.error('Failed to send previously failed records:', error.message);
                // Failed records will be automatically saved by pushRecordsToServer
            }
        }
        
        // 1. Fetch new records
        const records = await fetchNewRecords();
        console.log(`Found ${records.length} new records`);
        
        if (records.length > 0) {
            // 2. Push records to target server
            await pushRecordsToServer(records);
            
            // 3. Clear the new records flag only after successful push
            await clearNewRecordsFlag();
        }
        
        // Close the connection
        request.close();
        console.log('Cron job completed successfully');
    } catch (error) {
        console.error('Cron job failed:', error.message);
        if (request) {
            request.close();
        }
    }
}

// Schedule the cron job
cron.schedule(cronSchedule, cronJob, {
    scheduled: true,
    timezone: process.env.TIMEZONE || "UTC"
});

console.log(`Cron server started. Schedule: ${cronSchedule}`);
console.log(`Target server: ${targetServerUrl}`);
console.log(`Device IP: ${deviceIp}`);
