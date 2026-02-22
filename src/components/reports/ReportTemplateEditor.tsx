import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd';
import { GripVertical, Plus, X } from 'lucide-react';
import type { ReportTemplate, ReportSection } from '@/lib/report-templates';

interface ReportTemplateEditorProps {
  template?: ReportTemplate;
  onSave: (template: ReportTemplate) => void;
}

export function ReportTemplateEditor({ template, onSave }: ReportTemplateEditorProps) {
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [sections, setSections] = useState<ReportSection[]>(
    template?.sections || []
  );

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSections(items);
  };

  const addSection = () => {
    const newSection: ReportSection = {
      id: crypto.randomUUID(),
      type: 'patient-info',
      title: 'Nouvelle Section',
      fields: [],
      layout: 'single-column'
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (index: number) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    setSections(newSections);
  };

  const updateSection = (index: number, updates: Partial<ReportSection>) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], ...updates };
    setSections(newSections);
  };

  const handleSave = () => {
    onSave({
      id: template?.id || crypto.randomUUID(),
      name,
      description,
      sections,
      footer: template?.footer
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Nom du template</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Rapport Standard"
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description du template..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Sections</Label>
          <Button variant="outline" size="sm" onClick={addSection}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une section
          </Button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {sections.map((section, index) => (
                  <Draggable
                    key={section.id}
                    draggableId={section.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="border rounded-lg p-4 bg-white"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            {...provided.dragHandleProps}
                            className="mt-2 cursor-move"
                          >
                            <GripVertical className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="flex justify-between">
                              <Input
                                value={section.title || ''}
                                onChange={(e) =>
                                  updateSection(index, { title: e.target.value })
                                }
                                placeholder="Titre de la section"
                                className="w-64"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSection(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            {/* Ajoutez ici les champs spécifiques à chaque type de section */}
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Annuler</Button>
        <Button onClick={handleSave}>Enregistrer</Button>
      </div>
    </div>
  );
}