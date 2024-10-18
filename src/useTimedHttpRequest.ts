import { useState, useEffect, useCallback } from "react";

// Configuration constants
const FINISH_SECONDS = 180;
const RETRY_TIME = 5000; // 10 seconds in milliseconds
const DELAY_START_TIME = 0; // 10 seconds in milliseconds

type HttpResponse = {
    status: number;
    data: {
        login?: boolean;
    };
};

type HttpRequestFunction = () => Promise<HttpResponse>;

const useTimedHttpRequest = (httpRequestFn: HttpRequestFunction) => {
    const [isFinished, setIsFinished] = useState(false);
    const [result, setResult] = useState<HttpResponse | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(FINISH_SECONDS);
    const [isDelayedStart, setIsDelayedStart] = useState(true);

    const executeRequest = useCallback(async () => {
        if (isFinished) return;

        try {
            const response = await httpRequestFn();
            setResult(response);

            if (response.status === 200 && response.data.login === true) {
                setIsFinished(true);
            } else if (response.status !== 200) {
                setIsFinished(true);
            }
        } catch (error) {
            console.error("Error executing HTTP request:", error);
            setIsFinished(true);
        }
    }, [httpRequestFn, isFinished]);

    useEffect(() => {
        let timeoutId: any;
        let intervalId: any;
        let timerIntervalId: any;

        const startTimer = () => {
            timerIntervalId = setInterval(() => {
                setTimeRemaining((prevTime) => {
                    if (isFinished || prevTime <= 1) {
                        clearInterval(timerIntervalId);
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);

            timeoutId = setTimeout(() => {
                setIsFinished(true);
            }, FINISH_SECONDS * 1000);
        };

        const startRequests = () => {
            setIsDelayedStart(false);
            executeRequest();

            intervalId = setInterval(() => {
                executeRequest();
            }, RETRY_TIME);
        };

        startTimer();

        const initialDelayId = setTimeout(startRequests, DELAY_START_TIME);

        return () => {
            clearTimeout(initialDelayId);
            clearTimeout(timeoutId);
            clearInterval(intervalId);
            clearInterval(timerIntervalId);
        };
    }, [executeRequest, isFinished]);

    useEffect(() => {
        if (isFinished) {
            setTimeRemaining(0);
        }
    }, [isFinished]);

    const formattedTimeRemaining = `${Math.floor(timeRemaining / 60)}:${(
        timeRemaining % 60
    )
        .toString()
        .padStart(2, "0")}`;

    return {
        isFinished,
        result,
        timeRemaining: formattedTimeRemaining,
        isDelayedStart,
    };
};

export default useTimedHttpRequest;
