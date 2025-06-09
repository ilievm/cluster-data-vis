export default {
    policyName: 'Policy',
    applyToDirectory: '/',
    scheduleType: 'Daily or Weekly',
    timezone: 'N.America/Toronto',
    snapshotTime: { hour: '07', minute: '00' },
    selectedDays: {
      everyDay: false,
      mon: true,
      tue: true,
      wed: true,
      thur: true,
      fri: true,
      sat: false,
      sun: false
    },
    deleteOption: 'Never',
    deleteAfterDays: '99',
    deleteTimeUnit: 'day(s)',
    enableLockedSnapshots: false,
    enablePolicy: true
  }