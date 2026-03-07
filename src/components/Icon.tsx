import type { MaterialSymbol } from "material-symbols";

type IconStyle = "outlined" | "rounded" | "sharp";

type IconProps = {
  /** Icon name; see https://fonts.google.com/icons */
  name: MaterialSymbol;
  style?: IconStyle;
  size?: number;
  /** 0 = outline, 1 = filled */
  fill?: 0 | 1;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  grade?: number;
  opticalSize?: number;
  className?: string;
};

const styleClass: Record<IconStyle, string> = {
  outlined: "material-symbols-outlined",
  rounded: "material-symbols-rounded",
  sharp: "material-symbols-sharp",
};

export function Icon({
  name,
  style = "outlined",
  size = 24,
  fill = 0,
  weight,
  grade,
  opticalSize,
  className = "",
}: IconProps) {
  const classNames = [styleClass[style], className].filter(Boolean).join(" ");
  const variableStyles: React.CSSProperties = {
    fontSize: size,
    fontVariationSettings: [
      `"FILL" ${fill}`,
      weight != null && `"wght" ${weight}`,
      grade != null && `"GRAD" ${grade}`,
      opticalSize != null && `"opsz" ${opticalSize}`,
    ]
      .filter(Boolean)
      .join(", "),
  };

  return (
    <span
      className={classNames}
      style={variableStyles}
      aria-hidden
    >
      {name}
    </span>
  );
}
