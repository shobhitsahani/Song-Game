export function ScoreDisplay({ score, rank }: { score: number; rank?: number }) {
  return (<div className="text-center"><div className="text-3xl font-bold">{score.toLocaleString()}</div>{rank && <div className="text-xs text-muted-foreground">#{rank}</div>}</div>);
}