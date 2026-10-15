import PageHeader from '../components/PageHeader.jsx';
import TeamMemberCard from '../components/TeamMemberCard.jsx';
import { teamMembers } from '../data/siteContent.js';

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About ATS Roofing Supply"
        subtitle="Reliable products. Exceptional service. Built to weather any storm."
      />
      <section className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 mb-4">
              <h2>Who We Are</h2>
              <p>
                ATS Roofing Supply was founded on one simple principle: quality materials make quality roofs.
                Based in the heart of the Midwest, we’ve been serving contractors, builders, and ambitious DIYers
                with top-tier roofing supplies backed by unbeatable service and support.
              </p>
              <p>
                Whether you’re patching a leak or building from the ground up, we’re here to supply everything
                from architectural shingles to durable underlayment, sealants, and trusted tools.
              </p>
            </div>
            <div className="col-lg-6 mb-4">
              <h2>Why Choose Us?</h2>
              <ul>
                <li>🛠️ Industry-tested materials from reputable brands</li>
                <li>🚛 Fast, local delivery &amp; convenient pickup options</li>
                <li>🧰 Expert advice from people who know roofs</li>
                <li>📞 A real voice on the other end of the phone — no robots here</li>
              </ul>
            </div>
          </div>
          <div className="mt-5 text-center">
            <h2 className="h3">Meet Our Team</h2>
            <p className="mb-0">
              From our warehouse staff to our sales team, ATS is powered by people who care about your project’s success.
            </p>
            <p>We might not wear hard hats every day — but we think like roofers.</p>
          </div>
          <div className="row text-center mt-4">
            {teamMembers.map((member) => <TeamMemberCard key={member.name} member={member} />)}
          </div>
          <div className="text-center mt-5">
            <button type="button" id="factBtn" className="btn btn-accent">Tell Me a Roofing Fact</button>
            <p id="factOutput" className="mt-3 fw-medium" />
          </div>
        </div>
      </section>
    </>
  );
}