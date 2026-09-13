# Hut4Devs Security Policy

> **Protect the system strongly enough to preserve trust, and protect
> the person carefully enough that security itself does not become a
> source of harm.**

## 1. Purpose

Security at Hut4Devs protects more than source code.

It protects:

- People.
- Accounts.
- Community relationships.
- Personal and financial data.
- Payment and commitment records.
- Trust trails.
- Vouching and recognition evidence.
- Verification statements.
- Administrative authority.
- Infrastructure.
- Open-source contributors.
- The integrity of decisions made using Hut4Devs.

This file explains how to report security vulnerabilities and how the
Hut4Devs project intends to receive, assess, contain, repair, and
disclose security issues.

For the broader privacy and security principles behind these practices,
see:

``` text
docs/09_PRIVACY_AND_SECURITY.md
```

This file is operational.

`docs/09_PRIVACY_AND_SECURITY.md` defines the deeper security and
privacy model.

## 2. Security Principle

Hut4Devs uses this security model:

``` text
SECURITY
   │
   ├── Protect the SYSTEM
   │      attacks, tampering, abuse, availability
   │
   ├── Protect the DATA
   │      exposure, alteration, loss, misuse
   │
   ├── Protect the EVIDENCE
   │      forgery, rewriting, false verification
   │
   └── Protect the PERSON
          dignity, consent, coercion,
          profiling, retaliation, silent harm
```

A technically secure system can still harm people.

A socially careful system can still be technically vulnerable.

Hut4Devs must account for both.

## 3. Reporting a Security Vulnerability

Please report suspected security vulnerabilities privately.

Do **not** publish sensitive vulnerability details in:

- Public GitHub issues.
- Pull requests.
- GitHub Discussions.
- Public chat channels.
- Social media.
- Public documentation.
- Screenshots containing credentials or private user data.

If GitHub Private Vulnerability Reporting is enabled for the affected
repository, use:

``` text
Security → Report a vulnerability
```

If private vulnerability reporting is not available, use an official
private Hut4Devs contact channel published by the organization or
repository.

If no private security channel is currently published, open only a
minimal public issue stating that you need a private security contact.

Do not include:

- Exploit instructions.
- Secrets.
- Personal data.
- Vulnerable endpoints.
- Proof-of-concept code.
- Screenshots exposing sensitive information.

A dedicated security contact may be added as Hut4Devs infrastructure
matures.

## 4. What to Include in a Report

A useful vulnerability report should include, where possible:

- A short vulnerability title.
- The affected repository, component, endpoint, feature, or workflow.
- The type of security problem.
- Preconditions required to reproduce it.
- Reproduction steps.
- Expected behaviour.
- Actual behaviour.
- Potential impact.
- Whether exploitation was observed.
- Whether sensitive data may have been accessed.
- Whether credentials, tokens, keys, or sessions may be affected.
- Relevant logs or screenshots with sensitive values removed.
- Suggested remediation, if known.

Please use synthetic or non-sensitive data when demonstrating an issue.

Do not access other people's private information merely to prove that a
vulnerability exists.

## 5. Responsible Testing

Security research should minimize harm.

Please:

- Test only against systems and accounts you are authorized to use.
- Use the minimum access necessary to demonstrate the issue.
- Stop testing once sufficient evidence exists.
- Avoid modifying or deleting real data.
- Avoid disrupting service availability.
- Avoid accessing unrelated records.
- Avoid persistence after proving the issue.
- Avoid automated scanning that could materially degrade the service.
- Do not attempt social engineering against community members or
  maintainers.
- Do not publicly disclose an unresolved vulnerability before
  coordinated review.

A vulnerability report does not grant permission to exceed existing
authorization.

## 6. High-Priority Security Areas

Hut4Devs treats the following areas as particularly sensitive:

- Authentication.
- Authorization.
- Session management.
- Account recovery.
- Administrative access.
- Payment integrity.
- Commitment records.
- Trust-trail integrity.
- Vouching.
- Recognition.
- Verification statements.
- QR or reference verification.
- Signature or signing-key handling.
- Identity information.
- Privacy controls.
- Consent controls.
- Data exports.
- File uploads.
- Notifications.
- Grants or sponsored-resource workflows.
- Third-party integrations.
- Infrastructure credentials.
- CI/CD.
- Dependency and supply-chain security.
- Blockchain or wallet integrations when present.

Reports affecting these areas may receive higher priority depending on
impact and exploitability.

## 7. Examples of Security Issues

Examples include, but are not limited to:

