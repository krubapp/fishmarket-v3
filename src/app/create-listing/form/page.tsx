"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Resolver } from "react-hook-form";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ContextTopBar } from "@/components/ContextTopBar";
import { MediaDropzone } from "@/components/MediaDropzone";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { Dropdown } from "@/components/Dropdown";
import { Button } from "@/components/Button";
import { Switch } from "@/components/Switch";
import { VariantDrawer } from "@/components/VariantDrawer";
import { VariantList } from "@/components/VariantList";

import {
  listingFormSchema,
  LISTING_CONDITIONS,
  LISTING_CATEGORIES,
  type ListingFormData,
  type VariantGroup,
} from "@/lib/schemas/listing";
import { createListing, updateListing } from "@/lib/firestore";
import { uploadListingImages, uploadVariantImage } from "@/lib/storage";

const conditionItems = LISTING_CONDITIONS.map((id) => ({
  id,
  label: id.charAt(0).toUpperCase() + id.slice(1),
}));

const categoryItems = LISTING_CATEGORIES.map((id) => ({
  id,
  label: id,
}));

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col">
      <h2 className="font-medium text-text-default-headings text-paragraph-xl leading-(--line-height-h6)">
        {title}
      </h2>
      <p className="text-text-default-body text-paragraph-md leading-(--line-height-paragraph-md)">
        {subtitle}
      </p>
    </div>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6 border-b border-slate-200 bg-white px-6 py-12">
      {children}
    </section>
  );
}

