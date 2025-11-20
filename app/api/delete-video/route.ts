import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    try {
        const { publicId } = await req.json();

        if (!publicId) {
            return NextResponse.json(
                { error: "Missing publicId" },
                { status: 400 }
            );
        }

        // Delete from Cloudinary
        const cloudRes = await cloudinary.uploader.destroy(publicId, {
            resource_type: "video",
        });

        if (cloudRes.result !== "ok") {
            return NextResponse.json(
                { error: "Failed to delete video from Cloudinary" },
                { status: 500 }
            );
        }

        // Delete from Prisma database
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
