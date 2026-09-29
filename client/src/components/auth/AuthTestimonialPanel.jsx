import { useEffect, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { AUTH_TESTIMONIALS } from '../../constants/authMarketing';

const AuthTestimonialPanel = () => {
  const [active, setActive] = useState(0);
  const total = AUTH_TESTIMONIALS.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % total);
    }, 7000);

    return () => clearInterval(timer);
  }, [total]);

  const goTo = (index) => setActive((index + total) % total);
  const current = AUTH_TESTIMONIALS[active];

  return (
    <aside className="testimonial-panel">
      <div className="corner-tab" aria-hidden="true" />

      <div className="testimonial-content">
        <h2>
          What&rsquo;s our
          <br />
          team said.
        </h2>

        <span className="quote-mark" aria-hidden="true">
          &ldquo;
        </span>

        <blockquote>{current.quote}</blockquote>

        <p className="author-name">{current.name}</p>
        <p className="author-role">{current.role}</p>

        <div className="testimonial-actions">
          <button
            type="button"
            className="arrow-button arrow-previous"
            onClick={() => goTo(active - 1)}
            aria-label="Previous testimonial"
          >
            <ArrowLeftIcon strokeWidth={1.6} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="arrow-button arrow-next"
            onClick={() => goTo(active + 1)}
            aria-label="Next testimonial"
          >
            <ArrowRightIcon strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="starburst" aria-hidden="true" />
    </aside>
  );
};

export default AuthTestimonialPanel;
