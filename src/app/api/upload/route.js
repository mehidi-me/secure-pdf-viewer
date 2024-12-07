import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";



function runMiddleware(req, fn) {
  return new Promise((resolve, reject) => {
    fn(req, {}, (result) =>
      result instanceof Error ? reject(result) : resolve(result)
    );
  });
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

    // 5️⃣ Generate the URL where the PDF can be viewed
    const url = `${req.nextUrl.origin}/viewer/${uniqueId}`;

    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "File upload failed." }, { status: 500 });
  }
}
