import axiosClient from '../api/axiosClient';

export async function downloadPaymentReceipt(invoiceId, paymentId, filename) {
    const response = await axiosClient.get(
        `/fee-invoices/${invoiceId}/payments/${paymentId}/receipt`,
        { responseType: 'blob' }
    );
    if (response.data.type && response.data.type.includes('json')) {
        const body = JSON.parse(await response.data.text());
        throw new Error(body.message || 'Could not download receipt');
    }
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `receipt-${paymentId}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
}