import {
  createContext,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

import type { Skill } from '@game/game-arena/shared';

import SkillDetailSheet from './SkillDetailSheet.js';

const SkillDetailContext = createContext<((skill: Skill) => void) | null>(null);

type SkillDetailProviderProps = {
  children: ReactNode;
};

export function SkillDetailProvider({
  children,
}: SkillDetailProviderProps): ReactElement {
  const [skill, setSkill] = useState<Skill | null>(null);
  const openSkillDetails = useCallback((selectedSkill: Skill) => {
    setSkill(selectedSkill);
  }, []);
  const closeSkillDetails = useCallback(() => {
    setSkill(null);
  }, []);

  return (
    <SkillDetailContext.Provider value={openSkillDetails}>
      {children}
      <SkillDetailSheet skill={skill} onClose={closeSkillDetails} />
    </SkillDetailContext.Provider>
  );
}

export function useSkillDetails(): (skill: Skill) => void {
  const context = useContext(SkillDetailContext);
  if (!context) {
    throw new Error('useSkillDetails must be used within SkillDetailProvider');
  }

  return context;
}
