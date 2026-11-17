import { useState } from "react";
import { Download } from "lucide-react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

export default function InstallButton({ className = "btn primary sm" }) {
    const { installed, ios, install } = useInstallPrompt();
    const [help, setHelp] = useState(false);

    if (installed) return null;

    const click = async () => {
        const result = await install();
        if (result === "manual") setHelp(true);
    };

    return (
        <>
            <button className={className} onClick={click}>
                <Download size={16} /> Install
            </button>
            {help && (
                <div className="scrim center" onClick={() => setHelp(false)}>
                    <div className="dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                        <h3>Pasang Spotlight di perangkat</h3>
                        {ios ? (
                            <ol className="steps">
                                <li>Buka halaman ini di Safari.</li>
                                <li>Ketuk tombol Bagikan di bilah bawah.</li>
                                <li>Pilih Tambah ke Layar Utama, lalu ketuk Tambah.</li>
                            </ol>
                        ) : (
                            <ol className="steps">
                                <li>Buka menu browser (titik tiga di kanan atas).</li>
                                <li>Pilih Install aplikasi atau Tambahkan ke layar utama.</li>
                                <li>Jika menu tidak ada, buka lewat Chrome atau Edge dan muat ulang halaman.</li>
                            </ol>
                        )}
                        <div className="dialog-actions">
                            <button className="btn primary" onClick={() => setHelp(false)}>Mengerti</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}