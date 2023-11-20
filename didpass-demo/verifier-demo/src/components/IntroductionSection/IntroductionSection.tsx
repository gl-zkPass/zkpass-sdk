import { useState } from 'react';
import styles from './IntroductionSection.module.css';
import CaseExplanation from '../CaseExplanation/CaseExplanation';
import IntroductionText from './IntroductionText.json';
import { VerfiyData } from '../../data/VerifyData';

type IntroductionSectionParams = {
  handleContinue: () => void;
};

const IntroductionSection = (params: IntroductionSectionParams) => {
  const totalSteps = 2;
  const useCaseVerifyData = VerfiyData[0].useCases[0];
  const [step, setStep] = useState<number>(1);

  const handlePreviousStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleNextStep = () => {
    if (step === totalSteps) {
      params.handleContinue();
      return;
    }
    setStep(step + 1);
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Introduction</h2>

        <p className={styles.steps}>Step {step} of {totalSteps}</p>
      </div>

      <p className={styles.description}>
        {IntroductionText[step - 1]}
      </p>

      {
        step === 1 ?
          <CaseExplanation name={useCaseVerifyData.name} description={useCaseVerifyData.description} />
          :
          <></>
      }

      <div className={styles.buttons}>
        <button className={styles.buttons_prev} onClick={handlePreviousStep} disabled={step === 1}>Prev</button>
        <button className={styles.buttons_next} onClick={handleNextStep}>Next</button>
      </div>
    </section>
  );
};

export default IntroductionSection;