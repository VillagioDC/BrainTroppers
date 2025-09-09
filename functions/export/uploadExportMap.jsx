// FUNCTION TO UPLOAD EXPORT MAP
// Dependencies
const { createClient } = require('@supabase/supabase-js'); // npm install
require("dotenv").config(); // npm install dotenv
const fs = require('fs').promises;
const path = require('path');

// Functions
const log = require('../utils/log.jsx');

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

/* PARAMETERS
  input {string} - sourceFilepath 
  RETURN {string|null} - downloadUrl || null
*/

async function uploadExportMap(projectId, sourceFilepath) {

    // Check map
    if (!sourceFilepath || typeof sourceFilepath !== 'string') {
        log("ERROR", "invalid input @uploadExportMap.");
        return null;
    }

    // Initialize emptu url
    let downloadUrl = null;

    try {
        // Read file from filesystem
        const fileBuffer = await fs.readFile(sourceFilepath);
        const fileName = path.basename(sourceFilepath);

        // Supabase bucket
        const bucket = process.env.SUPABASE_BUCKET;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket) // or bucket name 'name'
            .upload(`${projectId}/${fileName}`, fileBuffer, {
                contentType: 'application/octet-stream',
                upsert: true,
            });
        if (error) {
            log("ERROR", "Supabase upload error @uploadExportMap", error.message);

        } else {
            // Generate public download URL
            const { data: publicUrlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(`${projectId}/${fileName}`);
            // Set downloadUrl
            downloadUrl = publicUrlData.publicUrl;
            if (!downloadUrl) {
                log("ERROR", "Supabase url error @uploadExportMap", error.message);
            }
        }

    // Catch error
    } catch (error) {
        log("ERROR", "Failed to upload export map @uploadExportMap: " + error.message);
    }

    // Delete temp file on local directory (temp folder)
    try {
        await fs.unlink(sourceFilepath);
    // Catch error
    } catch (error) {
        log("ERROR", "Failed to delete temp file @uploadExportMap: " + error.message);
    }

    // Return
    return downloadUrl; // url || null
}

module.exports = uploadExportMap;