
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a dummy image file
const testImagePath = path.join(__dirname, 'test-upload.jpg');
fs.writeFileSync(testImagePath, 'fake image content');

// Function to upload
async function testUpload() {
    const formData = new FormData();
    const file = new File([fs.readFileSync(testImagePath)], 'test-upload.jpg', { type: 'image/jpeg' });
    formData.append('image', file);

    try {
        const response = await fetch('http://localhost:5001/api/uploads', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Cleanup
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
        }
    }
}

testUpload();
