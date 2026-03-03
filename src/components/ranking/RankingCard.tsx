interface RankingCardProps {
  children: React.ReactNode;
}

export function RankingCard({ children }: RankingCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-[12px] overflow-hidden mb-6">
      {children}
    </div>
  );
}
