'use client'

import { ITransactionDetails } from "@/models/Transaction"
import UserAvatar from "./user-avatar";
import { ReactNode } from "react";
import { ArrowRightCircleIcon } from "lucide-react";
import IconColorBadge from "./icon-color-badge";
import { diffAssignees, formatDate, UserDiff } from "@/lib/utils";

interface TransactionDetailsComponentProps {
    transaction: ITransactionDetails;
}

export default function TransactionDetailsComponent({ transaction }: TransactionDetailsComponentProps) {

    let updateTempalete: ReactNode[] = [
        <p key={transaction.transactionId + '_header'} className="grid grid-cols-5 gap-1 items-center pt-2 border-t-1">

            <UserAvatar className="col-span-2 justify-start" avatarClass="size-5" textClass="" user={transaction.user} />
            <span className="col-span-3 text-right">
                {`${transaction.transactionType}d on`} <span className="truncate">{formatDate(new Date(transaction.createdAt))}</span> {`${transaction.transactionType === 'update' ? 'with following field(s).' : ''}`}
            </span>
        </p>
    ]

    const arrowElement = <ArrowRightCircleIcon className="mx-2 my-1" />;
    const recordClass = "grid grid-cols-4 gap-1 items-center";
    const recordValueClass = "col-span-3 flex justify-left items-center";
    const recordlabelClass = "col-span-1";

    const getAssigneeTemplate = (diff: UserDiff): ReactNode => {
        return <div className="flex justify-start flex-wrap">
            {diff.added.length ? <p className="flex  flex-wrap items-center jusify start px-2">
                <span className="mr-2">Added</span> {
                    diff.added.map((userVal) => {
                        return <UserAvatar
                            key={userVal.userId}
                            className="bg-muted  shadow-sm  rounded-sm p-1 m-1"
                            avatarClass="size-5"
                            user={userVal}
                        />
                    })
                }
            </p> : ''
            }
            {diff.removed.length ? <p className="flex flex-wrap items-center jusify start px-2">
                <span className="mr-2">Removed</span> {
                    diff.removed.map((userVal) => {
                        return <UserAvatar
                            key={userVal.userId}
                            className="bg-muted shadow-sm  rounded-sm p-1 line-through m-1"
                            textClass="max-w-[150px]"
                            avatarClass="size-5"
                            user={userVal}
                        />
                    })
                }
            </p> : ''
            }
        </div>
    }

    if (transaction.fields.name) {
        updateTempalete.push(
            <div key={transaction.transactionId + '_name'} className={recordClass}>
                <p className={recordlabelClass}>Name</p>
                <div  className={recordValueClass}>
                    <div className="line-through">
                        {transaction.fields.name.oldValue}
                    </div>
                    {arrowElement}
                    <div>
                        {transaction.fields.name.newValue}
                    </div>
                </div>
            </div>
        )
    }

    if (transaction.fields.description) {
        updateTempalete.push(
            <div key={transaction.transactionId + '_description'} className={recordClass}>
                <p className={recordlabelClass}>Description</p>
                <div  className={recordValueClass}>
                    <div className="line-through">
                        {transaction.fields.description.oldValue}
                    </div>
                    {arrowElement}
                    <div>
                        {transaction.fields.description.newValue}
                    </div>
                </div>
            </div>
        )
    }

    if (transaction.fields.assigneeIds) {
        updateTempalete.push(
            <div key={transaction.transactionId + '_assignee'} className={recordClass}>
                <p className={recordlabelClass}>Assignees</p>
                <div className={recordValueClass}>
                    {getAssigneeTemplate(diffAssignees(transaction.fields.assigneeIds.oldValue || [], transaction.fields.assigneeIds.newValue || []))}
                </div>
            </div>
        )
    }

    if (transaction.fields.statusId) {
        updateTempalete.push(
            <div key={transaction.transactionId + '_statusId'} className={recordClass}>
                <p className={recordlabelClass}>Status</p>
                <div  className={recordValueClass}>
                    <div className="line-through">
                        {transaction.fields.statusId.oldValue && <IconColorBadge textClass="line-through" entity={transaction.fields.statusId.oldValue} />}
                    </div>
                    {arrowElement}
                    <div>
                        {transaction.fields.statusId.newValue && <IconColorBadge entity={transaction.fields.statusId.newValue} />}
                    </div>
                </div>
            </div>
        )
    }

    if (transaction.fields.priorityId) {
        updateTempalete.push(
            <div key={transaction.transactionId + '_priotity'} className={recordClass}>
                <p className={recordlabelClass}>Priority</p>
                <div  className={recordValueClass}>
                    <div className="line-through">
                        {transaction.fields.priorityId.oldValue && <IconColorBadge textClass="line-through" entity={transaction.fields.priorityId.oldValue} />}
                    </div>
                    {arrowElement}
                    <div>
                        {transaction.fields.priorityId.newValue && <IconColorBadge entity={transaction.fields.priorityId.newValue} />}
                    </div>
                </div>
            </div>
        )
    }

    return (<div className=" mb-2 ">{
        updateTempalete
    }</div>)
}
