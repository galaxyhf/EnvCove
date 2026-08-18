import { LoaderCircle } from "lucide-react";

function Spinner() {
  return (
    <span
      data-slot="spinner"
      aria-hidden="true"
      className="inline-flex shrink-0 animate-spin motion-reduce:animate-none"
    >
      <LoaderCircle />
    </span>
  );
}

export { Spinner };
