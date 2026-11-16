import { useEffect } from "react";

export default function Splash({ onDone }) {
    useEffect(() => {
        const t = setTimeout(onDone, 2200);
        return () => clearTimeout(t);
    }, [onDone]);

    return (
        <div className="splash" onClick={onDone}>
            <div className="beam" />
            <div className="splash-ring" />
            <h1>Spotlight</h1>
            <p>Sorot yang penting, lewati yang bising.</p>
        </div>
    );
}
