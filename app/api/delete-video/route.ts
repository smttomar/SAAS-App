import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { publicId } = await req.json();

        if (!publicId) {
            return NextResponse.json(
                { error: "Missing publicId" },
                { status: 400 }
            );
        }

        // Find video in database
        const video = await prisma.video.findUnique({
            where: { publicId },
        });

        if (!video) {
            return NextResponse.json(
                { error: "Video not found" },
                { status: 404 }
            );
        }

        // 🔥 CHECK OWNER
        if (video.ownerId !== userId) {
            return NextResponse.json(
                {
                    error: "Forbidden: You are not allowed to delete this video",
                },
                { status: 403 }
            );
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(publicId, {
            resource_type: "video",
        });

        // Delete from database
        await prisma.video.delete({
            where: { publicId },
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Delete video failed:", err);
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