export default function CreateListingFormPage() {
  const router = useRouter();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageError, setImageError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);
  const [variantDrawerOpen, setVariantDrawerOpen] = useState(false);
  const [variantImageFiles, setVariantImageFiles] = useState<Map<string, File>>(
    () => new Map(),
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema) as Resolver<ListingFormData>,
    defaultValues: {
      title: "",
      description: "",
      specifications: "",
      price: 0,
      shippingCost: 0,
      currency: "SEK",
      condition: "new" as const,
      category: "",
      acceptTerms: false,
    },
  });

  const handleVariantImageSelect = (valueId: string, file: File) => {
    setVariantImageFiles((prev) => {
      const next = new Map(prev);
      next.set(valueId, file);
      return next;
    });
  };

  const onSubmit = async (data: ListingFormData) => {
    setImageError(false);
    if (imageFiles.length === 0) {
      setImageError(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const variantsWithValues = variantGroups.filter(
        (g) => g.values.length > 0,
      );
      const listingId = await createListing({
        ...data,
        ...(variantsWithValues.length > 0
          ? { variants: variantsWithValues }
          : {}),
        imageUrls: [],
      });

      const imageUrls = await uploadListingImages(imageFiles, listingId);

      // Upload variant images and collect updated groups with imageUrls
      let updatedVariants = variantsWithValues;
      if (variantImageFiles.size > 0) {
        updatedVariants = await Promise.all(
          variantsWithValues.map(async (group) => ({
            ...group,
            values: await Promise.all(
              group.values.map(async (value) => {
                const file = variantImageFiles.get(value.id);
                if (!file) return value;
                const imageUrl = await uploadVariantImage(
                  file,
                  listingId,
                  value.id,
                );
                return { ...value, imageUrl };
              }),
            ),
          })),
        );
      }

      await updateListing(listingId, {
        imageUrls,
        ...(updatedVariants.length > 0
          ? { variants: updatedVariants }
          : {}),
      });

      router.push("/create-listing");
    } catch (err) {
      console.error("Failed to create listing:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col bg-white">
      <ContextTopBar
        backLabel="Section"
        title="Advance listing"
        onBack={() => router.back()}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-1 flex-col"
      >
        {/* Product Image */}
        <SectionCard>
          <SectionHeader
            title="Add product image"
            subtitle="Add up to 10 photos of your item"
          />
          <MediaDropzone
            onFilesSelect={(files) => {
              setImageFiles(files);
              setImageError(false);
            }}
            error={imageError}
          />
        </SectionCard>

        {/* Item Details */}
        <SectionCard>
          <SectionHeader
            title="Item Details"
            subtitle="Helps people find your listing faster and improves search visibility."
          />

          <Input
            {...register("title")}
            label="Product name"
            placeholder="Shimano Stardic FL 3000"
            error={Boolean(errors.title)}
            helperText={errors.title?.message}
          />

          <div className="flex gap-6">
            <div className="flex flex-1 flex-col gap-3">
              <span className="font-semibold text-text-default-headings text-paragraph-md leading-(--line-height-paragraph-md)">
                Category
              </span>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    label="Select Category"
                    value={field.value}
                    items={categoryItems}
                    onSelect={field.onChange}
                    aria-label="Select category"
                  />
                )}
              />
              {errors.category && (
                <span className="text-sm text-red-600">
                  {errors.category.message}
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-3">
              <span className="font-semibold text-text-default-headings text-paragraph-md leading-(--line-height-paragraph-md)">
                Condition
              </span>
              <Controller
                name="condition"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    label="Select condition"
                    value={field.value}
                    items={conditionItems}
                    onSelect={field.onChange}
                    aria-label="Select condition"
                  />
                )}
              />
              {errors.condition && (
                <span className="text-sm text-red-600">
                  {errors.condition.message}
                </span>
              )}
            </div>
          </div>

          <Textarea
            {...register("description")}
            label="Description"
            placeholder="Add Specification"
            error={Boolean(errors.description)}
            helperText={errors.description?.message}
          />

          <Textarea
            {...register("specifications")}
            label="Specifications (Optimal)-but highly recommended"
            placeholder="Add Specification"
          />
        </SectionCard>

        {/* Pricing */}
        <SectionCard>
          <SectionHeader
            title="Pricing"
            subtitle="Helps people find your listing faster and improves search visibility."
          />

          <div className="flex gap-6">
            <div className="flex-1">
              <Input
                {...register("price", { valueAsNumber: true })}
                type="number"
                label="Price"
                placeholder="0,00"
                error={Boolean(errors.price)}
                helperText={errors.price?.message}
              />
            </div>
            <div className="flex-1">
              <Input
                {...register("shippingCost", { valueAsNumber: true })}
                type="number"
                label="Shipping Cost"
                placeholder="0,00"
                error={Boolean(errors.shippingCost)}
                helperText={errors.shippingCost?.message}
              />
            </div>
          </div>
        </SectionCard>

        {/* Variants */}
        <SectionCard>
          <SectionHeader
            title="Variants"
            subtitle="Secondary information and details plus more"
          />
          <VariantList
            groups={variantGroups}
            onGroupsChange={setVariantGroups}
            onOpenDrawer={() => setVariantDrawerOpen(true)}
            variantImageFiles={variantImageFiles}
            onVariantImageSelect={handleVariantImageSelect}
          />
        </SectionCard>

        <VariantDrawer
          open={variantDrawerOpen}
          onClose={() => setVariantDrawerOpen(false)}
          groups={variantGroups}
          onGroupsChange={setVariantGroups}
        />

        {/* Accept */}
        <section className="flex items-center gap-6 border-b border-slate-200 bg-white px-6 py-12">
          <div className="flex flex-1 flex-col">
            <h2 className="font-medium text-text-default-headings text-paragraph-xl leading-(--line-height-h6)">
              Accept
            </h2>
            <p className="text-text-default-body text-paragraph-md leading-(--line-height-paragraph-md)">
              Secondary information and details plus more
            </p>
          </div>
          <Controller
            name="acceptTerms"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onChange={field.onChange}
                size="small"
                aria-label="Accept terms"
              />
            )}
          />
        </section>

        {/* Footer */}
        <section className="flex gap-6 bg-white px-6 py-12 border-b border-slate-200">
          <Button
            size="large"
            variant="transparent"
            type="button"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            size="large"
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Creating..." : "Create listing"}
          </Button>
        </section>
      </form>
    </div>
  );
}
