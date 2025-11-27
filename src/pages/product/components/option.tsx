import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ProductOptionsProps {
  data: { id: number; name: string; values: { id: number; name: string }[] }[];
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
    <div className="space-y-4">
      {data.map((o) => {
        return (
          <div key={o.id} className="space-y-2">
            <p className="text-sm font-medium">{o.name}</p>
            <div className="flex flex-wrap gap-2">
              {o.values.map((v) => (
                <Button
                  key={v.id}
                  variant={options[o.name] === v.name ? "default":"secondary"}
                  className="rounded-full"
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