- Authentication bypass.
- Authorization bypass.
- Privilege escalation.
- Account takeover.
- Session fixation or session theft.
- Insecure account recovery.
- Exposure of private records.
- Cross-user data access.
- Insecure direct object references.
- Injection vulnerabilities.
- Remote code execution.
- Cross-site scripting.
- Cross-site request forgery where relevant.
- Server-side request forgery.
- Path traversal.
- Unsafe file upload.
- Secret exposure.
- Signing-key exposure.
- Forged verification statements.
- Tampering with trusted records.
- Silent modification of payment or trust evidence.
- QR or verification-reference reuse that validates altered content.
- Replay or duplicate-processing vulnerabilities.
- Missing integrity checks.
- Unsafe third-party integration.
- Dependency compromise.
- CI/CD compromise.
- Unauthorized administrative actions.
- Security logging that exposes sensitive data.
- Privacy leaks through notifications.
- Excessive data exposure during verification.

## 8. Social and Human Security Issues

Some Hut4Devs risks are not purely technical.

Security concerns may also involve:

- Coercive use of privileged information.
- Administrative retaliation.
- Unauthorized surveillance.
- Deliberate privacy exposure.
- Coordinated fraudulent vouching.
- Manipulation of community evidence.
- Abuse of identity or impersonation.
- Exploitation of account recovery.
- Pressure to reveal private records.
- Use of technical access outside legitimate authority.

These issues may overlap with:

``` text
CODE_OF_CONDUCT.md
docs/10_GOVERNANCE.md
```

Security reporting should focus on the vulnerability, control failure,
or abuse path.

Conduct complaints that do not involve a security vulnerability should
follow the Code of Conduct process.

## 9. Severity Is Based on Harm, Not Drama

Hut4Devs should evaluate severity using factors such as:

- Confidentiality impact.
- Integrity impact.
- Availability impact.
- Scope of affected users.
- Sensitivity of exposed information.
- Ease of exploitation.
- Required privileges.
- Persistence.
- Detectability.
- Ability to forge trusted evidence.
- Ability to impersonate another person.
- Ability to exercise unauthorized authority.
- Potential financial harm.
- Potential social or psychological harm.
- Potential for silent misuse.
- Recoverability.

A vulnerability affecting only a small number of people may still be
severe if the information or authority involved is highly sensitive.

## 10. Silent Harm Matters

Hut4Devs should pay particular attention to vulnerabilities that may
remain invisible while causing harm.

Examples include:

- An administrator silently viewing private records.
- A user accessing another person's data without obvious evidence.
- A trusted record being changed without a visible correction history.
- A verification statement disclosing more information than intended.
- A notification revealing private activity on a lock screen.
- A copied verification reference validating altered content.
- A third-party integration retaining information beyond its purpose.
- Cross-context data being combined into an unintended profile.

A security review should ask:

> **What harmful outcome could happen quietly because the system
> technically allowed it?**

## 11. Security and Privacy Boundaries

Security fixes should preserve privacy.

A remediation should not solve one security problem by unnecessarily
exposing more personal information.

Where possible:

- Collect less.
- Expose less.
- Log only what is necessary.
- Restrict access.
- Bind access to purpose.
- Allow access to expire.
- Preserve traceability.
- Protect correction history.
- Avoid universal profiling.

> **Verification is not permission to browse a person's account.**

## 12. Evidence and Record Integrity

Hut4Devs may contain records that influence trust and decisions.

Material records should not be silently rewritten.

Security-sensitive records may require preservation of:

``` text
Original state
      ↓
Requested change
      ↓
Reason
      ↓
Authorization
      ↓
New state
      ↓
Traceable history
```

Good-faith corrections should remain possible.

Integrity should not prevent repair.

> **Integrity should enable correction, not punish it.**

## 13. Anti-Forgery Expectations

Verification systems should distinguish authoritative statements from:

- Screenshots.
- Edited PDFs.
- Copied QR codes.
- Typed claims.
- Reused references.
- Altered certificates.
- Forged statements.

A verification mechanism should bind the verification result to the
protected statement and subject.

Conceptually:

``` text
Presented statement + verification reference
                  ↓
       Locate authoritative statement
                  ↓
       Verify integrity / signature
                  ↓
          Verify subject binding
                  ↓
       Compare protected details
                  ↓
 VALID / MISMATCH / REVOKED / SUPERSEDED
```

A legitimate verification reference placed on altered content should not
cause the altered content to validate.

## 14. Secrets and Credentials

Never commit:

- Passwords.
- API keys.
- Private keys.
- Access tokens.
- Session secrets.
- Database credentials.
- Cloud credentials.
- Signing keys.
- Wallet seed phrases.
- Production `.env` files.
- Private certificates.

