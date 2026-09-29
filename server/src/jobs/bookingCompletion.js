const cron = require('node-cron');
const { completePastBookings } = require('../services/bookingService');

const EVERY_FIVE_MINUTES = '*/5 * * * *';//MIN HR DAY MONTH WEEKDAY-> * * * * *

/**
 * Run the completion job once and report the number of bookings and slots
 * changed. Errors are logged so a transient database failure does not stop
 * the API server or the scheduled job.
 */
const runBookingCompletion = async () => {
  try {
    const result = await completePastBookings();

    if (result.completedCount > 0 || result.releasedSlots > 0) {
      console.log(
        `⏰ Booking completion job: ${result.completedCount} booking(s) completed, ` +
          `${result.releasedSlots} slot record(s) released.`,
      );
    }
  } catch (error) {
    console.error('❌ Booking completion job failed:', error.message);
  }
};

/**
 * Run once immediately on server startup, then every five minutes.
 */
const startBookingCompletionJob = async () => {
  await runBookingCompletion();

  const task = cron.schedule(EVERY_FIVE_MINUTES, runBookingCompletion);
  console.log("⏰ Booking completion job scheduled every 5 minutes.");
  //task.start();
  // task.stop();
  // task.destroy();
  return task;
};;


module.exports = {
  EVERY_FIVE_MINUTES,
  runBookingCompletion,
  startBookingCompletionJob,
};
