# Keepsake setup guide

You don't need to write or change any code. Every step is clicking and copying in your web browser.

The guide has four parts:

| Part | What you get | Time |
|---|---|---|
| 1. Put the site online | A working website. People can make, download and print albums. Albums are saved in each visitor's own browser. | 5 min |
| 2. Add storage | A place to keep photos and albums online. | 5 min |
| 3. Google sign-in | People can sign in with Google. Albums are saved online and can be shared, and guests can add photos. | 10–15 min |
| 4. Email sign-in (optional) | People can sign in with a link sent to their email. | 15 min + waiting |
| 5. Google Photos button (optional) | People can add photos straight from Google Photos. Needs Part 3. | 10 min |
| 6. Print orders and your team | Customers can order printed books. Your team manages orders and vendors at `/admin`. Needs Parts 2 and 3 (or 4). | 5 min |

Parts 2 and 3 work together. "Sign in" only appears on the site once storage **and** at least one sign-in method (Google or email) are set up.

---

## Part 1: Put the site online

1. Go to **https://vercel.com** and click **Sign Up** (or **Log In**). Choose **Continue with GitHub** and use the same GitHub account that holds the Keepsake repository (Tola-Fame).
2. On your Vercel dashboard, click **Add New…** then **Project**.
3. Find **Keepsake** in the list and click **Import**.
   - If Keepsake isn't listed, click **Adjust GitHub App Permissions**, allow access to the Keepsake repository, then come back.
4. Don't change any settings. Click **Deploy**.
5. Wait about two minutes. When you see "Congratulations", click the picture of your site to open it.

The site is now live. Its address looks like `keepsake-xxxx.vercel.app`. You can find it any time on the project page under **Domains**.

---

## Part 2: Add storage for photos and albums

Do these inside your Keepsake project on Vercel.

### 2a. Photo storage

1. Open your Keepsake project and click **Storage** in the **left-hand menu**. On a phone or narrow window, tap the menu icon (☰) first to show that menu.
   - Can't find it there? Go back to your main Vercel dashboard (click your name or team at the top left) and look for **Storage** in its left-hand menu.
2. Click **Create Storage** (it may say **Create Database** or **Connect Database**), then choose **Blob** and click **Continue**.
3. **Important:** choose **Public** access. Private storage will not work with this site, and this can't be changed later.
4. Name it `keepsake-photos`.
5. Click **Create**. When asked, connect it to the Keepsake project with all environments ticked (Production, Preview, Development).

### 2b. Album database

1. Still in **Storage**, click **Create Storage** again and choose **Neon** (it may be listed as Postgres or Serverless Postgres).
   - If Neon isn't listed, open the **Marketplace** (in the dashboard's left-hand menu, or at vercel.com/marketplace), search for **Neon**, and click **Install**.
2. Accept the terms, pick the **Free** plan and the region closest to you, then click **Create**.
3. Connect it to the Keepsake project with all environments ticked.

Nothing changes on the site yet. Continue to Part 3.

---

## Part 3: Google sign-in

### 3a. Create a Google sign-in key

1. Go to **https://console.cloud.google.com** and sign in with your Google account.
2. At the top, click the project picker, then **New Project**. Name it `Keepsake` and click **Create**. Make sure it is selected afterwards.
3. In the search bar, type **Google Auth Platform** and open it. Click **Get started**.
   - App name: `Keepsake`
   - User support email: your email
   - Audience: **External**
   - Contact email: your email
   - Agree to the policy and click **Create**.
4. In the left menu, click **Clients**, then **Create client**.
   - Application type: **Web application**
   - Name: `Keepsake`
   - Under **Authorized redirect URIs**, click **Add URI** and paste your site address with this ending:
     `https://YOUR-SITE.vercel.app/api/auth/callback/google`
     (replace `YOUR-SITE.vercel.app` with your real address from Part 1)
   - Click **Create**.
