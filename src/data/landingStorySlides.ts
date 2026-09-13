/**
 * Hut4Devs Landing Story Slides (Checkpoint 01)
 *
 * Defines the structured content for the 6-slide first-view storytelling carousel.
 * Future realistic, African-centered photographic assets will be plugged into `imageSrc`
 * one slide at a time during subsequent checkpoints.
 *
 * Invariant: Slide 6 is dedicated strictly to Welfare & Mediation.
 * Institution branding / provider customization belongs to future roadmap / Fix a Puzzle.
 */

export interface LandingStorySlide {
  id: string;
  slideNumber: number;
  focus: string;
  title: string;
  message: string;
  imageSrc?: string;
  imageAlt: string;
  plannedSceneDescription: string;
}

export const LANDING_STORY_SLIDES: LandingStorySlide[] = [
  {
    id: 'slide-mutual-support',
    slideNumber: 1,
    focus: 'Mutual Support in Shared Living',
    title: 'Community shows up',
    message:
      'When one of us needs support, shared living should not feel isolating.',
    imageSrc: '/story/slide-01-mutual-support.webp',
    imageAlt:
      'Three African roommates supporting one another in a modest shared accommodation room',
    plannedSceneDescription:
      'Three African female Techpreneurs in a modest shared room. One is worried about low funds. Two roommates encourage her. One of the supporting women may be an adult woman with dwarfism.',
  },
  {
    id: 'slide-shared-contributions',
    slideNumber: 2,
    focus: 'Shared Contributions',
    title: 'Shared needs. Shared action.',
    message:
      'Small contributions can help communities solve practical needs together.',
    imageSrc: '/story/slide-02-shared-contribution.webp',
    imageAlt:
      'Four African roommates reviewing a superior Wi-Fi plan and planning shared contributions in their accommodation room',
    plannedSceneDescription:
      'African male roommates in a modest bunk-room environment contributing toward shared Wi-Fi.',
  },
  {
    id: 'slide-digital-registration',
    slideNumber: 3,
    focus: 'Digital Registration & E-Signature',
    title: 'Registration becomes an agreement',
    message:
      'Membership details, consent and signatures can become one structured accommodation record.',
    imageSrc: '/story/slide-03-digital-agreement.webp',
    imageAlt:
      'A young African Member reviewing and signing a digital accommodation membership agreement on a laptop with an enlarged agreement preview',
    plannedSceneDescription:
      'African Member reviewing and signing a digital accommodation agreement.',
  },
  {
    id: 'slide-communication-accountability',
    slideNumber: 4,
    focus: 'Communication & Accountability',
    title: 'The right people stay informed',
    message:
      'Room-level, coordination and financial conversations stay connected to the responsibility that created them.',
    imageSrc: '/story/slide-04-role-coordination.webp',
    imageAlt:
      'A Fellow, a Muslim Room Captain, an Accommodation Coordinator, and a Financial Admin coordinating around an accommodation responsibility',
    plannedSceneDescription:
      'African Members interacting through relevant room / coordinator / Financial Admin communication.',
  },
  {
    id: 'slide-financial-accountability',
    slideNumber: 5,
    focus: 'Financial Accountability',
    title: 'Problems should surface themselves',
    message:
      'Clear records and attention queues help Financial Admins act without searching for problems manually.',
    imageSrc: '/story/slide-05-financial-accountability.webp',
    imageAlt:
      'Comparison of stressed manual accounting with Excel versus calm structured oversight using Hut4Devs Financial Command Center with attention queues',
    plannedSceneDescription:
      'African Financial Admin reviewing accommodation responsibilities and issues requiring attention.',
  },
  {
    id: 'slide-welfare-mediation',
    slideNumber: 6,
    focus: 'Welfare & Mediation',
    title: 'See where help is needed',
    message:
      'Feedback and welfare concerns can reach the right support role before small problems grow.',
    imageSrc: '/story/slide-06-welfare-mediation.webp',
    imageAlt:
      'An African Accommodation Coordinator logging a room concern from a lodge kitchen, routed directly to a Welfare and Mediation Officer at dinner',
    plannedSceneDescription:
      'African Accommodation Welfare & Mediation Officer reviewing concise concerns and support signals.',
  },
];
