/**
 * Check if JWT token is expired (exp claim)
 */
export function isTokenExpired(jwt: string): boolean {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    const exp = payload.exp;
    if (!exp) return false;
    return exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