5. A box shows a **Client ID** and a **Client secret**. Keep this page open; you'll copy both in the next step.
6. In the left menu, click **Branding** and fill in:
   - **Application home page:** `https://YOUR-SITE.vercel.app`
   - **Application privacy policy link:** `https://YOUR-SITE.vercel.app/privacy`
   - **Application terms of service link:** `https://YOUR-SITE.vercel.app/terms`
   - **Authorized domains:** `YOUR-SITE.vercel.app`
   - Leave **App logo** empty. Uploading a logo makes Google review your app first, which can take weeks.
   - Click **Save**.
7. In the left menu, click **Audience** and click **Publish app**. Without this, only people you add as "test users" can sign in.

### 3b. Give the key to your site

1. Back on Vercel, open your Keepsake project, then **Settings** → **Environment Variables**.
2. Add these two. For each one, type the **Key**, paste the **Value**, and click **Save**:

   | Key | Value |
   |---|---|
   | `AUTH_GOOGLE_ID` | the Client ID from Google |
   | `AUTH_GOOGLE_SECRET` | the Client secret from Google |

3. Go to the **Deployments** tab. Click the **⋯** button next to the top deployment and choose **Redeploy**. Wait about two minutes.

Open your site. A **Sign in** button now appears at the top right. Try signing in with Google.

---

## Part 4 (optional): Email sign-in links

People type their email and get a link that signs them in. This uses a free email service called Resend.

To send sign-in emails to **anyone**, you need your own web domain (for example `yourname.com`). Without one, Resend only delivers to your own email address, which is fine for testing but not for visitors.

1. Go to **https://resend.com** and create a free account.
2. Click **Domains** → **Add Domain**, and type your domain.
3. Resend shows a few records to add. Add them in the settings of the company where you bought the domain (GoDaddy, Namecheap, Google Domains, Cloudflare and so on). Look for "DNS settings". Wait until Resend shows **Verified**, which can take from minutes to a few hours.
4. Click **API Keys** → **Create API Key**. Give it "Sending access" and copy the key.
5. On Vercel, go to **Settings** → **Environment Variables** and add:

   | Key | Value |
   |---|---|
   | `AUTH_RESEND_KEY` | the API key from Resend |
   | `AUTH_EMAIL_FROM` | `Keepsake <hello@yourdomain.com>` (use your verified domain) |

6. **Redeploy** as in Part 3b, step 3.

---

## Part 5 (optional): Google Photos button

This adds a **Google Photos** button next to "Choose photos". It uses the same Google key as Part 3. Phones don't need it, because their photo picker already includes Google Photos, but it saves computer users from downloading photos first.

1. Go to **https://console.cloud.google.com** and select your **Keepsake** project.
2. In the search bar at the top, type **Photos Picker API**, open it and click **Enable**.
3. Open **APIs & Services** → **Credentials** and click your Keepsake key (OAuth client).
4. Under **Authorized JavaScript origins**, click **Add URI** and enter your site address, e.g. `https://keepsake-xxxx.vercel.app` (no slash at the end). Add your own domain too if you have one. Click **Save**.
5. Open **Google Auth Platform** → **Data access** (it may be called **OAuth consent screen** → **Scopes**). Click **Add or remove scopes**, search for `photospicker.mediaitems.readonly`, tick it, click **Update**, then **Save**.
6. In Vercel, open your project → **Settings** → **Environment Variables**. Add the key `GOOGLE_PHOTOS` with the value `on`, then redeploy.

Good to know: until Google reviews your app, people see a "Google hasn't verified this app" warning when they connect Google Photos. To remove it, go to **Google Auth Platform** → **Verification centre** and submit the app for verification. Google may take a few days.

---

## Part 6: Print orders and your team

Customers can order printed copies of any book saved to their account. There's no online payment yet: your team confirms the price and delivery time with the customer by email before printing.

**Give your team access:**

1. In Vercel, open your project → **Settings** → **Environment Variables**.
2. Add the key `ADMIN_EMAILS`. For the value, enter the email addresses of everyone on your team, separated by commas, e.g. `ada@yourcompany.com, tunde@yourcompany.com`. Each person must sign in with exactly that email.
3. Redeploy.

**Every day:**

