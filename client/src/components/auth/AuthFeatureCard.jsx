import { CheckIcon } from '@heroicons/react/24/outline';
import { AUTH_HIGHLIGHTS, AUTH_STATS } from '../../constants/authMarketing';

const AVATAR_INITIALS = ['AR', 'MB', 'PN'];
const MORE_MEMBERS = 147;

/**
 * White card that overlaps the bottom of the testimonial panel.
 * Only rendered on the register screen.
 */
const AuthFeatureCard = () => (
  <div className="job-card">
    <h3>Get the right room for your next meeting</h3>
    <p>Join your workspace and claim a free slot before the rest of the floor does.</p>

    <ul className="job-list">
      {AUTH_HIGHLIGHTS.map((item) => (
        <li key={item.title}>
          <span className="job-list-tick" aria-hidden="true">
            <CheckIcon className="h-3 w-3" strokeWidth={3} />
          </span>
          <span>
            <span className="job-list-title">{item.title}</span>{' '}
            <span className="job-list-desc">{item.description}</span>
          </span>
        </li>
      ))}
    </ul>

    <div className="job-foot">
      <div className="job-stats">
        {AUTH_STATS.map((stat) => (
          <div key={stat.label}>
            <p className="job-stat-value">{stat.value}</p>
            <p className="job-stat-label">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="avatar-stack" aria-hidden="true">
        {AVATAR_INITIALS.map((initials) => (
          <span key={initials}>{initials}</span>
        ))}
        <span>+{MORE_MEMBERS}</span>
      </div>
    </div>
  </div>
);

export default AuthFeatureCard;
