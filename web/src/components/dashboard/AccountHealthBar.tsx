import { Card, CardTitle, CardContent } from '../ui'
import styles from './AccountHealthBar.module.css'

interface AccountHealthBarProps {
  passCount: number
  failCount: number
  onClickPass: () => void
  onClickFail: () => void
}

export function AccountHealthBar({
  passCount,
  failCount,
  onClickPass,
  onClickFail,
}: AccountHealthBarProps) {
  const total = passCount + failCount
  const passPercent = total > 0 ? (passCount / total) * 100 : 0
  const failPercent = total > 0 ? (failCount / total) * 100 : 0

  return (
    <Card className={styles.card}>
      <CardTitle className={styles.title}>Account Health</CardTitle>
      <CardContent>
        <div className={styles.summary}>
          <span className={styles.summaryText}>
            <strong>{passCount}</strong> of <strong>{total}</strong> accounts accessible
          </span>
          <span className={styles.percentage}>
            {total > 0 ? Math.round(passPercent) : 0}%
          </span>
        </div>

        <div className={styles.barContainer}>
          {passPercent > 0 && (
            <button
              className={`${styles.barSegment} ${styles.pass}`}
              style={{ width: `${passPercent}%` }}
              onClick={onClickPass}
              title={`${passCount} accounts passing - Click to view`}
              aria-label={`${passCount} accounts passing`}
            />
          )}
          {failPercent > 0 && (
            <button
              className={`${styles.barSegment} ${styles.fail}`}
              style={{ width: `${failPercent}%` }}
              onClick={onClickFail}
              title={`${failCount} accounts failing - Click to view`}
              aria-label={`${failCount} accounts failing`}
            />
          )}
        </div>

        <div className={styles.legend}>
          <button className={styles.legendItem} onClick={onClickPass}>
            <span className={`${styles.dot} ${styles.passDot}`} />
            <span>Pass ({passCount})</span>
          </button>
          <button className={styles.legendItem} onClick={onClickFail}>
            <span className={`${styles.dot} ${styles.failDot}`} />
            <span>Fail ({failCount})</span>
          </button>
        </div>

        {failCount > 0 && (
          <p className={styles.hint}>
            Click the red section to see which accounts need attention
          </p>
        )}
      </CardContent>
    </Card>
  )
}
