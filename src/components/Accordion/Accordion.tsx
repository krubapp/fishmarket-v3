"use client";

import { useState } from "react";

import { AccordionItem } from "./AccordionItem";

import type { AccordionProps } from "./types";

export function Accordion({
  items,
  allowMultiple = false,
  value: valueProp,
  onValueChange,
  className = "",
}: AccordionProps) {
  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = useState<number[]>([]);
  const openSet = isControlled ? valueProp : internalValue;

  const handleItemChange = (index: number, open: boolean) => {
    const next = allowMultiple
      ? open
        ? [...openSet, index]
        : openSet.filter((i) => i !== index)
      : open
        ? [index]
        : [];
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`.trim()}>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.title}
          headerRight={item.headerRight}
          open={openSet.includes(index)}
          onOpenChange={(open) => handleItemChange(index, open)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
}
