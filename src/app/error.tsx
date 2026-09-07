"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="page-container inner-page">
      <h1>Something interrupted the plan.</h1>
      <p>Your saved local plans are still in your browser.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
