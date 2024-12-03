'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import assets from '../../../public/assets/asset';

export default function Background() {
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    useEffect(() => {
        // Create video element properly
        const video = document.createElement('video');
        video.src = assets.vessel_video;
        
        // Add event listener for loaded data
        video.addEventListener('loadeddata', () => {
            setIsVideoLoaded(true);
        });

        // Clean up
        return () => {
            video.removeEventListener('loadeddata', () => {
                setIsVideoLoaded(true);
            });
        };
    }, []);

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            <AnimatePresence>
                {!isVideoLoaded && (
                    <motion.img
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        src={assets.vessel}
                        alt="Ship Background"
                        className="object-cover w-full h-full"
                    />
                )}
            </AnimatePresence>
            
            {isVideoLoaded && (
                <motion.video
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="object-cover w-full h-full"
                    style={{ playbackRate: 0.5 }}
                    onLoadedMetadata={(e) => {
                        e.target.playbackRate = 0.5;
                    }}
                >
                    <source src={assets.vessel_video} type="video/mp4" />
                </motion.video>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />
        </div>
    );
} 