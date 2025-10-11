'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const ROOM_NAME = 'passepartout';

export default function Home() {
  const router = useRouter();

  const handleJoinCall = () => {
    router.push(`/room/${ROOM_NAME}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold tracking-tight">Passepartout</h1>
          <p className="text-xl text-muted-foreground">
            Your Personal Travel Architect
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <Button
            onClick={handleJoinCall}
            className="h-14 w-full text-lg"
            size="lg"
          >
            Join Room
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>Click to join and start planning your journey</p>
        </div>
      </div>
    </div>
  );
}
