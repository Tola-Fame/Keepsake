import type { Metadata } from "next";
import LegalPage, { Contact } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms of service" };

export default function Terms() {
  return (
    <LegalPage title="Terms of service">
      <p>By using Keepsake (&quot;the site&quot;), you agree to these terms. If you do not agree, please do not use the site.</p>

      <h2>Using the site</h2>
      <p>Keepsake lets you upload photos, design photo albums, share them, and download or print them. The site is currently provided free of charge.</p>

      <h2>Your photos and albums</h2>
      <ul>
        <li>You keep ownership of the photos and content you upload.</li>
        <li>
          You give the site permission to store, process and display your content only as needed to run the site, for example to save your albums and show them to people you share them with.
        </li>
        <li>You are responsible for having the right to upload and share the photos you use, including photos of other people.</li>
      </ul>

      <h2>What is not allowed</h2>
      <ul>
        <li>Uploading content that is illegal, or that you do not have the right to use</li>
        <li>Uploading content that harasses, threatens or exploits anyone</li>
        <li>Trying to access other people&apos;s albums or accounts without permission, or disrupting the site</li>
      </ul>
      <p>We may remove content or close accounts that break these rules.</p>

      <h2>Guest uploads</h2>
      <p>If you add photos to someone else&apos;s album as a guest, the album owner can see, use and delete them in their album.</p>

      <h2>Availability</h2>
      <p>
        The site is provided &quot;as is&quot;, without guarantees. We try to keep it working and your albums safe, but we cannot promise it will always be available or free of errors. Keep your own copies of important photos, for example by downloading your album as a PDF.
      </p>

      <h2>Limitation of liability</h2>
      <p>To the extent allowed by law, the site&apos;s owner is not liable for any loss of data or other damages that result from using the site.</p>

      <h2>Changes to these terms</h2>
      <p>If these terms change, the new version will be posted on this page with a new &quot;Last updated&quot; date.</p>

      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent to <Contact />.
      </p>
    </LegalPage>
  );
}
