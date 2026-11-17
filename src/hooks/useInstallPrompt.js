import { useEffect, useState } from "react";

let deferred = null;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

if (typeof window !== "undefined") {
    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferred = e;
        notify();
    });
    window.addEventListener("appinstalled", () => {
        deferred = null;
        notify();
    });
}

const isStandalone = () =>
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

export function useInstallPrompt() {
    const [, force] = useState(0);
    useEffect(() => {
        const fn = () => force((n) => n + 1);
        listeners.add(fn);
        return () => listeners.delete(fn);
    }, []);

    const install = async () => {
        if (!deferred) return "manual";
        deferred.prompt();
        const { outcome } = await deferred.userChoice;
        deferred = null;
        notify();
        return outcome;
    };

    return { installed: isStandalone(), canPrompt: Boolean(deferred), ios: isIOS(), install };
}