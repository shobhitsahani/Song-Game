export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="relative mx-auto w-12 h-12 mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-gold/30" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold animate-spin" />
        </div>
        <p className="text-muted-foreground animate-pulse">Loading Song Game...</p>
      </div>
    </div>
  );
}
