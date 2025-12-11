"use client";

import { useProjectTicket } from "@/app/context/ProjectTicketContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useSharedApp } from "@/app/context/SharedAppContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { createTicket } from "@/app/actions/createTicket";
import { updateTicket } from "@/app/actions/updateTicket";
import { useRouter } from "next/navigation";
import { UserAvatarGroup } from "./user-avatar-group";
import { IAppUser } from "@/models/User";
import UserAvatar from "./user-avatar";
import DynamicIcon from "./dynamic-icon";

const FormSchema = z.object({
    name: z.string().min(1, {
        message: "Name is required.",
    }).max(64, {
        message: "Name cannot be longer than 64 charecters.",
    }),
    description: z.string().max(1000, {
        message: "Description cannot be longer than 1000 charecters.",
    }).optional(),
    ticketId: z.string(),
    projectId: z.string(),
    assigneeIds: z.array(z.string()),
    statusId: z.string(),
    priorityId: z.string(),
})

type Props = {
    onDirtyChange: (dirty: boolean) => void;
    onSubmitSuccess: () => void;
};

export default function TicketForm({ onDirtyChange, onSubmitSuccess }: Props) {

    const router = useRouter();
    const { ticket, projectUsers, setTransactions } = useProjectTicket();
    const { statuses, priorities } = useSharedApp();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: ticket?.name,
            ticketId: ticket?.ticketId,
            description: ticket?.description,
            projectId: ticket?.project.projectId,
            assigneeIds: ticket?.assignee.map(user => user.userId),
            statusId: ticket?.status.statusId,
            priorityId: ticket?.priority.priorityId,
        },
    });

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            if (!data.ticketId) {
                await createTicket(data.projectId, data);
            } else {
                await updateTicket(data.ticketId, data.projectId, data);
                setTransactions(null)
            }
            // setTicket(null);
            onDirtyChange(false);
            onSubmitSuccess();
            router.refresh();
        } catch(err) {
            console.error(err);
        }
    }

    const getStatusTrigger = (statusId: string) => {
        const status = statuses.find(s => s.statusId === statusId);
        return (<SelectTrigger
            className="max-w-[200px] min-w-[150px] mr-3"
            style={{
                color: status?.color || '',
                backgroundColor: status?.color ? `${status?.color}20` : '', // add 20 for ~12% opacity
            }}>
            <SelectValue placeholder="Select a status" />
        </SelectTrigger>);
    }

    const getPriorityTrigger = (priorityId: string) => {
        const priority = priorities.find(p => p.priorityId === priorityId);
        return (<SelectTrigger
            className="max-w-[200px] min-w-[150px]"
            style={{
                color: priority?.color || '',
                backgroundColor: priority?.color ? `${priority?.color}20` : '', // add 20 for ~12% opacity
            }}>
            <SelectValue placeholder="Select a priority" />
        </SelectTrigger>);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
                <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Title of this ticket" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    name="assigneeIds"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Assignee</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        {
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "flex text-muted-foreground border-0 size-12 items-center"
                                                )}
                                                style={{
                                                    width: !field.value.length ? '130px' : `${Math.min((field.value.length * (field.value.length === 1 ? 36 : 30)), 4 * 30) + 24}px`,
                                                }}
                                            >
                                                {
                                                    field.value.length
                                                        ? <UserAvatarGroup users={field.value.reduce((previousVal, currentVal) => {
                                                            const user = projectUsers.find(u => u.userId === currentVal);
                                                            if (user) {
                                                                previousVal.push(user);
                                                            }
                                                            return previousVal;
                                                        }, [] as IAppUser[])} />
                                                        : <span className="inline-flex items-center justify-between">Add Assignee <ChevronsUpDown className="opacity-50" /></span>}

                                            </Button>
                                        }
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                    <Command>
                                        <CommandInput
                                            placeholder="Search user..."
                                            className="h-9"
                                        />
                                        <CommandList>
                                            <CommandEmpty>No user found.</CommandEmpty>
                                            <CommandGroup>
                                                {projectUsers.map((user) => (
                                                    <CommandItem
                                                        value={user.fullname}
                                                        key={user.userId}
                                                        onSelect={() => {
                                                            form.setValue(
                                                                'assigneeIds',
                                                                field.value.includes(user.userId)
                                                                    ? field.value.filter(val => val !== user.userId)
                                                                    : field.value.concat([user.userId])
                                                            )
                                                        }}
                                                    >
                                                        <UserAvatar user={user} />
                                                        <Check
                                                            className={cn(
                                                                "ml-auto",
                                                                field.value.includes(user.userId)
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="w-full inline-flex justify-start">
                    <FormField
                        name="statusId"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        {getStatusTrigger(field.value)}
                                    </FormControl>
                                    <SelectContent>
                                        {statuses.map((status) => {
                                            return (
                                                <SelectItem
                                                    key={status.statusId}
                                                    value={status.statusId}
                                                    className="my-1 focus:ring-1"
                                                    style={{
                                                        color: status.color,
                                                        backgroundColor: `${status.color}20`, // add 20 for ~12% opacity
                                                    }}>
                                                    <DynamicIcon iconName={status.icon} color={status.color} /> {status.name}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="priorityId"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        {getPriorityTrigger(field.value)}
                                    </FormControl>
                                    <SelectContent>
                                        {priorities.map((priority) => {
                                            return (

                                                <SelectItem
                                                    key={priority.priorityId}
                                                    value={priority.priorityId}
                                                    className="my-1  focus:ring-1"
                                                    style={{
                                                        color: priority.color,
                                                        backgroundColor: `${priority.color}20`, // add 20 for ~12% opacity
                                                    }} >
                                                    <DynamicIcon iconName={priority.icon} color={priority.color} /> {priority.name}
                                                </SelectItem>);
                                        })}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    name="description"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Tell us a little bit about this ticket!"
                                    className="resize-none sm:min-h-[200px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />


                <Button type="submit">Submit</Button>
            </form>
        </Form>
    )
}