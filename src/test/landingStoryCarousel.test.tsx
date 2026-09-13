import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LANDING_STORY_SLIDES } from '../data/landingStorySlides';
import { LandingStoryCarousel } from '../components/LandingStoryCarousel';
import { LandingView } from '../components/LandingView';

describe('Hut4Devs Landing Story Carousel Framework (Checkpoint 01)', () => {
  it('defines exactly six structured slides with full required attributes', () => {
    expect(LANDING_STORY_SLIDES).toHaveLength(6);

    LANDING_STORY_SLIDES.forEach((slide, idx) => {
      expect(slide.slideNumber).toBe(idx + 1);
      expect(slide.id).toBeTruthy();
      expect(slide.focus).toBeTruthy();
      expect(slide.title).toBeTruthy();
      expect(slide.message).toBeTruthy();
      expect(slide.imageAlt).toBeTruthy();
      expect(slide.plannedSceneDescription).toBeTruthy();
    });
  });

  it('verifies slide 1 is Mutual Support in Shared Living', () => {
    const slide1 = LANDING_STORY_SLIDES[0];
    expect(slide1.focus).toBe('Mutual Support in Shared Living');
    expect(slide1.title).toBe('Community shows up');
    expect(slide1.message).toContain('When one of us needs support');
  });

  it('verifies slide 6 focuses strictly on Welfare & Mediation without institution customization', () => {
    const slide6 = LANDING_STORY_SLIDES[5];
    expect(slide6.focus).toBe('Welfare & Mediation');
    expect(slide6.title).toBe('See where help is needed');
    expect(slide6.message).toContain('Feedback and welfare concerns');
    // Ensure no provider or institution branding leaked into slide 6
    expect(slide6.message).not.toContain('branding');
    expect(slide6.message).not.toContain('provider');
    expect(slide6.message).not.toContain('wallet');
  });

  it('renders LandingStoryCarousel with accessible controls and navigates slides', () => {
    const onSlideChange = vi.fn();
    render(<LandingStoryCarousel isDark={false} onSlideChange={onSlideChange} />);

    // Check initial slide is slide 1 with integrated image and heading
    const slide1Img = screen.getByRole('img', {
      name: /Three African roommates supporting one another/i,
    });
    expect(slide1Img).toBeInTheDocument();
    expect(slide1Img).toHaveAttribute('src', '/story/slide-01-mutual-support.webp');
    expect(screen.getByRole('heading', { name: /Community shows up/i })).toBeInTheDocument();

    // Check next button navigates to slide 2 (with integrated image and heading)
    const nextBtn = screen.getByRole('button', { name: /Next story/i });
    fireEvent.click(nextBtn);
    expect(screen.getByText('Story 2 of 6')).toBeInTheDocument();
    const slide2Img = screen.getByRole('img', {
      name: /Four African roommates reviewing a superior Wi-Fi plan/i,
    });
    expect(slide2Img).toBeInTheDocument();
    expect(slide2Img).toHaveAttribute('src', '/story/slide-02-shared-contribution.webp');
    expect(screen.getByRole('heading', { name: /Shared needs\. Shared action\./i })).toBeInTheDocument();
    expect(onSlideChange).toHaveBeenCalledWith(1);

    // Check previous button navigates back to slide 1
    const prevBtn = screen.getByRole('button', { name: /Previous story/i });
    fireEvent.click(prevBtn);
    expect(
      screen.getByRole('img', { name: /Three African roommates supporting one another/i })
    ).toBeInTheDocument();
    expect(onSlideChange).toHaveBeenCalledWith(0);

    // Check clicking dot 3 navigates to slide 3 with image and heading
    const dot3 = screen.getByRole('tab', { name: /Go to story 3/i });
    fireEvent.click(dot3);
    expect(screen.getByText('Story 3 of 6')).toBeInTheDocument();
    const slide3Img = screen.getByRole('img', {
      name: /A young African Member reviewing and signing a digital accommodation membership agreement/i,
    });
    expect(slide3Img).toBeInTheDocument();
    expect(slide3Img).toHaveAttribute('src', '/story/slide-03-digital-agreement.webp');
    expect(screen.getByRole('heading', { name: /Registration becomes an agreement/i })).toBeInTheDocument();
    expect(onSlideChange).toHaveBeenCalledWith(2);

    // Check clicking dot 4 navigates to slide 4 with image and heading
    const dot4 = screen.getByRole('tab', { name: /Go to story 4/i });
    fireEvent.click(dot4);
    expect(screen.getByText('Story 4 of 6')).toBeInTheDocument();
    const slide4Img = screen.getByRole('img', {
      name: /A Fellow, a Muslim Room Captain, an Accommodation Coordinator, and a Financial Admin/i,
    });
    expect(slide4Img).toBeInTheDocument();
    expect(slide4Img).toHaveAttribute('src', '/story/slide-04-role-coordination.webp');
    expect(screen.getByRole('heading', { name: /The right people stay informed/i })).toBeInTheDocument();
    expect(onSlideChange).toHaveBeenCalledWith(3);

    // Check clicking dot 5 navigates to slide 5 with image and heading
    const dot5 = screen.getByRole('tab', { name: /Go to story 5/i });
    fireEvent.click(dot5);
    expect(screen.getByText('Story 5 of 6')).toBeInTheDocument();
    const slide5Img = screen.getByRole('img', {
      name: /Comparison of stressed manual accounting with Excel versus calm structured oversight/i,
    });
    expect(slide5Img).toBeInTheDocument();
    expect(slide5Img).toHaveAttribute('src', '/story/slide-05-financial-accountability.webp');
    expect(screen.getByRole('heading', { name: /Problems should surface themselves/i })).toBeInTheDocument();
    expect(onSlideChange).toHaveBeenCalledWith(4);

    // Check clicking dot 6 navigates to slide 6 with image and heading
    const dot6 = screen.getByRole('tab', { name: /Go to story 6/i });
    fireEvent.click(dot6);
    expect(screen.getByText('Story 6 of 6')).toBeInTheDocument();
    const slide6Img = screen.getByRole('img', {
      name: /An African Accommodation Coordinator logging a room concern from a lodge kitchen/i,
    });
    expect(slide6Img).toBeInTheDocument();
    expect(slide6Img).toHaveAttribute('src', '/story/slide-06-welfare-mediation.webp');
    expect(screen.getByRole('heading', { name: /See where help is needed/i })).toBeInTheDocument();
    expect(onSlideChange).toHaveBeenCalledWith(5);
  });

  it('supports pause and resume of slideshow', () => {
    render(<LandingStoryCarousel isDark={false} />);
    const pausePlayBtn = screen.getByRole('button', { name: /Pause story slideshow/i });
    expect(pausePlayBtn).toBeInTheDocument();

    // Click to pause
    fireEvent.click(pausePlayBtn);
    expect(screen.getByRole('button', { name: /Play story slideshow/i })).toBeInTheDocument();
  });

  it('renders LandingView preserving all primary CTAs, sticky header, and identity switch', () => {
    const onEnter = vi.fn();
    const onOpenRegistration = vi.fn();
    const onOpenDevAuth = vi.fn();
    const onToggleTheme = vi.fn();

    render(
      <LandingView
        isDark={false}
        onEnter={onEnter}
        onOpenRegistration={onOpenRegistration}
        onOpenDevAuth={onOpenDevAuth}
        onToggleTheme={onToggleTheme}
      />
    );

    // Header & Brand
    expect(screen.getByText(/Switch Identity/i)).toBeInTheDocument();
    expect(screen.getByText(/Turning everyday collaboration into trails of trust/i)).toBeInTheDocument();

    // CTAs
    const enterBtn = screen.getByRole('button', { name: /Enter Hut4Devs/i });
    expect(enterBtn).toBeInTheDocument();
    fireEvent.click(enterBtn);
    expect(onEnter).toHaveBeenCalledTimes(1);

    const regBtn = screen.getByRole('button', { name: /Submit Accommodation Membership Request/i });
    expect(regBtn).toBeInTheDocument();
    fireEvent.click(regBtn);
    expect(onOpenRegistration).toHaveBeenCalledTimes(1);

    const devAuthBtn = screen.getByRole('button', { name: /Switch Identity/i });
    fireEvent.click(devAuthBtn);
    expect(onOpenDevAuth).toHaveBeenCalledTimes(1);

    // Carousel is also present on LandingView
    expect(screen.getByText('Story 1 of 6')).toBeInTheDocument();
  });
});
