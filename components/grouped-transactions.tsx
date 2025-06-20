'use client'

import { useProjectTicket } from '@/app/context/ProjectTicketContext';
import { IGroupedTransactions, TimeGroupsOrder, groupTransactionsByTimeRange } from '@/lib/grouped-transactions';
import { ITransactionDetails } from '@/models/Transaction';
import { useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import TransactionDetailsComponent from './transaction-details-component';
import { GroupedTransactionsSkeleton } from './grouped-transaction-skeleton';

export default function GroupedTransactions() {

    const { ticket, transactions, setTransactions } = useProjectTicket();
    const [loading, setLoading] = useState(true);
    let groupedTransactions: IGroupedTransactions = {};
    let groupOrder = TimeGroupsOrder;

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await fetch(`/api/transactions/${ticket?.ticketId}`);
                const result = await res.json() as ITransactionDetails[];
                setTransactions(result);
                groupedTransactions = groupTransactionsByTimeRange(result);
            } catch (err) {
                console.error('Failed to load transactions', err);
            } finally {
                setLoading(false);
            }
        };
        if (!transactions?.length || transactions[0]?.entityDetails?.id !== ticket?.ticketId) {
            fetchTransactions();
        } else {
            setLoading(false);
            groupedTransactions = groupTransactionsByTimeRange(transactions);
        }

    }, [ticket?.ticketId]);

    if (loading) {
        return <GroupedTransactionsSkeleton />
    } else if (transactions) {
        groupedTransactions = groupTransactionsByTimeRange(transactions);
    }

    groupOrder = groupOrder.filter(x => groupedTransactions[x]);

    return (
        <div>
            <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue={groupOrder[0]}
            >
                {groupOrder.map((timeRange) => {
                    return (

                        <AccordionItem key={`accordian_item-${timeRange.replace(' ', '')}`} value={timeRange} className='border-b-3'>
                            <AccordionTrigger key={`accordian_trigger-${timeRange.replace(' ', '')}`}>{timeRange}</AccordionTrigger>
                            <AccordionContent key={`accordian_content-${timeRange.replace(' ', '')}`} className="flex flex-col gap-4 text-balance">
                                    {groupedTransactions[timeRange]?.map(transaction => <TransactionDetailsComponent key={transaction.transactionId} transaction={transaction} />)}
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}

            </Accordion>
        </div>
    )
}