If a secret is committed, deleting it from the latest file is not
sufficient.

Treat it as compromised.

The appropriate response may include:

1. Revoke or rotate the credential.
2. Identify exposure.
3. Remove the secret from active use.
4. Review logs where appropriate.
5. Repair repository history if necessary.
6. Document the incident without republishing the secret.

## 15. Test Data

Do not use real private community information as ordinary development
fixtures.

Prefer:

- Synthetic names.
- Synthetic payment records.
- Synthetic addresses.
- Synthetic identifiers.
- Synthetic vouches.
- Synthetic support requests.
- Anonymized datasets where justified.

Developers should not need unnecessary access to production personal
data merely to build or test features.

## 16. Logging and Monitoring

Security-relevant events may need logging.

Examples include:

- Authentication events.
- Privileged access.
- Permission changes.
- Sensitive record corrections.
- Statement generation.
- Verification failures.
- Administrative changes.
- Key rotation.
- Suspicious recovery attempts.
- Security configuration changes.

Logs are themselves sensitive.

They should not become a hidden surveillance database.

Avoid logging secrets, complete tokens, unnecessary personal data, or
full sensitive payloads.

## 17. Dependency and Supply-Chain Security

Dependencies increase the trust boundary.

Before adding or updating dependencies, consider:

- Maintenance activity.
- Security history.
- Release integrity.
- License compatibility.
- Transitive dependencies.
- Replacement difficulty.
- Necessity.

Automated dependency and vulnerability scanning should be used as the
project matures.

A dependency alert should be evaluated in context rather than ignored or
blindly upgraded without understanding compatibility.

## 18. CI/CD and Repository Security

Hut4Devs repositories should progressively use:

- Protected branches.
- Pull request review.
- Automated tests.
- Secret scanning.
- Dependency scanning.
- Restricted production credentials.
- Environment separation.
- Least-privilege automation tokens.
- Traceable deployments.
- Controlled release authority.

CI workflows should be reviewed as privileged code.

A malicious or compromised workflow can expose repository and deployment
secrets.

## 19. Administrative Access

Administrative access is a security boundary.

Administrators should receive only the privileges necessary for their
responsibilities.

High-risk actions should be attributable and reviewable where practical.

Hut4Devs should avoid:

- Shared administrator accounts.
- Permanent unnecessary privilege.
- Unlogged high-impact actions.
- Using production access for convenience.
- Privileged access without a legitimate purpose.

> **Capability is not authority.**

## 20. Account Recovery

Account recovery can bypass otherwise strong authentication.

Recovery design should consider:

- Identity assurance.
- Lost devices.
- Changed phone numbers.
- Lost email access.
- Compromised recovery channels.
- Social engineering.
- Administrator-assisted recovery.
- Recovery audit history.

Recovery should be usable without becoming the easiest path to account
takeover.

## 21. Sessions and Devices

Security design should consider:

- Shared devices.
- Lost devices.
- Public computers.
- Session expiration.
- Session revocation.
- Re-authentication for high-risk actions.
- Suspicious session changes.
- Multiple active sessions.

Sensitive information should not remain indefinitely available simply
because a user authenticated once.

## 22. Rate Limits and Abuse Controls

Resource-intensive or abuse-prone operations may require:

- Rate limits.
- Quotas.
- Duplicate protection.
- Idempotency.
- Additional verification.
- Risk-based review.
- Temporary slowdown.
- Abuse monitoring.

Exact thresholds are product and governance decisions.

Security controls should not silently become economic or social
discrimination.

## 23. Third-Party Services

Integrations may include:

- Authentication providers.
- Payment services.
- Email providers.
- Messaging platforms.
- Cloud infrastructure.
- Analytics.
- File storage.
- Identity services.
- Blockchain infrastructure.
- Wallet services.

Before integrating a third party, ask:

``` text
What data leaves Hut4Devs?
Why?
Who can access it?
How long is it retained?
Can it be deleted?
What happens if the provider is breached?
What happens if the provider becomes unavailable?
Can we replace the provider?
Are we exposing more than the feature requires?
```

Third-party convenience does not remove Hut4Devs' responsibility to
users.

## 24. Blockchain and Wallet Security

Hut4Devs may experiment with blockchain or Stellar-related capabilities.

Blockchain use does not automatically improve security.

Risks may include:

- Public permanence.
- Transaction linkability.
- Metadata exposure.
- Private-key loss.
- Wallet compromise.
- Signing confusion.
- Phishing.
- Irreversible transactions.
- Difficult correction.

Sensitive raw personal information should not be placed on-chain merely
because the technology allows it.

