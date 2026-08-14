import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() { return <div className="space-y-6"><Skeleton className="h-8 w-48" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map((x) => <Skeleton key={x} className="h-32" />)}</div><Skeleton className="h-80" /></div>; }
