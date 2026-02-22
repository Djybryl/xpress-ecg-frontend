import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, FileText, Copy, Trash2 } from 'lucide-react';
import { ReportTemplateEditor } from './ReportTemplateEditor';
import type { ReportTemplate } from '@/lib/report-templates';

interface ReportTemplateListProps {
  templates: ReportTemplate[];
  onCreateTemplate: (template: ReportTemplate) => void;
  onDuplicateTemplate: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
}

export function ReportTemplateList({
  templates,
  onCreateTemplate,
  onDuplicateTemplate,
  onDeleteTemplate
}: ReportTemplateListProps) {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Templates de Rapport</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau template</DialogTitle>
            </DialogHeader>
            <ReportTemplateEditor
              onSave={(template) => {
                onCreateTemplate(template);
                setIsCreating(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                {template.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                {template.description}
              </p>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Modifier le template</DialogTitle>
                    </DialogHeader>
                    <ReportTemplateEditor
                      template={template}
                      onSave={(updatedTemplate) => {
                        onCreateTemplate(updatedTemplate);
                      }}
                    />
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDuplicateTemplate(template.id)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => onDeleteTemplate(template.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}