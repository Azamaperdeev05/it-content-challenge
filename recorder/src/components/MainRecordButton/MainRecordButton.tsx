import cx from 'classnames';

import RecordButton from 'components/RecordButton';
import { useCountdown } from 'contexts/countdown';
import { useRecording } from 'contexts/recording';

import styles from './MainRecordButton.module.css';

const MainRecordButton = () => {
  const { countingDown, setCountingDown } = useCountdown();
  const { isRecording, startRecording, stopRecording } = useRecording();

  return (
    <RecordButton
      className={cx(styles.root, {
        [styles.recording]: isRecording,
        [styles.countingDown]: countingDown,
      })}
      classes={{ icon: styles.icon }}
      onClick={() => {
        if (countingDown) {
          return;
        }
        if (isRecording) {
          stopRecording();
        } else {
          setCountingDown(true);
          setTimeout(() => {
            startRecording();
            setCountingDown(false);
          }, 3000);
        }
      }}
    />
  );
};

export default MainRecordButton;
