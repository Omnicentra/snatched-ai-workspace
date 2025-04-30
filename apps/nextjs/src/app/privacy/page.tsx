import React from 'react';
import Head from 'next/head';

const PrivacyPolicyPage = () => {
  // Extracted variables for maintainability
  const companyName = "Omnicentra Holdings LTD";
  const doingBusinessAs = "Snatched AI";
  const registrationCountry = "United Kingdom"; // Added from TermsOfUse
  const addressStreet = "71-75 Shelton Street, Covent Garden"; // Added from TermsOfUse
  const addressCity = "London"; // Added from TermsOfUse
  const addressArea = "Covent Garden"; // Added area definition
  const addressPostalCode = "WC2H 9JQ"; // Added from TermsOfUse
  const appName = "Snatched AI";
  const appDescription = "Snatched AI helps women to visualise, achieve, and track their ideal `snatched` body shape through personalised AI plans combining workouts, nutrition, body analysis, and styling tips. It's playful, empowering, and designed to feel like a confidence-boosting bestie in your pocket.";
  const contactEmail = "ola@omnicentra.com";
  const dsarLink = "https://app.termly.io/notify/d7cde1c9-673c-4d11-abed-8be485ca8cb0";
  const lastUpdatedDate = "April 29, 2025";
  const paymentProcessor1 = "Apple Pay";
  const paymentProcessor1Link = "https://www.apple.com/legal/privacy/data/en/apple-pay";
  const paymentProcessor2 = "Google Pay";
  const paymentProcessor2Link = "https://payments.google.com/payments/apis-secure/u/0/get_legal_document?ldo=0&ldt=privacynotice&ldl=en-GB";
  const dataRetentionPeriodAccount = "the period of time in which users have an account with us"; // Example
  const ukRepName = "Ola Oladapo";
  const ukRepEmail = "ola@omnicentra.com";
  const ukRepLinkedIn = "https://www.linkedin.com/in/ola-o-181937149";
  const ukRepPhone = "07445976637";
  const ukRepAddressStreet = "71-75 Shelton Street";
  const ukRepAddressArea = "Covent Garden";
  const ukRepAddressCity = "London";
  const ukRepAddressPostalCode = "WC2H 9JQ";
  const ukRepAddressCountry = "England"; // or UK
  const retentionCatB = "6 months";
  const retentionCatC = "6 months";
  const retentionCatL = "As long as the user has an account with us";
  const usStatesWithRights = "California, Colorado, Connecticut, Delaware, Florida, Indiana, Iowa, Kentucky, Maryland, Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon, Rhode Island, Tennessee, Texas, Utah, or Virginia";
  const usStatesWith3rdPartyCatList = "California, Delaware, and Maryland";
  const usStatesWith3rdPartySpecificList = "Minnesota and Oregon";
  const usStatesWithSensitiveLimit = "California";
  const usStatesWithVoiceFacialOptOut = "Florida";

  // AI Providers - make this an array for easier management if more are added
  const aiProviders = ["OpenAI", "Google Cloud AI"];

  // AI Product Functions - array for easier management
  const aiProductFunctions = ["AI insights", "Image analysis", "Image generation", "Video generation"];

  return (
    <div className="privacy_container">
      <Head>
        <title>Privacy Policy - {doingBusinessAs}</title>
        <meta name="description" content={`Privacy Policy for ${doingBusinessAs} / ${companyName}. Last updated ${lastUpdatedDate}`} />
      </Head>

      <span className="logo"></span>

      <div className="privacy_body">
        <h1 className="privacy_title">PRIVACY POLICY</h1>
        <div className="privacy_subtitle">
          Last updated {lastUpdatedDate}
        </div>

        {/* Introduction */}
        <div className={`content_section`}>
          <p className="privacy_body_text">
            This Privacy Notice for {companyName} (doing business as {doingBusinessAs}) ('<strong>we</strong>', '<strong>us</strong>', or '<strong>our</strong>'), describes how and why we might access, collect, store, use, and/or share ('<strong>process</strong>') your personal information when you use our services ('<strong>Services</strong>'), including when you:
          </p>
          <ul>
            <li>Download and use our mobile application ({appName}), or any other application of ours that links to this Privacy Notice</li>
          </ul>
          <ul>
            <li>Use {appName}. {appDescription}</li>
          </ul>
          <ul>
            <li>Engage with us in other related ways, including any sales, marketing, or events</li>
          </ul>
          <p className="privacy_body_text">
            <strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at {contactEmail}.
          </p>

          {/* Summary */}
          <h2 className="heading_1">SUMMARY OF KEY POINTS</h2>
          <p className="privacy_body_text">
            <strong><em>This summary provides key points from our Privacy Notice, but you can find out more details about any of these topics by clicking the link following each key point or by using our <a href="#toc" className="link">table of contents</a> below to find the section you are looking for.</em></strong>
          </p>
          <p className="privacy_body_text">
            <strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use. Learn more about <a href="#personalinfo" className="link">personal information you disclose to us</a>.
          </p>
          <p className="privacy_body_text">
            <strong>Do we process any sensitive personal information?</strong> Some of the information may be considered 'special' or 'sensitive' in certain jurisdictions, for example your racial or ethnic origins, sexual orientation, and religious beliefs. We may process sensitive personal information when necessary with your consent or as otherwise permitted by applicable law. Learn more about <a href="#sensitiveinfo" className="link">sensitive information we process</a>.
          </p>
          <p className="privacy_body_text">
            <strong>Do we collect any information from third parties?</strong> We may collect information from public databases, marketing partners, social media platforms, and other outside sources. Learn more about <a href="#othersources" className="link">information collected from other sources</a>.
          </p>
          <p className="privacy_body_text">
            <strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. We process your information only when we have a valid legal reason to do so. Learn more about <a href="#infouse" className="link">how we process your information</a>.
          </p>
          <p className="privacy_body_text">
            <strong>In what situations and with which parties do we share personal information?</strong> We may share information in specific situations and with specific third parties. Learn more about <a href="#whoshare" className="link">when and with whom we share your personal information</a>.
          </p>
          <p className="privacy_body_text">
            <strong>How do we keep your information safe?</strong> We have adequate organisational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorised third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Learn more about <a href="#infosafe" className="link">how we keep your information safe</a>.
          </p>
          <p className="privacy_body_text">
            <strong>What are your rights?</strong> Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information. Learn more about <a href="#privacyrights" className="link">your privacy rights</a>.
          </p>
          <p className="privacy_body_text">
            <strong>How do you exercise your rights?</strong> The easiest way to exercise your rights is by submitting a <a href={dsarLink} rel="noopener noreferrer" target="_blank" className="link">data subject access request</a>, or by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.
          </p>
          <p className="privacy_body_text">
            Want to learn more about what we do with any information we collect? <a href="#toc" className="link">Review the Privacy Notice in full</a>.
          </p>

          {/* Table of Contents */}
          <h2 className="heading_1" id="toc">TABLE OF CONTENTS</h2>
          <ol style={{ listStyleType: 'decimal', paddingLeft: '20px' }}>
            <li><a href="#infocollect" className="link">1. WHAT INFORMATION DO WE COLLECT?</a></li>
            <li><a href="#infouse" className="link">2. HOW DO WE PROCESS YOUR INFORMATION?</a></li>
            <li><a href="#legalbases" className="link">3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?</a></li>
            <li><a href="#whoshare" className="link">4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</a></li>
            <li><a href="#ai" className="link">5. DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</a></li>
            <li><a href="#sociallogins" className="link">6. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</a></li>
            <li><a href="#inforetain" className="link">7. HOW LONG DO WE KEEP YOUR INFORMATION?</a></li>
            <li><a href="#infosafe" className="link">8. HOW DO WE KEEP YOUR INFORMATION SAFE?</a></li>
            <li><a href="#infominors" className="link">9. DO WE COLLECT INFORMATION FROM MINORS?</a></li>
            <li><a href="#privacyrights" className="link">10. WHAT ARE YOUR PRIVACY RIGHTS?</a></li>
            <li><a href="#DNT" className="link">11. CONTROLS FOR DO-NOT-TRACK FEATURES</a></li>
            <li><a href="#uslaws" className="link">12. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</a></li>
            <li><a href="#policyupdates" className="link">13. DO WE MAKE UPDATES TO THIS NOTICE?</a></li>
            <li><a href="#contact" className="link">14. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</a></li>
            <li><a href="#request" className="link">15. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</a></li>
          </ol>

          {/* Section 1 */}
          <h2 className="heading_1" id="infocollect">1. WHAT INFORMATION DO WE COLLECT?</h2>
          <h3 className="heading_2" id="personalinfo">Personal information you disclose to us</h3>
          <p className="privacy_body_text">
            <strong><em>In Short:</em></strong> <em>We collect personal information that you provide to us.</em>
          </p>
          <p className="privacy_body_text">
            We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.
          </p>
          <p className="privacy_body_text">
            <strong>Personal Information Provided by You.</strong> The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:
          </p>
          <ul>
            <li>names</li>
            <li>email addresses</li>
          </ul>
          <h3 className="heading_2" id="sensitiveinfo">Sensitive Information.</h3>
          <p className="privacy_body_text">
            When necessary, with your consent or as otherwise permitted by applicable law, we process the following categories of sensitive information:
          </p>
          <ul>
            <li>health data</li>
            <li>information revealing race or ethnic origin</li>
          </ul>
          <p className="privacy_body_text">
            <strong>Payment Data.</strong> We may collect data necessary to process your payment if you choose to make purchases, such as your payment instrument number, and the security code associated with your payment instrument. All payment data is handled and stored by {paymentProcessor1} and {paymentProcessor2}. You may find their privacy notice link(s) here: <a href={paymentProcessor1Link} target="_blank" rel="noopener noreferrer" className="link">{paymentProcessor1Link}</a> and <a href={paymentProcessor2Link} target="_blank" rel="noopener noreferrer" className="link">{paymentProcessor2Link}</a>.
          </p>
          <p className="privacy_body_text">
            <strong>Social Media Login Data.</strong> We may provide you with the option to register with us using your existing social media account details, like your Facebook, X, or other social media account. If you choose to register in this way, we will collect certain profile information about you from the social media provider, as described in the section called '<a href="#sociallogins" className="link">HOW DO WE HANDLE YOUR SOCIAL LOGINS?</a>' below.
          </p>
          <p className="privacy_body_text">
            <strong>Application Data.</strong> If you use our application(s), we also may collect the following information if you choose to provide us with access or permission:
          </p>
          <ul>
            <li>
                <em>Push Notifications.</em> We may request to send you push notifications regarding your account or certain features of the application(s). If you wish to opt out from receiving these types of communications, you may turn them off in your device's settings.
            </li>
          </ul>
          <p className="privacy_body_text">
            This information is primarily needed to maintain the security and operation of our application(s), for troubleshooting, and for our internal analytics and reporting purposes.
          </p>
          <p className="privacy_body_text">
            All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.
          </p>
          <h3 className="heading_2" id="othersources">Information collected from other sources</h3>
           <p className="privacy_body_text">
                <strong><em>In Short:</em></strong> <em>We may collect limited data from public databases, marketing partners, social media platforms, and other outside sources.</em>
           </p>
           <p className="privacy_body_text">
                In order to enhance our ability to provide relevant marketing, offers, and services to you and update our records, we may obtain information about you from other sources, such as public databases, joint marketing partners, affiliate programs, data providers, social media platforms, and from other third parties. This information includes mailing addresses, job titles, email addresses, phone numbers, intent data (or user behaviour data), Internet Protocol (IP) addresses, social media profiles, social media URLs, and custom profiles, for purposes of targeted advertising and event promotion.
           </p>
           <p className="privacy_body_text">
             If you interact with us on a social media platform using your social media account (e.g. Facebook or X), we receive personal information about you from such platforms such as your name, email address, and gender. You may have the right to withdraw your consent to processing your personal information. Learn more about <a href="#withdrawconsent" className="link">withdrawing your consent</a>. Any personal information that we collect from your social media account depends on your social media account's privacy settings. Please note that their own use of your information is not governed by this Privacy Notice.
           </p>

          {/* Section 2 */}
          <h2 className="heading_1" id="infouse">2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
          <p className="privacy_body_text">
            <strong><em>In Short:</em></strong> <em>We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.</em>
          </p>
          <p className="privacy_body_text">
            <strong>We process your personal information for a variety of reasons, depending on how you interact with our Services, including:</strong>
          </p>
          <ul>
            <li><strong>To facilitate account creation and authentication and otherwise manage user accounts.</strong> We may process your information so you can create and log in to your account, as well as keep your account in working order.</li>
            {/* Add other list items if they existed in the original source */}
            <li><strong>To save or protect an individual's vital interest.</strong> We may process your information when necessary to save or protect an individual's vital interest, such as to prevent harm.</li>
          </ul>

          {/* Section 3 */}
          <h2 className="heading_1" id="legalbases">3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR INFORMATION?</h2>
          <p className="privacy_body_text">
            <em><strong>In Short:</strong> We only process your personal information when we believe it is necessary and we have a valid legal reason (i.e. legal basis) to do so under applicable law, like with your consent, to comply with laws, to provide you with services to enter into or fulfil our contractual obligations, to protect your rights, or to fulfil our legitimate business interests.</em>
          </p>

          <p className="privacy_body_text">
            <em><strong><u>If you are located in the EU or UK, this section applies to you.</u></strong></em>
          </p>
          <p className="privacy_body_text">
            The General Data Protection Regulation (GDPR) and UK GDPR require us to explain the valid legal bases we rely on in order to process your personal information. As such, we may rely on the following legal bases to process your personal information:
          </p>
          <ul>
            <li><strong>Consent.</strong> We may process your information if you have given us permission (i.e. consent) to use your personal information for a specific purpose. You can withdraw your consent at any time. Learn more about <a href="#withdrawconsent" className="link">withdrawing your consent</a>.</li>
            {/* Add other list items if they existed */}
            <li><strong>Legal Obligations.</strong> We may process your information where we believe it is necessary for compliance with our legal obligations, such as to cooperate with a law enforcement body or regulatory agency, exercise or defend our legal rights, or disclose your information as evidence in litigation in which we are involved.</li>
            <li><strong>Vital Interests.</strong> We may process your information where we believe it is necessary to protect your vital interests or the vital interests of a third party, such as situations involving potential threats to the safety of any person.</li>
          </ul>
          <p className="privacy_body_text">
             In legal terms, we are generally the 'data controller' under European data protection laws of the personal information described in this Privacy Notice, since we determine the means and/or purposes of the data processing we perform. This Privacy Notice does not apply to the personal information we process as a 'data processor' on behalf of our customers. In those situations, the customer that we provide services to and with whom we have entered into a data processing agreement is the 'data controller' responsible for your personal information, and we merely process your information on their behalf in accordance with your instructions. If you want to know more about our customers' privacy practices, you should read their privacy policies and direct any questions you have to them.
          </p>

           <p className="privacy_body_text">
            <em><strong><u>If you are located in Canada, this section applies to you.</u></strong></em>
          </p>
           <p className="privacy_body_text">
            We may process your information if you have given us specific permission (i.e. express consent) to use your personal information for a specific purpose, or in situations where your permission can be inferred (i.e. implied consent). You can <a href="#withdrawconsent" className="link">withdraw your consent</a> at any time.
           </p>
           <p className="privacy_body_text">
             In some exceptional cases, we may be legally permitted under applicable law to process your information without your consent, including, for example:
           </p>
           <ul>
            <li>If collection is clearly in the interests of an individual and consent cannot be obtained in a timely way</li>
            <li>For investigations and fraud detection and prevention</li>
            <li>For business transactions provided certain conditions are met</li>
            <li>If it is contained in a witness statement and the collection is necessary to assess, process, or settle an insurance claim</li>
            <li>For identifying injured, ill, or deceased persons and communicating with next of kin</li>
            <li>If we have reasonable grounds to believe an individual has been, is, or may be victim of financial abuse</li>
            <li>If it is reasonable to expect collection and use with consent would compromise the availability or the accuracy of the information and the collection is reasonable for purposes related to investigating a breach of an agreement or a contravention of the laws of Canada or a province</li>
            <li>If disclosure is required to comply with a subpoena, warrant, court order, or rules of the court relating to the production of records</li>
            <li>If it was produced by an individual in the course of their employment, business, or profession and the collection is consistent with the purposes for which the information was produced</li>
            <li>If the collection is solely for journalistic, artistic, or literary purposes</li>
            <li>If the information is publicly available and is specified by the regulations</li>
           </ul>

          {/* Section 4 */}
          <h2 className="heading_1" id="whoshare">4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2>
          <p className="privacy_body_text">
            <strong><em>In Short:</em></strong> <em>We may share information in specific situations described in this section and/or with the following third parties.</em>
          </p>
          <p className="privacy_body_text">
            We may need to share your personal information in the following situations:
          </p>
          <ul>
            <li><strong>Business Transfers.</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
            {/* Add other list items if they existed, like 'Affiliates', 'Business Partners' */}
            <li>
                <strong>Offer Wall.</strong> Our application(s) may display a third-party hosted 'offer wall'. Such an offer wall allows third-party advertisers to offer virtual currency, gifts, or other items to users in return for the acceptance and completion of an advertisement offer. Such an offer wall may appear in our application(s) and be displayed to you based on certain data, such as your geographic area or demographic information. When you click on an offer wall, you will be brought to an external website belonging to other persons and will leave our application(s). A unique identifier, such as your user ID, will be shared with the offer wall provider in order to prevent fraud and properly credit your account with the relevant reward.
            </li>
          </ul>

          {/* Section 5 */}
          <h2 className="heading_1" id="ai">5. DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</h2>
          <p className="privacy_body_text">
            <strong><em>In Short:</em></strong> <em>We offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies.</em>
          </p>
          <p className="privacy_body_text">
             As part of our Services, we offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies (collectively, 'AI Products'). These tools are designed to enhance your experience and provide you with innovative solutions. The terms in this Privacy Notice govern your use of the AI Products within our Services.
          </p>
          <p className="privacy_body_text"><strong>Use of AI Technologies</strong></p>
          <p className="privacy_body_text">
            We provide the AI Products through third-party service providers ('AI Service Providers'), including {aiProviders.join(' and ')}. As outlined in this Privacy Notice, your input, output, and personal information will be shared with and processed by these AI Service Providers to enable your use of our AI Products for purposes outlined in '<a href="#legalbases" className="link">WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?</a>' You must not use the AI Products in any way that violates the terms or policies of any AI Service Provider.
          </p>
           <p className="privacy_body_text"><strong>Our AI Products</strong></p>
           <p className="privacy_body_text">Our AI Products are designed for the following functions:</p>
           <ul>
              {aiProductFunctions.map((func, index) => (
                  <li key={index}>{func}</li>
              ))}
           </ul>
            <p className="privacy_body_text"><strong>How We Process Your Data Using AI</strong></p>
            <p className="privacy_body_text">
                All personal information processed using our AI Products is handled in line with our Privacy Notice and our agreement with third parties. This ensures high security and safeguards your personal information throughout the process, giving you peace of mind about your data's safety.
            </p>

          {/* Section 6 */}
          <h2 className="heading_1" id="sociallogins">6. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</h2>
            <p className="privacy_body_text">
                <strong><em>In Short:</em></strong> <em>If you choose to register or log in to our Services using a social media account, we may have access to certain information about you.</em>
            </p>
            <p className="privacy_body_text">
                Our Services offer you the ability to register and log in using your third-party social media account details (like your Facebook or X logins). Where you choose to do this, we will receive certain profile information about you from your social media provider. The profile information we receive may vary depending on the social media provider concerned, but will often include your name, email address, friends list, and profile picture, as well as other information you choose to make public on such a social media platform.
            </p>
            <p className="privacy_body_text">
                We will use the information we receive only for the purposes that are described in this Privacy Notice or that are otherwise made clear to you on the relevant Services. Please note that we do not control, and are not responsible for, other uses of your personal information by your third-party social media provider. We recommend that you review their privacy notice to understand how they collect, use, and share your personal information, and how you can set your privacy preferences on their sites and apps.
            </p>

          {/* Section 7 */}
          <h2 className="heading_1" id="inforetain">7. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
             <p className="privacy_body_text">
                <strong><em>In Short:</em></strong> <em>We keep your information for as long as necessary to fulfil the purposes outlined in this Privacy Notice unless otherwise required by law.</em>
             </p>
             <p className="privacy_body_text">
                We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements). No purpose in this notice will require us keeping your personal information for longer than {dataRetentionPeriodAccount}.
             </p>
             <p className="privacy_body_text">
                When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymise such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.
             </p>

          {/* Section 8 */}
          <h2 className="heading_1" id="infosafe">8. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
             <p className="privacy_body_text">
                <strong><em>In Short:</em></strong> <em>We aim to protect your personal information through a system of organisational and technical security measures.</em>
             </p>
             <p className="privacy_body_text">
                We have implemented appropriate and reasonable technical and organisational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorised third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.
             </p>

          {/* Section 9 */}
           <h2 className="heading_1" id="infominors">9. DO WE COLLECT INFORMATION FROM MINORS?</h2>
             <p className="privacy_body_text">
                <strong><em>In Short:</em></strong> <em>We do not knowingly collect data from or market to children under 18 years of age.</em>
             </p>
             <p className="privacy_body_text">
                We do not knowingly collect, solicit data from, or market to children under 18 years of age, nor do we knowingly sell such personal information. By using the Services, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent's use of the Services. If we learn that personal information from users less than 18 years of age has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records. If you become aware of any data we may have collected from children under age 18, please contact us at {contactEmail}.
             </p>

          {/* Section 10 */}
           <h2 className="heading_1" id="privacyrights">10. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
            <p className="privacy_body_text">
                <strong><em>In Short:</em></strong> <em>Depending on your state of residence in the US or in some regions, such as the European Economic Area (EEA), United Kingdom (UK), Switzerland, and Canada, you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time, depending on your country, province, or state of residence.</em>
            </p>
            <p className="privacy_body_text">
                In some regions (like the EEA, UK, Switzerland, and Canada), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; (iv) if applicable, to data portability; and (v) not to be subject to automated decision-making. In certain circumstances, you may also have the right to object to the processing of your personal information. You can make such a request by contacting us by using the contact details provided in the section '<a href="#contact" className="link">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</a>' below.
            </p>
            <p className="privacy_body_text">
                We will consider and act upon any request in accordance with applicable data protection laws.
            </p>
            <p className="privacy_body_text">
                If you are located in the EEA or UK and you believe we are unlawfully processing your personal information, you also have the right to complain to your <a href="https://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm" rel="noopener noreferrer" target="_blank" className="link">Member State data protection authority</a> or <a href="https://ico.org.uk/make-a-complaint/data-protection-complaints/data-protection-complaints/" rel="noopener noreferrer" target="_blank" className="link">UK data protection authority</a>.
            </p>
            <p className="privacy_body_text">
                If you are located in Switzerland, you may contact the <a href="https://www.edoeb.admin.ch/edoeb/en/home.html" rel="noopener noreferrer" target="_blank" className="link">Federal Data Protection and Information Commissioner</a>.
            </p>
            <h3 className="heading_3" id="withdrawconsent">Withdrawing your consent:</h3>
             <p className="privacy_body_text">
                If we are relying on your consent to process your personal information, which may be express and/or implied consent depending on the applicable law, you have the right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us by using the contact details provided in the section '<a href="#contact" className="link">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</a>' below.
             </p>
             <p className="privacy_body_text">
                However, please note that this will not affect the lawfulness of the processing before its withdrawal nor, when applicable law allows, will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.
             </p>
            <h3 className="heading_3">Account Information</h3>
            <p className="privacy_body_text">
                If you would at any time like to review or change the information in your account or terminate your account, you can:
            </p>
            <ul>
                <li>Contact us using the contact information provided.</li>
                {/* Add other methods if applicable */}
            </ul>
            <p className="privacy_body_text">
                Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, we may retain some information in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal terms and/or comply with applicable legal requirements.
            </p>
            <p className="privacy_body_text">
                If you have questions or comments about your privacy rights, you may email us at {contactEmail}.
            </p>

          {/* Section 11 */}
          <h2 className="heading_1" id="DNT">11. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
             <p className="privacy_body_text">
                Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ('DNT') feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage, no uniform technology standard for recognising and implementing DNT signals has been finalised. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this Privacy Notice.
             </p>
             <p className="privacy_body_text">
                California law requires us to let you know how we respond to web browser DNT signals. Because there currently is not an industry or legal standard for recognising or honouring DNT signals, we do not respond to them at this time.
             </p>

          {/* Section 12 */}
           <h2 className="heading_1" id="uslaws">12. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</h2>
             <p className="privacy_body_text">
                <strong><em>In Short:</em></strong> <em>If you are a resident of {usStatesWithRights}, you may have the right to request access to and receive details about the personal information we maintain about you and how we have processed it, correct inaccuracies, get a copy of, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law. More information is provided below.</em>
             </p>
              <h3 className="heading_2">Categories of Personal Information We Collect</h3>
              <p className="privacy_body_text">
                We have collected the following categories of personal information in the past twelve (12) months:
              </p>
                {/* Table */}
              <table className="privacy_table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Examples</th>
                    <th className="collected_status">Collected</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>A. Identifiers</td>
                    <td>Contact details, such as real name, alias, postal address, telephone or mobile contact number, unique personal identifier, online identifier, Internet Protocol address, email address, and account name</td>
                    <td className="collected_status">NO</td>
                  </tr>
                   <tr>
                      <td>B. Personal information as defined in the California Customer Records statute</td>
                      <td>Name, contact information, education, employment, employment history, and financial information</td>
                      <td className="collected_status">YES</td>
                  </tr>
                   <tr>
                      <td>C. Protected classification characteristics under state or federal law</td>
                      <td>Gender, age, date of birth, race and ethnicity, national origin, marital status, and other demographic data</td>
                      <td className="collected_status">YES</td>
                  </tr>
                    <tr>
                      <td>D. Commercial information</td>
                      <td>Transaction information, purchase history, financial details, and payment information</td>
                      <td className="collected_status">NO</td>
                  </tr>
                  <tr>
                      <td>E. Biometric information</td>
                      <td>Fingerprints and voiceprints</td>
                      <td className="collected_status">NO</td>
                  </tr>
                  <tr>
                      <td>F. Internet or other similar network activity</td>
                      <td>Browsing history, search history, online behaviour, interest data, and interactions with our and other websites, applications, systems, and advertisements</td>
                      <td className="collected_status">NO</td>
                  </tr>
                  <tr>
                      <td>G. Geolocation data</td>
                      <td>Device location</td>
                      <td className="collected_status">NO</td>
                  </tr>
                  <tr>
                      <td>H. Audio, electronic, sensory, or similar information</td>
                      <td>Images and audio, video or call recordings created in connection with our business activities</td>
                      <td className="collected_status">NO</td>
                  </tr>
                   <tr>
                      <td>I. Professional or employment-related information</td>
                      <td>Business contact details in order to provide you our Services at a business level or job title, work history, and professional qualifications if you apply for a job with us</td>
                      <td className="collected_status">NO</td>
                  </tr>
                  <tr>
                      <td>J. Education Information</td>
                      <td>Student records and directory information</td>
                      <td className="collected_status">NO</td>
                  </tr>
                  <tr>
                      <td>K. Inferences drawn from collected personal information</td>
                      <td>Inferences drawn from any of the collected personal information listed above to create a profile or summary about, for example, an individual's preferences and characteristics</td>
                      <td className="collected_status">NO</td>
                  </tr>
                   <tr>
                      <td>L. Sensitive personal Information</td>
                      <td>Racial or ethnic origin</td>
                      <td className="collected_status">YES</td>
                  </tr>
                </tbody>
              </table>

             <p className="privacy_body_text">
                We only collect sensitive personal information, as defined by applicable privacy laws or the purposes allowed by law or with your consent. Sensitive personal information may be used, or disclosed to a service provider or contractor, for additional, specified purposes. You may have the right to limit the use or disclosure of your sensitive personal information. We do not collect or process sensitive personal information for the purpose of inferring characteristics about you.
             </p>
             <p className="privacy_body_text">
                We may also collect other personal information outside of these categories through instances where you interact with us in person, online, or by phone or mail in the context of:
             </p>
             <ul>
                <li>Receiving help through our customer support channels;</li>
                <li>Participation in customer surveys or contests; and</li>
                <li>Facilitation in the delivery of our Services and to respond to your inquiries.</li>
             </ul>
             <p className="privacy_body_text">
                 We will use and retain the collected personal information as needed to provide the Services or for:
             </p>
              <ul>
                  <li>Category B - {retentionCatB}</li>
                  <li>Category C - {retentionCatC}</li>
                  <li>Category L - {retentionCatL}</li>
              </ul>

              <h3 className="heading_2">Sources of Personal Information</h3>
              <p className="privacy_body_text">Learn more about the sources of personal information we collect in '<a href="#infocollect" className="link">WHAT INFORMATION DO WE COLLECT?</a>'</p>

              <h3 className="heading_2">How We Use and Share Personal Information</h3>
               <p className="privacy_body_text">Learn more about how we use your personal information in the section, '<a href="#infouse" className="link">HOW DO WE PROCESS YOUR INFORMATION?</a>'</p>

              <p className="privacy_body_text"><strong>Will your information be shared with anyone else?</strong></p>
              <p className="privacy_body_text">
                We may disclose your personal information with our service providers pursuant to a written contract between us and each service provider. Learn more about how we disclose personal information to in the section, '<a href="#whoshare" className="link">WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</a>'
              </p>
              <p className="privacy_body_text">
                We may use your personal information for our own business purposes, such as for undertaking internal research for technological development and demonstration. This is not considered to be 'selling' of your personal information.
              </p>
              <p className="privacy_body_text">
                We have not disclosed, sold, or shared any personal information to third parties for a business or commercial purpose in the preceding twelve (12) months. We will not sell or share personal information in the future belonging to website visitors, users, and other consumers.
              </p>

             <h3 className="heading_2">Your Rights</h3>
             <p className="privacy_body_text">
                 You have rights under certain US state data protection laws. However, these rights are not absolute, and in certain cases, we may decline your request as permitted by law. These rights include:
             </p>
             <ul>
                 <li><strong>Right to know</strong> whether or not we are processing your personal data</li>
                 <li><strong>Right to access</strong> your personal data</li>
                 <li><strong>Right to correct</strong> inaccuracies in your personal data</li>
                 <li><strong>Right to request</strong> the deletion of your personal data</li>
                 <li><strong>Right to obtain a copy</strong> of the personal data you previously shared with us</li>
                 <li><strong>Right to non-discrimination</strong> for exercising your rights</li>
                 <li><strong>Right to opt out</strong> of the processing of your personal data if it is used for targeted advertising (or sharing as defined under California's privacy law), the sale of personal data, or profiling in furtherance of decisions that produce legal or similarly significant effects ('profiling')</li>
             </ul>
              <p className="privacy_body_text">
                 Depending upon the state where you live, you may also have the following rights:
              </p>
              <ul>
                 <li>Right to access the categories of personal data being processed (as permitted by applicable law, including the privacy law in Minnesota)</li>
                 <li>Right to obtain a list of the categories of third parties to which we have disclosed personal data (as permitted by applicable law, including the privacy law in {usStatesWith3rdPartyCatList})</li>
                 <li>Right to obtain a list of specific third parties to which we have disclosed personal data (as permitted by applicable law, including the privacy law in {usStatesWith3rdPartySpecificList})</li>
                 <li>Right to review, understand, question, and correct how personal data has been profiled (as permitted by applicable law, including the privacy law in Minnesota)</li>
                 <li>Right to limit use and disclosure of sensitive personal data (as permitted by applicable law, including the privacy law in {usStatesWithSensitiveLimit})</li>
                 <li>Right to opt out of the collection of sensitive data and personal data collected through the operation of a voice or facial recognition feature (as permitted by applicable law, including the privacy law in {usStatesWithVoiceFacialOptOut})</li>
              </ul>

              <h3 className="heading_2">How to Exercise Your Rights</h3>
              <p className="privacy_body_text">
                 To exercise these rights, you can contact us by submitting a <a href={dsarLink} rel="noopener noreferrer" target="_blank" className="link">data subject access request</a>, by emailing us at {contactEmail}, or by referring to the contact details at the bottom of this document.
              </p>
              <p className="privacy_body_text">
                 Under certain US state data protection laws, you can designate an authorised agent to make a request on your behalf. We may deny a request from an authorised agent that does not submit proof that they have been validly authorised to act on your behalf in accordance with applicable laws.
              </p>

              <h3 className="heading_2">Request Verification</h3>
              <p className="privacy_body_text">
                Upon receiving your request, we will need to verify your identity to determine you are the same person about whom we have the information in our system. We will only use personal information provided in your request to verify your identity or authority to make the request. However, if we cannot verify your identity from the information already maintained by us, we may request that you provide additional information for the purposes of verifying your identity and for security or fraud-prevention purposes.
              </p>
              <p className="privacy_body_text">
                If you submit the request through an authorised agent, we may need to collect additional information to verify your identity before processing your request and the agent will need to provide a written and signed permission from you to submit such request on your behalf.
              </p>

              <h3 className="heading_2">Appeals</h3>
              <p className="privacy_body_text">
                Under certain US state data protection laws, if we decline to take action regarding your request, you may appeal our decision by emailing us at {contactEmail}. We will inform you in writing of any action taken or not taken in response to the appeal, including a written explanation of the reasons for the decisions. If your appeal is denied, you may submit a complaint to your state attorney general.
              </p>

              <h3 className="heading_2">California 'Shine The Light' Law</h3>
              <p className="privacy_body_text">
                California Civil Code Section 1798.83, also known as the 'Shine The Light' law, permits our users who are California residents to request and obtain from us, once a year and free of charge, information about categories of personal information (if any) we disclosed to third parties for direct marketing purposes and the names and addresses of all third parties with which we shared personal information in the immediately preceding calendar year. If you are a California resident and would like to make such a request, please submit your request in writing to us by using the contact details provided in the section '<a href="#contact" className="link">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</a>'
              </p>

          {/* Section 13 */}
          <h2 className="heading_1" id="policyupdates">13. DO WE MAKE UPDATES TO THIS NOTICE?</h2>
            <p className="privacy_body_text">
                <em><strong>In Short:</strong> Yes, we will update this notice as necessary to stay compliant with relevant laws.</em>
            </p>
            <p className="privacy_body_text">
                We may update this Privacy Notice from time to time. The updated version will be indicated by an updated 'Revised' date at the top of this Privacy Notice. If we make material changes to this Privacy Notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this Privacy Notice frequently to be informed of how we are protecting your information.
            </p>

          {/* Section 14 */}
          <h2 className="heading_1" id="contact">14. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
             <p className="privacy_body_text">
                 If you have questions or comments about this notice, you may email us at {contactEmail} or contact us by post at:
             </p>
             <p className="privacy_body_text">
                 {companyName}<br />
                 {addressStreet}, {addressArea} {/* Assuming Covent Garden is area */} <br />
                 {addressCity} {addressPostalCode}<br />
                 {registrationCountry}
             </p>
             <p className="privacy_body_text">
                 If you are a resident in the United Kingdom, we are the 'data controller' of your personal information. We have appointed {ukRepName} to be our representative in the UK. You can contact them directly regarding our processing of your information, by email at {ukRepEmail}, by visiting <a href={ukRepLinkedIn} target="_blank" rel="noopener noreferrer" className="link">{ukRepLinkedIn}</a>, by phone at {ukRepPhone}, or by post to:
             </p>
              <p className="privacy_body_text">
                 {ukRepAddressStreet}<br />
                 {ukRepAddressArea}<br />
                 {ukRepAddressCity} {ukRepAddressPostalCode}<br />
                 {ukRepAddressCountry}
              </p>

          {/* Section 15 */}
           <h2 className="heading_1" id="request">15. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2>
             <p className="privacy_body_text">
                 Based on the applicable laws of your country or state of residence in the US, you may have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law. To request to review, update, or delete your personal information, please fill out and submit a <a href={dsarLink} rel="noopener noreferrer" target="_blank" className="link">data subject access request</a>.
             </p>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;