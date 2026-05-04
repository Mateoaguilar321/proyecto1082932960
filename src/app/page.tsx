import HolaMundo from "@/components/HolaMundo";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-slate-900 to-black">
      <HolaMundo 
        title="AthletiTrack"
        subtitle="Sistema de Control Atletico"
        description="Plataforma integral para la gestión y seguimiento de deportistas en Atletismo con herramientas avanzadas de rendimiento."
      />
    </div>
  );
}
