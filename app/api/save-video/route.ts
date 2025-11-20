import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const video = await prisma.video.create({
            data: {
                title: body.title,
                description: body.description,
                publicId: body.publicId,
                originalSize: Number(body.originalSize),
                compressedSize: Number(body.compressedSize),
                duration: Number(body.duration),
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
