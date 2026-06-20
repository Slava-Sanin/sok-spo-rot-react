import React, {useState, useEffect} from "react";
import {InitStatus} from "../../code/functions"
import {debugMode} from "../../code/globals";

const Status = ({state, needUpdateTrigger}) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        if (debugMode) {
            console.log("Creating timer");
        }
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    return (
        <>
            {InitStatus(state, needUpdateTrigger)}
        </>
    );
}

export default Status;

