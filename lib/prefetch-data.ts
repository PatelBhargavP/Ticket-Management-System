import { useSharedApp } from "@/app/context/SharedAppContext";
import { useEffect } from "react";

export function prefetchStatusAndPriority() {
    const { statuses , setStatuses , getStatuses, priorities, setPriorities, getPriorities } = useSharedApp();
    useEffect(() => {

    if(!statuses || statuses.length === 0) {
        getStatuses.then(setStatuses);
    }
    if(!priorities || priorities.length === 0) {
        getPriorities.then(setPriorities);
    }
    } , [statuses, priorities])

}