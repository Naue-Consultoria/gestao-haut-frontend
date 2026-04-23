import { MapaDados } from '../../../types/mapa-ambicao';

interface PropositorTabProps {
  dados: MapaDados;
  onChange: (patch: Partial<MapaDados>) => void;
}

interface CardDef {
  key: keyof Pick<MapaDados, 'p1Visao' | 'p1Atividades' | 'p1Legado' | 'p1Causas' | 'p1Dia'>;
  num: string;
  heading: string;
  prompt: string;
  placeholder: string;
  rows: number;
}

const CARDS: CardDef[] = [
  {
    key: 'p1Visao',
    num: 'Pergunta 1',
    heading: 'Visão Ideal (10+ anos)',
    prompt: 'Imagine sua vida daqui a 10 anos — onde você está, o que faz, quem te rodeia.',
    placeholder: 'Se dinheiro, tempo e responsabilidades não fossem um problema, o que você faria?',
    rows: 6,
  },
  {
    key: 'p1Atividades',
    num: 'Pergunta 2',
    heading: 'Satisfação Profunda',
    prompt: 'As atividades que te dão senso de propósito, não só retorno financeiro.',
    placeholder: 'O que realmente importa, não só o lucrativo...',
    rows: 6,
  },
  {
    key: 'p1Legado',
    num: 'Pergunta 3',
    heading: 'Legado e Impacto',
    prompt: 'Como você quer ser lembrado profissional e pessoalmente.',
    placeholder: 'Um propósito maior e duradouro...',
    rows: 6,
  },
  {
    key: 'p1Causas',
    num: 'Pergunta 4',
    heading: 'Causas e Propósito Social',
    prompt: 'Causas que te movem e onde sua contribuição faz diferença.',
    placeholder: 'Alinhe ambições pessoais com contribuição social...',
    rows: 6,
  },
  {
    key: 'p1Dia',
    num: 'Pergunta 5',
    heading: 'Um Dia Perfeito',
    prompt: 'Um retrato detalhado de como é um dia ideal na sua vida realizada.',
    placeholder: 'Descreva com o máximo de detalhes como seria um dia perfeito na sua vida ideal...',
    rows: 7,
  },
];

const textareaClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-sm font-main text-sm outline-none transition-all focus:border-gray-400 focus:bg-white resize-y min-h-[120px]';

function QuestionCard({ num, heading, prompt, placeholder, rows, value, onChange }: {
  num: string; heading: string; prompt: string; placeholder: string; rows: number;
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-[12px] p-6 shadow">
      <div className="text-[11px] font-semibold tracking-[2px] uppercase text-gray-500 mb-1">{num}</div>
      <h3 className="text-[15px] font-semibold text-gray-900 mb-1">{heading}</h3>
      <p className="text-sm text-gray-500 mb-4">{prompt}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={textareaClass}
      />
    </div>
  );
}

export function PropositorTab({ dados, onChange }: PropositorTabProps) {
  const [p1, p2, p3, p4, p5] = CARDS;

  return (
    <>
      <div className="grid grid-cols-2 gap-6 mb-6 max-lg:grid-cols-1">
        {[p1, p2, p3, p4].map((card) => (
          <QuestionCard
            key={card.key}
            num={card.num}
            heading={card.heading}
            prompt={card.prompt}
            placeholder={card.placeholder}
            rows={card.rows}
            value={dados[card.key]}
            onChange={(v) => onChange({ [card.key]: v } as Partial<MapaDados>)}
          />
        ))}
      </div>
      <div>
        <QuestionCard
          num={p5.num}
          heading={p5.heading}
          prompt={p5.prompt}
          placeholder={p5.placeholder}
          rows={p5.rows}
          value={dados[p5.key]}
          onChange={(v) => onChange({ [p5.key]: v } as Partial<MapaDados>)}
        />
      </div>
    </>
  );
}
