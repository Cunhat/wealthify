export function formatCurrency(number: number) {
	return `${number.toLocaleString("pt-PT", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})} €`;
}
