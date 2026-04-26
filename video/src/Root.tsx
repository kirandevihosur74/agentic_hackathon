import { Composition } from 'remotion';
import { SignalDigestDemo } from './Demo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SignalDigestDemo"
      component={SignalDigestDemo}
      durationInFrames={1641}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