A preferred direction is:

``` text
Private detailed records
        ↓
Hut4Devs controlled storage
        ↓
Minimal cryptographic proof / anchor
        ↓
External verification layer
```

> **Use blockchain only where its guarantees solve a real problem better
> than simpler alternatives.**

## 25. Availability and Failure

Security includes availability.

A service failure should not create a false trust judgment.

For example, a verification service should distinguish:

``` text
Unable to verify at this time
```

from:

``` text
Invalid statement
```

Infrastructure failure is not evidence that a person is untrustworthy.

Recovery plans should consider:

- Service outages.
- Database failures.
- Dependency failures.
- Corruption.
- Accidental deletion.
- Failed deployments.
- Denial-of-service conditions.
- Backup restoration.

## 26. Backups

Backups should be:

- Protected.
- Access-controlled.
- Tested.
- Retained intentionally.
- Restorable.
- Included in privacy and deletion planning.

A backup containing sensitive information is still sensitive
information.

Recovery procedures should be tested rather than assumed.

## 27. Incident Response

A security incident may follow this general process:

``` text
Detect
  ↓
Confirm
  ↓
Contain
  ↓
Preserve evidence
  ↓
Assess affected people and systems
  ↓
Communicate appropriately
  ↓
Recover
  ↓
Repair
  ↓
Learn
```

Response should consider both technical recovery and human impact.

## 28. Security Communication

Security communication should be:

- Clear.
- Specific.
- Actionable.
- Proportionate.
- Privacy-respecting.
- Honest about uncertainty.

Affected people should be told what they reasonably need to know,
including:

- What happened.
- What may be affected.
- What actions they should take.
- What Hut4Devs has done.
- What remains uncertain.
- Where to get help.

Do not publish unnecessary personal information in incident reports.

## 29. Coordinated Disclosure

Hut4Devs encourages responsible disclosure.

When a valid vulnerability is reported, maintainers should aim to:

1. Acknowledge the report.
2. Assess severity and scope.
3. Reproduce or verify the issue.
4. Contain immediate risk where necessary.
5. Develop and test a fix.
6. Coordinate disclosure with the reporter when appropriate.
7. Notify affected users when necessary.
8. Publish a security advisory when useful.
9. Review what allowed the vulnerability to exist.

Exact response times are not promised yet because Hut4Devs is still
developing its operational security capacity.

As the project matures, formal service-level targets may be added.

## 30. Public Disclosure

Please allow maintainers a reasonable opportunity to investigate and
remediate a vulnerability before public disclosure.

Public disclosure may eventually include:

- Vulnerability summary.
- Affected versions.
- Severity.
- Impact.
- Fixed versions.
- Mitigation.
- Credits, with the reporter's consent.

Sensitive personal information, credentials, or unnecessary exploit
details should not be published.

## 31. Security Advisories

When appropriate, Hut4Devs may use GitHub Security Advisories or
equivalent mechanisms to coordinate:

- Private vulnerability discussion.
- Patch development.
- CVE coordination where applicable.
- Release preparation.
- Public disclosure.

Not every minor issue requires a formal advisory.

The mechanism should match the risk.

## 32. Supported Versions

Hut4Devs is currently under active development.

Until stable versioning and release-support policies are established,
security work should prioritize the current maintained code and active
releases.

A general initial policy is:

| Version or branch                                | Security support           |
|--------------------------------------------------|----------------------------|
| Current maintained `main` / active release       | Supported                  |
| Current development branches under active review | Best effort                |
| Historical branches and obsolete commits         | Not guaranteed             |
| Third-party forks                                | Maintained by their owners |

Individual Hut4Devs repositories may publish more specific support
policies as they mature.

## 33. Security Fixes

Security fixes should be:

- Focused.
- Reviewed.
- Tested.
- Traceable.
- Released carefully.

Where disclosure risk is high, the project may use a private remediation
workflow until a patch is ready.

Do not deliberately weaken a security fix merely to preserve insecure
historical behaviour.

Compatibility should be considered, but safety may require breaking
changes.

## 34. Security Pull Requests

Normal hardening changes that do not expose an active vulnerability may
use the standard pull-request process.

Use a branch such as:

``` text
security/<topic>
```

Example:

``` text
security/session-revocation
```

Commit example:

``` text
🛖 security: revoke expired verification sessions
```

Do not open a public pull request containing an unpatched exploitable
vulnerability before the issue has been privately reviewed.

## 35. Security Review Questions

Before merging security-sensitive work, ask:

