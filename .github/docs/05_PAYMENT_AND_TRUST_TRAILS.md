# Payment and Trust Trails

> **Turning real commitments into understandable evidence of
> responsibility — without turning Hut4Devs into a surveillance system,
> credit bureau, or social-credit platform.**

## Table of Contents

- [Purpose](#purpose)
- [Starting Principle](#starting-principle)
- [What Is a Trust Trail?](#what-is-a-trust-trail)
- [Trust Trails Are Evidence, Not
  Verdicts](#trust-trails-are-evidence-not-verdicts)
- [What Can Create a Trust Trail](#what-can-create-a-trust-trail)
- [The Core Payment Trail](#the-core-payment-trail)
- [Accommodation Payment Example](#accommodation-payment-example)
- [Part Payments](#part-payments)
- [Peer Support Trails](#peer-support-trails)
- [Loan Trail](#loan-trail)
- [Repayment Trail](#repayment-trail)
- [Gift Trail](#gift-trail)
- [Debt-to-Gift Trail](#debt-to-gift-trail)
- [Contribution Trail](#contribution-trail)
- [Vouch Trails](#vouch-trails)
- [Vouch Exposure](#vouch-exposure)
- [Evaluating a Vouch Outcome](#evaluating-a-vouch-outcome)
- [Vouch Power and Trust Evidence](#vouch-power-and-trust-evidence)
- [Overdue Obligations](#overdue-obligations)
- [The Not Advisable Signal](#the-not-advisable-signal)
- [Consent-Based History Access](#consent-based-history-access)
- [What Should Be Visible](#what-should-be-visible)
- [What Should Remain Private](#what-should-remain-private)
- [Trails Across Groups](#trails-across-groups)
- [Disputes, Corrections, and
  Context](#disputes-corrections-and-context)
- [Repair and Recovery](#repair-and-recovery)
- [Trail Integrity](#trail-integrity)
- [On-Chain and Off-Chain
  Boundaries](#on-chain-and-off-chain-boundaries)
- [Recognition from Trust Trails](#recognition-from-trust-trails)
- [Preventing Trust Trails from Becoming Social
  Credit](#preventing-trust-trails-from-becoming-social-credit)
- [Potential Trail States](#potential-trail-states)
- [Research Questions](#research-questions)
- [Explicitly Out of Scope](#explicitly-out-of-scope)
- [What This Document Does Not
  Decide](#what-this-document-does-not-decide)
- [Trust Trail North Star](#trust-trail-north-star)

------------------------------------------------------------------------

## Purpose

This document defines the product meaning of **payments** and **trust
trails** inside Hut4Devs.

It builds directly on the experience principles established in
[`04_USER_EXPERIENCE.md`](04_USER_EXPERIENCE.md):

- Direct relationships first.
- Coordinators are optional rather than default gatekeepers.
- Loans, gifts, and contributions have different meanings.
- Vouching is measured responsibility rather than casual praise.
- Trust should be contextual.
- Privacy and consent matter.
- Mistakes must be repairable.
- Evidence should guide human judgment rather than control people.

The goal is not merely to record that money moved.

The goal is to preserve enough trustworthy context for members to
understand:

- What was agreed.
- What actually happened.
- What remains unresolved.
- How people responded when circumstances changed.
- Which statements of trust were made.
- What evidence later supported or challenged those judgments.

------------------------------------------------------------------------

## Starting Principle

A payment is an event.

A commitment gives that event meaning.

A trust trail connects the two.

``` text
Money moved
     +
Why it moved
     +
What was agreed
     +
What happened afterward
     =
Meaningful trust evidence
```

A transfer by itself cannot tell Hut4Devs whether it was:

- Accommodation payment.
- Loan.
- Repayment.
- Gift.
- Contribution.
- Refund.
- Another legitimate transfer.

The product should therefore avoid treating raw transaction history as
human meaning.

------------------------------------------------------------------------

## What Is a Trust Trail?

A **Trust Trail** is a structured history of meaningful actions
connected to a responsibility, agreement, or relationship.

A trail may contain events such as:

``` text
Commitment created
        ↓
Terms accepted
        ↓
Payment made
        ↓
Part payment recorded
        ↓
Support received
        ↓
Vouch given
        ↓
Repayment made
        ↓
Terms adjusted
        ↓
Obligation completed
```

A trail should help an authorized viewer answer:

> **What happened here?**

rather than merely:

> **What transactions exist?**

A useful trail should preserve:

1. **Context** — what the action related to.
2. **Intent** — loan, gift, contribution, repayment, etc.
3. **Participants** — who was directly involved.
4. **Time** — when meaningful events occurred.
5. **Terms** — what was agreed where relevant.
6. **State** — active, partial, overdue, resolved, and so on.
7. **Evidence** — what supports the record.
8. **Consent** — what sensitive information may be viewed and by whom.
9. **Corrections or disputes** — whether the meaning of an event is
    contested.
10. **Resolution** — how the commitment eventually ended.

------------------------------------------------------------------------

## Trust Trails Are Evidence, Not Verdicts

A trust trail should record evidence without pretending that software
can fully measure character.

For example:

``` text
Evidence:
"₦25,000 of a ₦100,000 loan was repaid by the expected date."

Possible interpretation:
"The original repayment expectation was not fully met."

Bad conclusion:
"This is an untrustworthy person."
```

Similarly:

``` text
Evidence:
"A member vouched at 100% and the borrower later repaid only 25%
by the original expected date."

Possible interpretation:
"The vouch was more confident than the observed outcome."

Bad conclusion:
"This voucher has bad judgment in everything."
```

Hut4Devs should preserve the difference between **facts, contextual
signals, and human conclusions**.

------------------------------------------------------------------------

## What Can Create a Trust Trail?

Potential trail-producing actions include:

- Accommodation responsibilities.
- Accommodation payments.
- Part payments.
- Loans.
- Loan acceptance.
- Repayments.
- Gifts.
- Debt converted to gifts.
- Contributions.
- Vouches.
- Vouch declines.
- Repayment extensions.
- Consent requests.
- Consent approvals or declines.
- Disputes.
- Resolutions.
- Mentorship or technical contribution in future modules.

Not every click, message, profile view, or ordinary social interaction
should become a trust event.

A trail should exist because something meaningful happened, not because
the platform can technically record it.

------------------------------------------------------------------------

## The Core Payment Trail

A basic responsibility may produce:

``` text
Responsibility created
        ↓
Amount / purpose / period understood
        ↓
Payment initiated
        ↓
Payment succeeds
        ↓
Payment associated with responsibility
        ↓
Balance recalculated
        ↓
Trail updated
        ↓
Responsibility completed or remains active
```

The experience should distinguish:

``` text
INITIATED ≠ SUCCESSFUL ≠ SETTLED ≠ VERIFIED
```

A failed or pending payment must never be represented as completed.

------------------------------------------------------------------------

## Accommodation Payment Example

Assume a member has an accommodation responsibility of **₦66,000**.

### Full Payment

``` text
Accommodation obligation
₦66,000
    ↓
Member pays ₦66,000
    ↓
Payment verified
    ↓
Outstanding balance = ₦0
    ↓
Obligation fulfilled
```

The trust trail can show that the responsibility was fulfilled without
exposing unrelated financial activity.

### Why This Matters

The member should not need to search for screenshots, resend proof
through chats, or depend on one coordinator's spreadsheet if the payment
itself can be appropriately verified.

------------------------------------------------------------------------

## Part Payments

Suppose the same member can initially pay only **₦40,000**.

``` text
Original responsibility: ₦66,000
             ↓
Payment: ₦40,000
             ↓
Outstanding: ₦26,000
             ↓
State: Partially Fulfilled
```

The trail should preserve both progress and remaining responsibility.

Later:

``` text
Additional ₦26,000 received
             ↓
Outstanding: ₦0
             ↓
State: Fulfilled
```

The second amount may come from:

- The member.
- A peer loan.
- A gift.
- A contribution.

Those meanings should remain distinct in the trail.

------------------------------------------------------------------------

## Peer Support Trails

Peer support begins with the direct relationship.

``` text
A needs support
      ↓
B considers helping
      ↓
B trusts A directly?
   ┌────┴────┐
   │         │
  YES       NOT ENOUGH
   │         │
   │      Optional vouches
   │         │
   └────┬────┘
        ↓
Meaning selected:
Loan / Gift / Contribution
        ↓
Terms understood
        ↓
Support provided
        ↓
Relevant trail created
```

No coordinator is required for the ordinary flow.

------------------------------------------------------------------------

## Loan Trail

A loan should create an explicit commitment.

At minimum, the agreement should capture:

- Lender.
- Borrower.
- Amount.
- Date received.
- Expected repayment date or time range.
- Any agreed context relevant to repayment.
- Current outstanding balance.
- Current status.

Example:

``` text
B requests ₦30,000 from A
          ↓
A agrees
          ↓
Expected repayment:
within 30 days
          ↓
B accepts terms
          ↓
₦30,000 transferred
          ↓
Loan becomes Active
```

The platform should not silently infer a loan from a peer-to-peer
transfer.

Both parties should understand that repayment is expected.

------------------------------------------------------------------------

## Repayment Trail

A repayment trail should connect repayment to the original loan.

``` text
Original loan: ₦30,000
        ↓
Repayment 1: ₦10,000
        ↓
Balance: ₦20,000
        ↓
Repayment 2: ₦20,000
        ↓
Balance: ₦0
        ↓
Loan: Repaid
```

The trail should preserve:

- Amount repaid.
- Date.
- Remaining balance.
- Whether repayment was partial or full.
- Whether it occurred within the expected period.

Repayment history should describe what happened without turning lateness
into permanent stigma.

------------------------------------------------------------------------

## Gift Trail

A gift should be explicit.

``` text
A chooses to support B
        ↓
Support type = Gift
        ↓
B understands no repayment is expected
        ↓
Gift transferred
        ↓
Gift trail recorded
```

A gift creates no debt balance.

The platform must not later allow either party to unilaterally
reinterpret the original gift as a loan.

------------------------------------------------------------------------

## Debt-to-Gift Trail

A lender may voluntarily release some or all outstanding debt.

Example:

``` text
Original loan: ₦30,000
        ↓
Borrower repays: ₦10,000
        ↓
Outstanding: ₦20,000
        ↓
Lender converts ₦20,000 to Gift
        ↓
Outstanding: ₦0
        ↓
Loan resolved through:
₦10,000 repayment + ₦20,000 gift conversion
```

The history should not erase the original loan.

It should accurately show how the obligation was resolved.

The conversion is one-way:

``` text
Debt → Gift  ✓
Gift → Debt  ✗
```

------------------------------------------------------------------------

## Contribution Trail

A contribution is support toward a purpose without necessarily creating
repayment.

Example:

``` text
B has ₦26,000 remaining
on accommodation
        ↓
A contributes ₦5,000
        ↓
C contributes ₦3,000
        ↓
Remaining responsibility updates
```

A contribution should not automatically make A or C lenders.

The interface and trail must clearly distinguish contribution from debt.

------------------------------------------------------------------------

## Vouch Trails

A vouch is a meaningful trust statement.

It should record enough context to preserve what the voucher actually
claimed.

A vouch trail may include:

- Voucher.
- Person being vouched for.
- Context.
- Requested amount or commitment.
- Vouch exposure.
- Date.
- Relevant duration.
- Whether the vouch was accepted as part of another person's decision.
- Eventual observable outcome.

A vouch should **not** mean:

> I guarantee everything this person will ever do.

It should mean something closer to:

> **Within this defined context, this is the level of confidence I am
> willing to place behind this person.**

------------------------------------------------------------------------

## Vouch Exposure

The initial UX proposes:

``` text
No Vouch
25%
50%
100%
```

For a **₦100,000** request:

``` text
25%  → confidence around ₦25,000
50%  → confidence around ₦50,000
100% → confidence around ₦100,000
```

This is **judgment exposure**, not automatically financial liability.

Before implementation, research must determine whether users understand
percentages or whether direct amount-based vouching is clearer:

``` text
"I vouch up to ₦25,000."
```

may ultimately be more understandable than:

``` text
"I vouch 25%."
```

------------------------------------------------------------------------

## Evaluating a Vouch Outcome

Suppose:

``` text
Requested commitment: ₦100,000
Expected repayment: 60 days

C → 25% vouch
D → 50% vouch
E → 100% vouch
```

At the end of the agreed period, **₦25,000** has been repaid.

This produces evidence, not an automatic moral judgment.

The system may observe:

- C's limited confidence was broadly consistent with the amount honored
  by that point.
- D's confidence exceeded the observed repayment.
- E's full confidence exceeded it substantially.

However, evaluation should consider context before affecting any derived
trust signal:

``` text
Was an extension agreed?
Was the payment delayed externally?
Did the borrower communicate?
Is a dispute active?
Were terms changed?
Was some debt converted to a gift?
Has the original period actually ended?
```

The system should avoid punishing a voucher for circumstances the
original vouch did not reasonably claim to predict.

------------------------------------------------------------------------

## Vouch Power and Trust Evidence

**Vouch Power** is a possible future derived signal representing
demonstrated quality of judgment in a particular context.

It should be based on evidence such as:

- Appropriate vouch limits.
- Accuracy over repeated outcomes.
- Willingness to express uncertainty.
- Avoidance of careless recommendation.
- Relevant context.
- Repair after poor judgment.

It should **not** be based merely on:

- Popularity.
- Number of friends.
- Wealth.
- Frequency of saying yes.
- Social status.
- One isolated outcome.

A person who responsibly declines to vouch may be exercising excellent
judgment.

The governing rule is:

> **Vouch power should guide decisions, not control people.**

The exact formula is intentionally undefined at this stage.

------------------------------------------------------------------------

## Overdue Obligations

A loan becomes overdue when:

1. An expected repayment period was agreed.
2. That period has passed.
3. An outstanding balance remains.
4. No valid change to the agreement has superseded the original timing.

The trail should distinguish:

``` text
Active
   ↓
Partially Repaid
   ↓
Expected period ends
   ↓
Balance remains
   ↓
Overdue
```

If the parties agree to a legitimate extension before or after
difficulty arises, the trail should preserve both the original agreement
and the updated agreement.

History should not be silently rewritten.

------------------------------------------------------------------------

## The Not Advisable Signal

When a member with an unresolved overdue loan is about to receive
another ordinary loan, the prospective lender should receive:

> **⚠️ Not Advisable**
>
> This member currently has an overdue lending obligation. Review the
> available lending context before deciding whether to continue.

This is a **risk signal**, not a ban.

The lender may:

- Stop.
- Reduce the amount.
- Ask trusted peers to vouch.
- Request access to relevant debt history.
- Continue based on their own knowledge.
- Continue after acknowledging the risk.

The platform should preserve human choice while making material risk
difficult to overlook.

------------------------------------------------------------------------

## Consent-Based History Access

Detailed debt history is sensitive.

A warning that an unresolved obligation exists does not automatically
justify exposing every detail.

A lender who wants more information may request access.

``` text
Prospective lender
requests relevant history
        ↓
Borrower is notified
        ↓
System explains:
Who?
What?
Why?
        ↓
Borrower chooses
   ┌────┴────┐
   │         │
DECLINE    APPROVE
   │         │
No detail   Relevant detail
shared      temporarily available
              ↓
          Lender decides
```

The eventual design should consider whether consent access should:

- Expire automatically.
- Apply only to a particular lending decision.
- Reveal only relevant loans.
- Be revocable before the decision is completed.
- Leave a trail showing that access was requested and granted.

------------------------------------------------------------------------

## What Should Be Visible

Visibility should be based on purpose.

A member should normally be able to see their own:

- Responsibilities.
- Payments.
- Loans.
- Repayments.
- Gifts.
- Contributions.
- Vouches made.
- Vouches received where appropriate.
- Consent activity.
- Relevant disputes and resolutions.

A direct counterparty should see information necessary to understand the
shared agreement.

A prospective lender may receive limited risk information and, with
consent, relevant additional history.

A group may see appropriate shared responsibility status without
receiving every individual's financial details.

------------------------------------------------------------------------

## What Should Remain Private

Hut4Devs should not automatically expose:

- Complete wallet history.
- Unrelated transactions.
- Detailed personal debt history.
- Private explanations for hardship.
- Unrelated group activity.
- Private communications.
- Sensitive identity information.
- Every declined support request.
- Every person who declined to vouch.

A blockchain's technical visibility must not be confused with good
product privacy.

The application should minimize unnecessary exposure even where
underlying infrastructure has different visibility properties.

------------------------------------------------------------------------

## Trails Across Groups

Hut4Devs may eventually support nested contexts:

``` text
Individual
   ↓
Room / Peer Circle
   ↓
Lodge
   ↓
Cohort
   ↓
Program
   ↓
Wider Community
```

A trail created in one context should not automatically become fully
visible in every higher-level group.

For example:

- A room may need to know that a shared accommodation responsibility is
  fulfilled.
- The room does not necessarily need to know which member borrowed money
  privately to fulfill it.
- A prospective lender may need to know an overdue obligation exists.
- They do not automatically need the borrower's entire financial
  history.

Context should travel only as far as its legitimate purpose requires.

------------------------------------------------------------------------

## Disputes, Corrections, and Context

Trustworthy history cannot mean pretending records are never wrong or
contested.

A member should eventually be able to dispute:

- Incorrect amount.
- Incorrect attribution.
- Wrong support type.
- Incorrect repayment status.
- Incorrect vouch association.
- Duplicate event.
- Missing repayment.
- Incorrect overdue state.

Corrections should not secretly erase history.

A possible pattern is:

``` text
Original event
      ↓
Disputed
      ↓
Evidence reviewed
      ↓
Correction / confirmation
      ↓
Resolution attached to trail
```

This preserves integrity while allowing mistakes to be repaired.

------------------------------------------------------------------------

## Repair and Recovery

Trust trails should make improvement visible.

Examples:

``` text
Overdue
   ↓
Borrower communicates
   ↓
New terms agreed
   ↓
Repayment resumes
   ↓
Resolved
```

or:

``` text
Poor vouch judgment
   ↓
Member becomes more careful
   ↓
Uses smaller, evidence-based vouches
   ↓
Repeated outcomes align
   ↓
Contextual vouch strength rebuilds
```

A trail that records failure but cannot represent repair would create
distorted trust.

Recovery is therefore part of integrity, not an exception to it.

------------------------------------------------------------------------

## Trail Integrity

A trustworthy trail should aim for:

### Authenticity

The event should be attributable to the correct participants.

### Integrity

Recorded evidence should not be silently altered.

### Context

A payment without its purpose may be technically accurate but
practically misleading.

### Chronology

The sequence of agreements and changes should remain understandable.

### Non-duplication

The same action should not accidentally count twice.

### Appropriate Finality

Pending actions should not be presented as completed.

### Correction

Errors and disputes need visible resolution mechanisms.

### Privacy

Integrity does not require universal visibility.

------------------------------------------------------------------------

## On-Chain and Off-Chain Boundaries

Hut4Devs should not assume:

> **Trust trail = put everything on a blockchain.**

A better question is:

> **Which evidence benefits from independent verifiability, and which
> information should remain private, changeable, contextual, or
> access-controlled?**

Potentially verifiable events may include:

- Payment references.
- Commitment identifiers.
- Repayment events.
- Certain consent-safe proofs.
- Integrity anchors for records.

Potentially private or off-chain information may include:

- Personal explanations.
- Detailed debt context.
- Private messages.
- Sensitive metadata.
- Internal dispute evidence.
- Consent-restricted information.

The technical architecture document should determine implementation only
after these product boundaries are better validated.

------------------------------------------------------------------------

## Recognition from Trust Trails

Trust trails may eventually support recognition.

Examples might include evidence of:

- Consistently honoring commitments.
- Repaying support.
- Communicating and repairing responsibly.
- Making careful vouches.
- Supporting peers.
- Contributing reliably.

Recognition should summarize meaningful patterns without converting
every event into points.

A person should not be rewarded simply for:

- Moving more money.
- Lending larger amounts.
- Having greater financial capacity.
- Participating in more transactions.

Recognition should reflect **quality of participation**, not wealth or
transaction volume.

Detailed recognition rules belong in
[`07_RECOGNITION.md`](07_RECOGNITION.md).

------------------------------------------------------------------------

## Preventing Trust Trails from Becoming Social Credit

Trust trails become dangerous if evidence from limited contexts starts
controlling unrelated opportunities.

Hut4Devs should therefore maintain these boundaries:

### No Universal Score

There should be no single number representing a person's overall worth.

### Contextual Evidence

Financial repayment evidence should not automatically determine
technical competence.

Technical competence should not automatically establish financial
reliability.

### No Permanent Labels

Current states can change.

### Explainable Signals

People should understand why a warning or contextual signal exists.

### Repairable Signals

Better future behavior should matter.

### Limited Visibility

Not everyone needs access to every trail.

### No Popularity Weighting

Social popularity is not evidence of reliability.

### No Wealth Weighting

Financial capacity is not equivalent to character.

### Human Decision-Making

The system informs; people still decide where appropriate.

------------------------------------------------------------------------

## Potential Trail States

### Responsibility

``` text
Upcoming
Due
Partially Fulfilled
Fulfilled
Overdue
Resolved
Disputed
```

### Payment

``` text
Initiated
Pending
Successful
Failed
Verified
Reversed
Disputed
```

### Loan

``` text
Proposed
Accepted
Active
Partially Repaid
Repaid
Overdue
Renegotiated
Converted to Gift
Resolved
Disputed
```

### Vouch

``` text
Requested
Declined
Active
Expired
Outcome Pending
Outcome Observed
Disputed
Reviewed
```

### Consent

``` text
Not Requested
Requested
Approved
Declined
Expired
Revoked
Completed
```

These states are product hypotheses, not final implementation
requirements.

------------------------------------------------------------------------

## Research Questions

### Payments

- Which accommodation payments currently require manual proof?
- What counts as sufficient verification for users?
- How often are part payments necessary?
- Which payment failures create the most confusion?

### Loans

- How do peers currently document lending agreements?
- Are expected repayment dates usually exact or expressed as ranges?
- What constitutes a fair extension?
- What evidence matters when repayment is disputed?

### Vouching

- Do users prefer percentage vouches or explicit monetary limits?
- What do users believe they are responsible for when they vouch?
- Should vouches expire?
- Can a voucher revise or withdraw a vouch before a loan is made?
- Which outcomes should influence Vouch Power?
- How much contextual explanation is necessary?

### Research Questions on Privacy

- Is revealing the existence of an overdue obligation without details
  acceptable to users?
- What history should a borrower be able to authorize?
- How long should access last?
- What should happen after a lender finishes the decision?

### Trust

- Which events genuinely help members make better decisions?
- Which events would feel invasive if recorded?
- How can Hut4Devs distinguish evidence from interpretation in the
  interface?

### Recovery

- How should renegotiated commitments appear?
- When should an overdue warning disappear?
- How should repaired behavior affect contextual trust signals?

------------------------------------------------------------------------

## Explicitly Out of Scope

### Partnership and Investment Pools

Pooled investments, profit-sharing schemes, return-generating
partnerships, and collective investment products are outside the current
Hut4Devs vision.

The current focus remains:

> **Shared responsibilities, direct peer support, repayments,
> responsible vouching, and trails of trust.**

### Interest-Based Lending Marketplace

Hut4Devs is not currently defining a marketplace where members lend for
interest or compete for financial returns.

### Universal Credit Score

Trust trails must not become a universal credit or social score.

### Public Debt Registry

Hut4Devs should not create a publicly browsable list of members' debts.

### Automatic Guarantor Liability

A vouch does not automatically mean the voucher must repay the
borrower's debt.

Any future guarantee mechanism would be a materially different agreement
and must be designed explicitly.

### Coordinator-Controlled Payments

Ordinary peer transactions should not depend on routine coordinator
approval.

------------------------------------------------------------------------

## What This Document Does Not Decide

This document intentionally leaves several questions open:

- Exact Vouch Power mathematics.
- Whether vouch exposure should use percentages or currency amounts.
- Exact overdue grace periods.
- Exact lending limits.
- Whether a voucher can ever voluntarily assume financial liability.
- Exact data retention periods.
- Exact consent expiration rules.
- Which events will ultimately be on-chain.
- Blockchain or ledger selection.
- Smart contract design.
- Wallet architecture.
- Database architecture.
- Encryption implementation.
- Identity verification mechanisms.
- Final dispute governance.
- Exact recognition algorithms.

Those belong to research and later documentation, especially:

- [`07_RECOGNITION.md`](07_RECOGNITION.md)
- [`08_TECHNICAL_ARCHITECTURE.md`](08_TECHNICAL_ARCHITECTURE.md)
- [`09_PRIVACY_AND_SECURITY.md`](09_PRIVACY_AND_SECURITY.md)
- [`10_GOVERNANCE.md`](10_GOVERNANCE.md)

------------------------------------------------------------------------

## Trust Trail North Star

A good Hut4Devs trust trail should make it possible to say:

> **I can understand what was promised, what happened, what changed, and
> how it was resolved. I can use that evidence to make a better decision
> without pretending the platform knows everything about another
> person's character. Sensitive information remains appropriately
> protected, responsible actions become visible over time, and people
> retain the ability to learn, repair, and rebuild trust.**

The goal is not to make every person perfectly predictable.

The goal is to make **responsibility, judgment, support, and repair
easier to see and easier to practice.**

### Build. Pay. Support. Thrive. 🐜
