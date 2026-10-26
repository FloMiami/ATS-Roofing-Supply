// Keep each person's photo and role in the same card layout on the About page.
export default function TeamMemberCard({ member }) {
  return (
    <div className="col-md-4 mb-4">
      <article className="card h-100 shadow-sm">
        <img className="card-img-top" src={member.image} alt={member.name} />
        <div className="card-body">
          <h4 className="card-title h5">{member.name}</h4>
          <p className="card-text">{member.role}</p>
        </div>
      </article>
    </div>
  );
}