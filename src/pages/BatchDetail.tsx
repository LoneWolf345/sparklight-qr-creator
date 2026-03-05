import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BatchDetail() {
  const { id } = useParams();

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Batch Detail</h1>
      <Card>
        <CardHeader>
          <CardTitle>Batch: {id}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Batch detail view coming in Phase 3.</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
