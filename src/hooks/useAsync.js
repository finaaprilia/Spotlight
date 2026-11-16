import { useCallback, useEffect, useRef, useState } from "react";

// Menjalankan fungsi async dan menyimpan status loading, data, error.
export function useAsync(fn, deps) {
    const [state, setState] = useState({ data: null, loading: true, error: null });
    const ticket = useRef(0);

    const run = useCallback(() => {
        const id = ++ticket.current;
        setState((s) => ({ ...s, loading: true, error: null }));
        fn()
            .then((data) => id === ticket.current && setState({ data, loading: false, error: null }))
            .catch((e) => id === ticket.current && setState({ data: null, loading: false, error: e.message }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
        run();
    }, [run]);

    return { ...state, reload: run };
}