1. What asset are we protecting?
2. Who should have access?
3. Who technically has access?
4. Are those the same people?
5. What happens if authorization fails?
6. What information could leak?
7. What could be inferred indirectly?
8. Can trusted evidence be forged?
9. Can history be silently changed?
10. Can access expire?
11. Can access be revoked?
12. Are secrets protected?
13. Are logs safe?
14. Can duplicate actions cause harm?
15. Can an administrator misuse this?
16. Can a third party expose this?
17. What happens during an outage?
18. Can the system recover?
19. Can a human mistake be corrected?
20. Could the security control itself harm or unfairly exclude people?

## 36. Out of Scope for Security Reporting

Unless they expose a real security weakness, the following should
normally use other project channels:

- Feature requests.
- General UX feedback.
- Ordinary documentation errors.
- Non-security bugs.
- Disagreement with a product decision.
- Code-style preferences.
- Conduct disputes without a security component.
- Reports based only on automated scanner output with no meaningful
  impact analysis.

If uncertain, report privately and explain why you believe there may be
a security impact.

## 37. Good-Faith Security Research

Hut4Devs values responsible security research conducted in good faith.

Good-faith research should:

- Respect authorization boundaries.
- Minimize privacy impact.
- Avoid service disruption.
- Report vulnerabilities responsibly.
- Avoid extortion or coercion.
- Avoid retaining unnecessary private information.
- Give maintainers a reasonable opportunity to respond.

A formal legal safe-harbor policy is not established by this document.

Researchers remain responsible for complying with applicable law and the
authorization boundaries of the systems they test.

## 38. Security Is a Shared Responsibility

Maintainers are responsible for security decisions, but security is not
only a maintainer task.

Contributors should:

- Avoid committing secrets.
- Review dependencies.
- Write tests.
- Question excessive permissions.
- Report suspicious behaviour.
- Protect private data.
- Follow the Code of Conduct.
- Consider abuse cases before shipping features.

Community members should be given understandable guidance about account
security, privacy, phishing, verification, and responsible sharing.

> **Do not only record responsible behaviour. Help cultivate the
> judgment required to practise it.**

## 39. Current Security Maturity

Hut4Devs is still evolving.

Not every mature security control described in this policy may exist
yet.

That is not a reason to remove the principle.

It is a reason to make the gap visible.

Security work should progressively convert these expectations into:

- Architecture.
- Code.
- Tests.
- Repository settings.
- Operational procedures.
- Monitoring.
- Incident response.
- Community education.

Claims about security should match what has actually been implemented.

> **Document the target clearly, but never pretend the target has
> already been achieved.**

## 40. Relationship to Other Hut4Devs Documents

This policy should be read alongside:

- `README.md`
- `CODE_OF_CONDUCT.md`
- `CONTRIBUTING.md`
- `docs/08_TECHNICAL_ARCHITECTURE.md`
- `docs/09_PRIVACY_AND_SECURITY.md`
- `docs/10_GOVERNANCE.md`

Their roles differ:

``` text
TECHNICAL ARCHITECTURE
What must the system guarantee?

PRIVACY AND SECURITY
What can go wrong and what principles protect against it?

SECURITY POLICY
How do we report and respond to vulnerabilities?

GOVERNANCE
Who may make and review high-impact decisions?

CODE OF CONDUCT
How should participants treat one another?

CONTRIBUTING
How should contributors work together?
```

## 41. Security North Star

Hut4Devs should evolve toward a system where:

- Sensitive information is private by default.
- Authority is not confused with technical capability.
- Access is limited by legitimate purpose.
- High-impact actions are traceable.
- Trusted evidence cannot be silently rewritten.
- Corrections remain possible and understandable.
- Verification reveals only what is necessary.
- Forged or altered statements can be detected.
- Administrative power is constrained and reviewable.
- Incidents can be investigated and repaired.
- Backups and recovery actually work.
- Security controls distinguish mistakes from abuse.
- Third-party services do not silently expand surveillance.
- Blockchain does not become an excuse for unnecessary permanence.
- Security grows with real risk.
- Human dignity remains part of the threat model.

## 42. Closing Principle

Hut4Devs is intended to become infrastructure people can rely on when
coordinating responsibilities, support, payments, evidence,
opportunities, and community relationships.

That trust must be earned technically and socially.

``` text
PEOPLE
  +
DATA
  +
EVIDENCE
  +
SYSTEMS
  +
RESPONSIBLE RESPONSE
  ↓
TRUSTWORTHY INFRASTRUCTURE
```

Our security standard is therefore:

> **Protect the system strongly enough to preserve trust, and protect
> the person carefully enough that security itself does not become a
> source of harm.**
