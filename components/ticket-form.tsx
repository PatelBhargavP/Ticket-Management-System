"use-client";

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
import { useEffect } from "react";
import { ITicketDetails } from "@/models/Ticket";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
    name: z.string().min(1, {
        message: "Name is required.",
    }).max(64, {
        message: "Name cannot be longer than 64 charecters.",
    }),
    description: z.string().max(1000, {
        message: "Description cannot be longer than 1000 charecters.",
    }),
    ticketId: z.string(),
    projectId: z.string(),
    assigneeIds: z.array(z.string()),
    statusId: z.string(),
    priorityId: z.string(),
})

export default function TicketForm() {

    const router = useRouter();
    const { ticket, projectUsers } = useProjectTicket();
    const { statuses, priorities } = useSharedApp();
    useEffect(() => setFormValue(ticket), [ticket]);


    const setFormValue = (ticket: ITicketDetails | null) => {
        form.setValue("name", ticket?.name || "");
        form.setValue("ticketId", ticket?.ticketId || "");
        form.setValue("description", ticket?.description || "");
        form.setValue("projectId", ticket?.project.projectId || "");
        form.setValue("assigneeIds", ticket?.assignee?.map(user => user.userId) || []);
        form.setValue("statusId", ticket?.status.statusId || "");
        form.setValue("priorityId", ticket?.priority.priorityId || "");
    }
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
        console.log(data);
        if (!data.ticketId) {
            await createTicket(data.projectId, data);
        } else {
            await updateTicket(data.ticketId, data.projectId, data);
        }
        router.refresh();
    }

    return (
        <div className="px-3">
            TicketForm, {ticket?.name}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="shadcn" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Tell us a little bit about this ticket!"
                                        className="resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="assigneeIds"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Assignee</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-[200px] justify-between",
                                                    !field.value.length ? "text-muted-foreground" : "overflow-hidden text-ellipsis"
                                                )}
                                            >
                                                {field.value.length
                                                    ? field.value.reduce((previousVal, currentVal) => {
                                                        const user = projectUsers.find(u => u.userId === currentVal);
                                                        previousVal = `${previousVal}${previousVal ? ',' : ''} ${user?.fullname}`;
                                                        return previousVal;
                                                    }, '')
                                                    : "Add Assignee"}
                                                <ChevronsUpDown className="opacity-50" />
                                            </Button>
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
                                                            {user.fullname}
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

                    <FormField
                        control={form.control}
                        name="statusId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {statuses.map((status) => {
                                            return <SelectItem key={status.statusId} value={status.statusId}>{status.name}</SelectItem>;
                                        })}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="priorityId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a priority" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {priorities.map((priority) => {
                                            return <SelectItem key={priority.priorityId} value={priority.priorityId}>{priority.name}</SelectItem>;
                                        })}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Submit</Button>
                </form>
            </Form>

        </div>
    )
}