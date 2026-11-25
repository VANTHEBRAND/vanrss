# vanfeed: a lightweight cms self-hosted on cloudflare based on microfeed

[<img src="https://github.com/VANTHEBRAND/vanrss/blob/main/public/assets/brands/microfeed/horizontal-logo.png?raw=true" width=400 alt="microfeed: a lightweight self-hosted CMS on Cloudflare" />](https://rss.van.link/)

[![Deploy to Cloudflare Pages](https://github.com/microfeed/microfeed/actions/workflows/deploy.yml/badge.svg?event=workflow_dispatch)](https://github.com/VANTHEBRAND/vanfeed/actions/workflows/deploy.yml)
[![Email microfeed](https://img.shields.io/badge/Email-support%40microfeed.org-blue)](mailto:support@microfeed.org)
[![stability-alpha](https://img.shields.io/badge/stability-alpha-f4d03f.svg)](https://www.microfeed.org/i/introducing-microfeed-self-hosted-cms-on-cloudflare-opensource-serverless-free-uhbQEmArlC2/)

Welcome to vanfeed, a lightweight content management system (CMS) self-hosted on Cloudflare and based on microfeed.
With vanfeed, van can easily publish a variety of content such as audios, videos, photos, documents, blog posts,
and external URLs to a feed in the form of web, RSS, and JSON. It's the perfect solution for tech-savvy individuals who
want to self-host their own CMS without having to run their own servers.

vanfeed is built by VAN BRAND based on microfeed which is built by [Listen Notes](https://www.listennotes.com/) and is hosted on Cloudflare's [Pages](https://pages.cloudflare.com/),
[R2](https://www.cloudflare.com/products/r2/), [D1](https://developers.cloudflare.com/d1/), and [Zero Trust](https://www.cloudflare.com/products/zero-trust/).

If you have any questions or feedback, please don't hesitate to reach out to microfeed at support@microfeed.org. They'd love to hear from you!

**Table of contents**
<!-- TOC -->
* [vanfeed: a lightweight cms self-hosted on cloudflare](#microfeed--a-lightweight-cms-self-hosted-on-cloudflare)
  * [How it works](#how-it-works)
  * [Installation](#installation)
    * [Prerequisites](#prerequisites)
    * [Step 1. Fork the vanfeed repo to your GitHub](#step-1-fork-the-microfeed-repo-to-your-github)
    * [Step 2. Put some secrets on your forked repo](#step-2-put-some-secrets-on-your-forked-repo)
    * [Step 3. Run GitHub Action to deploy code](#step-3-run-github-action-to-deploy-code)
    * [Step 4. Make a few clicks on Cloudflare dashboard](#step-4-make-a-few-clicks-on-cloudflare-dashboard)
    * [Step 5. Done. Start publishing!](#step-5-done-start-publishing-)
    * [Bonus. Update to the latest version of vanfeed](#bonus-update-to-the-latest-version-of-microfeed)
  * [FAQs](#faqs)
  * [Contributions](#contributions)
    * [Run vanfeed on local](#run-microfeed-on-local)
  * [License](#license)
<!-- TOC -->

## How it works

Since the 1990s, a significant portion of the web has been powered by feeds.
People (and bots) publish items to a feed, and others can subscribe to that feed to receive new content.

vanfeed makes it easy for individuals to self-host their own feed on Cloudflare, including but not limited to
* a podcast feed of audios
* a blog feed of posts
* an Instagram-like feed of images (e.g., [llamacorn.listennotes.com](https://llamacorn.listennotes.com/))
* a YouTube-like feed of videos
* a personal website with custom links (e.g., [wenbin.org](https://www.wenbin.org/))
* a content curation feed of external urls
* a marketing site with updates and press coverage (e.g., [microfeed.org](https://www.microfeed.org/))
* ...

vanfeed uses Cloudflare [Pages](https://pages.cloudflare.com/) to host and run the code,
[R2](https://www.cloudflare.com/products/r2/) to host and serve media files,
[D1](https://developers.cloudflare.com/d1/) to store metadata,
and [Zero Trust](https://www.cloudflare.com/products/zero-trust/) to provide logins to the admin dashboard.
Cloudflare provides very generous free usage quotas, making it an affordable solution for personal or small business use.
While you will still need to pay for a domain name, hosting vanfeed on Cloudflare is essentially free.

With vanfeed, you can publish a variety of content such as audios, videos, photos, documents, blog posts,
and external URLs to a customizable website, an RSS feed, and a [JSON feed](https://www.jsonfeed.org/).
Check out some examples of microfeed (which vanfeed is based on) in action:
* Web feed: [https://llamacorn.listennotes.com/](https://llamacorn.listennotes.com/)
* Rss feed: [https://llamacorn.listennotes.com/rss/](https://llamacorn.listennotes.com/rss/)
* Json feed: [https://llamacorn.listennotes.com/json/](https://llamacorn.listennotes.com/json/)

vanfeed provides a simple yet powerful admin dashboard that makes it easy to add items to the feed,
upload media files, and customize web page styles. If you've used WordPress before, you'll find it familiar.

![image-6d056193c81c0b8f5de0503f5af18116](https://user-images.githubusercontent.com/1719237/209486588-00acefe0-dd51-4bfc-aed7-1f63850aa720.png)


## Installation

Roughly you'll follow these steps to install a vanfeed instance to Cloudflare:

1. Fork the [vanfeed repo](https://github.com/VANTHEBRAND/vanrss) to your personal (or organizational) GitHub account.
2. Configure a GitHub deployment environment for each Cloudflare environment.
3. Use the predefined GitHub Action in your forked repository to deploy the code to Cloudflare Pages, using the secrets from step 2.
4. Make a few clicks on Cloudflare's dashboard to set up custom domains and configure some security settings.
5. Done. Start publishing!

> We understand that not everyone is comfortable with reading documentation, so we've made it as easy as possible
> to get started with vanfeed. However, we'd love to see Cloudflare implement a "Login with Cloudflare" OAuth feature,
> which would allow for almost one-click deployment of vanfeed. In the meantime, we've tried to make the setup process
> as straightforward as possible for tech-savvy users.


### Prerequisites

* Have a Cloudflare account. If you don't have one already, you can [sign up for free at Cloudflare.com](https://dash.cloudflare.com/sign-up).
* Have a GitHub account. If you don't have one, you can [sign up for free at GitHub.com](https://github.com/signup).

### Step 1. Fork the vanfeed repo to your GitHub

Simply click on [https://github.com/VANTHEBRAND/vanrss/fork](https://github.com/VANTHEBRAND/vanrss) to fork the repository.

You may choose to modify the code in your forked repository in the future, van has customized it for himself so
you probably will have to. Simply fork the repository and keep it synced for future use.

### Step 2. Put some secrets on your forked repo

Create `production` and `preview` under **Settings → Environments** in GitHub. For `production`, set **Deployment branches and tags** to **Selected branches and tags**, add only the repository's default branch, and allow no tags. Configure this restriction in GitHub before adding credentials. It protects the environment even when a different ref contains an older or modified workflow. Restrict `preview` to branches whose authors may deploy there.

Create a separate R2 bucket for each environment. Set its CORS policy to allow your site's origin and the upload methods and headers it needs. Provision the buckets and their CORS rules through the Cloudflare dashboard once. The deployment uses object credentials scoped to that environment's existing bucket.

Configure the following in **each GitHub environment**.

| Type | Name | Value |
| --- | --- | --- |
| Secret | `PAGES_D1_DEPLOY_TOKEN` | A separate Cloudflare API token with Pages Edit and D1 Edit for the environment's account. Use separate Cloudflare accounts to isolate production when these permissions apply account-wide. |
| Secret | `R2_OBJECT_ACCESS_KEY_ID`, `R2_OBJECT_SECRET_ACCESS_KEY` | Key pair with Object Read & Write for this environment's bucket only. |
| Variable | `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_PROJECT_NAME` | Account ID and Pages project for this environment. |
| Variable | `R2_PUBLIC_BUCKET` | Explicit name of this environment's bucket. |
| Variable | `CF_ACCESS_ISSUER`, `CF_ACCESS_AUD` | Team origin and the admin Access application's audience for this environment. |

After verifying deployments with the replacement credentials, remove the old repository-wide deploy and R2 secrets and revoke their provider-side credentials. Check organization secrets granted to this repository for the same values. Keep the new secret names exclusively at the environment level. Old workflow revisions can still reference legacy repository secrets while those secrets exist.

### Step 3. Run GitHub Action to deploy code

Before deploying, configure a Cloudflare Access self-hosted application for the admin path and its descendants on every production hostname, including the Pages project domain and custom domains. Protect preview deployments, branch aliases, and deployment-specific hostnames with an admin-only Access policy as well. In each GitHub deployment environment, set the variables `CF_ACCESS_ISSUER` (the team origin, such as `https://your-team.cloudflareaccess.com`) and `CF_ACCESS_AUD` (the Access application audience for that environment). Use the same names in `.vars.toml` for a local setup. Each environment accepts assertions from its configured application only. Missing bindings keep all admin handlers closed.

Go to [Actions -> Deploy to Cloudflare Pages](../../actions/workflows/deploy.yml) and run Workflow

<img width="1606" alt="Screenshot 2022-12-04 at 4 11 19 PM" src="https://user-images.githubusercontent.com/1719237/205526856-05ea0ff4-703a-4d08-bc7f-4ae2dfc07cfe.png">

If you see the green checkmark, then the deployment is successful. And you can see a Pages project in your [Cloudflare dashboard](https://dash.cloudflare.com/sign-up/pages):


<img width="880" alt="Screenshot 2022-12-04 at 4 55 10 PM" src="https://user-images.githubusercontent.com/1719237/205527141-277620dd-586b-42dd-be97-edb7875d0705.png">

You can access the site via ${CLOUDFLARE_PROJECT_NAME}.pages.dev, for example, [https://microfeed-org.pages.dev/](https://microfeed-org.pages.dev/)

### Step 4. Make a few clicks on Cloudflare dashboard

To manage your vanfeed instance, you'll use the admin dashboard at ${CLOUDFLARE_PROJECT_NAME}.pages.dev/admin, for example, [https://microfeed-org.pages.dev/admin/](https://microfeed-org.pages.dev/admin/) (the admin dashboard needs to be protected by Cloudflare Zero Trust).

Upon accessing the admin dashboard for the first time, you'll complete the setup process by following the checklist:

<img width="1182" alt="Screenshot 2022-12-17 at 10 34 05 AM" src="https://user-images.githubusercontent.com/1719237/208216864-38a65086-77ef-4595-bc05-c87be2676e6d.png">

### Step 5. Done. Start publishing!

Once you've completed the setup process, your vanfeed instance will be ready to use.
You can add, update, or delete items from the admin dashboard.

You can also customize the appearance of the website at Settings / Custom code by editing the raw HTML and CSS:

<img width="1094" alt="Screenshot 2022-12-26 at 1 15 57 PM" src="https://user-images.githubusercontent.com/1719237/209499220-a2f7b7e4-f0b0-422a-bdf2-2ffed4b37aff.png">


### Bonus. Update to the latest version of vanfeed

vanfeed will continue to add new features and fix bugs and add fetures and bug fixes from the microfeed repo.
You may want to update your forked repo with the new code.

You'll first sync up the code in your forked repo:

<img width="488" alt="Screenshot 2022-12-26 at 7 58 32 AM" src="https://user-images.githubusercontent.com/1719237/209483973-c82e7808-0d21-4aad-ac2d-c4e80da691bc.png">

Then go to [Actions -> Deploy to Cloudflare Pages](../../actions/workflows/deploy.yml) and run Workflow to deploy the new code.



## FAQs

<details>
<summary><b>How can I track podcast / video / image downloads?</b></summary>

To track podcast, video, or image downloads with vanfeed, you can use the tracking URLs feature.
This allows you to set up third-party tracking URLs for your media files, such as those provided by Podtrac or Chartable.

To set up tracking URLs, you will need to go to Settings / Tracking URLs:
<img width="1101" alt="Screenshot 2022-12-17 at 10 19 50 AM" src="https://user-images.githubusercontent.com/1719237/208216098-1c8ab8df-eeae-4e50-96c8-4347911ee281.png">

From there, you can add the third-party tracking URLs that you want to use.
vanfeed will automatically add these URLs to the front of the URL for your media files, allowing you to track download statistics.

This is a [common practice in the podcast industry](https://lowerstreet.co/blog/podcast-tracking) and can be a useful way to monitor the performance of your content and understand how it is being consumed by your audience.

</details>


## Contributions
We welcome contributions to vanfeed!
If you have an idea for a new feature or have found a bug, please [open an issue](https://github.com/VANTHEBRAND/vanfeed/issues/new) in the repository.
If you'd like to submit a fix or new feature, please create a pull request with a detailed description of your changes.

### Run vanfeed on local

First, create a .vars.toml file in vanfeed's root directory (same level as this README.md file) and configure local settings in the .vars.toml file (Similar to [Step 2. Put some secrets on your forked repo](#step-2-put-some-secrets-on-your-forked-repo)):
```toml
# .vars.toml
CLOUDFLARE_PROJECT_NAME = "your-project-org"
CLOUDFLARE_ACCOUNT_ID = "account id"
CLOUDFLARE_API_TOKEN = 'api token'

R2_ACCESS_KEY_ID = "access key"
R2_SECRET_ACCESS_KEY = "secret key"
```

Second, run local dev server:
```bash
npm run dev
```

You should be able to access to a local vanfeed instance via http://127.0.0.1:8788/.

## License
microfeed is licensed under the [AGPL-3.0](https://github.com/microfeed/microfeed/blob/main/LICENSE) license. Please see [the LICENSE file](https://github.com/microfeed/microfeed/blob/main/LICENSE) for more information. 
vanfeed is under the same license so just read that and pretend every time it says microfeed it says vanfeed.
