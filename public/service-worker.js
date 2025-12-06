// Service Worker for MedTracker - Handles background notifications and alarms

// Keep track of active alarms
let activeAlarms = new Map();
let soundInterval = null;

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  const { type, medicine, time } = event.data;
  console.log('[SW] Received message:', type, medicine?.name);

  if (type === 'START_ALARM') {
    startAlarm(medicine, time);
  } else if (type === 'STOP_ALARM') {
    stopAlarm(event.data.medicineId);
  }
});

function startAlarm(medicine, time) {
  console.log('[SW] Starting alarm for:', medicine.name);
  
  // Show notification
  self.registration.showNotification(`💊 Time to Take ${medicine.name}!`, {
    body: `Dosage: ${medicine.dosage} | Scheduled: ${time} | Tap to confirm`,
    icon: '/favicon.ico',
    tag: `medicine-${medicine.id}`,
    requireInteraction: true, // Keep notification visible until user interacts
    badge: '/favicon.ico',
    vibrate: [200, 100, 200, 100, 500], // Vibration pattern
    actions: [
      { action: 'confirm', title: '✅ Confirm Taken' },
      { action: 'dismiss', title: '❌ Dismiss' }
    ],
    data: {
      medicineId: medicine.id,
      medicineName: medicine.name,
      dosage: medicine.dosage,
      time: time
    }
  });

  // Store alarm in active alarms
  activeAlarms.set(medicine.id, {
    medicine,
    startTime: Date.now(),
    notificationId: `medicine-${medicine.id}`
  });

  // Play alarm sound every second
  playAlarmSound();
  soundInterval = setInterval(() => {
    if (activeAlarms.has(medicine.id)) {
      playAlarmSound();
    } else {
      clearInterval(soundInterval);
      soundInterval = null;
    }
  }, 1000);
}

function stopAlarm(medicineId) {
  console.log('[SW] Stopping alarm for medicine:', medicineId);
  activeAlarms.delete(medicineId);
  
  if (soundInterval && activeAlarms.size === 0) {
    clearInterval(soundInterval);
    soundInterval = null;
  }
  
  // Close the notification
  self.registration.getNotifications({ tag: `medicine-${medicineId}` }).then(notifications => {
    notifications.forEach(notification => notification.close());
  });
}

function playAlarmSound() {
  // Send message to all clients to play sound
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'PLAY_ALARM_SOUND'
      });
    });
  });
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  event.notification.close();

  const medicineId = event.notification.data.medicineId;
  const medicineName = event.notification.data.medicineName;

  if (event.action === 'confirm') {
    console.log('[SW] User confirmed taking medicine:', medicineName);
    // Send message to all clients to confirm taken - include all notification data
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'CONFIRM_TAKEN',
          medicineId: medicineId,
          medicineName: medicineName,
          dosage: event.notification.data.dosage,
          time: event.notification.data.time
        });
      });
    });
  } else if (event.action === 'dismiss') {
    console.log('[SW] User dismissed alarm for:', medicineName);
    // Send message to dismiss
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'DISMISS_ALARM',
          medicineId: medicineId
        });
      });
    });
  }

  // Focus or open the app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/dashboard');
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');
  const medicineId = event.notification.data.medicineId;
  stopAlarm(medicineId);
});
