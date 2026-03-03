import { Menu } from 'lucide-react';

interface MobileToggleProps {
  onClick: () => void;
}

export function MobileToggle({ onClick }: MobileToggleProps) {
  return (
    <button
      onClick={onClick}
      className="hidden max-md:flex fixed top-4 left-4 z-[101] w-10 h-10 bg-accent text-white border-none rounded-sm items-center justify-center cursor-pointer"
    >
      <Menu size={20} />
    </button>
  );
}
