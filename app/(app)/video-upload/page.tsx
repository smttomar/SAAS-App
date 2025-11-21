"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function VideoUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const router = useRouter();

    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 500MB

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.success("Please select a video file.");
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            toast.error("Video file exceeds 100MB limit.");
            return;
        }

        setIsUploading(true);

        try {
            // 1️⃣ Upload directly to Cloudinary
            const cloudForm = new FormData();
            cloudForm.append("file", file);
            cloudForm.append("upload_preset", "video_unsigned"); // your upload preset
            cloudForm.append("folder", "video-uploads");

            const cloudRes = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
                {
                    method: "POST",
                    body: cloudForm,
                }
            );

            const cloudData = await cloudRes.json();

            if (!cloudData.public_id) {
                console.error(cloudData);
                throw new Error("Cloudinary upload failed.");
            }

            // 2️⃣ Save video metadata to DB
            await fetch("/api/save-video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    publicId: cloudData.public_id,
                    originalSize: file.size,
                    compressedSize: cloudData.bytes,
                    duration: cloudData.duration,
                }),
            });

            toast.success("Upload successful!");
            router.push("/");
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Video upload failed.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Upload Video</h1>

            <form onSubmit={handleUpload} className="space-y-4">
                <div>
                    <label className="label">
                        <span className="label-text">Title</span>
                    </label>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="label">
                        <span className="label-text">Description</span>
                    </label>
                    <textarea
                        className="textarea textarea-bordered w-full"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div>
                    <label className="label">
                        <span className="label-text">
                            Video File{" "}
                            <p className="text-red-400">
                                {" "}
                                Maximum upload size is 100 MB.{" "}
                            </p>
                        </span>
                    </label>
                    <input
                        type="file"
                        accept="video/*"
                        className="file-input file-input-bordered w-full"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={isUploading}
                >
                    {isUploading ? "Uploading..." : "Upload Video"}
                </button>
            </form>
        </div>
    );
}
