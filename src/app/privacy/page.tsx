import type { Metadata } from "next";
import LegalPage, { Contact } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy policy" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy policy">
      <p>
        This policy explains what information Keepsake (&quot;the site&quot;) collects when you make photo albums, how it is used, and the choices you have.
      </p>

      <h2>Albums made without an account</h2>
      <p>
        If you don&apos;t sign in, your albums and photos are saved only in your web browser on your own device. They are not sent to or stored on our servers. Clearing your browser data deletes them.
      </p>

      <h2>Information we collect when you sign in</h2>
      <ul>
        <li>
          <strong>Account details:</strong> if you sign in with Google, we receive your name, email address and profile picture from Google. If you sign in with an email link, we store your email address.
        </li>
        <li>
          <strong>Albums:</strong> the designs you make, including page layouts, text, stickers and settings.
        </li>
        <li>
          <strong>Photos:</strong> the photos you upload. Photos are resized before upload and stored in online file storage.
        </li>
        <li>
          <strong>Guest photos:</strong> if an album owner allows guest uploads, guests provide a name and the photos they choose to add.
        </li>
      </ul>
      <p>We do not collect payment information, and we do not ask for any information beyond what is listed above.</p>

      <h2>How photos and shared albums can be seen</h2>
      <ul>
        <li>Your albums are private unless you turn on sharing. When sharing is on, anyone with the share link can view the album.</li>
        <li>
          Uploaded photos are stored at long, random web addresses that are hard to guess, but they are not password-protected. Anyone who has the exact address of a photo can view it.
        </li>
        <li>Turning off sharing stops the share link from working.</li>
      </ul>

      <h2>How we use information</h2>
      <p>
        We use your information only to run the site: to sign you in, save your albums, show shared albums to people you send the link to, and send sign-in emails. We do not sell your information, show ads, or use your photos for any other purpose.
      </p>

      <h2>Cookies and browser storage</h2>
      <p>
        When you sign in, the site sets one cookie to keep you signed in. Browser storage is used to save albums made without an account and to remember the name you entered as a guest. We do not use advertising or tracking cookies.
      </p>

      <h2>Service providers</h2>
      <p>We use these companies to run the site. They process data on our behalf:</p>
      <ul>
        <li>Vercel: website hosting and photo storage</li>
        <li>Neon: database for accounts and albums</li>
        <li>Google: &quot;Sign in with Google&quot;</li>
        <li>Resend: sending sign-in emails</li>
      </ul>

      <h2>Keeping and deleting your information</h2>
      <p>
        Your albums and photos are kept until you delete them. Deleting a photo or an album from the site removes it from our storage. To delete your account and everything in it, contact <Contact />.
      </p>

      <h2>Children</h2>
      <p>The site is not intended for children under 13, and we do not knowingly collect information from them.</p>

      <h2>Changes to this policy</h2>
      <p>If this policy changes, the new version will be posted on this page with a new &quot;Last updated&quot; date.</p>

      <h2>Contact</h2>
      <p>
        Questions about this policy can be sent to <Contact />.
      </p>
    </LegalPage>
  );
}
