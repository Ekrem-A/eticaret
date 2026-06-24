import { createHmac } from 'crypto'

export interface PaytrConfig {
  merchantId: string
  merchantKey: string
  merchantSalt: string
}

export function getPaytrConfig(): PaytrConfig {
  const merchantId = process.env.PAYTR_MERCHANT_ID
  const merchantKey = process.env.PAYTR_MERCHANT_KEY
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT

  if (!merchantId || !merchantKey || !merchantSalt) {
    throw new Error('Missing PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY or PAYTR_MERCHANT_SALT')
  }

  return { merchantId, merchantKey, merchantSalt }
}

export function createPaytrIframeTokenHash(params: {
  merchantId: string
  userIp: string
  merchantOid: string
  email: string
  paymentAmount: number
  paymentType: string
  installmentCount: number
  currency: string
  testMode: string
  non3d: string
  merchantSalt: string
  merchantKey: string
}) {
  const hashStr =
    params.merchantId +
    params.userIp +
    params.merchantOid +
    params.email +
    String(params.paymentAmount) +
    params.paymentType +
    String(params.installmentCount) +
    params.currency +
    params.testMode +
    params.non3d

  return createHmac('sha256', params.merchantKey)
    .update(hashStr + params.merchantSalt)
    .digest('base64')
}

export function createPaytrCallbackHash(params: {
  merchantOid: string
  status: string
  totalAmount: string
  merchantSalt: string
  merchantKey: string
}) {
  const hashStr = params.merchantOid + params.merchantSalt + params.status + params.totalAmount
  return createHmac('sha256', params.merchantKey).update(hashStr).digest('base64')
}

export function toKurus(amount: number) {
  return Math.round(amount * 100)
}
