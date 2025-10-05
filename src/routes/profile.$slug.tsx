import { ResultsBracket } from '@/components/ResultsBracket';
import { Card } from '@/components/ui/card';
import { createFileRoute, ErrorComponent } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start';
import { useQuery } from '@tanstack/react-query';
import { getProfileBySlug } from '@/services/profiles';
import { getPlayoffGames, getTeams } from '@/services/bracket';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Route = createFileRoute('/profile/$slug')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const profile = await getProfileBySlug({ data: { slug: params.slug } });
    return profile;
  },
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
})

function RouteComponent() {
  const profile = Route.useLoaderData();

  return (
    <div>
      <Tabs defaultValue="prediction">
        <TabsList>
          <TabsTrigger value="prediction">Prediction</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>
        <TabsContent value="prediction">
          <Card className="p-6 max-w-[90vw] max-h-[70vh] overflow-scroll">
            
          </Card>
        </TabsContent>
        <TabsContent value="results">
          <Card className="p-6 max-w-[90vw] max-h-[70vh] overflow-scroll">
            <ResultsBracket />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
