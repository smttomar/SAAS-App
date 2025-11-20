"use client";

import React from "react";

interface VideoPlayerModalProps {
    url: string;
    onClose: () => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
    url,
    onClose,
}) => {
    if (!url) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="relative">
                <button
                    onClick={onClose}
                    className="absolute -top-10 right-0 text-white text-2xl"
                >
                    ✖
                </button>

                <video
                    src={url}
                    controls
                    autoPlay
                    className="max-w-[90vw] max-h-[80vh] rounded"
                />
            </div>
        </div>
    );
};

export default VideoPlayerModal;
