import { useEffect, useRef, useState } from "react";

// Antrean global untuk staggered lazy load (muncul berurutan satu per satu)
let loadQueue = [];
let isProcessingQueue = false;

function processQueue() {
    if (isProcessingQueue || loadQueue.length === 0) return;
    isProcessingQueue = true;

    const nextItem = loadQueue.shift();
    if (nextItem) {
        nextItem();
    }

    // Jeda 120ms agar gambar berikutnya muncul bergantian secara berurutan
    setTimeout(() => {
        isProcessingQueue = false;
        processQueue();
    }, 120);
}

/**
 * Komponen LazyImage:
 * - Menggunakan IntersectionObserver saat scroll
 * - Memuat gambar satu per satu bergantian (staggered queue)
 * - Efek fade-in transisi halus saat selesai dimuat
 * - Log informasi ke Console (F12) untuk kemudahan verifikasi & pengujian
 */
export default function LazyImage({
    src,
    alt = "Gambar berita",
    className = "",
    style = {},
    placeholderColor = "var(--surface-2)",
}) {
    const imgRef = useRef(null);
    const [shouldLoad, setShouldLoad] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (!src) return;

        // Jika browser tidak mendukung IntersectionObserver, langsung load
        if (!("IntersectionObserver" in window)) {
            setShouldLoad(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting) {
                    // Masukkan ke antrian agar muncul urut bergantian satu per satu
                    loadQueue.push(() => {
                        setShouldLoad(true);
                        console.log(
                            `%c[LazyLoad] 🖼️ Gambar terdeteksi di viewport & mulai dimuat: "${alt}"\n→ URL: ${src.slice(0, 60)}...`,
                            "color: #06b6d4; font-weight: bold; background: rgba(6, 182, 212, 0.1); padding: 2px 6px; border-radius: 4px;"
                        );
                    });
                    processQueue();
                    observer.disconnect();
                }
            },
            {
                rootMargin: "0px 0px 80px 0px", // Mulai diobservasi 80px sebelum benar-benar masuk layar
                threshold: 0.05,
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [src, alt]);

    const handleLoad = () => {
        setIsLoaded(true);
        console.log(
            `%c[LazyLoad] ✅ Gambar selesai di-render (fade-in): "${alt}"`,
            "color: #10b981; font-weight: bold;"
        );
    };

    const handleError = () => {
        setHasError(true);
        console.warn(`[LazyLoad] ⚠️ Gagal memuat gambar: ${src}`);
    };

    if (hasError) {
        return (
            <div
                className={`lazy-img-wrap lazy-error ${className}`}
                style={{ ...style, background: placeholderColor }}
                aria-label={alt}
            />
        );
    }

    return (
        <div
            ref={imgRef}
            className={`lazy-img-wrap ${className} ${isLoaded ? "loaded" : "loading"}`}
            style={{ ...style, position: "relative", overflow: "hidden" }}
        >
            {/* Shimmer Placeholder saat gambar belum muncul */}
            {!isLoaded && <div className="lazy-shimmer" aria-hidden="true" />}

            {/* Gambar asli hanya diberi src saat masuk viewport */}
            {shouldLoad && (
                <img
                    src={src}
                    alt={alt}
                    className={`lazy-img-elem ${isLoaded ? "is-visible" : "is-hidden"}`}
                    onLoad={handleLoad}
                    onError={handleError}
                />
            )}
        </div>
    );
}
