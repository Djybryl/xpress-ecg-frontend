import { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Activity, 
  FileText, 
  Send, 
  BarChart2, 
  Keyboard,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/stores/appStore';

interface OnboardingTourProps {
  onComplete: () => void;
}

const steps = [
  {
    title: 'Bienvenue sur Xpress-ECG ! 👋',
    description: 'Découvrez les fonctionnalités principales de votre plateforme de télé-interprétation d\'ECG en quelques étapes.',
    icon: Activity,
    color: 'indigo',
  },
  {
    title: 'Tableau de bord',
    description: 'Visualisez tous les ECG en attente, filtrez par établissement ou par priorité, et accédez rapidement aux cas urgents.',
    icon: BarChart2,
    color: 'blue',
  },
  {
    title: 'Visualiseur ECG',
    description: 'Analysez les tracés avec des outils de zoom, de mesure (calipers) et annotez directement sur l\'ECG.',
    icon: FileText,
    color: 'purple',
  },
  {
    title: 'Interprétation rapide',
    description: 'Utilisez les phrases pré-définies et les raccourcis clavier pour gagner du temps. Tapez /rs pour "Rythme sinusal régulier".',
    icon: Keyboard,
    color: 'amber',
  },
  {
    title: 'Validation et envoi',
    description: 'Une fois l\'interprétation terminée, validez et envoyez le rapport au médecin prescripteur en un clic.',
    icon: Send,
    color: 'green',
  },
];

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { completeOnboarding } = useAppStore();

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      completeOnboarding();
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleSkip = () => {
    completeOnboarding();
    onComplete();
  };

  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ${colorClasses[step.color as keyof typeof colorClasses]}`}>
            <step.icon className="h-10 w-10" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pb-4">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-indigo-600'
                  : index < currentStep
                  ? 'bg-indigo-300'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={isFirst}
            className={isFirst ? 'invisible' : ''}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Précédent
          </Button>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentStep + 1} / {steps.length}
          </span>

          <Button
            onClick={handleNext}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isLast ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Commencer
              </>
            ) : (
              <>
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

