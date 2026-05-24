// File: src/mockData.js

export const MOCK_DB = {
  user: {
    name: "Mayank K.",
    vehicleNo: "OD-02-F-9901",
    walletBalance: 1250.75,
    smilePoints: 45,
    role: "Driver",
    profilePic: "https://ui-avatars.com/api/?name=Mayank+K&background=0D8ABC&color=fff"
  },
  activeSession: {
    isActive: true,
    slotId: "A14",
    zone: "Zone A (Premium)",
    entryTime: "2026-04-22T09:00:00Z", // Entered 3 hours ago
    baseRate: 40, // ₹40 per hour
    isSurgeActive: true, // 1.5x Multiplier
    currentBill: 180.00 // Calculated based on time
  },
  history: [
    { id: '1', date: '21 April', amount: 120, location: 'Zone B', type: 'Parking' },
    { id: '2', date: '20 April', amount: 500, location: 'App Wallet', type: 'Top-up' },
    { id: '3', date: '19 April', amount: 85, location: 'Zone C', type: 'Parking' }
  ],
  notifications: [
    { id: 'n1', title: 'Low Balance Alert', message: 'Your wallet is below ₹50.', time: '2h ago' }
  ]
};