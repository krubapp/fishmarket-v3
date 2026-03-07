"use client";

import { useRouter } from "next/navigation";

import { ContextTopBar } from "@/components/ContextTopBar";
import { ImageBlock } from "@/components/ImageBlock";
import { Button } from "@/components/Button";
import { BottomNav } from "@/components/BottomNav";
import { ROUTES } from "@/lib/routes";

export default function CreateListingPage() {
  const router = useRouter();
  return (
    <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col bg-white pb-[120px]">
      <ContextTopBar backLabel="Section" title="Advance listing" />

      {/* Decorative masonry grid of empty image placeholders */}
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-center gap-4">
          <div className="flex shrink-0 flex-col gap-4 -translate-y-[50px]">
            <ImageBlock size="medium" />
            <ImageBlock size="medium" />
            <ImageBlock size="medium" />
          </div>
          <div className="flex shrink-0 flex-col gap-4 translate-y-[58px]">
            <ImageBlock size="medium" />
            <ImageBlock size="medium" />
          </div>
          <div className="flex shrink-0 flex-col gap-4 -translate-y-[50px]">
            <ImageBlock size="medium" />
            <ImageBlock size="medium" />
            <ImageBlock size="medium" />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-6 px-6 py-10">
        <div className="flex flex-col gap-1">
          <h2 className="font-medium text-text-default-headings text-paragraph-xl leading-(--line-height-h6)">
            Create a new product inventory
          </h2>
          <p className="font-medium text-text-default-body text-paragraph-md leading-(--line-height-paragraph-md)">
            Add and manage your listings in one place
          </p>
        </div>
        <Button onClick={() => router.push(ROUTES.createListingForm)}>Create</Button>
      </div>

      <BottomNav activeItem="create" />
    </div>
  );
}
