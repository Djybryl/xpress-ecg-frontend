import { useState } from 'react';
import { FileText, Zap, ChevronDown, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface InterpretationPanelProps {
  interpretation: string;
  onInterpretationChange: (text: string) => void;
  isValidated: boolean;
}

// Phrases pré-définies par catégorie
const phraseTemplates = {
  rythme: [
    { shortcut: '/rs', text: 'Rythme sinusal régulier.' },
    { shortcut: '/rsi', text: 'Rythme sinusal irrégulier.' },
    { shortcut: '/ts', text: 'Tachycardie sinusale.' },
    { shortcut: '/bs', text: 'Bradycardie sinusale.' },
    { shortcut: '/fa', text: 'Fibrillation auriculaire.' },
    { shortcut: '/fl', text: 'Flutter auriculaire.' },
    { shortcut: '/esa', text: 'Extrasystoles auriculaires isolées.' },
    { shortcut: '/esv', text: 'Extrasystoles ventriculaires isolées.' },
  ],
  conduction: [
    { shortcut: '/pr1', text: 'Bloc auriculo-ventriculaire du premier degré.' },
    { shortcut: '/bbd', text: 'Bloc de branche droit complet.' },
    { shortcut: '/bbg', text: 'Bloc de branche gauche complet.' },
    { shortcut: '/hbag', text: 'Hémibloc antérieur gauche.' },
    { shortcut: '/hbpg', text: 'Hémibloc postérieur gauche.' },
  ],
  repolarisation: [
    { shortcut: '/rn', text: 'Repolarisation normale.' },
    { shortcut: '/tn', text: 'Ondes T négatives.' },
    { shortcut: '/st+', text: 'Sus-décalage du segment ST.' },
    { shortcut: '/st-', text: 'Sous-décalage du segment ST.' },
    { shortcut: '/qtl', text: 'Allongement de l\'intervalle QT.' },
  ],
  hypertrophie: [
    { shortcut: '/hvg', text: 'Hypertrophie ventriculaire gauche.' },
    { shortcut: '/hvd', text: 'Hypertrophie ventriculaire droite.' },
    { shortcut: '/hag', text: 'Hypertrophie auriculaire gauche.' },
    { shortcut: '/had', text: 'Hypertrophie auriculaire droite.' },
  ],
  conclusion: [
    { shortcut: '/ecgn', text: 'ECG dans les limites de la normale.' },
    { shortcut: '/ecga', text: 'ECG avec anomalies décrites ci-dessus.' },
    { shortcut: '/ctrl', text: 'Contrôle recommandé.' },
    { shortcut: '/urg', text: 'Anomalies nécessitant une prise en charge urgente.' },
  ],
};

export function InterpretationPanel({ 
  interpretation, 
  onInterpretationChange,
  isValidated 
}: InterpretationPanelProps) {
  const [showPhrases, setShowPhrases] = useState(false);
  const [activeCategory, setActiveCategory] = useState<keyof typeof phraseTemplates>('rythme');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let text = e.target.value;
    
    // Détection des raccourcis
    Object.values(phraseTemplates).flat().forEach(phrase => {
      if (text.endsWith(phrase.shortcut + ' ') || text.endsWith(phrase.shortcut)) {
        text = text.replace(new RegExp(phrase.shortcut + '\\s?$'), phrase.text + ' ');
      }
    });
    
    onInterpretationChange(text);
  };

  const insertPhrase = (text: string) => {
    const newText = interpretation + (interpretation.endsWith(' ') || interpretation === '' ? '' : ' ') + text + ' ';
    onInterpretationChange(newText);
  };

  const categoryLabels: Record<keyof typeof phraseTemplates, string> = {
    rythme: '💓 Rythme',
    conduction: '⚡ Conduction',
    repolarisation: '📈 Repolarisation',
    hypertrophie: '💪 Hypertrophie',
    conclusion: '✅ Conclusion',
  };

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className="py-3 px-4 bg-gradient-to-r from-indigo-50 to-white border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600" />
            Interprétation
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setShowPhrases(!showPhrases)}
          >
            <Zap className="h-3 w-3 mr-1 text-amber-500" />
            Phrases rapides
            <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${showPhrases ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
        {/* Panneau de phrases pré-définies */}
        {showPhrases && (
          <div className="border-b bg-gray-50 p-2">
            {/* Catégories */}
            <div className="flex gap-1 mb-2 flex-wrap">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key as keyof typeof phraseTemplates)}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    activeCategory === key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-indigo-50 border'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            
            {/* Phrases de la catégorie active */}
            <div className="flex flex-wrap gap-1">
              {phraseTemplates[activeCategory].map((phrase, index) => (
                <button
                  key={index}
                  onClick={() => insertPhrase(phrase.text)}
                  className="px-2 py-1 text-xs bg-white border rounded-md hover:bg-indigo-50 hover:border-indigo-300 transition-colors text-left"
                  title={`Raccourci: ${phrase.shortcut}`}
                >
                  <span className="text-indigo-600 font-mono mr-1">{phrase.shortcut}</span>
                  <span className="text-gray-700">{phrase.text.substring(0, 30)}...</span>
                </button>
              ))}
            </div>
            
            <p className="text-[10px] text-gray-400 mt-2">
              💡 Astuce: Tapez le raccourci (ex: /rs) suivi d'un espace pour insérer automatiquement
            </p>
          </div>
        )}

        {/* Zone de texte */}
        <div className="flex-1 p-3">
          <textarea
            value={interpretation}
            onChange={handleTextChange}
            placeholder="Saisissez votre interprétation ici...

Utilisez les raccourcis:
• /rs → Rythme sinusal régulier
• /fa → Fibrillation auriculaire
• /ecgn → ECG normal
..."
            className={`w-full h-full resize-none border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              isValidated 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-white border-gray-200'
            }`}
            disabled={isValidated}
          />
        </div>

        {/* Compteur de caractères et status */}
        <div className="px-3 pb-2 flex items-center justify-between text-xs text-gray-400">
          <span>{interpretation.length} caractères</span>
          {isValidated && (
            <span className="flex items-center gap-1 text-green-600">
              <Check className="h-3 w-3" />
              Validé et signé
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

