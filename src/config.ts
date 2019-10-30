require('dotenv').config();
const config = {
    projectId: process.env.FIREBASE_PROJECT_ID || "",
}
export default config;