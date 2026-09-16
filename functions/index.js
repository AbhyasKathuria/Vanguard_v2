const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");

// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();

/**
 * Triggers when a new issue is logged.
 * 1. If RED severity: Notify all ward residents via FCM & post to emergency chat.
 * 2. If ORANGE severity: Notify local ward officials only.
 */
exports.onIssueCreated = onDocumentCreated("issues/{issueId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.error("No data associated with issue creation event");
    return;
  }

  const issue = snapshot.data();
  const issueId = event.params.issueId;
  const { severity, category, village, ward, title, description, reporterName } = issue;

  logger.info(`New issue reported: ${issueId} - Severity: ${severity}`);

  try {
    // 1. If Red severity (Immediate danger):
    if (severity === 'red') {
      logger.info(`Triggering RED alert workflow for village: ${village}, ward: ${ward}`);

      // A. Query all FCM tokens of users in same village/ward
      const usersRef = db.collection("users");
      const usersSnap = await usersRef
        .where("village", "==", village)
        .where("ward", "==", ward)
        .get();

      const tokens = [];
      usersSnap.forEach((doc) => {
        const u = doc.data();
        if (u.fcmToken) {
          tokens.push(u.fcmToken);
        }
      });

      // B. Send batch FCM push notifications
      if (tokens.length > 0) {
        const message = {
          notification: {
            title: `🚨 Critical Issue: ${title || category}`,
            body: `${category.replace('_', ' ').toUpperCase()} reported near you. AI severity: DANGEROUS`
          },
          tokens: tokens
        };

        const response = await getMessaging().sendEachForMulticast(message);
        logger.info(`Successfully sent RED alert notification to ${response.successCount} users.`);
      }

      // C. Post to community emergency chat channel in Firestore
      const emergencyChatRef = db.collection("communities").doc(village || "default").collection("messages");
      await emergencyChatRef.add({
        senderId: "vanguard_ai_agent",
        senderName: "VANGUARD AI",
        senderRole: "AI Agent",
        text: `🚨 CRITICAL SAFETY ALERT: A DANGEROUS ${category.replace('_', ' ').toUpperCase()} has been reported in ${ward}. Risk details: ${issue.riskSummary || 'Immediate danger to residents'}. Recommended Action: ${issue.suggestedAction || 'Keep clear of the area'}.`,
        type: "text",
        channel: "Emergency",
        mediaUrl: issue.photoUrl || "",
        timestamp: new Date().toISOString()
      });

      logger.info(`RED alert successfully broadcasted to community Emergency chat.`);
    }

    // 2. If Orange severity (Urgent action needed):
    if (severity === 'orange') {
      logger.info(`Triggering ORANGE alert workflow for village: ${village}, ward: ${ward}`);

      // Query ward officials
      const usersRef = db.collection("users");
      const officialsSnap = await usersRef
        .where("village", "==", village)
        .where("ward", "==", ward)
        .where("role", "==", "Official")
        .get();

      const officialTokens = [];
      officialsSnap.forEach((doc) => {
        const u = doc.data();
        if (u.fcmToken) {
          officialTokens.push(u.fcmToken);
        }
      });

      if (officialTokens.length > 0) {
        const message = {
          notification: {
            title: `🔶 Urgent Action: ${title || category}`,
            body: `New issue reported in your ward. AI severity: URGENT.`
          },
          tokens: officialTokens
        };

        const response = await getMessaging().sendEachForMulticast(message);
        logger.info(`Sent ORANGE urgent notification to ${response.successCount} local officials.`);
      }
    }
  } catch (error) {
    logger.error("Error executing onIssueCreated trigger workflow:", error);
  }
});

/**
 * Triggers when a new manual emergency alert is generated.
 * Broadcasts emergency notification to all users in same village/ward.
 */
exports.onEmergencyAlert = onDocumentCreated("emergencies/{alertId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.error("No data associated with emergency alert event");
    return;
  }

  const alert = snapshot.data();
  const alertId = event.params.alertId;
  const { category, description, village, ward } = alert;

  logger.info(`Emergency alert triggered: ${alertId} - Category: ${category}`);

  try {
    // Query users in same village
    const usersRef = db.collection("users");
    const usersSnap = await usersRef
      .where("village", "==", village)
      .get();

    const tokens = [];
    usersSnap.forEach((doc) => {
      const u = doc.data();
      if (u.fcmToken) {
        tokens.push(u.fcmToken);
      }
    });

    if (tokens.length > 0) {
      const message = {
        notification: {
          title: `🚨 EMERGENCY BROADCAST: ${category.toUpperCase()}`,
          body: description || `Emergency reported near your area in ${village}. Stay safe.`
        },
        tokens: tokens
      };

      const response = await getMessaging().sendEachForMulticast(message);
      logger.info(`Sent emergency broadcast to ${response.successCount} residents.`);
    }

    // Post to emergency chat channel
    const emergencyChatRef = db.collection("communities").doc(village || "default").collection("messages");
    await emergencyChatRef.add({
      senderId: "emergency_system",
      senderName: "EMERGENCY BROADCAST",
      senderRole: "System",
      text: `🚨 EMERGENCY REPORTED: A ${category.toUpperCase()} emergency has been declared. Description: ${description || 'Please remain alert'}. Location coords logged on live map.`,
      type: "text",
      channel: "Emergency",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error("Error executing onEmergencyAlert trigger workflow:", error);
  }
});

/**
 * Triggers when an issue document is updated.
 * Escalates issues if confirmations cross 5 community counts.
 */
exports.onIssueConfirmation = onDocumentUpdated("issues/{issueId}", async (event) => {
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();

  const prevConfirmCount = beforeData.confirmations?.length || 0;
  const newConfirmCount = afterData.confirmations?.length || 0;

  // Execute only if confirmations count increases and crosses 5
  if (newConfirmCount >= 5 && prevConfirmCount < 5) {
    const { severity, escalationLevel, category, village, ward } = afterData;
    
    if (severity === 'orange' || severity === 'red') {
      logger.info(`Issue ${event.params.issueId} reached 5 community confirmations. Escalating...`);

      let nextLevel = escalationLevel;
      if (escalationLevel === 'community') nextLevel = 'ward';
      else if (escalationLevel === 'ward') nextLevel = 'district';
      else if (escalationLevel === 'district') nextLevel = 'emergency';

      // Update escalation in DB
      await event.data.after.ref.update({
        escalationLevel: nextLevel,
        updatedAt: new Date().toISOString()
      });

      // Query next-tier officials (district or ward level depending on nextLevel)
      const usersRef = db.collection("users");
      const nextTierSnap = await usersRef
        .where("village", "==", village)
        .where("role", "==", "Official")
        .get();

      const tokens = [];
      nextTierSnap.forEach((doc) => {
        const u = doc.data();
        if (u.fcmToken) {
          tokens.push(u.fcmToken);
        }
      });

      if (tokens.length > 0) {
        const message = {
          notification: {
            title: `📢 Escalated Hazard: ${category.toUpperCase()}`,
            body: `Issue has crossed 5 resident confirmations. Escalated to: ${nextLevel.toUpperCase()}`
          },
          tokens: tokens
        };

        await getMessaging().sendEachForMulticast(message);
        logger.info(`Escalation alert successfully sent to local officials.`);
      }
    }
  }
});
