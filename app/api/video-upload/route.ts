import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary Upload Return Type
interface CloudinaryUploadResult {
    public_id: string;
    bytes: number;
    duration?: number;
    secure_url: string;
    [key: string]: any;
}

export async function POST(request: NextRequest) {
    try {
        // Authenticate User
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check Cloudinary credentials
        if (
            !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {
            return NextResponse.json(
                { error: "Cloudinary credentials missing" },
                { status: 500 }
            );
        }

        // Read formData
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const originalSize = formData.get("originalSize") as string;

        if (!file) {
            return NextResponse.json(
                { error: "File missing" },
                { status: 400 }
            );
        }

        // Convert file → buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary using upload_stream
        const result = await new Promise<CloudinaryUploadResult>(
            (resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: "video",
                        folder: "video-uploads",
                        transformation: [
                            { quality: "auto", fetch_format: "mp4" },
                        ],
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result as CloudinaryUploadResult); // FIX (typed)
                    }
                );

                uploadStream.end(buffer);
            }
        );

        // Save video in DB
        const video = await prisma.video.create({
            data: {
                title,
                description,
                publicId: result.public_id,
                originalSize: Number(originalSize),
                compressedSize: result.bytes,
                duration: result.duration || 0,
                ownerId: userId, // 👈 save owner
            },
        });

        console.log("PRISMA VIDEO CREATE:", video);
        return NextResponse.json(video);
    } catch (error) {
        console.error("Upload failed:", error);
        return NextResponse.json(
            { error: "Video upload failed" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
