
# User Journey

## 1. Sign up

```
Continue with GitHub
```

↓

Automatically

* creates repository
* creates initial commit
* ready

No Asset Vault yet.

---

## 2. User writes notes

```
Markdown

Folders

History

Branches (future)

Compare versions
```

Everything works.

No media.

---

## 3. User pastes first image

Instead of silently failing:

```
──────────────────────────

Images need an Asset Vault

Text lives in GitHub.

Media lives in storage you own.

Setup takes about 2 minutes.

[ Connect Asset Vault ]

──────────────────────────
```

This is excellent because the user has context.

---

# Asset Vault Wizard

I would literally make it feel like GitHub login.

## Step 1

```
Choose Provider

○ Cloudflare R2 ⭐ Recommended

○ Amazon S3

○ Backblaze B2

More coming soon...
```

Don't overwhelm users.

---

## Step 2

```
Cloudflare R2

Estimated setup:
2 minutes

We'll guide you.

[ Continue ]
```

---

## Step 3

This is where most apps fail.

Don't give documentation.

Give screenshots.

```
① Click Create Bucket

[screenshot]

Continue →
```

Next

```
② Generate API Token

[screenshot]

Continue →
```

Next

```
③ Paste API Token

──────────────

_______________

Verify

```

This dramatically lowers the barrier.

---

# Then Kairno does everything

Once user pastes token

Backend

↓

Creates bucket

↓

Checks permissions

↓

Creates

```
images/

videos/

attachments/
```

(optional)

↓

Uploads test object

↓

Deletes it

↓

Success

---

# YES

This is exactly what these providers expose.

## Cloudflare R2

Yes.

Cloudflare has REST APIs to:

* create buckets
* list buckets
* delete buckets
* upload objects
* list objects

Once you have an API token with the right scopes, you can automate bucket creation and verification.

---

## AWS S3

Yes.

AWS SDK can:

```ts
CreateBucket

PutObject

HeadBucket

DeleteObject
```

Everything you need.

---

## Backblaze B2

Also yes.

Provides APIs for:

* authorize
* create bucket
* upload
* list
* delete

---

So your flow

```
Paste Token

↓

Backend

↓

Create bucket

↓

Verify upload

↓

Done
```

is completely realistic.

---

# One thing I'd change

Don't ask users to name buckets.

Automatically create

```
kairno-assets

or

kairno-{githubUsername}

or

kairno-{uuid}
```

People don't care.

---

# Image upload pipeline

I LOVE this.

I would formalize it.

```
Paste image

↓

Editor

↓

Temporary image

↓

Save

↓

Parse Markdown

↓

Find images

↓

Upload images

↓

Receive URLs

↓

Replace markdown

↓

Commit to GitHub
```

Exactly.

---

# Even better

Don't upload immediately.

Only upload on Save.

Suppose user pastes

```
10 screenshots
```

then deletes 8.

If you upload immediately,

you uploaded unnecessary data.

Save-first is cleaner.

---

# Asset references

I'd avoid raw R2 URLs.

Instead

```
https://cdn.example.com/assets/abc123.webp
```

or

```
https://<public-domain>/abc123.webp
```

Never expose bucket URLs.

Much easier to migrate later.

---

# Here's the improvement I'd make

Suppose user changes

```
diagram.png
```

Tomorrow.

Don't upload again if identical.

Hash it.

```
SHA256(image)

↓

Already exists?

↓

Reuse
```

Content-addressed storage.

Advantages

* deduplication

* no duplicate uploads

* easier caching

Git philosophy again.

---

# What about videos?

Exactly the same.

```
Paste

↓

Temporary

↓

Save

↓

Upload

↓

Replace markdown

↓

Commit
```

Nothing changes.

---

# Future providers

The abstraction becomes

```ts
interface AssetProvider {
    verify()

    upload(file)

    delete(key)

    createBucket()

    list()

    getPublicUrl()
}
```

Then

```
CloudflareR2Provider

implements AssetProvider
```

```
S3Provider

implements AssetProvider
```

```
BackblazeProvider

implements AssetProvider
```

The editor never changes.

---

# The one thing I'd add

Since the Asset Vault becomes such a central concept, I would expose it in Settings:

```
Settings

──────────────

GitHub Repository

✓ Connected

──────────────

Asset Vault

✓ Connected

Provider

Cloudflare R2

Bucket

kairno-arjun

Storage Used

128 MB

Test Connection

Change Provider

Reconnect
```

If something goes wrong later (expired token, deleted bucket, permission change), the user has a clear place to diagnose and fix it.

---

## Suggested architectural change

Instead of replacing image references with the final public URL in the markdown, introduce a **stable Kairno asset URI**:

```md
![Architecture](kairno://asset/01K1ABCDEF...)
```

Then keep a small asset manifest (or metadata mapping) alongside the note that maps that asset ID to the provider-specific object key or URL.

Why this matters:

* You can migrate from R2 → S3 → B2 without rewriting every note.
* You can change CDN domains later without touching note content.
* You can support private buckets with signed URLs transparently.
* Your markdown stays provider-agnostic, which fits Kairno's ownership philosophy.

The renderer resolves `kairno://asset/...` to the appropriate URL at display time. It's a bit more engineering upfront, but it preserves portability and flexibility in a way that raw storage URLs never can.
