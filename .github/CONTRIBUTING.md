# Contributing to Hut4Devs

> **Contribute clearly. Review respectfully. Improve continuously.**

Thank you for contributing to Hut4Devs.

Hut4Devs is being built as trusted community infrastructure.
Contributions may affect documentation, user experience, trust evidence,
peer support, governance, privacy, security, and eventually production
software.

For that reason, contribution quality is not only about whether code
works.

It is also about whether the contribution preserves the principles
Hut4Devs is built on.

## 1. Before You Contribute

Please become familiar with:

- `README.md`
- `CODE_OF_CONDUCT.md`
- Relevant files in `docs/`
- `SECURITY.md` when reporting security issues

The core project principles include:

- Dignity.
- Interdependence.
- Consent.
- Contextual trust.
- Accountability.
- Repair.
- Privacy.
- Traceability.
- Responsible use of authority.

A contribution that technically works but undermines these principles
may still need revision.

## 2. Ways to Contribute

Contributions may include:

- Documentation.
- Research.
- Product thinking.
- UX improvements.
- Bug reports.
- Feature proposals.
- Code.
- Tests.
- Security improvements.
- Architecture discussions.
- Accessibility improvements.
- Developer tooling.
- Community learning materials.
- Governance improvements.

Not every contribution must be code.

Good questions, careful reviews, clear documentation, and
well-researched issues are valuable contributions.

## 3. Start With the Problem

Before choosing a technology or implementation, understand the problem
being solved.

Ask:

``` text
Who is affected?
What is happening?
Why does it matter?
What evidence do we have?
What assumptions are we making?
What could go wrong?
What is the smallest responsible improvement?
```

A recurring Hut4Devs principle is:

> **Understand before automating. Validate before scaling. Solve the
> human problem before choosing technology.**

Do not introduce a technology merely because it is available,
fashionable, required by a hackathon, or personally preferred.

## 4. Find or Create an Issue

For meaningful changes, start from a GitHub issue where practical.

An issue should make the problem understandable before implementation
begins.

A useful issue may contain:

- Problem or need.
- Context.
- Proposed scope.
- Expected outcome.
- Relevant documentation.
- Constraints.
- Open questions.
- Acceptance criteria where appropriate.

Small typo fixes or extremely minor documentation corrections may not
require a separate issue.

Large architectural, security, governance, data-model, or trust-model
changes should normally be discussed before implementation.

## 5. Claiming Work

If an issue is already assigned, avoid duplicating the work unless the
assignee or maintainers agree.

If an issue is unassigned and you want to work on it:

1. Comment that you would like to contribute.
2. Clarify any important ambiguity.
3. Wait for assignment when the issue requires coordination.
4. Create your branch after the scope is reasonably clear.

Do not claim many issues and leave them inactive.

If circumstances change, communicate so another contributor can
continue.

## 6. Repository Workflow

Hut4Devs uses a lightweight branch-and-pull-request workflow.

The stable branch is:

``` text
main
```

Contributors should work in short-lived branches and open pull requests
rather than committing feature work directly to `main`.

Typical flow:

``` text
Issue
  ↓
Branch
  ↓
Work
  ↓
Commit
  ↓
Push
  ↓
Pull Request
  ↓
Review
  ↓
Merge
```

## 7. Forking and Cloning

If you do not have direct write access, fork the repository first.

Then clone your fork.

Example:

``` bash
git clone <your-fork-url>
cd .github
```

Add the Hut4Devs repository as `upstream` if needed:

``` bash
git remote add upstream <hut4devs-repository-url>
git remote -v
```

Keep your local `main` synchronized:

``` bash
git switch main
git pull origin main
```

If you use an upstream remote:

``` bash
git fetch upstream
git switch main
git merge upstream/main
```

Use the workflow appropriate to your access level.

## 8. Branch Naming

Use short, descriptive branch names.

Recommended patterns:

``` text
docs/<topic>
feature/<topic>
fix/<topic>
test/<topic>
refactor/<topic>
chore/<topic>
security/<topic>
```

Examples:

``` text
docs/code-of-conduct
docs/governance
feature/payment-recording
fix/duplicate-payment
test/vouch-validation
security/session-revocation
```

Avoid vague names such as:

