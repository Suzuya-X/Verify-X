import fs from 'fs';
import path from 'path';
import { extractPassportFromImage } from './gemini';

// NOTE: Before running this test, you must place a synthetic passport image (e.g. synthetic-passport.jpg)
// inside the verifyx folder, and add your API key to .env.local.
//
// You can run this test by executing:
// npx tsx src/lib/ai/test.ts

async function runGeminiTest() {
  console.log('=== Gemini API Extraction Test ===\n');

  // Note: Run this script with: npx tsx --env-file=.env.local src/lib/ai/test.ts

  if (!process.env.GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY is not set in .env.local.');
    console.error('Please add your API key before running the test.');
    process.exit(1);
  }

  // Define the path to a synthetic test image
  const testImagePath = path.join(process.cwd(), 'synthetic-passport.jpg');

  if (!fs.existsSync(testImagePath)) {
    console.error(`ERROR: No test image found at ${testImagePath}`);
    console.error('To test the extraction, please place a synthetic dummy passport image');
    console.error('named "synthetic-passport.jpg" in the root of the verifyx folder.');
    process.exit(1);
  }

  try {
    console.log('Reading image...');
    const imageBuffer = fs.readFileSync(testImagePath);
    
    // Determine mime type based on extension (simple assumption for the test script)
    const mimeType = testImagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

    console.log('Sending image to Gemini for extraction...');
    const result = await extractPassportFromImage(imageBuffer, mimeType);

    console.log('\n--- EXTRACTION SUCCESSFUL ---\n');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n-----------------------------\n');

  } catch (error: any) {
    console.error('\n--- EXTRACTION FAILED ---\n');
    console.error(error.message);
  }
}

runGeminiTest();
