# CI / Release setup

| Workflow | Trigger | What it does |
| --- | --- | --- |
| `ci.yml` | every push to any branch, every PR | install → `verify` (or `test` + `build`, or `vite build`). Check name: **Build** |
| `release.yml` | GitHub Release **published** | build gate (same `ci.yml`) → **Publish to npm**, only after the build passes. |
| `pages.yml` | push to `main`, or manual **Run workflow** | `verify` → `build-storybook` → **Deploy Storybook to GitHub Pages**. |

No token lives in the repo. The npm token is a secret on the `npm-publish` environment.

## 1. Create the npm token

1. npmjs.com → avatar → **Access Tokens** → **Generate New Token** → **Granular Access Token**.
2. Packages and scopes: **Read and write**, limited to `@devopsnext/starterkit-badge-component`
   (or the `@devopsnext` scope). Set an expiry.
3. If your npm account uses 2FA for publishing, tick **Bypass two-factor authentication** (needed for CI).
4. Copy the token. You see it only once.

## 2. Create the `npm-publish` environment (holds the token)

1. GitHub repo → **Settings** → **Environments** → **New environment** → name: `npm-publish` → **Configure environment**.
2. **Deployment branches and tags** → **Selected branches and tags** → **Add deployment branch or tag rule** →
   Ref type **Tag**, pattern `v*`. (Releases run on the tag, so a branch-only rule would block them.)
3. Optional: **Required reviewers** → add yourself if you want to approve each npm publish manually.
4. **Environment secrets** → **Add environment secret** → Name `NPM_TOKEN`, Value: the token from step 1.

## 3. GitHub Pages (Storybook)

1. **Settings** → **Pages** → **Build and deployment** → Source: **GitHub Actions**.
2. **Settings** → **Environments** → `github-pages` → **Deployment branches and tags** → allow branch `main`.
3. Merge to `main` (or **Actions** → **Pages** → **Run workflow**). A release is not needed.

Site: https://thinktalentservice-ai.github.io/starterkit-badge-component/

## 4. Block merges unless the build passes

Push once so the **Build** check exists, then:

1. **Settings** → **Rules** → **Rulesets** → **New ruleset** → **New branch ruleset**.
2. Name `main`, Enforcement **Active**, Target branches → **Include default branch**.
3. Tick **Require a pull request before merging**.
4. Tick **Require status checks to pass** → **Add checks** → `Build` (source: GitHub Actions).
   Tick **Require branches to be up to date before merging**.
5. Tick **Block force pushes**. **Create**.

## 5. Cutting a release

1. Bump `version` in `package.json`, merge to `main`.
2. **Releases** → **Draft a new release** → tag `v<version>` (must equal `package.json` version, or the build fails) → **Publish release**.
3. Mark it **pre-release** to publish under npm dist-tag `next` instead of `latest`.
4. Re-running a release whose version is already on npm skips the npm step instead of failing.