``` text
new
update
emma-branch
work
changes
test2
```

A branch should communicate its purpose.

## 9. One Concern Per Branch

Keep branches focused.

A pull request for governance documentation should not quietly include
unrelated payment code.

A bug fix should not also restructure unrelated modules unless the two
changes are genuinely connected.

Focused branches make review, rollback, and collaboration easier.

Before committing, check:

``` bash
git status
```

Before opening a pull request, inspect the files changed:

``` bash
git diff --stat main...HEAD
```

## 10. Commit Message Convention

Hut4Devs commit messages should begin with:

``` text
🛖
```

Recommended format:

``` text
🛖 <type>: <clear description>
```

Common types include:

``` text
docs
feat
fix
test
refactor
chore
security
build
ci
```

Examples:

``` text
🛖 docs: define recognition model
🛖 docs: define governance model
🛖 feat: add payment commitment creation
🛖 fix: prevent duplicate payment records
🛖 test: cover vouch confidence validation
🛖 security: revoke expired verification links
```

Write commit messages that describe what changed.

Avoid messages such as:

``` text
update
done
final
work
changes
fixed stuff
```

## 11. Keep Commits Understandable

A commit should ideally represent one coherent change.

Before committing:

``` bash
git status
git diff
```

Stage only what belongs to the commit:

``` bash
git add <specific-file>
```

Then verify again:

``` bash
git status
```

Avoid using broad staging commands when you have unrelated local work
unless you have verified the result carefully.

## 12. Documentation Standards

Documentation is part of the product.

Documentation contributions should aim for:

- Clear headings.
- Consistent terminology.
- Plain language.
- Meaningful examples.
- Context before implementation detail.
- Traceable reasoning.
- Accurate internal links.
- One top-level H1 per Markdown document.

For Markdown files, avoid multiple H1 headings.

Preferred structure:

``` markdown
Document Title

Major Section

Subsection
```

This helps avoid markdownlint errors such as `MD025/single-h1`.

Do not rewrite project principles merely for stylistic preference if
doing so changes their meaning.

## 13. Code Quality Expectations

Code should be:

- Understandable.
- Testable.
- Focused.
- Consistent with project architecture.
- Secure by default.
- Explicit about important failures.
- Reasonably documented where intent is not obvious.

Prefer the simplest design that responsibly solves the current problem.

Do not introduce unnecessary complexity merely to demonstrate technical
sophistication.

> **Complexity should be earned by real need.**

## 14. Tests

New behaviour should normally include tests appropriate to the risk.

Tests should cover:

- Expected behaviour.
- Important edge cases.
- Invalid input.
- Failure conditions.
- Regression cases for bug fixes.

Security-sensitive and trust-sensitive behaviour deserves stronger test
coverage.

A bug fix should ideally include a test that would have failed before
the fix.

## 15. Privacy and Security in Contributions

Before submitting work involving data, identity, payments, vouching,
recognition, sharing, statements, or access control, ask:

``` text
What data are we collecting?
Why is it necessary?
Who can access it?
Who can modify it?
What can be inferred from it?
What happens if it leaks?
What happens if it is wrong?
Can access expire?
Can a correction be traced?
Could this feature enable silent harm?
```

Consult:

``` text
docs/08_TECHNICAL_ARCHITECTURE.md
docs/09_PRIVACY_AND_SECURITY.md
docs/10_GOVERNANCE.md
```

Do not commit:

- Passwords.
- Private keys.
- API keys.
- Access tokens.
- Production credentials.
- Sensitive personal information.
- Real private community records used as test fixtures.

Use synthetic or anonymized data for development and examples.

## 16. Trust-Sensitive Features Require Extra Care

Features involving any of the following should receive careful design
and review:

- Payments.
- Commitments.
- Peer support.
- Vouching.
- Recognition.
- Trust trails.
- Verification statements.
- Identity.
- Governance.
- Moderation.
- Grants.
- Administrative access.

Ask whether a feature could accidentally create:

- A universal trust score.
- Public debt shaming.
- Permanent stigma.
- Cross-context profiling.
- Unnecessary surveillance.
- Clique reinforcement.
- Administrative overreach.
- Coercion.
- Forgery risk.
- Silent rewriting of trusted history.

If the answer may be yes, raise it in the issue or pull request.