1. Sign in and click **Team** in the menu (or go to `/admin`).
2. **Vendors:** add each print partner once: name, contact details and notes such as prices, turnaround and the countries they ship to.
3. **Orders:** new orders appear with the status **New**. Open one to see the book, the shipping address and the customer's note.
4. Email the customer the price. Then set the status to **Confirmed**, type the price into **Price** and click **Save changes**. The customer sees the price on their **My orders** page.
5. Choose a vendor under **Vendor**. Click **Print PDF (300 DPI)** to download the print file and send it to the vendor along with the shipping address.
6. Update the status as the vendor reports back: **Printing**, then **Shipped** (add the carrier and tracking number), then **Delivered**.

Each change is recorded in the order's **History**, with who made it and when. Customers can cancel an order themselves only while it's still **New**. While an order is open, the customer can't delete that book, and its photos are kept even if the customer removes them from the book, so the print file always works.

---

## Using your own web address (optional)

On Vercel, open the project → **Settings** → **Domains** → **Add**, and follow the instructions. If you do this after Part 3, also add the new address to Google:

- Go to Google Auth Platform → **Clients** → Keepsake → **Authorized redirect URIs**.
- Add `https://yourdomain.com/api/auth/callback/google`.

---

## Contact email on the Privacy and Terms pages (optional)

The Privacy policy and Terms pages say people can contact "the site owner". To show your email address there instead, add an environment variable in Vercel (**Settings** → **Environment Variables**) with the key `CONTACT_EMAIL` and your email as the value, then redeploy.

## Printing tips

- **At home:** use **Download → Print now**. In the print window, set the scale to **Actual size** or **100%**, set margins to **None**, and choose paper that matches the album size (Letter or A4 albums fit standard paper).
- **At a print shop or online printer:** use **Download → PDF for printing**. Pages are 300 DPI, which is standard print quality. Tell the shop the page size you picked (for example 8 × 8 inches). Some shops ask for "bleed", a small extra edge that gets trimmed off. These PDFs don't include bleed. Keep important text and faces away from the very edges of pages.

---

## Good to know

- **Albums made without signing in** are saved only in that browser, on that device. Clearing browser data deletes them. After signing in, click the cloud button on the album in **My albums** to move it into the account.
- **Guest uploads:** in an album, click **Share**, turn on the link, then turn on **Let guests add photos**. Send the link to guests. Their photos appear in your **Photos** tab with their names.
- **Costs:** Vercel, Neon and Resend all have free plans with usage limits. Check each company's pricing page as your site grows. Vercel's free "Hobby" plan is for personal, non-commercial use only. If you plan to charge money or run this as a business, Vercel requires a paid plan.
- **Changes need a redeploy:** after adding or changing anything under **Environment Variables**, redeploy (Part 3b, step 3) for it to take effect.

## If something goes wrong

**First, open your site's setup check page:** `https://YOUR-SITE.vercel.app/setup`. It shows which parts are connected and what to fix, without showing any passwords or keys.

| What you see | What to do |
|---|---|
| No "Sign in" button | Check that Blob storage and Neon are both connected (Part 2), at least one sign-in method is added (Part 3 or 4), and you redeployed. |
| Google says "redirect_uri_mismatch" | The address in Google's **Authorized redirect URIs** must match your site exactly, starting with `https://` and ending with `/api/auth/callback/google`. |
| Google says "Access blocked" or only you can sign in | Publish the app (Part 3a, step 7). |
| Google won't let you publish ("branding incomplete") | Fill in the Branding page (Part 3a, step 6) and click Save. |
| Sign-in emails don't arrive | Check that the domain shows **Verified** in Resend and that `AUTH_EMAIL_FROM` uses that domain. Check the spam folder. |
| No **Google Photos** button | Check that Google sign-in works (Part 3), `GOOGLE_PHOTOS` is set to `on`, and you redeployed. |
| Google Photos says "This app is blocked" or shows an error about origins | Add your site address under **Authorized JavaScript origins** (Part 5, step 4) and enable the Photos Picker API (Part 5, step 2). |
| "This page is for the Keepsake team" at `/admin` | Add that person's email to `ADMIN_EMAILS` (Part 6) and redeploy. The email must match the one they sign in with. |
| Photo uploads fail after signing in | Make sure the Blob store was created with **Public** access. If it's private, delete it and create a new public one (Part 2a), then redeploy. |
