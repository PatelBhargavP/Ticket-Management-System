

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center mt-24">
            <p className="text-3xl">404 | Not Found</p>
            <p className="py-4">Could not find requested resource</p>

            <Button variant="outline">
                <Link href="/projects">
                    Return Home
                </Link>
            </Button>
        </div>
    )
}