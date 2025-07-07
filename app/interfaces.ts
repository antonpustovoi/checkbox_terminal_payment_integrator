export interface TerminalPaymentResult {
  /** Приклад: 0 */
  acquiring_fee: number;
  /** Приклад: 0 */
  acquiring_fee_percent: number;
  /** Повна сума транзакції (грн). Приклад: 1 */
  amount_full: number;
  /** Містить ідентифікаційний код відповіді , назначений авторизуючим інститутом. Приклад: "533248" */
  approval_code: string;
  /** Ідентифікатор батча транзакції. Приклад: 0 */
  batch_id: number;
  /** Код відповіді у процесінгу. Приклад: "iso00_Approved" */
  code: string;
  /** Дата проведення транзакції. Приклад: "20250629 09:13:48 +0000" */
  date: string;
  /** Сума знижки. Приклад: 0 */
  discount_amount: number;
  /** Процент знижки. Приклад: 0 */
  discount_percent: number;
  /** Тип знижки. Приклад: "no_discount" */
  discount_type: string;
  /** Маска платіжної картки. Приклад: "4422********1008" */
  masked_pan: string;
  /** Мерчант під яким робиласть транзакція. Приклад: "M126015K" */
  merchant: string;
  /** Платіжна система. Приклад: "Visa" */
  payment_system: string;
  /** Приклад: "000000" */
  processing_code: string;
  /** QR код. Приклад: "" */
  qr_code: string;
  /** Ідентифікатор чека. Приклад: 0 */
  receipt_id: number;
  /** Код відповіді авторизатора. Приклад: "00" */
  response_code: string;
  /** RRN. Приклад: "099146797236" */
  rrn: string;
  /** Це не унікальне числове значення транзакції. Приклад: "045345" */
  stan: string;
  /** Ідентифікатор транзакції. Приклад: "PAX686103caaee369.61503555" */
  transaction_id: number;
  /** Відповідь операції продажу процесінга. Приклад: "Успішно" */
  user_message: string;
}

export interface CheckboxPaymentResult {
  success: true;
  message?: string;
  code?: number;
  error?: string;
  id?: string;
  result: {
    terminal_id?: string;
    terminal?: string;
    merchant_id?: string;
    pan?: string;
    card_mask?: string;
    rrn?: string;
    currency?: string;
    currency_code?: string;
    auth_code?: string;
    date_time?: string;
    invoice_num?: number;
    receipt_no?: string;
    exp_date?: string;
    card_holder?: string;
    owner_name?: string;
    issuer_name?: string;
    payment_system?: string;
    totals_debit_num?: number;
    totals_debit_amt?: number;
    totals_credit_num?: number;
    totals_credit_amt?: number;
    totals_cancelled_num?: number;
    totals_cancelled_amt?: number;
    sign_verif?: true;
    signature_required?: true;
    txn_num?: number;
    amount?: number;
    value?: number;
    add_amount?: number;
    discountedAmount?: number;
    txn_type?: number;
    entry_mode?: number;
    emv_aid?: string;
    scenario_data?: string;
    terminal_info?: string;
    receipt?: string;
    additional_properties?: {
      additionalProp1?: string;
      additionalProp2?: string;
      additionalProp3?: string;
    };
    bank_name?: string;
    acquirer_and_seller?: string;
    provider_type?: string;
    bank_acquirer?: string;
  };
  terminal_status?: number;
}
