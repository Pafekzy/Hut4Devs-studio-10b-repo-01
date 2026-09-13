# User Experience

> **Designing direct, human-centered collaboration that helps fellows
> and interns practice responsibility, exercise sound judgment, support
> one another, and build trails of trust — starting with
> accommodation.**

## Table of Contents

- [Purpose](#purpose)
- [Experience Context](#experience-context)
- [Experience North Star](#experience-north-star)
- [Direct Relationships First](#direct-relationships-first)
- [Who We Are Designing For](#who-we-are-designing-for)
- [User Roles Are Fluid](#user-roles-are-fluid)
- [Core User Needs](#core-user-needs)
- [Experience Principles](#experience-principles)
- [Accommodation as the First
  Experience](#accommodation-as-the-first-experience)
- [Core Journey Map](#core-journey-map)
- [Journey Example: Accommodation
  Support](#journey-example-accommodation-support)
- [Peer Support Types](#peer-support-types)
- [Responsible Vouching](#responsible-vouching)
- [Vouch Exposure Levels](#vouch-exposure-levels)
- [Vouch Power](#vouch-power)
- [Example: Tiered Vouch Outcome](#example-tiered-vouch-outcome)
- [Vouching as Leadership Practice](#vouching-as-leadership-practice)
- [Preventing Score Creep](#preventing-score-creep)
- [Overdue Obligations and Not
  Advisable](#overdue-obligations-and-not-advisable)
- [Consent-Based Debt History](#consent-based-debt-history)
- [Debt-to-Gift Conversion](#debt-to-gift-conversion)
- [Room, Group, and Community
  Context](#room-group-and-community-context)
- [Optional Coordinators](#optional-coordinators)
- [Trust Without Public Shaming](#trust-without-public-shaming)
- [Recognition and Character
  Development](#recognition-and-character-development)
- [Failure, Repair, and Recovery](#failure-repair-and-recovery)
- [Important Experience States](#important-experience-states)
- [Accessibility and Practical
  Constraints](#accessibility-and-practical-constraints)
- [Experience Questions to Validate](#experience-questions-to-validate)
- [Explicitly Out of Scope](#explicitly-out-of-scope)
- [What This Document Does Not
  Decide](#what-this-document-does-not-decide)

------------------------------------------------------------------------

## Purpose

This document describes how Hut4Devs should feel and behave from the
perspective of the people using it.

It translates the broader problem and product vision into:

- Direct peer-to-peer relationships.
- User roles and needs.
- Shared responsibilities.
- Peer support.
- Borrowing and repayment.
- Responsible vouching.
- Consent and privacy.
- Character and leadership development.
- Trust, repair, and recovery.
- Experience journeys that can later guide interface design.

This document does **not** define the final screens, technical
architecture, blockchain implementation, smart contracts, token model,
database schema, or visual design.

The experience should be understood in human terms before technology is
allowed to shape it.

------------------------------------------------------------------------

## Experience Context

Hut4Devs begins with a broader collaboration problem:

> **Fellows and interns who share everyday responsibilities already
> support and depend on one another, but much of that collaboration
> happens informally, making commitments, contributions, repayments,
> judgment, and trust difficult to coordinate, verify, and carry forward
> over time.**

The current design challenge is:

> **How might we help fellows and interns coordinate shared
> responsibilities, peer support, and repayments in a way that builds
> trust, starting with accommodation?**

Accommodation remains the first proving ground.

The deeper opportunity is to help people practice:

- Responsibility.
- Accountability.
- Truthful communication.
- Sound judgment.
- Careful recommendation.
- Leadership.
- Fair management.
- Mutual support.
- Recovery after mistakes.

The product should not merely record transactions.

It should create an environment in which repeated real-world actions can
help people learn whom to trust, how much to trust, when to say no, when
to give another person an opportunity, and how to become more
trustworthy themselves.

------------------------------------------------------------------------

## Experience North Star

A successful Hut4Devs experience should allow a member to say:

> **I understand what I am responsible for. I can deal directly with
> other members without unnecessary gatekeepers. If trust is uncertain,
> we have ways to reason about it together. I can support others or
> receive support with clear expectations. My privacy and dignity are
> respected. My judgment carries responsibility. Mistakes can be
> repaired. Over time, our actions create meaningful trails of trust.**

------------------------------------------------------------------------

## Direct Relationships First

The default Hut4Devs relationship should be:

``` text
Person A
   ↕
Person B
```

Not:

``` text
Person A
   ↓
Coordinator
   ↓
Person B
```

A member should not normally need a coordinator, administrator, or other
third party to approve an ordinary peer interaction.

If A trusts B and both understand the agreement, they should be able to
act directly.

``` text
A trusts B
    ↓
Terms are clear
    ↓
Both consent
    ↓
Action happens
    ↓
Trail is recorded
```

Third parties should enter only when the people involved **choose** to
introduce them or when a genuinely necessary governance, safety, legal,
or dispute process requires it.

This keeps Hut4Devs decentralized at the human level even before
considering any technical architecture.

------------------------------------------------------------------------

## Who We Are Designing For

### Fellows and Interns

Primary community members who may need to:

- Understand responsibilities.
- Meet accommodation obligations.
- Support peers.
- Receive temporary support.
- Borrow and repay.
- Give gifts.
- Contribute toward another member's responsibility.
- Vouch for another person's reliability.
- Decline to vouch.
- Repair a missed commitment.
- Build a meaningful history of participation.

### Borrowers

A borrower needs:

- A dignified way to request or accept support.
- Clear loan terms.
- An expected repayment period.
- Visibility into outstanding balances.
- Partial repayment.
- Appropriate reminders.
- Privacy over detailed debt history.
- A route back to good standing after resolving difficulty.

### Lenders and Supporters

A supporter needs:

- Clear information about the requested support.
- Freedom to say yes or no.
- Freedom to request vouches when trust is insufficient.
- Ability to limit how much risk they accept.
- Clear repayment expectations.
- Relevant risk warnings.
- Confidence that support is being represented correctly as a loan,
  gift, or contribution.

### Vouchers

A voucher is a member who chooses to place some of their own judgment
behind another member.

A voucher needs to be able to say:

- I know this person well enough to vouch.
- I do not know this person well enough.
- I trust this person only within a certain amount or scope.
- I trust this person for this type of commitment but not another.
- I am unwilling to vouch at this time.

Vouching should never be reduced to casual praise.

### Roommates and Peer Groups

Groups provide context and relationships, not automatic authority over
individual members.

A room, lodge, cohort, technical team, or other community cluster may
create a useful environment for discovering support and requesting
vouches.

Membership in a group should not automatically expose private financial
history.

### Coordinators

Coordinators may exist where useful, particularly around accommodation
administration or community operations.

Their role is **optional and supporting**, not the default gateway
between members.

### Contributors and Maintainers

People building Hut4Devs are also part of its collaboration culture.

The product should eventually allow technical contribution, mentorship,
maintenance, and responsible community participation to form their own
appropriate trails of trust.

------------------------------------------------------------------------

## User Roles Are Fluid

Hut4Devs should describe current relationships and actions rather than
permanently classify people.

``` text
Today                         Tomorrow

Borrower        ───────────→  Supporter
Supporter       ───────────→  Borrower
New Fellow      ───────────→  Mentor
User            ───────────→  Contributor
Contributor     ───────────→  Maintainer
Voucher         ───────────→  Person needing a vouch
Supported Peer  ───────────→  Supporting Peer
```

A person who needs help today may be the person others rely on tomorrow.

A mistake should create an opportunity for correction and learning, not
a permanent identity.

------------------------------------------------------------------------

## Core User Needs

| Need               | User question                                              |
|--------------------|------------------------------------------------------------|
| **Clarity**        | What exactly am I agreeing to?                             |
| **Responsibility** | What am I currently responsible for?                       |
| **Status**         | What have I completed and what remains?                    |
| **Timing**         | When is this commitment expected to be completed?          |
| **Flexibility**    | Can I fulfill part now and complete the rest later?        |
| **Support**        | Can someone help me without unnecessary bureaucracy?       |
| **Judgment**       | If I am unsure about someone, whose judgment do I trust?   |
| **Vouching**       | How strongly am I willing to stand behind this person?     |
| **Meaning**        | Is this support a loan, gift, or contribution?             |
| **Privacy**        | Who can see sensitive information about me?                |
| **Consent**        | Can I approve or decline access to detailed history?       |
| **Recovery**       | Can I rebuild trust after a missed commitment?             |
| **Recognition**    | Can responsible participation become meaningfully visible? |
| **History**        | What actually happened over time?                          |

------------------------------------------------------------------------

## Experience Principles

1. **Direct relationships first.**
2. **Clarity before commitment.**
3. **Intent must be explicit.**
4. **A vouch is measured responsibility, not praise.**
5. **Support must remain voluntary.**
6. **People may decline to vouch without penalty.**
7. **Transparency needs privacy boundaries.**
8. **Consent must be understandable and specific.**
9. **Warnings should inform rather than automatically control.**
10. **Human judgment remains important.**
11. **Accountability should not become humiliation.**
12. **Recovery must be designed into the experience.**
13. **Trust should remain contextual rather than becoming one universal
    score.**
14. **Technology should stay in the background.**

A central guardrail is:

> **Vouch power should guide decisions, not control people.**

------------------------------------------------------------------------

## Accommodation as the First Experience

Accommodation creates a real environment where responsibility, timing,
payment, support, and trust already intersect.

``` text
Accommodation responsibility
            ↓
Understand amount and timing
            ↓
Can meet responsibility?
       ┌────┴────┐
       │         │
      YES      NO / PARTLY
       │         │
       │      Use available funds
       │      or seek peer support
       │         │
       └────┬────┘
            ↓
Payment / contribution / loan / gift
            ↓
Clear agreement
            ↓
Action recorded
            ↓
Outstanding responsibility?
       ┌────┴────┐
       │         │
      NO        YES
       │         │
Complete      Continue,
              repay,
              seek support,
              or repair
```

------------------------------------------------------------------------

## Core Journey Map

The broader experience can be understood as:

``` text
NEED
A responsibility or difficulty appears
        ↓
UNDERSTAND
Member sees what is needed, how much,
why, and by when
        ↓
DECIDE
Can I handle this directly?
        ↓
   ┌────┴────┐
   │         │
  YES        NO
   │         │
   │      SEEK SUPPORT
   │         ↓
   │    Direct trusted peer?
   │      ┌──┴──┐
   │     YES    NO
   │      │      │
   │      │   Optional vouching
   │      │      ↓
   │      │   Supporter evaluates
   │      │   amount and judgment
   │      └──┬───┘
   │         ↓
   └────→ AGREEMENT
             ↓
          ACTION
             ↓
        TRAIL CREATED
             ↓
        Commitment active?
          ┌──┴──┐
         NO    YES
          │      │
        CLOSE  TRACK
                 ↓
            Difficulty?
              ┌──┴──┐
             NO    YES
              │      │
           Continue REPAIR /
                    renegotiate /
                    repay
                       ↓
                     CLOSE
```

This map should guide later interface design without assuming every
journey needs the same screens or participants.

------------------------------------------------------------------------

## Journey Example: Accommodation Support

Consider a fellow with an accommodation responsibility of **₦66,000**.

The fellow currently has **₦40,000**.

``` text
Accommodation responsibility: ₦66,000
                 ↓
Available now: ₦40,000
                 ↓
Remaining need: ₦26,000
                 ↓
Part payment recorded
                 ↓
Fellow seeks ₦26,000 support
                 ↓
Potential supporter decides:
Do I trust this person directly?
          ┌──────┴──────┐
         YES            NOT ENOUGH
          │                 │
          │          Request optional vouches
          │                 │
          └────────┬────────┘
                   ↓
             Support decision
                   ↓
          Loan / Gift / Contribution
                   ↓
             Terms made clear
                   ↓
             Support provided
                   ↓
              Trail recorded
                   ↓
          If loan → repayment journey
                   ↓
        Repaid / repaired / converted
              to gift by lender
                   ↓
                  Close
```

No coordinator is required for the ordinary relationship.

------------------------------------------------------------------------

## Peer Support Types

### Loan

Support provided with an expectation of repayment.

The agreement should record:

- Amount.
- Date received.
- Expected repayment date or time range.
- Partial repayments.
- Outstanding balance.
- Current state.

### Gift

Support intentionally provided without an expectation of repayment.

A genuine gift must not later become debt.

### Contribution

Support toward another member's responsibility without necessarily
creating a borrower-lender relationship.

The product must make these meanings explicit before confirmation.

------------------------------------------------------------------------

## Responsible Vouching

When a potential supporter does not know a borrower well enough, the
supporter may ask other trusted members to vouch.

Example:

``` text
A wants to lend to B
        ↓
A does not know B well enough
        ↓
A trusts the judgment of C, D, and E
        ↓
A requests vouches
        ↓
C, D, and E respond independently
        ↓
A reviews their judgments
        ↓
A decides whether and how much to lend
```

C, D, and E are **not coordinators**.

They are not approving B's request on behalf of the platform.

They are placing their own judgment behind B for a defined situation.

A remains responsible for the final lending decision.

------------------------------------------------------------------------

## Vouch Exposure Levels

A vouch should not always be binary.

A person may reasonably believe:

> I trust this member, but not for the entire requested commitment.

For a financial commitment, a voucher may choose a defined exposure
level.

An initial model to explore is:

``` text
No Vouch
25% Vouch
50% Vouch
100% Vouch
```

If B requests **₦100,000**:

- A 25% vouch means the voucher is comfortable standing behind roughly
  ₦25,000 of that commitment.
- A 50% vouch represents confidence around ₦50,000.
- A 100% vouch represents willingness to stand behind the full requested
  amount.

These percentages represent **judgment exposure**, not ownership of the
debt and not an automatic guarantee to repay the borrower’s obligation.

The exact meaning and legal implications require further validation
before implementation.

------------------------------------------------------------------------

## Vouch Power

Hut4Devs may eventually represent a member's demonstrated quality of
judgment through **Vouch Power**.

Vouch Power is not intended to mean:

> This person is better than another person.

It means something closer to:

> **When this member chooses to place their judgment behind someone, how
> reliably has that judgment aligned with subsequent outcomes in
> comparable contexts?**

Vouch Power may strengthen when a member:

- Vouches thoughtfully.
- Uses appropriate limits.
- Avoids exaggerating another person's capacity.
- Makes judgments that repeatedly prove reasonable.
- Communicates uncertainty rather than pretending certainty.

It may weaken when a member repeatedly makes careless or exaggerated
vouches.

The product should reward **accuracy of judgment**, not constant
optimism.

Someone who frequently says:

> I cannot responsibly vouch for this.

may demonstrate better judgment than someone who says yes to everyone.

------------------------------------------------------------------------

## Example: Tiered Vouch Outcome

Suppose B requests **₦100,000** and states an expected repayment period.

Three members respond:

``` text
C → 25% vouch
D → 50% vouch
E → 100% vouch
```

Assume that by the expected date B has repaid only **25%** of the
commitment.

The system should not mechanically declare everyone right or wrong.

But the outcome provides evidence:

- C's limited judgment was consistent with the amount successfully
  honored.
- D's judgment was more optimistic than the observed outcome.
- E's full-confidence judgment was significantly more optimistic.

This may affect future contextual Vouch Power proportionally.

However, before adjusting judgment history, the system should consider
relevant evidence such as:

- Whether the repayment period has genuinely ended.
- Whether an agreed extension exists.
- Whether partial repayment was communicated.
- Whether an external event materially changed the commitment.
- Whether the lender changed the terms.
- Whether a dispute remains unresolved.

Vouching should teach careful judgment, not create blind algorithmic
punishment.

------------------------------------------------------------------------

## Vouching as Leadership Practice

Responsible vouching can become a practical leadership exercise.

A member learns to distinguish:

``` text
Friendship       ≠ Evidence
Confidence       ≠ Capacity
Good intention   ≠ Reliable execution
Technical skill  ≠ Financial reliability
Popularity       ≠ Trustworthiness
Recommendation   ≠ Casual praise
```

A member may truthfully say:

> This person is technically capable, but I do not know enough about
> their repayment reliability to vouch financially.

Or:

> I would vouch for this person up to ₦25,000, but not ₦100,000.

Or:

> I know this person's character well, but I cannot judge their ability
> to complete this technical task.

This is not disloyalty.

It is responsible judgment.

Over time, Hut4Devs can encourage fellows and interns to become more
analytical, truthful, careful, and accountable when their words
influence decisions affecting other people.

------------------------------------------------------------------------

## Preventing Score Creep

Vouching creates a serious design risk: a useful contextual signal could
gradually become a universal social-credit score.

Hut4Devs should explicitly resist this.

### No Universal Human Score

There should not be one number claiming to represent a person's overall
worth, character, or trustworthiness.

### Trust Must Be Contextual

Examples may include:

- Financial repayment judgment.
- Technical delivery.
- Collaborative reliability.
- Mentorship.
- Community responsibility.

Strong evidence in one context should not automatically become authority
in every other context.

### No Automatic Exclusion

Low Vouch Power should not automatically ban someone from opportunities
unrelated to that context.

### Explainability

Meaningful changes in Vouch Power should be understandable.

### Repairability

Judgment can improve.

Repeated responsible decisions should allow a member to rebuild
contextual Vouch Power.

### No Popularity Contest

Vouch Power should not increase merely because many people like someone.

### No Wealth Advantage

A wealthy member should not automatically appear more trustworthy
because they can participate in larger financial commitments.

### No Forced Vouching

Declining to vouch should not reduce a member's standing.

The governing principle remains:

> **Vouch power should guide decisions, not control people.**

------------------------------------------------------------------------

## Overdue Obligations and Not Advisable

When an expected repayment period passes with an outstanding balance,
the loan becomes overdue.

If another member attempts to make a new ordinary loan to that borrower,
Hut4Devs should provide a prominent warning:

> **⚠️ Not Advisable**
>
> This member currently has an overdue lending obligation. Review the
> available lending context before deciding whether to continue.

The warning should not automatically prohibit the transaction.

The prospective lender may know something the platform does not.

They may decide:

- Not to proceed.
- To reduce the amount.
- To request vouches.
- To request access to relevant debt history.
- To proceed despite the risk.

The final voluntary decision remains with the lender.

------------------------------------------------------------------------

## Consent-Based Debt History

Detailed debt history should not automatically be exposed.

If a prospective lender requests it:

``` text
Lender requests relevant history
              ↓
Borrower receives request
              ↓
What will be shared is explained
              ↓
       Borrower decides
         ┌────┴────┐
         │         │
      DECLINE    APPROVE
         │         │
History stays   Relevant history
private         becomes visible
                   ↓
             Lender decides
```

Consent should answer:

- Who is requesting access?
- What information will be shown?
- Why is it relevant?
- What decision is it supporting?

------------------------------------------------------------------------

## Debt-to-Gift Conversion

A lender may intentionally release some or all of a borrower's repayment
obligation.

``` text
Loan
 ↓
Outstanding debt
 ↓
Lender intentionally converts amount
 ↓
Gift
 ↓
Repayment obligation removed
for converted amount
```

The borrower should be notified and the trail should preserve what
happened.

The reverse must not occur:

``` text
Gift → Debt  ✗
```

A gift cannot later be retroactively turned into debt.

------------------------------------------------------------------------

## Room, Group, and Community Context

Hut4Devs may contain nested communities over time:

``` text
Individual
   ↓
Room / Close Peer Group
   ↓
Lodge / Local Group
   ↓
Cohort / Program Community
   ↓
Wider Hut4Devs Community
```

These groups may help members:

- Discover peers.
- Coordinate shared responsibilities.
- Request support.
- Find people whose judgment they trust.
- Participate in relevant discussions.

But hierarchy should not automatically mean authority.

A larger group should not automatically gain access to information
belonging to smaller groups or individuals.

Visibility must remain purposeful and bounded.

------------------------------------------------------------------------

## Optional Coordinators

A coordinator may help with:

- Accommodation administration.
- Resolving operational confusion.
- Facilitating a dispute when invited or required.
- Communicating shared responsibilities.
- Supporting community processes.

But coordinators should **not** become routine approval gates for:

- Lending.
- Borrowing.
- Gifting.
- Contributions.
- Vouching.
- Repayment.

The normal experience remains peer-to-peer.

------------------------------------------------------------------------

## Trust Without Public Shaming

Hut4Devs should distinguish states from identities.

``` text
STATUS                         IDENTITY

"This loan is overdue."   ≠   "This person is bad."

"Payment is incomplete."  ≠   "This person is irresponsible."

"A vouch was inaccurate." ≠   "This person has bad character."

"Risk exists."            ≠   "Nobody should help this person."
```

The system should make consequences visible without humiliating people.

------------------------------------------------------------------------

## Recognition and Character Development

Hut4Devs may eventually recognize constructive patterns such as:

- Honoring commitments.
- Communicating before a commitment fails.
- Repaying consistently.
- Making careful vouches.
- Refusing to exaggerate another person's ability.
- Supporting peers responsibly.
- Mentoring.
- Contributing code.
- Maintaining community infrastructure.
- Repairing mistakes.

Recognition should reinforce the idea that trust is built through
repeated actions.

It should not imply:

> **More money = more character.**

Nor:

> **Higher score = better human being.**

The deeper ambition is developmental.

While fellows and interns are still learning and growing together, the
platform can provide feedback that encourages stronger habits of:

- Truthfulness.
- Accountability.
- Leadership.
- Management.
- Judgment.
- Communication.
- Reliability.

------------------------------------------------------------------------

## Failure, Repair, and Recovery

The system should assume that people and technology will sometimes fail.

Possible situations include:

- A payment fails.
- Connectivity drops.
- A transaction remains pending.
- A member cannot repay on time.
- A voucher overestimated someone's capacity.
- A lender and borrower disagree about what happened.
- A member communicated late.
- A technical record and application state disagree.
- A user loses access to a device or wallet.

A good recovery experience should explain:

1. What happened.
2. What did not happen.
3. What is currently expected.
4. Whether money moved.
5. What evidence exists.
6. What can be corrected.
7. What the user can safely do next.

Recovery may include:

- Repayment.
- Partial repayment.
- Renegotiated timing.
- Clarification.
- Dispute resolution.
- Debt-to-gift conversion by the lender.
- Rebuilding Vouch Power through better future judgment.

The goal is accountable repair rather than permanent punishment.

------------------------------------------------------------------------

## Important Experience States

Possible responsibility states:

``` text
Upcoming
Due
Partially Fulfilled
Fulfilled
Overdue
Resolved
```

Possible loan states:

``` text
Proposed
Accepted
Active
Partially Repaid
Repaid
Overdue
Converted to Gift
Resolved
```

Possible vouch states:

``` text
Requested
Declined
25% Vouch
50% Vouch
100% Vouch
Expired
Outcome Observed
Under Review
```

Possible consent states:

``` text
Not Requested
Requested
Approved
Declined
Expired / No Longer Relevant
```

These remain product hypotheses until validated.

------------------------------------------------------------------------

## Accessibility and Practical Constraints

The experience should be tested against the actual environment of
fellows and interns.

Research should consider:

- Mobile-first usage.
- Lower-cost Android devices.
- Intermittent connectivity.
- Mobile data cost.
- Readability.
- Accessibility needs.
- Wallet familiarity.
- Web3 familiarity.
- Transaction confirmation time.
- Device loss.
- Account recovery.

Users should not need to understand blockchain terminology to understand
ordinary responsibilities, support, vouching, or repayment.

------------------------------------------------------------------------

## Experience Questions to Validate

### Direct Relationships

- Are members comfortable conducting support directly without a
  coordinator?
- When do they genuinely want a third party involved?

### Vouching

- Do members understand the difference between recommending and
  vouching?
- Are 25%, 50%, and 100% useful levels?
- Would amount-based vouching be clearer than percentages?
- Should vouchers be able to add context to a vouch?
- How should a vouch expire?
- What evidence should influence Vouch Power?
- How should disputed outcomes be handled?

### Behaviour

- Does having responsibility attached to a vouch make recommendations
  more thoughtful?
- Could vouching damage friendships or create unhealthy pressure?
- How do we protect members who decline to vouch?

### Repayment

- How do borrowers currently agree on repayment periods?
- What counts as reasonable communication when repayment will be late?
- When should a loan become overdue?

### Privacy

- Which parts of a trust trail should be private?
- What should a prospective lender know before requesting detailed
  history?
- Does consent feel genuinely optional?

### Character Development

- What kinds of feedback actually help young professionals improve?
- How do we encourage responsibility without pretending software can
  fully measure character?
- How do we distinguish evidence from interpretation?

------------------------------------------------------------------------

## Explicitly Out of Scope

### Partnership and Investment Pools

Hut4Devs is **not currently designing pooled investment, profit-sharing,
group investment, or return-generating partnership products**.

Although such models may be technically possible, they introduce a
substantially different purpose, risk profile, governance burden, and
potentially regulated financial activity.

Including them now would distract from the current vision:

> **Helping fellows and interns coordinate shared responsibilities, peer
> support, repayments, judgment, and trust.**

They should therefore remain outside the present product scope.

### Universal Reputation or Social Credit

Hut4Devs should not attempt to produce a universal score representing a
person's worth or character.

### Mandatory Third-Party Approval

Ordinary peer support should not require a coordinator or central
approver.

### Public Debt Exposure

Detailed debt histories should not become public community records.

------------------------------------------------------------------------

## What This Document Does Not Decide

This document intentionally does not decide:

- The mathematical formula for Vouch Power.
- Exact Vouch Power increases or decreases.
- Whether percentages or amount-based vouches are ultimately better.
- Whether any vouch creates legal financial liability.
- Exact lending limits.
- Exact reminder schedules.
- Whether every trail belongs on-chain.
- Which records are public or private at the infrastructure level.
- The final wallet experience.
- The final interface.
- Smart contract architecture.
- Tokens.
- Exact reward points or badge thresholds.
- Final governance rules.

Those decisions should follow research, product definition, privacy
analysis, governance work, and technical design.

The next document,
[`05_PAYMENT_AND_TRUST_TRAILS.md`](05_PAYMENT_AND_TRUST_TRAILS.md), can
build on this experience by defining how responsibilities, payments,
loans, repayments, gifts, vouches, consent events, and other meaningful
actions become trustworthy trails without turning Hut4Devs into a
surveillance or scoring system.

------------------------------------------------------------------------

### Build. Pay. Support. Thrive. 🐜
