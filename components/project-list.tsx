"use client";

import { IProjectDetails } from "@/models/Project";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import ProjectEdit from "./project-edit";
import { IAppUser } from "@/models/User";
import AddProjectButton from "./add-project-button";
import { CircleX, FilePenLine } from "lucide-react";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";


export default function ProjectList(
    { projects, users }: { projects: IProjectDetails[]; users: IAppUser[] }) {
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

    return (
        <>
            <div className="flex justify-between align-middle">
                <div className="inline-flex w-fit">
                    <Input
                        value={filterValue}
                        onChange={(e) => { setFilterValue(e.target.value); handleFilter(e.target.value); }}
                        placeholder="Filter projects by name"
                    />
                    {
                        filterValue && <Button className="ml-0.5" onClick={() => { setFilterValue(''); handleFilter(''); } } variant="ghost">
                            <CircleX />
                        </Button>
                    }
                </div>
                <AddProjectButton />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Members</TableHead>
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
                            className="cursor-pointer hover:bg-muted"
                        >
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.members.length} member{item.members.length > 1 ? 's' : ''}</TableCell>
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

            <Sheet open={openSheet} onOpenChange={setOpenSheet}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Edit Project</SheetTitle>
                    </SheetHeader>

                    {selectedItem ? <ProjectEdit key={selectedItem.updatedAt.toString()} project={selectedItem} users={users} /> : ''}
                </SheetContent>
            </Sheet>
        </>
    )
}