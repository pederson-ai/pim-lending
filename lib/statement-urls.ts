export function getStatementPdfUrl(statementId: number) {
  return `/api/statements/${statementId}/pdf`;
}