## 17. Pull Request Requirements

A pull request should explain:

- What changed.
- Why it changed.
- What issue it addresses.
- Important design decisions.
- How it was tested.
- Any known limitations.
- Any privacy, security, governance, or migration concerns.

Keep the title clear and begin it with:

``` text
🛖
```

Example:

``` text
🛖 docs: define privacy and security
```

If the pull request resolves an issue, include:

``` text
Closes #123
```

in the description.

## 18. Suggested Pull Request Template

A concise pull request may use:

``` markdown
## 🛖 Summary

Briefly explain what this PR changes.

## Changes

- Change one.
- Change two.
- Change three.

## Why

Explain the problem or reason for the change.

## Testing

Explain how the change was checked.

## Notes

Add important limitations, risks, screenshots, or follow-up work if needed.

Closes #<ISSUE_NUMBER>
```

Remove sections that do not apply rather than filling them with
meaningless text.

## 19. Pull Request Scope

Prefer pull requests that can be understood and reviewed without
reconstructing several unrelated decisions.

A PR may be considered too broad if reviewers cannot answer:

``` text
What problem does this PR solve?
Which files are necessary for that problem?
What behaviour changed?
What should I test or review carefully?
```

Large work can be split into staged pull requests where doing so
preserves clarity.

## 20. Review Culture

Code review is collaboration, not combat.

Reviewers should:

- Review the contribution, not the contributor.
- Explain important concerns.
- Distinguish required changes from suggestions.
- Ask questions when intent is unclear.
- Avoid ridicule.
- Recognize good reasoning.
- Consider project principles, not only syntax.

Contributors should:

- Treat review comments as discussion, not personal attack.
- Ask for clarification.
- Explain intentional trade-offs.
- Make requested changes where justified.
- Push back respectfully when they disagree.
- Resolve conversations only when the underlying concern is addressed.

Strong technical disagreement is allowed.

Personal disrespect is not.

## 21. Review Labels and Language

Where practical, reviewers may distinguish comments such as:

``` text
required:
suggestion:
question:
security:
privacy:
governance:
nit:
```

This helps contributors understand which comments block merge and which
are optional improvements.

The exact notation may evolve with the team's workflow.

## 22. Approval and Merge

A pull request should be merged only when:

- Its scope is understood.
- Required review concerns are resolved.
- Relevant checks pass.
- Important documentation is updated.
- Security or privacy concerns are addressed where applicable.
- The branch does not contain unintended files.

Protected branch rules should be used as the project matures.

No contributor should merge merely to bypass unresolved legitimate
review.

## 23. Merge Conflicts

If your branch falls behind `main`, synchronize carefully.

A common workflow is:

``` bash
git switch main
git pull origin main
git switch <your-branch>
git merge main
```

Resolve conflicts intentionally.

Do not blindly accept one side of a conflict when both versions contain
meaningful work.

After resolving:

``` bash
git status
git add <resolved-files>
git commit
```

Then run relevant checks again before pushing.

## 24. After a Pull Request Is Merged

Return to `main`:

``` bash
git switch main
git pull origin main
```

Delete the local branch when it is no longer needed:

``` bash
git branch -d <branch-name>
```

Delete the remote branch if appropriate:

``` bash
git push origin --delete <branch-name>
```

A clean repository reduces accidental work on stale branches.

## 25. Reporting Bugs

A useful bug report should include:

- What you expected.
- What happened.
- Steps to reproduce.
- Environment information where relevant.
- Logs or screenshots when safe.
- Whether the problem is consistent or intermittent.

Do not include sensitive credentials or private user information in
public bug reports.

If the issue is a security vulnerability, follow `SECURITY.md` instead
of opening a public issue.

## 26. Proposing Features

Feature proposals should begin with the human or system problem.

Avoid starting with:

> "We should use technology X."

Prefer:

> "Users currently experience problem Y. Here is the evidence, impact,
> and proposed outcome."

Useful proposals may include:

- User or stakeholder.
- Problem.
- Current workaround.
- Evidence.
- Desired outcome.
- Risks.
- Alternatives.
- Open questions.

Implementation can be discussed after the problem is understood.

## 27. Architecture Changes

Significant architecture changes should be discussed before large
implementation work begins.

