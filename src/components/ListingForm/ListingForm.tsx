"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Resolver } from "react-hook-form";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ContextTopBar } from "@/components/ContextTopBar";
import { MediaDropzone } from "@/components/MediaDropzone";
import { IconButton } from "@/components/IconButton";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { Dropdown } from "@/components/Dropdown";
import { Button } from "@/components/Button";
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
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { ROUTES } from "@/lib/routes";
import type { ListingFormProps } from "./types";

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

export function ListingForm({ mode, initialData }: ListingFormProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const isEdit = mode === "edit";

  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    () => initialData?.imageUrls ?? [],
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageError, setImageError] = useState(false);
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>(
    () => initialData?.variants ?? [],
  );
  const [variantDrawerOpen, setVariantDrawerOpen] = useState(false);
  const [variantImageFiles, setVariantImageFiles] = useState<Map<string, File>>(
    () => new Map(),
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingFormSchema) as Resolver<ListingFormData>,
    defaultValues: isEdit && initialData
      ? {
          title: initialData.title,
          description: initialData.description ?? "",
          specifications: initialData.specifications ?? "",
          price: initialData.price,
          shippingCost: initialData.shippingCost ?? 0,
          currency: initialData.currency ?? "SEK",
          condition: initialData.condition,
          category: initialData.category,
        }
      : {
          title: "",
          description: "",
          specifications: "",
          price: 0,
          shippingCost: 0,
          currency: "SEK",
          condition: "new" as const,
          category: "",
        },
  });

  const handleVariantImageSelect = (valueId: string, file: File) => {
    setVariantImageFiles((prev) => {
      const next = new Map(prev);
      next.set(valueId, file);
      return next;
    });
  };

  const totalImageCount = existingImageUrls.length + imageFiles.length;

  const onSubmit = async (data: ListingFormData) => {
    if (!user) return;

    setImageError(false);
    if (totalImageCount === 0) {
      setImageError(true);
      return;
    }

    try {
      const variantsWithValues = variantGroups.filter(
        (g) => g.values.length > 0,
      );

      if (isEdit && initialData?.id) {
        let imageUrls = [...existingImageUrls];
        if (imageFiles.length > 0) {
          const newUrls = await uploadListingImages(imageFiles, initialData.id);
          imageUrls = [...imageUrls, ...newUrls];
        }

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
                    initialData.id!,
                    value.id,
                  );
                  return { ...value, imageUrl };
                }),
              ),
            })),
          );
        }

        await updateListing(initialData.id, {
          ...data,
          imageUrls,
          ...(updatedVariants.length > 0
            ? { variants: updatedVariants }
            : { variants: [] }),
        });

        toastSuccess("Listing updated successfully");
        router.push(ROUTES.createListing);
      } else {
        const listingId = await createListing({
          ...data,
          sellerId: user.uid,
          ...(variantsWithValues.length > 0
            ? { variants: variantsWithValues }
            : {}),
          imageUrls: [],
        });

        const imageUrls = await uploadListingImages(imageFiles, listingId);

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

        toastSuccess("Listing created successfully");
        router.push(ROUTES.createListing);
      }
    } catch (err) {
      console.error(`Failed to ${isEdit ? "update" : "create"} listing:`, err);
      toastError(`Failed to ${isEdit ? "update" : "create"} listing`);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-[440px] flex-col bg-white">
      <ContextTopBar
        backLabel="Section"
        title={isEdit ? "Edit listing" : "Advance listing"}
        onBack={() => router.back()}
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-1 flex-col"
      >
        <SectionCard>
          <SectionHeader
            title={isEdit ? "Product images" : "Add product image"}
            subtitle="Add up to 10 photos of your item"
          />

          {existingImageUrls.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {existingImageUrls.map((url) => (
                <div key={url} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <IconButton
                    name="close"
                    size="small"
                    variant="default"
                    aria-label="Remove image"
                    className="absolute -right-2 -top-2"
                    onClick={() =>
                      setExistingImageUrls((prev) =>
                        prev.filter((u) => u !== url),
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}

          <MediaDropzone
            files={imageFiles}
            onFilesChange={(files) => {
              setImageFiles(files);
              setImageError(false);
            }}
            maxFiles={10 - existingImageUrls.length}
            error={imageError}
          />
        </SectionCard>

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
            loading={isSubmitting}
            disabled={authLoading || !user}
            className="flex-1"
          >
            {isEdit ? "Save changes" : "Create listing"}
          </Button>
        </section>
      </form>
    </div>
  );
}
