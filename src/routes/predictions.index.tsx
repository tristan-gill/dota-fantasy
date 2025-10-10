import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { getUserSession } from '@/services/auth';
import { getPredictionActivity } from '@/services/bracket';
import { getProfileByUserId } from '@/services/profiles';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { formatDistance } from "date-fns";

export const Route = createFileRoute('/predictions/')({
  component: RouteComponent,
  loader: async () => {
    const recentPredictions = await getPredictionActivity();
    return {
      recentPredictions
    }
  }
})

function RouteComponent() {
  const { recentPredictions } = Route.useLoaderData();
  
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-4">
      <div className="col-span-2">
        <RecentPredictions recentPredictions={recentPredictions} />
      </div>
      {/* <div>
        <Card>
          Prompt to add your bracket
        </Card>
      </div>
      <div>
        <Card>
          Maybe show like common expected winners?
        </Card>
      </div> */}
    </div>
  );
}

// TODO proper type from the table level
interface RecentPrediction {
  userId: string;
  slug: string;
  name: string | null;
  teamName: string;
  teamImage: string | null;
  createdAt: Date;
}
function RecentPredictions({ recentPredictions }: { recentPredictions: RecentPrediction[] }) {
  // TODO maybe add a list of possible phrasings, max limit team name, include team picture?
  // TODO make the user and team name look clickable
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent predictions</CardTitle>
        <CardDescription>
          Recently completed predictions and who they think will come out on top in the grand finals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            {recentPredictions.map((recentPrediction, index) => {
              return (
                <TableRow key={recentPrediction.userId}>
                  <TableCell>
                    <span>
                      <Link to="/predictions/$slug" params={{ slug: recentPrediction.slug }}>
                        {recentPrediction.name}
                      </Link>
                      {" "}
                      predicted
                      {" "}
                      {/* <Link to="/predictions/$slug" params={{ slug: recentPrediction.slug }}>
                        {recentPrediction.name}
                      </Link> */}
                      {recentPrediction.teamName}
                      {" "}
                      will win
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDistance(recentPrediction.createdAt, new Date(), { addSuffix: true, includeSeconds: false })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}