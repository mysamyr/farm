import HelpModal from '../../../components/modals/HelpModal';
import QrModal from '../../../components/modals/QrModal';
import IconButton from '../../../components/ui/IconButton';
import LanguageDropdown from '../../../components/ui/LanguageDropdown';
import { useConnection } from '../../../hooks/useConnection';
import { useLanguage } from '../../../hooks/useLanguage';
import { useModal } from '../../../hooks/useModal';

import styles from './Header.module.css';

export default function Header() {
  const { online } = useConnection();
  const { translation } = useLanguage();
  const { showModal } = useModal();

  return (
    <header className={styles.container}>
      <div>
        <div className={styles.logo}>🎲 {translation.dashboard.header}</div>
        <div className={styles.onlineIndicator}>
          <span className={styles.dot}></span>
          <span>{online} Online</span>
        </div>
      </div>

      <nav className={styles.headerTools}>
        <LanguageDropdown />
        <IconButton
          icon="📷"
          title="Show QR Code"
          onClick={() => showModal(QrModal)}
        />
        <IconButton
          icon="❓"
          title="Show Help"
          onClick={() => showModal(HelpModal)}
        />
      </nav>
    </header>
  );
}
