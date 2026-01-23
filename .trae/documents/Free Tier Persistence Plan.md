# Free Tier Persistence Plan (External DB + Image Hosting)

Since Render's free tier does not support persistent disks, we must store data and images in external free services.

## 1. Database Persistence (Accounts, Posts, Comments)
We will switch from the local H2 file database to an external **MySQL** database.
*   **Recommendation**: **TiDB Cloud** (Serverless) or **Aiven** offers a generous free tier for MySQL that is perfect for this project.
*   **Action**: I have updated `application.yaml` to accept database connection details via environment variables.

## 2. Image Persistence (Uploads)
We will switch from local file storage to **Cloudinary** (a cloud image hosting service with a generous free tier).
*   **Why**: Storing images on the server is impossible without a disk. Cloudinary provides an API to upload and serve images.
*   **Action**:
    1.  Add Cloudinary dependency to `pom.xml`.
    2.  Create a `CloudStorageService` to handle uploads.
    3.  Update `CommonController` to use this service instead of saving to disk.

## Implementation Steps

### Step 1: Add Cloudinary Dependency
Update `pom.xml` to include the Cloudinary Java SDK.

### Step 2: Implement Cloud Storage Logic
Create a service that checks if a Cloudinary URL is configured.
*   If configured: Upload to Cloudinary.
*   If not: Fallback to local storage (for local development).

### Step 3: User Configuration Guide
I will provide you with the exact environment variables you need to set in Render:
*   `SPRING_DATASOURCE_URL` (from TiDB/Aiven)
*   `SPRING_DATASOURCE_USERNAME`
*   `SPRING_DATASOURCE_PASSWORD`
*   `CLOUDINARY_URL` (from Cloudinary)

This solution ensures **100% persistence** on the free tier. Your accounts and posts will live in the external DB, and your images will live in Cloudinary. Restarting Render will have no effect on your data.