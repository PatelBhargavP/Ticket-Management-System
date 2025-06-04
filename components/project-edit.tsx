"use client";
import { cn } from "@/lib/utils";
import { IProject, IProjectDetails, IProjectDocument } from "@/models/Project";
import { useState } from "react";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { IAppUser } from "@/models/User";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "./ui/input";
import { updateProject } from "@/app/actions/updateProject";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import UserAvatar from "./user-avatar";

export default function ProjectEdit({ project, users }: { project: IProjectDetails, users: IAppUser[] }) {
    const router = useRouter();
    const [name, setName] = useState(project.name);
    const handleEdit = async (payload: Partial<IProjectDocument>) => {
        await updateProject(project.projectId, payload);
        router.refresh();
    };

    const removeMember = async (userId: string) => {
        await handleEdit({ memberIds: project.members.filter(member => member.userId !== userId).map(x => x.userId) });
    }
    const addMember = async (userId: string) => {
        await handleEdit({ memberIds: project.members.map(x => x.userId).concat([userId]) });
    }

    const editName = async () => {
        if (!name || name === project.name) {
            return;
        }
        await handleEdit({ name })
    }
    const availbleUsers = users.filter(u => !project.members.find(pu => pu.userId == u.userId));

    return (
        <>
            {/* <form className="mt-4 px-4"> */}
            <div className="mt-4 px-4">
                <label className="block text-sm mb-1">Name</label>
                <Input
                    className={cn(
                        "w-full px-3 py-2 border rounded-md",
                        name.length == 0 && "ring-2 ring-destructive text-destructive"
                    )}
                    onBlur={editName}
                    onKeyDown={async (e: React.KeyboardEvent) => {
                        if (e.code == 'Enter') {
                            await editName();
                        }
                    }}
                    value={name || ''}
                    onChange={(e) => setName(e.target.value)}
                />
                {name.length == 0 && <p className="text-destructive">Name is required</p>}
            </div>
            {/* </form> */}
            <div className="px-4">
                <div className="flex justify-between">
                    <h3 className="text-xl">Members</h3>
                    {
                        users.length > 0 &&

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Add Member
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {availbleUsers.map((user) => {
                                    return (
                                        <DropdownMenuItem key={user.userId} onClick={() => addMember(user.userId)}>
                                            <UserAvatar user={user} />
                                        </DropdownMenuItem>
                                    )
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    }
                </div>


                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {project.members.map((item) => (
                            <TableRow
                                key={item.userId}
                                className="cursor-pointer hover:bg-muted"
                            >
                                <TableCell>
                                    <UserAvatar user={item} />
                                </TableCell>
                                <TableCell>
                                    <Button title="Remove user" variant="ghost" onClick={() => removeMember(item.userId)}>
                                        <Trash2 />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    )
}