import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio");

    if (!audioFile) {
      return Response.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Save uploaded file temporarily
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const inputPath = path.join(tempDir, `input_${Date.now()}.wav`);
    const outputPath = path.join(tempDir, `output_${Date.now()}.json`);

    fs.writeFileSync(inputPath, buffer);

    // Run Rhubarb lip-sync
    const rhubarbCommand = `rhubarb -f json -o "${outputPath}" "${inputPath}"`;
    await execAsync(rhubarbCommand);

    // Read the generated lip-sync data
    const lipSyncData = JSON.parse(fs.readFileSync(outputPath, "utf8"));

    // Clean up temporary files
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    return Response.json(lipSyncData);
  } catch (error) {
    console.error("Rhubarb processing error:", error);
    return Response.json(
      { error: "Lip-sync processing failed" },
      { status: 500 }
    );
  }
}
