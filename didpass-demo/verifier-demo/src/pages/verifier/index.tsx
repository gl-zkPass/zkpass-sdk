import { useState } from 'react'
import IntroductionSection from '../../components/IntroductionSection/IntroductionSection';
import ShowQr from '../../components/ShowQr/ShowQr';

export default function Verifier() {
  const [showQr, setShowQr] = useState<boolean>(false);

  const handleStartDemo = () => {
    setShowQr(true);
  };

  return (
    <>
      {
        showQr ?
          <ShowQr />
          :
          <IntroductionSection handleContinue={handleStartDemo} />
      }
    </>
  )
};