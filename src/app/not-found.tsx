import Link from "next/link";
export default function NotFound() {
  return (
    <div className="page-container inner-page">
      <small className="overline">404 / OUTSIDE THE MAP</small>
      <h1>
        This route is
        <br />
        uncharted.
      </h1>
      <p className="lead">
        The page may have moved, or the record is not ready yet.
      </p>
      <Link className="button primary" href="/games">
        Back to games ↗
      </Link>
    </div>
  );
}
