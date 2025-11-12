import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ProductOptionsProps {
  data: { id: string; name: string; values: { id: string; name: string }[] }[];
  onChange?: (value: Record<string, string>) => void;
  value?: Record<string, string>;
}

export const ProductOptions = ({
  value,
  data,
  onChange,
}: ProductOptionsProps) => {
  const [options, setOptions] = useState<Record<string, string>>(
    value ? value : {},
  );
  function handleSelect(optionName: string, value: string) {
    const nextOptions = { ...options, [optionName]: value };
    setOptions(nextOptions);
    onChange?.(nextOptions);
  }
  return (
    <div className="space-y-2">
      {data.map((o) => {
        return (
          <div key={o.id} className="space-y-2">
            <p className="text-sm font-medium">{o.name}</p>
            <div className="flex flex-wrap gap-2">
              {o.values.map((v) => (
                <Button
                  key={v.id}
                  variant="outline"
                  size="sm"
                  className={cn(
                    options[o.name] === v.name && "ring-2 ring-primary",
                  )}
                  onClick={() => handleSelect(o.name, v.name)}
                >
                  {v.name}
                </Button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
