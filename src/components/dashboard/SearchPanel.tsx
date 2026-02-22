import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function SearchPanel() {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Patient</Label>
        <Input placeholder="Name" />
        <Input placeholder="Identifier" />
        <RadioGroup defaultValue="male" className="flex">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male">Male</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female">Female</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Physician</Label>
        <RadioGroup defaultValue="mine" className="space-y-1">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="mine" id="mine" />
            <Label htmlFor="mine">Of mine</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="specific" id="specific" />
            <Label htmlFor="specific">Specific</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <RadioGroup defaultValue="any" className="space-y-1">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="any" id="any" />
            <Label htmlFor="any">Any</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="today" id="today" />
            <Label htmlFor="today">Today</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yesterday" id="yesterday" />
            <Label htmlFor="yesterday">Yesterday</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="lastWeek" id="lastWeek" />
            <Label htmlFor="lastWeek">Last Week</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="lastMonth" id="lastMonth" />
            <Label htmlFor="lastMonth">Last Month</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="specificDay" id="specificDay" />
            <Label htmlFor="specificDay">Specific Day</Label>
          </div>
        </RadioGroup>
      </div>

      <Button className="w-full">Search</Button>
    </div>
  );
}