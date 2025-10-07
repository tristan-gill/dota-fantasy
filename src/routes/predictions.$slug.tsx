import { ResultsBracket } from '@/components/ResultsBracket';
import { Card } from '@/components/ui/card';
import { createFileRoute, ErrorComponent } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query';
import { getProfileBySlug } from '@/services/profiles';
import { getPlayoffGames, getPredictionsByProfileId, getTeams } from '@/services/bracket';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PredictionBracket } from '@/components/PredictionBracket';
import { Loader2 } from 'lucide-react';
import { useAuthentication } from '@/lib/auth/client';

export const Route = createFileRoute('/predictions/$slug')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const profile = await getProfileBySlug({ data: { slug: params.slug } });
    // const responses = await Promise.all([
    //   getPlayoffGames(),
    //   getTeams(),
    //   getPlayoffGamesPredictionsByProfileId({ data: { profileId: profile.id } })
    // ]);
    
    return {
      profile,
      // playoffGames: responses[0],
      // teams: responses[1],
      // predictions: responses[2]
    };
  },
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
})

function RouteComponent() {
  const { profile } = Route.useLoaderData();
  const { userSession } = useAuthentication();

  const { data: playoffGames } = useQuery({ queryKey: ['playoffGames'], queryFn: getPlayoffGames, staleTime: Infinity });
  const { data: teams } = useQuery({ queryKey: ['teams'], queryFn: getTeams, staleTime: Infinity });
  const {
    data: predictions,
    // TODO a poor way to force rerender
    isFetching: isPredictionsFetching
  } = useQuery({
    queryKey: ["predictions"],
    queryFn: () => getPredictionsByProfileId({ data: { profileId: profile.id } })
  });

  const isOwner = userSession?.user.id === profile.userId;

  return (
    <div className="flex flex-col items-center">
      <Tabs defaultValue="prediction">
        <TabsList>
          <TabsTrigger value="prediction">Prediction</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        <TabsContent value="prediction">
          <Card className="p-6 max-w-[90vw] max-h-[calc(100vh-150px)] overflow-scroll">
            {(!playoffGames || !teams || isPredictionsFetching) ? (
              <div className="h-[70vh] w-[90vw] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin size-20" />
              </div>
            ) : (
              <PredictionBracket playoffGames={playoffGames} teams={teams} predictions={predictions || []} isOwner={isOwner} />
            )}
          </Card>
        </TabsContent>
        <TabsContent value="results">
          <Card className="p-6 max-w-[90vw] max-h-[calc(100vh-150px)] overflow-scroll">
            {(!playoffGames || !teams) ? (
              <div className="h-[70vh] w-[90vw] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin size-20" />
              </div>
            ) : (
              <ResultsBracket playoffGames={playoffGames} teams={teams} />
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
