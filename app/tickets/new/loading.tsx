// app/tickets/new/loading.tsx
import { Skeleton } from "../../components/ui/skeleton";
import { Card, CardContent, CardHeader } from "../../components/ui/card";

export default function Loading() {
  return (
    <div className="container max-w-2xl py-10 mx-auto">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-96" />
        </CardHeader>
        <CardContent className="space-y-8" />
      </Card>
    </div>
  );
}