Where appropriate, record major decisions in an Architecture Decision
Record.

An ADR may include:

``` text
Title
Status
Context
Decision
Alternatives considered
Consequences
Date
```

Architecture changes should preserve the principle:

> **Architecture is not the technology list. It is the structure that
> determines what the technology is allowed to do.**

## 28. Dependencies

Before adding a dependency, consider:

- Why it is needed.
- Whether the standard library or existing dependencies already solve
  the problem.
- Maintenance quality.
- Security history.
- License compatibility.
- Project activity.
- Size and complexity.
- Replacement cost.

Avoid unnecessary dependency growth.

## 29. Breaking Changes

Breaking changes should be intentional and clearly documented.

Where relevant, include:

- What breaks.
- Who is affected.
- Migration steps.
- Compatibility strategy.
- Rollback considerations.

Do not silently change trusted data meaning, API semantics, or
governance behaviour.

## 30. Accessibility and Inclusion

Contributions should consider whether people with different devices,
network conditions, abilities, experience levels, and economic
constraints can reasonably use the result.

Where applicable, consider:

- Mobile use.
- Low-bandwidth environments.
- Clear language.
- Keyboard access.
- Screen-reader compatibility.
- Readable interfaces.
- Accessible error messages.
- Avoiding unnecessary resource requirements.

Hut4Devs should not assume ideal hardware or connectivity.

## 31. Community Research and Learning Contributions

Hut4Devs may include public or internal learning resources such as:

- Articles.
- Videos.
- Audio.
- Stories.
- Guides.
- Illustrated examples.
- Reflection prompts.

These materials may teach principles beyond the platform.

The boundary is:

> **Share principles. Protect people.**

Do not expose private community cases, sensitive records, or
identifiable personal difficulties merely to make educational content
more compelling.

## 32. Conduct While Contributing

All contributors must follow `CODE_OF_CONDUCT.md`.

In particular:

- Respect disagreement.
- Do not retaliate against review.
- Do not use seniority as a weapon.
- Do not shame inexperienced contributors.
- Do not pressure people into unpaid work.
- Do not expose private information.
- Do not fabricate evidence.
- Do not use contribution history as a universal measure of personal
  worth.

Contribution should build both software and community trust.

## 33. Maintainer Responsibility

Maintainers are responsible for more than merging pull requests.

They should:

- Protect project direction.
- Keep contribution pathways understandable.
- Review fairly.
- Avoid favoritism.
- Explain significant decisions.
- Manage access carefully.
- Encourage new contributors.
- Protect security and privacy.
- Avoid allowing stale authority to become permanent entitlement.
- Help preserve institutional knowledge.

> **A role grants responsibility before it grants privilege.**

## 34. When You Are Unsure

If you are uncertain whether a proposed change fits Hut4Devs:

1. Describe the problem.
2. Explain your proposed outcome.
3. Identify the uncertainty.
4. Ask in the relevant issue or discussion.
5. Avoid building a large solution before the question is clarified.

Questions asked early are cheaper than corrections made late.

## 35. Contribution Checklist

Before opening a pull request, check:

``` text
[ ] I understand the problem this change addresses.
[ ] My branch contains only related changes.
[ ] I reviewed git status and the final diff.
[ ] My commit messages follow Hut4Devs conventions.
[ ] I updated relevant documentation.
[ ] I added or updated tests where appropriate.
[ ] I did not commit secrets or sensitive personal data.
[ ] I considered privacy and security implications.
[ ] I considered trust and governance implications where relevant.
[ ] I ran available checks or linters.
[ ] My PR explains what changed and why.
[ ] I linked the relevant issue where applicable.
[ ] I followed the Code of Conduct.
```

## 36. Our Contribution Standard

Hut4Devs should be a project where a first-time contributor can learn,
an experienced contributor can challenge assumptions, and a maintainer
can protect quality without becoming a gatekeeper.

We value contributions that are:

``` text
CLEAR
   +
FOCUSED
   +
TESTED
   +
RESPONSIBLE
   +
REVIEWABLE
   +
HUMAN-CENTERED
   ↓
TRUSTWORTHY OPEN-SOURCE WORK
```

The closing principle is:

> **Leave the project easier to understand, safer to use, and stronger
> for the next contributor than you found it.**
