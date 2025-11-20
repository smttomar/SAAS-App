import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        // Get logged-in user
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();

        const video = await prisma.video.create({
            data: {
                title: body.title,
                description: body.description,
                publicId: body.publicId,
                originalSize: Number(body.originalSize),
                compressedSize: Number(body.compressedSize),
                duration: Number(body.duration),
                ownerId: userId, // ✅ REQUIRED!
            },
        });

        return NextResponse.json(video);
    } catch (err) {
        console.error("DB Save Error:", err);
        return NextResponse.json(
            { error: "Failed to save video" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
