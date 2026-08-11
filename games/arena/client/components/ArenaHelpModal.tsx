import type { ReactElement } from 'react';

import { HelpModal } from '@game/client-core/components';

import { useArenaHelpTranslation } from '../hooks/useArenaTranslation.js';

export default function ArenaHelpModal(): ReactElement {
  const help = useArenaHelpTranslation();

  return (
    <HelpModal>
      <h2>{help.title}</h2>
      <p>{help.goal}</p>
    </HelpModal>
  );
}
