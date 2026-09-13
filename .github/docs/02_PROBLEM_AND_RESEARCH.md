# Problem and Research

> **Understanding the accommodation payment experience before designing
> the solution.**

## Purpose of This Document

This document captures the problem space that Hut4Devs is being designed
around.

Its purpose is to separate:

- What has been **observed** in the current accommodation payment
  experience.
- What we can reasonably **infer** from those observations.
- What still requires **research and validation**.
- What people appear to **need**, without prematurely deciding which
  technology or feature must solve it.

Hut4Devs should not begin with blockchain, wallets, smart contracts,
badges, or dashboards.

It should begin with the people experiencing the problem.

------------------------------------------------------------------------

## Table of Contents

- [Research Context](#research-context)
- [Current Accommodation Payment
  Experience](#current-accommodation-payment-experience)
- [Observed Pain Points](#observed-pain-points)
- [Stakeholders](#stakeholders)
- [Existing Community Behaviours](#existing-community-behaviours)
- [Current Payment Journey](#current-payment-journey)
- [Where the Journey Breaks Down](#where-the-journey-breaks-down)
- [Symptoms and Possible Root
  Causes](#symptoms-and-possible-root-causes)
- [Emerging Research Insights](#emerging-research-insights)
- [Needs, Not Features](#needs-not-features)
- [Opportunity Areas](#opportunity-areas)
- [Assumptions to Validate](#assumptions-to-validate)
- [Research Questions](#research-questions)
- [Evidence Still Needed](#evidence-still-needed)
- [Design Challenge](#design-challenge)
- [Research Principle](#research-principle)

------------------------------------------------------------------------

## Research Context

Hut4Devs grows from the accommodation payment experience of interns and
fellows participating in structured learning, internship, and
technology-development programs.

Accommodation payments can involve several moving parts:

- An intern or fellow who must meet an accommodation obligation.
- Funds that may arrive through a stipend, bank account, payment
  platform, personal income, family support, or peer support.
- Roommates who may share accommodation responsibilities.
- Accommodation coordinators or managers who need to know who has paid.
- Program stakeholders who may need reports or visibility into
  accommodation status.
- Payment evidence that must be collected and verified.
- Different payment dates and financial circumstances across members.

The difficulty is therefore not simply moving money from one person to
another.

It involves **timing, verification, coordination, record keeping,
accountability, privacy, and human relationships**.

------------------------------------------------------------------------

## Current Accommodation Payment Experience

A typical accommodation payment process may involve the following:

1. An intern expects or receives funds.
2. An accommodation payment becomes due.
3. The intern makes a payment through an available payment channel.
4. The intern obtains evidence of the payment, often a screenshot or
    receipt.
5. Payment information is submitted through a form, message, email, or
    other channel.
6. A coordinator or manager reviews the evidence.
7. The amount, payer, room, month, or other details may need to be
    cross-checked.
8. Missing or unclear payments require follow-up.
9. Records may then be transferred into another spreadsheet, form,
    report, or tracking system.
10. The same process may repeat during the next payment cycle.

This creates work for both the person paying and the person verifying
the payment.

------------------------------------------------------------------------

## Observed Pain Points

| Pain point                     | Current experience                                                                                   | Consequence                                                                      |
|--------------------------------|------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| **Repeated form filling**      | Members repeatedly provide names, amounts, rooms, months, bank details, and related information.     | Repetition, wasted time, and opportunities for inconsistent data.                |
| **Screenshot-based proof**     | Screenshots or receipts are used as evidence of payment.                                             | Evidence can be difficult to verify and may be edited, reused, lost, or deleted. |
| **Manual verification**        | Coordinators manually inspect and cross-check payment evidence.                                      | Administrative workload increases as the number of members grows.                |
| **Different payment channels** | Members may receive or send money through different banks, programs, platforms, or personal sources. | There is no single payment experience or record source.                          |
| **Irregular payment dates**    | Funds may arrive early, late, or not at the expected time.                                           | A uniform payment deadline may not match each member's actual cash flow.         |
| **Scattered records**          | Relevant information may exist across forms, chats, emails, receipts, and spreadsheets.              | Reconstructing a complete payment history becomes difficult.                     |
| **Temporary shortages**        | Accommodation may become due before expected funds arrive.                                           | Members may need short-term help to avoid falling behind.                        |
| **Informal peer support**      | Members already lend, contribute, gift, and repay money among themselves.                            | Valuable support exists, but expectations and records may remain informal.       |
| **Repeated follow-up**         | Missing or unclear payments require reminders and individual communication.                          | Both coordinators and members spend time resolving payment status.               |
| **Weak auditability**          | There may be no single trusted history of what happened over time.                                   | Disputes, reporting, and historical verification become harder.                  |

These pain points should continue to be tested rather than treated as
permanently settled facts for every accommodation community.

------------------------------------------------------------------------

## Stakeholders

### Interns and Fellows

They are responsible for meeting accommodation obligations while
managing the timing and availability of their funds.

They may need to know what is due, when it is due, make full or partial
payments, demonstrate payment, understand balances, receive support when
temporarily short, and preserve privacy and dignity.

### Roommates

Roommates may share accommodation conditions and may already support one
another informally.

They may need relevant awareness of shared obligations, clear privacy
boundaries, voluntary support mechanisms, and protection from public
humiliation during financial difficulty.

### Accommodation Coordinators and Managers

They need reliable information to administer accommodation, including
confirming payments, identifying outstanding obligations, resolving
unclear records, following up where necessary, and producing reports.

The objective of Hut4Devs is not to make managers the central product
goal. Their needs matter because they are part of the payment ecosystem,
while the design challenge remains centered on improving the
accommodation payment experience through transparency, verifiability,
and collaboration.

### Developers and Contributors

Developers build and maintain the infrastructure. They need a clearly
understood real-world problem, product requirements grounded in user
needs, open-source contribution structures, and technical decisions that
serve the problem rather than dictate it.

### Program and Accommodation Stakeholders

Institutes, accommodation providers, sponsors, or related stakeholders
may require appropriate reporting or confirmation. Their information
needs must be balanced against member privacy.

------------------------------------------------------------------------

## Existing Community Behaviours

One of the most important observations behind Hut4Devs is that
collaboration does not need to be invented.

It already happens.

Members may:

- Lend money to one another.
- Borrow when expected funds are delayed.
- Repay after receiving funds.
- Make partial repayments.
- Contribute toward a roommate's payment.
- Gift money without expecting repayment.
- Remind one another about obligations.
- Coordinate within rooms.
- Help peers solve temporary financial problems.

This behaviour suggests that the accommodation payment experience is not
purely individual. It already contains a layer of **interdependence**.

The design opportunity is not simply, “How do we make each person pay
independently?”

It may also be, “How do we support the collaboration that already exists
while making expectations, records, privacy, and accountability
clearer?”

The deeper collaboration model is documented in
[`01_COLLABORATION.md`](01_COLLABORATION.md).

------------------------------------------------------------------------

## Current Payment Journey

``` text
Expected funds
      ↓
Funds arrive — or are delayed
      ↓
Accommodation obligation
      ↓
Member finds money to pay
      ↓
Payment is made
      ↓
Screenshot / receipt is obtained
      ↓
Form / message / email is submitted
      ↓
Coordinator manually verifies
      ↓
Record is updated
      ↓
Missing or unclear?
   ┌──────┴──────┐
   │             │
  NO            YES
   │             │
Complete      Follow-up
                 ↓
          More messages /
          more evidence /
          more checking
```

When funds are delayed, another journey may occur:

``` text
Payment is due
      ↓
Member is temporarily short
      ↓
Ask roommate / fellow / friend
      ↓
Loan, contribution, or gift
      ↓
Accommodation payment is made
      ↓
Informal promise or expectation
      ↓
Repayment later — if applicable
```

These journeys may currently exist in different places with little
connection between them.

------------------------------------------------------------------------

## Where the Journey Breaks Down

### Before Payment

A member may not have received expected funds, may be uncertain about
the amount due, or may need temporary assistance.

### During Payment

Different payment channels and part-payment situations can make the
process inconsistent.

### After Payment

Making the payment does not necessarily complete the process. The member
may still need to capture proof, fill another form, submit identifying
information, wait for verification, and respond to follow-up questions.

### During Verification

The coordinator must determine whether submitted evidence corresponds to
the correct person, amount, room, period, and obligation.

### During Peer Support

A peer loan or gift may solve the immediate problem while creating new
questions: Was it a loan or gift? When is repayment expected? What
remains? What happens when repayment is late? Who should see the
history?

### Over Time

Repeated cycles create historical records across multiple systems. The
longer the process continues, the harder it may become to reconstruct a
trustworthy history.

------------------------------------------------------------------------

## Symptoms and Possible Root Causes

| Symptom                                   | Possible underlying cause to investigate                                            |
|-------------------------------------------|-------------------------------------------------------------------------------------|
| People repeatedly fill forms              | Member information and payment obligations are not persistently connected.          |
| Screenshots are required                  | The payment event and verification system are disconnected.                         |
| Managers manually verify payments         | There may be no trusted machine-verifiable payment record linked to the obligation. |
| Members pay at different times            | Income and stipend timing varies between people.                                    |
| Records become scattered                  | Different stages use separate communication and record-keeping tools.               |
| Members borrow informally                 | Payment deadlines and personal cash flow do not always align.                       |
| Repeated reminders are necessary          | The process may depend heavily on manual communication.                             |
| Payment disputes are difficult to resolve | There may be no shared, trusted history of events.                                  |

These are **hypotheses**, not final root-cause conclusions.

------------------------------------------------------------------------

## Emerging Research Insights

### Payment Is Only One Part of the Experience

The broader experience includes:

#### **Prepare → Pay → Prove → Verify → Record → Follow Up**

Improving only the payment step may leave most frustration untouched.

### Timing Matters

A member can be willing to pay and still be unable to pay at a
particular moment because expected funds have not arrived.

> **Late payment does not automatically mean unwillingness to pay.**

### Proof and Payment Are Disconnected

When a person must manually take a screenshot and send it elsewhere, the
payment event and proof system are separate.

### Collaboration Already Exists

Peer lending, gifting, contribution, and repayment reflect behaviours
that already occur. The research question is how much structure users
actually want around those behaviours.

### Transparency Must Have Boundaries

> **Verifiable does not have to mean visible to everyone.**

### Scale Changes the Problem

Processes manageable for a small group may become burdensome as members,
rooms, payments, and reporting periods increase.

------------------------------------------------------------------------

## Needs, Not Features

| Instead of saying                     | Express the underlying need                                                                        |
|---------------------------------------|----------------------------------------------------------------------------------------------------|
| “We need blockchain.”                 | **I need payment records I can trust and verify.**                                                 |
| “We need a dashboard.”                | **I need to understand payment status quickly.**                                                   |
| “We need smart contracts.”            | **I need agreed rules to be applied consistently.**                                                |
| “We need badges.”                     | **I want positive, reliable community behaviour to be recognized.**                                |
| “We need wallet integration.”         | **I need a safe and practical way to make and identify payments.**                                 |
| “We need lending features.”           | **I need a clear way to give or receive temporary support when payment timing becomes difficult.** |
| “We need public transaction history.” | **I need appropriate evidence without exposing unnecessary private information.**                  |
| “We need reminders.”                  | **I need to know what is due and act before it becomes a problem.**                                |

------------------------------------------------------------------------

## Opportunity Areas

- **Reduce repetition:** persist relevant member and accommodation
  information.
- **Connect payment and verification:** reduce dependence on separate
  screenshot workflows.
- **Support irregular cash flow:** explore part payments, delayed funds,
  and temporary shortages.
- **Structure existing peer support:** clarify loans, gifts,
  contributions, and repayments without rigid surveillance.
- **Improve shared awareness:** support relevant roommate visibility
  while protecting privacy.
- **Create a trusted history:** make important events reconstructable
  without searching multiple channels.
- **Reduce administrative work:** explore safer automation for
  verification, tracking, reminders, and reporting.
- **Preserve human discretion:** warn and inform without removing
  compassionate, context-aware decisions.

------------------------------------------------------------------------

## Assumptions to Validate

- Interns consider repeated payment forms a meaningful problem.
- Screenshot verification creates significant administrative burden.
- Members would prefer payment verification to happen automatically.
- Members are comfortable using a digital wallet for accommodation
  payments.
- Members understand or can learn stablecoin-based payments.
- Peer lending happens frequently enough to justify product support.
- Borrowers want digital records of peer debts and repayments.
- Lenders want access to repayment history when evaluating risk.
- Borrowers would accept consent-based sharing of relevant debt history.
- Members value recognition for collaborative behaviour.
- Room-level accountability encourages cooperation rather than unhealthy
  pressure.
- Accommodation coordinators would trust verifiable digital records.
- The benefits of an on-chain component outweigh its complexity.
- Users understand the difference between public blockchain records and
  private application information.

------------------------------------------------------------------------

## Research Questions

### Payment Experience

- How do members currently receive money used for accommodation?
- How predictable are payment dates?
- What happens when expected funds arrive late?
- How many steps are required to complete and prove a payment?
- Which step causes the most frustration?

### Verification

- How are payments currently verified?
- How long does verification take?
- What information must be cross-checked?
- What mistakes or disputes occur?
- Which parts could safely be automated?

### Peer Support

- How often do members borrow from or lend to peers?
- Are arrangements verbal, written, or recorded in chats?
- How are repayment dates agreed?
- How common are partial repayments?
- What happens when repayment is late?
- When does a lender forgive debt or convert it into a gift?

### Privacy and Trust

- Who should see a member's payment status?
- Who should see peer lending history?
- What information is too private to share?
- Would members consent to sharing relevant debt history with a
  prospective lender?
- What makes a digital record feel trustworthy?

### Collaboration

- Do roommates coordinate around accommodation payments?
- What shared accountability feels supportive?
- What feels punitive?
- Which collaborative behaviours should be recognized?
- Could rewards unintentionally pressure people to lend or give?

### Technology

- What devices do members commonly use?
- How familiar are they with wallets, USDC, Stellar, or Web3?
- What onboarding barriers would prevent adoption?
- What happens when internet access is unreliable?
- What recovery experience is needed if wallet access is lost?

------------------------------------------------------------------------

## Evidence Still Needed

Future research should progressively collect:

- Interviews with interns and fellows.
- Interviews with accommodation coordinators.
- Interviews with roommates who have lent or borrowed money.
- Existing payment forms and their required fields.
- Examples of the current payment-proof workflow.
- Number of manual verification steps.
- Typical payment timelines.
- Frequency and causes of delayed payments.
- Frequency of part payments.
- Frequency of peer lending and gifting.
- Common repayment expectations.
- Common disputes or misunderstandings.
- Current reminder and follow-up processes.
- Privacy concerns around payment and debt information.
- User reactions to early Hut4Devs prototypes.

Where possible, future evidence should be labeled:

- **Observed**
- **Reported by users**
- **Measured**
- **Inferred**
- **Assumption**
- **Needs validation**

This helps prevent assumptions from quietly becoming “facts” as Hut4Devs
evolves.

------------------------------------------------------------------------

## Design Challenge

The research currently converges around:

> **How might we help fellows and interns coordinate shared responsibilities, peer support, and repayments in a way that builds trust, starting with accommodation?**

### “How might we”

Keeps the challenge open to exploration rather than assuming one
predetermined solution.

### “Transform”

Recognizes that the current experience requires more than a cosmetic
improvement.

### “Intern accommodation payments”

Keeps the initial problem space focused.

### “Transparent”

Members and appropriate stakeholders should be able to understand
relevant payment status and activity.

### “Verifiable”

Trust should not depend primarily on manually submitted screenshots or
unverifiable claims.

### “Built on collaboration”

The system should recognize that accommodation, development, peer
support, and community participation are not purely individual
experiences.

------------------------------------------------------------------------

## Research Principle

> **Understand before automating. Validate before scaling. Solve the
> human problem before choosing the technology.**

Hut4Devs may ultimately use Stellar, Soroban, digital assets, wallets,
databases, automation, and other technologies.

Those technologies should be selected because they solve validated
needs.

They should not become the reason the product exists.

------------------------------------------------------------------------

## Related Documentation

- [`README.md`](../README.md) — Main Hut4Devs project overview.
- [`01_COLLABORATION.md`](01_COLLABORATION.md) — Collaboration,
  interdependence, peer support, repayment, gifting, recognition, and
  community philosophy.

------------------------------------------------------------------------

### Build. Pay. Support. Thrive. 🐜
