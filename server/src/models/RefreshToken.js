const mongoose = require('mongoose');

/**
 * One row per issued refresh token.
 *
 * Only the SHA-256 hash is stored - the raw token is never written to the
 * database, so a database leak cannot be replayed as a valid session.
 * A row is removed automatically once `expiresAt` passes (TTL index).
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      // MongoDB deletes the document automatically at this time.
      expires: 0,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    // Remembered so a refresh can re-issue cookies with the same persistence
    // the user originally chose ("Keep me signed in").
    rememberMe: {
      type: Boolean,
      default: true,
    },
    userAgent: {
      type: String,
      default: '',
    },
    ip: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

refreshTokenSchema.index({ user: 1, revokedAt: 1 });

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;