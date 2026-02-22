import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTagStore } from '@/stores/useTagStore';
import { useState, useEffect } from 'react';

interface TagSelectorProps {
  ecgId: string;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagSelector({ ecgId, selectedTags, onTagsChange }: TagSelectorProps) {
  const { tags, isLoading, fetchTags, createTag, addTagToECG, removeTagFromECG } = useTagStore();
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    await createTag(newTagName, newTagColor);
    setNewTagName('');
  };

  const handleTagClick = async (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      await removeTagFromECG(ecgId, tagId);
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      await addTagToECG(ecgId, tagId);
      onTagsChange([...selectedTags, tagId]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <button
            key={tag.id}
            onClick={() => handleTagClick(tag.id)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedTags.includes(tag.id)
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            style={{
              backgroundColor: selectedTags.includes(tag.id) ? tag.color + '40' : undefined,
              color: selectedTags.includes(tag.id) ? tag.color : undefined
            }}
          >
            {tag.name}
            {selectedTags.includes(tag.id) && (
              <X className="h-3 w-3" />
            )}
          </button>
        ))}

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 rounded-full"
            >
              <Plus className="h-3 w-3 mr-1" />
              Nouveau tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau tag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nom du tag</Label>
                <Input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Ex: Urgent, À revoir, Important..."
                />
              </div>
              <div className="space-y-2">
                <Label>Couleur</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-12 h-8 p-1"
                  />
                  <Input
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>
              <Button
                onClick={handleCreateTag}
                className="w-full"
                disabled={!newTagName.trim()}
              >
                Créer le tag
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}