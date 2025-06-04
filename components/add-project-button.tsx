'use client';

import React, { useState } from 'react';
import AddProjectDialog from './add-project-dialog';
import { Button } from '@/components/ui/button';

export default function AddProjectButton() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddProject = (name: string) => {
    console.log('Added project:', name);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Button onClick={() => setDialogOpen(true)}>Add Project</Button>
      </div>

      <AddProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={handleAddProject}
      />
    </>
  );
}