export type TabId = 'dashboard' | 'proposito' | 'estilo' | 'patrimonio' | 'rastreamento' | 'plano';

interface TabBarProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

interface TabDef { id: TabId; label: string; }

const TABS: TabDef[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'proposito', label: 'Propósito e Visão' },
  { id: 'estilo', label: 'Estilo de Vida' },
  { id: 'patrimonio', label: 'Estratificação do Patrimônio' },
  { id: 'rastreamento', label: 'Rastreamento' },
  { id: 'plano', label: 'Plano de Ação' },
];

export function TabBar({ activeTab, onChange }: TabBarProps) {
  return (
    <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              isActive
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
