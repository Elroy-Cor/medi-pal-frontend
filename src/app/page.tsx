import Link from "next/link";
export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      Welcome to Medipal!
      <div className="flex gap-4 p-4">
        <Link href="/patient" className="text-blue-500">
          Patient
        </Link>
        <Link href="/nurse" className="text-blue-500">
          Nurse
        </Link>
      </div>
    </div>
  );
}
