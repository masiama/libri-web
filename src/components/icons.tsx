export {
  ArrowUpRight,
  Camera,
  CameraOff,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Keyboard,
  Moon,
  Search,
  Share,
  Sun,
  X,
} from "lucide-react";

export const ScanIcon = ({
  size = 24,
  ...rest
}: React.SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...rest}
  >
    <path d="M3 7V4h3M21 7V4h-3M3 17v3h3M21 17v3h-3" />
    <path d="M7 8v8M10 8v8M13 8v8M16 8v8" />
  </svg>
);
