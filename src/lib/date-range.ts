/** Resolves the `range`/`from`/`to` search params into an actual { from, to } Date pair. */
export function resolveDateRange(params: { range?: string; from?: string; to?: string }): { from: Date; to: Date } {
  const to = params.to ? new Date(params.to) : new Date();
  if (params.range === "custom" && params.from) {
    return { from: new Date(params.from), to };
  }
  const days = Number(params.range) || 30;
  return { from: new Date(to.getTime() - days * 24 * 60 * 60 * 1000), to };
}
