"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface ComboboxInputProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
  inputClassName?: string
}

export function ComboboxInput({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className,
  inputClassName
}: ComboboxInputProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  
  // Set initial input value based on selected value's label
  React.useEffect(() => {
    const selectedOption = options.find((opt) => opt.value === value)
    if (selectedOption) {
      setInputValue(selectedOption.label)
    } else {
      setInputValue("")
    }
  }, [value, options])

  const handleSelect = (currentValue: string) => {
    onChange(currentValue)
    const selectedOption = options.find((opt) => opt.value === currentValue)
    if (selectedOption) {
      setInputValue(selectedOption.label)
    }
    setOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    if (!open) setOpen(true)
    
    // If they clear the text, clear the underlying value
    if (e.target.value === "") {
        onChange("")
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("relative flex items-center w-full", className)}>
            <Input
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setOpen(true)}
                placeholder={placeholder}
                className={cn(
                    "w-full pr-8 cursor-text", 
                    inputClassName
                )}
            />
            <ChevronsUpDown className="absolute right-2 h-4 w-4 opacity-50 pointer-events-none" />
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-lg border border-slate-200 bg-white p-0 text-slate-900 shadow-xl z-[100] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()} // Prevent popover from stealing focus from input
      >
        <Command className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
          {/* We hide the command input because our main input handles the filtering via state */}
          <CommandList className="max-h-[320px] bg-white dark:bg-slate-900">
            <CommandEmpty className="bg-white py-6 text-center text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">No results found.</CommandEmpty>
            <CommandGroup className="max-h-[320px] overflow-auto bg-white p-1 dark:bg-slate-900">
              {options
                .filter(opt => opt.label.toLowerCase().includes(inputValue.toLowerCase()))
                .map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleSelect(option.value)}
                  className="bg-white text-slate-900 hover:bg-indigo-50 data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-900 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:data-[selected=true]:bg-indigo-950 dark:data-[selected=true]:text-indigo-200"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
