import TrackingClient from "./tracking-client";

export default function RecommendationPage({
  params,
}: {
  params: { id: string };
}) {
  return <TrackingClient recommendationId={params.id} />;
}
