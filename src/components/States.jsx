import { AlertCircle, Inbox, Loader2 } from "lucide-react";

export const Loading = ({ text = "Memuat berita" }) => (
    <div className="state">
        <Loader2 className="spin" size={24} />
        <p>{text}</p>
    </div>
);

export const ErrorBox = ({ message, onRetry }) => (
    <div className="state err">
        <AlertCircle size={24} />
        <p>{message}</p>
        {onRetry && <button className="btn" onClick={onRetry}>Coba lagi</button>}
    </div>
);

export const Empty = ({ title, hint, children }) => (
    <div className="state">
        <Inbox size={24} />
        <h3>{title}</h3>
        {hint && <p>{hint}</p>}
        {children}
    </div>
);
