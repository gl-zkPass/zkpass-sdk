import styles from './CaseExplanation.module.css';

type CaseExplanationParams = {
  name: string,
  description: string,
};

const CaseExplanation = (params: CaseExplanationParams) => {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Use Case</h3>
      <p className={styles.field}>
        <span className={styles.field_name}>Name</span> {params.name}
      </p>
      <p className={styles.field}>
        <span className={styles.field_name}>Description</span> {params.description}
      </p>
    </div>
  )
};

export default CaseExplanation;