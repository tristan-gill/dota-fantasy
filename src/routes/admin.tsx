import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { processMatchById } from '@/services/fantasy';
import { getUserRole } from '@/services/profiles';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin')({
  component: RouteComponent,
  loader: async () => {
    // TODO test if this works
    const userRole = await getUserRole();
    if (!userRole || userRole.role !== "ADMIN") {
      throw notFound();
    }
  }
})

function RouteComponent() {
  const processMatchByIdMutation = useMutation({
    mutationFn: processMatchById,
    onSuccess: async () => {
      // TODO any invalidation needed?
      toast("Match was added successfully!")
    },
  });

  // TODO might be nice if we confirmed the match was parsed somehow, could do a client side fetch?
  const onAddMatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    processMatchByIdMutation.mutate({
      data: {
        matchId: formData.get("matchId") as string,
        isPlayoff: !!formData.get("isPlayoffGame")
      },
    });
  }

  return (
    <div>
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle>Add match</CardTitle>
          <CardDescription>
            Fetch the match data from Opendota and save it to the site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAddMatch}>
            <div className="flex flex-col gap-4">
              <Label htmlFor="matchId">
                Match
              </Label>
              <Input id="matchId" name="matchId" required />
              
              <div className="flex flex-row justify-between">
                <Label htmlFor="isPlayoffGame">
                  Is playoff game
                  {/* <Input id="name" name="isPlayoffGame" type="checkbox" /> */}
                </Label>
                <Checkbox id="isPlayoffGame" name="isPlayoffGame" />
              </div>

              <Button disabled={processMatchByIdMutation.isPending} className="w-full">
                Add
                {processMatchByIdMutation.isPending && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
