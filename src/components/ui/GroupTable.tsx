import { byId } from '../../data/players';
import type { Standing } from '../../engine/groupStage';

export function GroupTable({
  name, standings, fighterId, qualifiedCount = 2,
}: { name: string; standings: Standing[]; fighterId: string; qualifiedCount?: number }) {
  return (
    <div className="rounded-xl bg-panel p-3 ring-1 ring-line">
      <div className="mb-2 text-sm font-black text-neon">Grupo {name}</div>
      <table className="w-full text-sm">
        <thead className="text-white/40">
          <tr>
            <th className="text-left font-medium">#</th>
            <th className="text-left font-medium">Jogador</th>
            <th className="text-right font-medium">V</th>
            <th className="text-right font-medium">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr
              key={s.playerId}
              className={`${i < qualifiedCount ? 'text-white' : 'text-white/40'} ${s.playerId === fighterId ? 'font-bold text-neon' : ''}`}
            >
              <td>{i + 1}</td>
              <td>{byId[s.playerId].name}</td>
              <td className="text-right">{s.wins}</td>
              <td className="text-right">{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
