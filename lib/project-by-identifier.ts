import { getProjectDetails } from "@/app/actions/getprojectDetails";
import { unstable_cache } from "next/cache";

export const projectByIdentifierCache = (uniqueIdentifier: string) => unstable_cache(
    async () => {
        return getProjectDetails({ identifier: uniqueIdentifier });
    },
    [`projectIdentifier:${uniqueIdentifier}`],
    { tags: ['projectByIdentifier', `projectIdentifier:${uniqueIdentifier}`] }
);