'use client'

import { Palette } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Label } from './ui/label';
import { useCustomTheme } from './providers/custom-theme-provider';

export function ColorPicker() {
  const { theme, setTheme, resetToDefaults } = useCustomTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Customize Colors</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">Customize Theme</h3>
            <Button variant="ghost" size="sm" onClick={resetToDefaults}>Reset</Button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="background-color">Background</Label>
            <input
              id="background-color"
              type="color"
              value={theme.background}
              onChange={(e) => setTheme({ background: e.target.value })}
              className="h-6 w-6 cursor-pointer appearance-none rounded-sm border-none bg-transparent p-0"
              style={{'backgroundColor': theme.background}}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="primary-color">Primary</Label>
            <input
              id="primary-color"
              type="color"
              value={theme.primary}
              onChange={(e) => setTheme({ primary: e.target.value })}
              className="h-6 w-6 cursor-pointer appearance-none rounded-sm border-none bg-transparent p-0"
              style={{'backgroundColor': theme.primary}}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="accent-color">Accent</Label>
            <input
              id="accent-color"
              type="color"
              value={theme.accent}
              onChange={(e) => setTheme({ accent: e.target.value })}
              className="h-6 w-6 cursor-pointer appearance-none rounded-sm border-none bg-transparent p-0"
              style={{'backgroundColor': theme.accent}}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
