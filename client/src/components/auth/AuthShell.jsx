import AuthTestimonialPanel from './AuthTestimonialPanel';
import AuthFeatureCard from './AuthFeatureCard';
import { BRAND_LOGO_URL } from '../../constants/brand';
import '../../styles/auth.css';

/**
 * Brand lockup shown at the top of the form panel on both auth screens.
 * Left aligned so it lines up with the field labels below it.
 */
const AuthBrand = () => (
  <div className="auth-brand">
    <span className="auth-brand-mark">
      <img
        src={BRAND_LOGO_URL}
        alt=""
        className="auth-brand-icon"
        width="44"
        height="44"
      />
    </span>
    <span className="auth-brand-name font-display">RoomReserve</span>
  </div>
);

/**
 * Shared chrome for both auth screens.
 *
 * Only the form block changes between sign in and register - the gradient
 * scene, form panel and testimonial panel stay identical, so switching
 * between the two routes does not change the layout.
 *
 * `tall` is used by register: its form is much longer than a screen, and it
 * also adds the white feature card that overlaps the testimonial panel.
 */
const AuthShell = ({ children, tall = false, label }) => (
  <main className="login-scene">
    <section
      className={`login-shell ${tall ? 'login-shell--tall' : ''}`}
      aria-label={label}
    >
      <div className="login-form-panel">
        <div className={`form-wrap ${tall ? 'form-wrap--wide' : ''}`}>
          <AuthBrand />
          {children}
        </div>
      </div>

      <div className="testimonial-column">
        <AuthTestimonialPanel />
        {tall && <AuthFeatureCard />}
      </div>
    </section>
  </main>
);

export default AuthShell;
