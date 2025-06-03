'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

type Item = {
  id: string;
  name: string;
};

const mockData: Item[] = [
  { id: '1', name: 'Item Alpha' },
  { id: '2', name: 'Item Beta' },
  { id: '3', name: 'Item Gamma' },
];

export default function DataTable() {
  const [openSheet, setOpenSheet] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const router = useRouter();

  const handleRowClick = (item: Item) => {
    router.push(`/items/${item.id}`);
  };

  const handleEditClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    item: Item
  ) => {
    e.stopPropagation(); // prevent row navigation
    setSelectedItem(item);
    setOpenSheet(true);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockData.map((item) => (
            <TableRow
              key={item.id}
              onClick={() => handleRowClick(item)}
              className="cursor-pointer hover:bg-muted"
            >
              <TableCell>{item.name}</TableCell>
              <TableCell>
                <Button
                  size="sm"
                  onClick={(e) => handleEditClick(e, item)}
                  variant="outline"
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Sheet open={openSheet} onOpenChange={setOpenSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Item</SheetTitle>
            <SheetDescription>
              You are editing: <strong>{selectedItem?.name}</strong>
            </SheetDescription>
          </SheetHeader>

          {/* Example form or content inside sheet */}
          <div className="mt-4">
            <label className="block text-sm mb-1">Name</label>
            <input
              className="w-full px-3 py-2 border rounded-md"
              value={selectedItem?.name || ''}
              readOnly
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
