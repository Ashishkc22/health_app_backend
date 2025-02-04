const { getFirestore } = require("firebase-admin/firestore");
const { PaymentStatus } = require("../../Enums/PaymentEnums");
const createPaymentOrder = require("../../processors/createPaymentOrder");

const renewPlan = async (req, res) => {
  try {
    const { planId, subscriptionId, notes } = req.body;
    const userId = req.user.uid;
    const db = getFirestore();

    // Get the subscription details
    const subscriptionRef = db.collection("subscriptions").doc(subscriptionId);
    const subscription = await subscriptionRef.get();
    
    if (!subscription.exists) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Get the plan details
    const planRef = db.collection("plans").doc(planId);
    const plan = await planRef.get();

    if (!plan.exists) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    // Create payment order
    const orderData = {
      userId,
      planId,
      subscriptionId,
      amount: plan.data().price,
      notes: notes || "",
      status: PaymentStatus.PENDING,
    };

    const paymentOrder = await createPaymentOrder(orderData);

    return res.status(200).json({
      success: true,
      message: "Payment order created successfully",
      data: paymentOrder,
    });
  } catch (error) {
    console.error("Error in renewing plan:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = renewPlan;