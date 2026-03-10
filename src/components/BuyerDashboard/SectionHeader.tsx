"use client";

export type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  onViewAll?: () => void;
  className?: string;
};

export function SectionHeader({
  title,
  subtitle,
  onViewAll,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex items-start gap-5 ${className}`}>
      <div className="flex flex-1 flex-col gap-[5px]">
        <p className="font-medium text-[24px] leading-normal text-[#121212]">
          {title}
        </p>
        {subtitle && (
          <p className="font-medium text-[16px] leading-normal text-[#3c3c3c]">
            {subtitle}
          </p>
        )}
      </div>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="shrink-0 font-medium text-[14px] leading-normal text-[#3c3c3c] transition-colors hover:text-[#121212]"
        >
          View All
        </button>
      )}
    </div>
  );
}
