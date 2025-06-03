'use client';
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProject } from "@/app/actions/createProject";
import { useRouter } from "next/navigation";

interface AddProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

export default function AddProjectDialog({ open, onClose, onAdd }: AddProjectDialogProps) {
    const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || loading) {
      return;
    }
    setLoading(true);

    try {
      const res = await createProject({ name });
      router.refresh();

      if (res) {
        onAdd(name.trim());
        setName("");
        onClose();
      }
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleAdd}>
          <div className="flex flex-col space-y-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              className="w-full"
            />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
