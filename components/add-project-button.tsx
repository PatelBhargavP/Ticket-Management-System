'use client';

import React, { useState } from 'react';
import AddProjectDialog from './add-project-dialog';
import { Button } from '@/components/ui/button';

export default function AddProjectButton() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projects, setProjects] = useState<string[]>([]);

  const handleAddProject = (name: string) => {
    setProjects((prev) => [...prev, name]);
    console.log('Added project:', name);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Button onClick={() => setDialogOpen(true)}>Add Project</Button>
      </div>

      <ul className="list-disc pl-5 space-y-1">
        {projects.map((project, idx) => (
          <li key={idx}>{project}</li>
        ))}
      </ul>

      <AddProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={handleAddProject}
      />
    </>
  );
}