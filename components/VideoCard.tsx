import React, { useState, useEffect, useCallback } from "react";
import { getCldImageUrl, getCldVideoUrl } from "next-cloudinary";
import { Download, Clock, FileDown, FileUp } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { filesize } from "filesize";
import { Video } from "@prisma/client";
import VideoPlayerModal from "./VideoPlayerModal";
import { toast } from "react-hot-toast";

dayjs.extend(relativeTime);

interface VideoCardProps {
    video: Video;
    onDownload: (url: string, title: string) => void;
    currentUserId: string | null;
}

const VideoCard: React.FC<VideoCardProps> = ({
    video,
    onDownload,
    currentUserId,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [previewError, setPreviewError] = useState(false);
    const [showPlayer, setShowPlayer] = useState(false);

    const getThumbnailUrl = useCallback((publicId: string) => {
        return getCldImageUrl({
            src: publicId,
            width: 300,
            height: 200,
            crop: "fill",
            gravity: "auto",
            format: "jpg",
            quality: "auto",
            assetType: "video",
        });
    }, []);

    const getFullVideoUrl = useCallback((publicId: string) => {
        return getCldVideoUrl({
            src: publicId,
            width: 1920,
            height: 1080,
            format: "mp4",
        });
    }, []);

    const getPreviewVideoUrl = useCallback((publicId: string) => {
        return getCldVideoUrl({
            src: publicId,
            width: 400,
            height: 225,
            format: "mp4",
            rawTransformations: [
                "e_preview:duration_10:max_seg_9:min_seg_dur_1",
            ],
        });
    }, []);

    const formatSize = useCallback((size: number) => filesize(size), []);
    const formatDuration = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }, []);

    const compressionPercentage = Math.round(
        (1 - Number(video.compressedSize) / Number(video.originalSize)) * 100
    );

    const handleDownload = async (url: string, title: string) => {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error("Network response not ok");

            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = `${title.replace(/\s+/g, "_")}.mp4`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(blobUrl);
            toast.success("Download started!");
        } catch (err) {
            console.error("Download failed:", err);
            toast.error("Download failed. See console for details.");
        }
    };

    useEffect(() => {
        setPreviewError(false);
    }, [isHovered]);

    const isOwner = currentUserId === video.ownerId;

    return (
        <>
            <div
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onMouseEnter={() => !showPlayer && setIsHovered(true)}
                onMouseLeave={() => !showPlayer && setIsHovered(false)}
                onClick={() => setShowPlayer(true)}
            >
                <figure className="aspect-video relative">
                    {!showPlayer && (
                        <>
                            {isHovered ? (
                                previewError ? (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                        <p className="text-red-500">
                                            Preview not available
                                        </p>
                                    </div>
                                ) : (
                                    <video
                                        src={getPreviewVideoUrl(video.publicId)}
                                        autoPlay
                                        muted
                                        loop
                                        className="w-full h-full object-cover"
                                        onError={() => setPreviewError(true)}
                                    />
                                )
                            ) : (
                                <img
                                    src={getThumbnailUrl(video.publicId)}
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </>
                    )}

                    <div className="absolute bottom-2 right-2 bg-base-100 bg-opacity-70 px-2 py-1 rounded-lg text-sm flex items-center">
                        <Clock size={16} className="mr-1" />
                        {formatDuration(video.duration)}
                    </div>
                </figure>

                <div className="card-body p-4">
                    <h2 className="card-title text-lg font-bold">
                        {video.title}
                    </h2>
                    <p className="text-sm opacity-70 mb-4">
                        {video.description}
                    </p>
                    <p className="text-sm opacity-70 mb-4">
                        Uploaded {dayjs(video.createdAt).fromNow()}
                    </p>

                    <div className="flex justify-between items-center mt-4">
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(
                                    getFullVideoUrl(video.publicId),
                                    video.title
                                );
                            }}
                        >
                            <Download size={16} />
                        </button>

                        {/* DELETE BUTTON ONLY IF OWNER */}
                        {isOwner && (
                            <button
                                className="btn btn-error btn-sm"
                                onClick={(e) => {
                                    e.stopPropagation();

                                    toast(
                                        (t) => (
                                            <div className="flex flex-col gap-2">
                                                <span>
                                                    Are you sure you want to
                                                    delete this video?
                                                </span>

                                                <div className="flex gap-2">
                                                    {/* Confirm Button */}
                                                    <button
                                                        className="btn btn-error btn-xs"
                                                        onClick={async () => {
                                                            toast.dismiss(t.id);

                                                            const res =
                                                                await fetch(
                                                                    "/api/delete-video",
                                                                    {
                                                                        method: "POST",
                                                                        headers:
                                                                            {
                                                                                "Content-Type":
                                                                                    "application/json",
                                                                            },
                                                                        body: JSON.stringify(
                                                                            {
                                                                                publicId:
                                                                                    video.publicId,
                                                                            }
                                                                        ),
                                                                    }
                                                                );

                                                            if (res.ok) {
                                                                toast.success(
                                                                    "Video deleted successfully."
                                                                );
                                                                setTimeout(
                                                                    () => {
                                                                        window.location.reload();
                                                                    },
                                                                    800
                                                                );
                                                            } else {
                                                                toast.error(
                                                                    "Delete failed."
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        Yes, Delete
                                                    </button>

                                                    {/* Cancel Button */}
                                                    <button
                                                        className="btn btn-neutral btn-xs"
                                                        onClick={() =>
                                                            toast.dismiss(t.id)
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ),
                                        { duration: 5000 }
                                    );
                                }}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showPlayer && (
                <VideoPlayerModal
                    url={getFullVideoUrl(video.publicId)}
                    onClose={() => setShowPlayer(false)}
                />
            )}
        </>
    );
};

export default VideoCard;
