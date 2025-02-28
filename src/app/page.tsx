import Navbar from '@/components/Navbar';
import Calendar from '@/app/calendar/page';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Navbar />
      <main className="flex h-screen items-center justify-center">
        <div className="flex h-full w-2/3 pt-24 pb-10">
          <Calendar />
        </div>
      </main>
    </div>
  );
}
