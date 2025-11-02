import { Calendar, MapPin, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Event {
  title: string;
  datetime: string;
  location: string;
  url: string;
}

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
      <CardHeader>
        <CardTitle className="text-lg leading-tight line-clamp-2">
          {event.title}
        </CardTitle>
        <CardDescription className="flex flex-col gap-2 mt-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span>{event.datetime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-green-500" />
            <span>{event.location}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardFooter className="pt-0">
        <Button
          asChild
          variant="outline"
          className="w-full group"
        >
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            イベント詳細を見る
            <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
