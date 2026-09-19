import { type ReactElement, useState } from 'react';

import {
  SKILLS,
  SkillType,
  type Player,
  type Room,
  type Skill,
} from '@game/game-arena/shared';

import { getSkillIcon, getSkillName } from '../../../constants/index.js';
import { useArenaTranslation } from '../../../hooks/useArenaTranslation.js';
import {
  getActivePlayerId,
  getPlayersInTurnOrder,
  isPlayerEliminated,
} from '../../../utils/index.js';

import BattleLog from './BattleLog.js';
import PlayerStatsDisplay from './PlayerStats.js';
import SkillCard from './SkillCard.js';
import SkillDetailSheet from './SkillDetailSheet.js';
import styles from './SpectatorPhase.module.css';

type SpectatorPhaseProps = {
  room: Room;
  preparation: boolean;
};

function SpectatorSkills({ player }: { player: Player }): ReactElement {
  const [detailSkill, setDetailSkill] = useState<Skill | null>(null);
  const selectedSkills = player.loadout
    .map(skillId => SKILLS[skillId])
    .filter((skill): skill is Skill => Boolean(skill));
  const activeSkills = selectedSkills.filter(
    skill => skill.type === SkillType.active
  );
  const supportSkills = selectedSkills.filter(
    skill => skill.type !== SkillType.active
  );

  const renderSkill = (skill: Skill): ReactElement => {
    const cooldown =
      skill.type === SkillType.passive
        ? undefined
        : player.skills.find(playerSkill => playerSkill.id === skill.id)
            ?.cooldown;

    return (
      <SkillCard
        key={skill.id}
        skill={skill}
        cooldown={cooldown}
        alwaysShowCooldown={skill.type !== SkillType.passive}
        disabled
        onClick={() => undefined}
        onOpenDetail={setDetailSkill}
      />
    );
  };

  return (
    <>
      <div className={styles.skills}>
        <div className={styles.skillRow}>{activeSkills.map(renderSkill)}</div>
        <div className={styles.skillRow}>{supportSkills.map(renderSkill)}</div>
      </div>
      {detailSkill ? (
        <SkillDetailSheet
          skill={detailSkill}
          onClose={() => setDetailSkill(null)}
        />
      ) : null}
    </>
  );
}

export default function SpectatorPhase({
  room,
  preparation,
}: SpectatorPhaseProps): ReactElement {
  const t = useArenaTranslation();
  const activePlayerId = getActivePlayerId(room);
  const playersInTurnOrder = getPlayersInTurnOrder(room);

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        {preparation ? (
          <div className={styles.intro}>
            <h2 className={styles.title}>{t.preparation.spectatorTitle}</h2>
            <p>{t.preparation.spectatorDescription}</p>
            <p className={styles.readySummary}>
              {t.preparation.waitingForPlayers
                .replace(
                  '{ready}',
                  String(room.players.filter(player => player.ready).length)
                )
                .replace('{total}', String(room.players.length))}
            </p>
          </div>
        ) : null}
        <div className={styles.players}>
          {playersInTurnOrder.map((player, index) => (
              <section key={player.id} className={styles.player}>
                {preparation ? (
                  <div className={styles.status}>
                    {player.ready
                      ? t.preparation.readyStatus
                      : t.preparation.selectingStatus}
                  </div>
                ) : null}
                <PlayerStatsDisplay
                  player={player}
                  turnOrder={index + 1}
                  isActive={!preparation && activePlayerId === player.id}
                  isEliminated={isPlayerEliminated(player)}
                  isWinner={room.winner === player.id}
                  isMatchEnded={Boolean(room.winner)}
                  showStatuses
                />
                {preparation && player.ready ? (
                  <>
                    <div className={styles.loadout}>
                      {player.loadout.map(skillId => (
                        <span key={skillId} className={styles.skill}>
                          {getSkillIcon(skillId)}{' '}
                          {getSkillName(skillId, t.skillNames)}
                        </span>
                      ))}
                    </div>
                  </>
                ) : null}
                {!preparation ? <SpectatorSkills player={player} /> : null}
              </section>
          ))}
        </div>
      </main>
      {!preparation ? (
        <aside className={styles.log}>
          <BattleLog steps={room.steps} />
        </aside>
      ) : null}
    </div>
  );
}
