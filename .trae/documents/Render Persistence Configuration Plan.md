# Configure Render Persistence for HJZDM

To ensure that your data (user accounts, posts, comments) and uploaded files persist across Render restarts, you need to configure a **Persistent Disk** and set environment variables.

## 1. Add a Persistent Disk on Render
1.  Go to your Service in the Render Dashboard.
2.  Click on the **"Disks"** tab.
3.  Click **"Add Disk"**.
    *   **Name**: `hjzdm_data` (or any name you prefer).
    *   **Mount Path**: `/data` (This is crucial. It must be `/data`).
    *   **Size**: `1 GB` (or larger if you expect many images).

## 2. Configure Environment Variables
Go to the **"Environment"** tab of your service and add the following variables:

| Key | Value | Description |
| :--- | :--- | :--- |
| `DB_PATH` | `/data/hjzdm` | Tells the app to store the H2 database file on the persistent disk. |
| `UPLOAD_PATH` | `/data/uploads/` | Tells the app to store uploaded images on the persistent disk. |

> **Note**: Do not change `SPRING_DATASOURCE_URL` directly if you use `DB_PATH`. The application is now configured to build the URL automatically using `DB_PATH`.

## 3. Verify Configuration
After redeploying with these settings:
1.  The H2 database file will be created at `/data/hjzdm.mv.db`.
2.  Uploaded images will be saved to `/data/uploads/`.
3.  Since `/data` is backed by a persistent disk, this data will survive restarts and deployments.

## Summary of Code Changes Made
*   **`application.yaml`**: Updated to use `${DB_PATH}` and `${UPLOAD_PATH}` with local fallbacks.
*   **`CommonController.java`**: Updated to save files to the configured `uploadPath`.
*   **`HandlerConfig.java`**: Updated to serve static resources from the configured `uploadPath`.

You are now ready to deploy to Render with persistence!