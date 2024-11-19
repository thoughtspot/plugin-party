import cx from 'classnames';
import styles from './radio.module.scss';

interface RadioProps {
  /**
   * label of the radio
   */
  label: string;
  /**
   * value of the radio
   */
  value: string;
  /**
   * id of the radio
   */
  id?: string;
  /**
   * checked state
   * @default false
   */
  checked?: boolean;
  /**
   * classname for the radio
   * @default ''
   */
  className?: string;
  /**
   * name for the radio button
   */
  name?: string;
  /**
   * onChange event for the radio
   */
  onChange?: (e) => void;
}

export const Radio = (props: RadioProps) => {
  const wrapperClassNames = cx(styles.radioWrapper, props.className);
  return (
    <label id={props.id} className={wrapperClassNames}>
      <input
        type="radio"
        name={props.name}
        value={props.value}
        checked={props.checked}
        className={styles.radioButton}
        onChange={props.onChange}
      />
      <span className={styles.radioLabel}>{props.label}</span>
    </label>
  );
};
