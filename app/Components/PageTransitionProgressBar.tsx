/*
 * Shout-out to Gustavo Guichard (gustavoguichard on Twitter) for this awesome progress bar!
 * You can find the original blog post here: https://dev.to/gugaguichard/creating-a-github-like-progress-bar-for-your-remix-app-153l
 */

import { useNavigation } from '@remix-run/react';
import { clsx } from 'clsx';
import { useEffect, useRef, useState } from 'react';

function PageTransitionProgressBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimationCompleted, setHasAnimationCompleted] = useState(true);

  const navigation = useNavigation();
  const isTransitioning = navigation.state !== 'idle';

  useEffect(() => {
    if (!isTransitioning) {
      return;
    }

    async function awaitAnimationCompletion() {
      if (!ref.current) return;
      const runningAnimations = ref.current.getAnimations();
      const animationPromises = runningAnimations.map((animation) => animation.finished);
      await Promise.allSettled(animationPromises);
      setHasAnimationCompleted(true);
    }

    setHasAnimationCompleted(false);
    awaitAnimationCompletion();
  }, [isTransitioning]);

  function getProgress() {
    if (navigation.state === 'idle') {
      return 0;
    }
    if (navigation.state === 'submitting') {
      return 25;
    }
    if (navigation.state === 'loading') {
      return 75;
    }
    return 100;
  }

  return (
    <div
      role="progressbar"
      aria-hidden={!isTransitioning}
      aria-valuetext={isTransitioning ? 'Loading' : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={getProgress()}
      className="fixed inset-x-0 top-0 left-0 z-50 h-2 animate-pulse"
    >
      <div
        ref={ref}
        className={clsx(
          'h-full bg-gradient-to-r from-primary to-red-950 transition-all duration-500 ease-in-out',
          navigation.state === 'idle' && hasAnimationCompleted && 'w-0 opacity-0 transition-none',
          navigation.state === 'submitting' && 'w-4/12',
          navigation.state === 'loading' && 'w-10/12',
          navigation.state === 'idle' && !hasAnimationCompleted && 'w-full',
        )}
      />
    </div>
  );
}

export { PageTransitionProgressBar };