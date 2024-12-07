import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";

// Path to store uploaded files details in JSON
const uploadsJsonPath = path.join(process.cwd(), 'uploads.json');

// Function to read the uploads from the JSON file
const readUploadsFromFile = async () => {
  try {
    const data = await fs.readFile(uploadsJsonPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading uploads from JSON file:', error);
    return []; // If file doesn't exist, return an empty array
  }
};

// Function to save uploads to the JSON file
const saveUploadsToFile = async (uploads) => {
  try {
    await fs.writeFile(uploadsJsonPath, JSON.stringify(uploads, null, 2));
  } catch (error) {
    console.error('Error saving uploads to JSON file:', error);
  }
};

export async function DELETE(req) {
    try {
      const { url } = await req.json(); // Get file URL from the request body
      if (!url) {
        return NextResponse.json({ error: "No URL provided" }, { status: 400 });
      }
  
      // 1️⃣ Extract file name from the URL
      const fileName = url.split('/').pop()+'.pdf';
      const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
  
      // 2️⃣ Delete the file from the uploads folder
      await fs.unlink(filePath); // Deletes the file from the uploads folder
  
      // 3️⃣ Remove the file from the uploads.json file
      const uploads = await readUploadsFromFile();
      const updatedUploads = uploads.filter((file) => file.url !== url);
      await saveUploadsToFile(updatedUploads); // Save the updated uploads list
  
      return NextResponse.json({ message: "File deleted successfully" }, { status: 200 });
    } catch (error) {
      console.error('Error deleting file:', error);
      return NextResponse.json({ error: "Failed to delete the file", details: error.message }, { status: 500 });
    }
  }

export async function GET(req) {
  try {
    // Ensure the JSON file exists
    const uploads = await readUploadsFromFile();
    if (uploads.length > 0) {
      return NextResponse.json(uploads, { status: 200 });
    } else {
      return NextResponse.json({ message: 'No uploads found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error in GET request:', error);
    return NextResponse.json({ message: 'Error reading uploads data' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // 1️⃣ Handle form data using the Next.js `formData()` API
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // 2️⃣ Check if the file is a PDF
    const fileType = file.type;
    if (fileType !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid file type. Only PDFs allowed." },
        { status: 400 }
      );
    }
    
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const fileSize = file.size;
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB. Please upload a smaller file." },
        { status: 400 }
      );
    }

    // 4️⃣ Generate a unique name for the file
    const uniqueId = uuidv4();
    const fileName = `${uniqueId}.pdf`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const destination = path.join(uploadsDir, fileName);

    // 5️⃣ Ensure the uploads directory exists, create it if not
    await fs.mkdir(uploadsDir, { recursive: true });

    // 6️⃣ Read file as a buffer and save it to the /public/uploads folder
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(destination, buffer);
    const url = `/viewer/${uniqueId}`;

    // Get the current uploads from JSON
    const uploads = await readUploadsFromFile();

    // Add the new file's details to the uploads array
    const newFile = { name: file.name, url };
    uploads.push(newFile);

    // Save the updated uploads array back to the JSON file
    await saveUploadsToFile(uploads);

    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "File upload failed." }, { status: 500 });
  }
}
