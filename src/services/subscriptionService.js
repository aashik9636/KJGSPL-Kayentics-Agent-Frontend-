import apiClient from './apiClient';

export const subscriptionService = {
  /**
   * Get dynamic plans & prices (filtered optional by region INDIA_INR or GLOBAL_USD)
   */
  async getPlans(region) {
    const response = await apiClient.get('/subscriptions/plans', {
      params: region ? { region } : {}
    });
    return response.data;
  },

  /**
   * Get current active subscription, add-ons, and usage meter for an organization
   */
  async getOrganizationSubscription(organizationId) {
    const response = await apiClient.get(`/subscriptions/organizations/${organizationId}`);
    return response.data;
  },

  /**
   * Direct subscribe or upgrade plan
   */
  async subscribe(organizationId, planCode, region = 'INDIA_INR', billingCycle = 'MONTHLY') {
    const response = await apiClient.post('/subscriptions/subscribe', {
      organizationId,
      planCode,
      region,
      billingCycle
    });
    return response.data;
  },

  /**
   * Create Razorpay payment order
   */
  async createRazorpayOrder(organizationId, planCode, region = 'INDIA_INR', billingCycle = 'MONTHLY') {
    const response = await apiClient.post('/subscriptions/razorpay/create-order', {
      organizationId,
      planCode,
      region,
      billingCycle
    });
    return response.data;
  },

  /**
   * Verify Razorpay payment signature
   */
  async verifyRazorpayPayment(organizationId, razorpayOrderId, razorpayPaymentId, razorpaySignature, planCode, region = 'INDIA_INR', billingCycle = 'MONTHLY') {
    const response = await apiClient.post('/subscriptions/razorpay/verify', {
      organizationId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      planCode,
      region,
      billingCycle
    });
    return response.data;
  },

  /**
   * Create Razorpay payment order for Add-on top-up
   */
  async createAddOnRazorpayOrder(organizationId, addOnCode, quantity = 1, region = 'INDIA_INR') {
    const response = await apiClient.post('/subscriptions/addons/razorpay/create-order', {
      organizationId,
      addOnCode,
      quantity,
      region
    });
    return response.data;
  },

  /**
   * Verify Razorpay payment signature and grant Add-on top-up
   */
  async verifyAddOnRazorpayPayment(organizationId, razorpayOrderId, razorpayPaymentId, razorpaySignature, addOnCode, quantity = 1) {
    const response = await apiClient.post('/subscriptions/addons/razorpay/verify', {
      organizationId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      addOnCode,
      quantity
    });
    return response.data;
  },

  /**
   * Purchase Add-on top-up
   */
  async purchaseAddOn(organizationId, addOnCode, quantity = 1) {
    const response = await apiClient.post('/subscriptions/addons/purchase', {
      organizationId,
      addOnCode,
      quantity
    });
    return response.data;
  },

  /**
   * Create Razorpay order for dynamic per-unit top-up
   * (tasks, images, and/or research runs — any quantity)
   */
  async createDynamicTopUpOrder(organizationId, taskUnits = 0, imageUnits = 0, researchUnits = 0, region = 'INDIA_INR') {
    const response = await apiClient.post('/subscriptions/topup/razorpay/create-order', {
      organizationId,
      taskUnits,
      imageUnits,
      researchUnits,
      region,
    });
    return response.data;
  },

  /**
   * Verify dynamic per-unit top-up payment and grant credits
   */
  async verifyDynamicTopUpPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature, taskUnits = 0, imageUnits = 0, researchUnits = 0 }) {
    const response = await apiClient.post('/subscriptions/topup/razorpay/verify', {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      taskUnits,
      imageUnits,
      researchUnits,
    });
    return response.data;
  },
};
