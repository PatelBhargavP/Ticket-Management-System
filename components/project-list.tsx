"use client";

import { IProjectDetails } from "@/models/Project";
import { Button } from "./ui/button";
import { use, useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import ProjectEdit from "./project-edit";
import { IAppUser } from "@/models/User";
import AddProjectButton from "./add-project-button";
import { CircleX, FilePenLine } from "lucide-react";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import { UserAvatarGroup } from "./user-avatar-group";
import { ScrollArea } from "./ui/scroll-area";


export default function ProjectList(
    { projectsPromise, usersPromise }: { projectsPromise: Promise<IProjectDetails[]>; usersPromise: Promise<IAppUser[]> }
) {
    const users = use(usersPromise);
    const projects = use(projectsPromise);
    const [openSheet, setOpenSheet] = useState(false);
    const [filterValue, setFilterValue] = useState('');
    const [selectedItem, setSelectedItem] = useState<IProjectDetails | null>(null);
    const [filteredList, setFilteredList] = useState(projects);
    const router = useRouter();

    useEffect(() => {
        handleFilter(filterValue); // Reset filter when props change
    }, [projects]);

    const handleFilter = (filterValue: string) => {
        if (!filterValue) {
            return setFilteredList(projects);
        }
        const filtered = projects.filter((item) =>
            item.name.toLowerCase().includes(filterValue.toLowerCase())
        );
        setFilteredList(filtered);
    };

    const handleRowClick = (item: IProjectDetails) => {
        router.push(`/projects/${item.identifier}/list`);
    };

    const handleEditClick = (
        e: React.MouseEvent<HTMLButtonElement>,
        item: IProjectDetails
    ) => {
        e.stopPropagation(); // prevent row navigation
        setSelectedItem(item);
        setOpenSheet(true);
    };

    if (selectedItem && selectedItem?.updatedAt.toString() !== projects.find(p => p.projectId === selectedItem.projectId)?.updatedAt.toString()) {
        const updateSelectedItem = projects.find(p => p.projectId === selectedItem.projectId);
        if (updateSelectedItem) {
            setSelectedItem(updateSelectedItem);
        } else {
            setSelectedItem(null);
            setOpenSheet(false);
        }
    }

    const header = <div className="flex justify-between align-middle">
        <div className="inline-flex w-fit">
            <Input
                value={filterValue}
                onChange={(e) => { setFilterValue(e.target.value); handleFilter(e.target.value); }}
                placeholder="Filter projects by name"
            />
            {
                filterValue && <Button className="ml-0.5" onClick={() => { setFilterValue(''); handleFilter(''); }} variant="ghost">
                    <CircleX />
                </Button>
            }
        </div>
        <AddProjectButton />
    </div>

    if (!filteredList.length) {
        return (
            <>
                {header}
                <div className="flex items-center justify-center h-96">
                    <div className='flex flex-col justify-around'>
                        {filterValue ? "No matching results found!" : "No projects created yet!"}
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            {header}
            <ScrollArea className="max-h-[calc(100vh-140px)] overflow-auto">
                <Table>
                    <TableHeader className="bg-muted text-muted-foreground uppercase text-xs font-extralight tracking-wide sticky top-0 z-10">
                        <TableRow className="[&>th]:px-4 [&>th]:py-2 [&>th]:text-left">
                            <TableHead className="max-w-[150px] sm:max-w-[450px] max-xl:max-w-[650px]">Name</TableHead>
                            <TableHead className="hidden sm:table-cell">Identifier</TableHead>
                            <TableHead className="hidden xs:table-cell">Members</TableHead>
                            <TableHead>
                                <span className="w-full flex justify-end pr-3">
                                    Action
                                </span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredList.map((item) => (
                            <TableRow
                                key={item.projectId}
                                onClick={() => handleRowClick(item)}
                                className="cursor-pointer hover:bg-muted [&>td]:px-4"
                            >
                                <TableCell className="max-w-[150px] sm:max-w-[450px] max-xl:max-w-[650px] truncate" title={item.name}>{item.name}</TableCell>
                                <TableCell className="hidden sm:table-cell">{item.identifier}</TableCell>
                                <TableCell className="hidden xs:table-cell">
                                    <UserAvatarGroup users={item.members} />
                                </TableCell>
                                <TableCell>
                                    <span className="w-full flex justify-end pr-2">
                                        <Button
                                            size="sm"
                                            title="Edit Project"
                                            onClick={(e) => handleEditClick(e, item)}
                                            variant="outline"
                                        >
                                            <FilePenLine />
                                        </Button>
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>

            <Sheet open={openSheet} onOpenChange={setOpenSheet}>
                <SheetContent className="w-full sm:w-[600px] sm:max-w-[600px]">
                    <SheetHeader>
                        <SheetTitle>Edit Project</SheetTitle>
                    </SheetHeader>

                    {selectedItem ? <ProjectEdit key={selectedItem.updatedAt.toString()} project={selectedItem} users={users} /> : ''}
                </SheetContent>
            </Sheet>
        </>
    )
}