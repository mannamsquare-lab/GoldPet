import { useState, useRef } from 'react';
import { OnboardingScreen1 } from './components/OnboardingScreen1';
import { OnboardingScreen2 } from './components/OnboardingScreen2';
import { OnboardingScreen3 } from './components/OnboardingScreen3';
import { OnboardingScreen4 } from './components/OnboardingScreen4';
import './OnboardingPage.css';

export const OnboardingPage = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50; // 최소 스와이프 거리

  const handleNext = (nextIndex: number) => {
    console.log(`Moving from screen ${currentScreen} to screen ${nextIndex}`);
    setCurrentScreen(nextIndex);
  };

  const handlePrevious = () => {
    if (currentScreen > 0) {
      handleNext(currentScreen - 1);
    }
  };

  const handleSwipe = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentScreen < 3) {
      // 왼쪽으로 스와이프 (다음 화면)
      handleNext(currentScreen + 1);
    }
    if (isRightSwipe && currentScreen > 0) {
      // 오른쪽으로 스와이프 (이전 화면)
      handlePrevious();
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    handleSwipe();
  };

  const screens = [
    <OnboardingScreen1 key="1" onNext={() => handleNext(1)} />,
    <OnboardingScreen2 key="2" onNext={() => handleNext(2)} />,
    <OnboardingScreen3 key="3" onNext={() => handleNext(3)} />,
    <OnboardingScreen4 key="4" onNext={() => handleNext(0)} />,
  ];

  console.log('Current screen:', currentScreen);

  return (
    <div className="onboarding-page">
      <div 
        className="onboarding-carousel"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {screens[currentScreen]}
      </div>
    </div>
  );
};

