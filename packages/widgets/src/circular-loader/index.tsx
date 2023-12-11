import styles from './index.module.scss';

export const CircularLoader = ({ loadingText }) => {
  return (
    <div className={styles.loadingContainer}>
      <h1>{loadingText}</h1>
      <div className={styles.loader}></div>
    </div>
  );
};
