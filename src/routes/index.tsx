import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { createFileRoute, Link } from '@tanstack/react-router';
import { SignedIn } from "@/components/SignedIn";
import { SignedOut } from "@/components/SignedOut";

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  // TODO could add link to predictions and roster pages as secondary actions
  return (
    <div className="flex flex-col justify-center items-center grow">
      <Carousel opts={{ loop: true }} className="max-w-3xl" plugins={[Autoplay({ delay: 10000, stopOnMouseEnter: true, stopOnInteraction: false })]}>
        <CarouselContent>
          <CarouselItem>
            <div className="flex flex-col gap-4 items-center max-w-2xl mx-auto">
              <h2 className="text-6xl font-bold text-balance">
                Predict who will win
              </h2>
              
              <p className="text-lg text-center">
                The only thing better than being right is being able to ping everyone who was
                wrong in lads general discord and show them the receipts.
              </p>

              <SignedIn>
                <Button variant="outline" className="cursor-pointer">
                  <Link to="/predictions">
                    Get started
                  </Link>
                </Button>
              </SignedIn>
              <SignedOut>
                <Button variant="outline" className="cursor-pointer">
                  <Link to="/login">
                    Get started
                  </Link>
                </Button>
              </SignedOut>
            </div>
          </CarouselItem>
          <CarouselItem>
            <div className="flex flex-col gap-4 items-center max-w-2xl mx-auto">
              <h2 className="text-6xl font-bold text-balance">
                Craft the ultimate team
              </h2>
              
              <p className="text-lg text-center">
                Assemble the strongest players in each role and enhance their fantasy scores with the perfect banners and titles.
              </p>

              <SignedIn>
                <Button variant="outline" className="cursor-pointer">
                  <Link to="/rosters">
                    Get started
                  </Link>
                </Button>
              </SignedIn>
              <SignedOut>
                <Button variant="outline" className="cursor-pointer">
                  <Link to="/login">
                    Get started
                  </Link>
                </Button>
              </SignedOut>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
