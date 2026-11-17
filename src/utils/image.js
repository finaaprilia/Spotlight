// Memperkecil foto di browser sebelum diunggah: sisi terpanjang 1400 px, JPEG kualitas 82%.
export function compressImage(file, max = 1400, quality = 0.82) {
    return new Promise((resolve, reject) => {
        if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
            return reject(new Error("Format harus JPG, PNG, atau WebP"));
        }
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const r = Math.min(1, max / Math.max(img.width, img.height));
            const c = document.createElement("canvas");
            c.width = Math.round(img.width * r);
            c.height = Math.round(img.height * r);
            c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
            URL.revokeObjectURL(url);
            resolve(c.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("File gambar tidak dapat dibaca"));
        };
        img.src = url;
    });
}
