import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function Card({ title, href, group }) {
  return (
    <div className="relative">
      <Link href={href}>
        <a className="block sm:hover:bg-neutral-800 sm:px-4">
          <div className="py-8 text-lg">{title}</div>
        </a>
      </Link>
      {group && (
        <button className="absolute right-0 top-1/2 -translate-y-1/2 mr-2">
          <XMarkIcon className="w-6" />
        </button>
      )}
    </div>
  );
}
