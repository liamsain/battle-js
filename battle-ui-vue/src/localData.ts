const key = 'playerData';
export function setUserId(id: string) {
  localStorage.userId = id;
}

export function setUserIsAdmin() {
  localStorage.userIsAdmin = true;
}

export function userIsAdmin() {
  return localStorage.userIsAdmin === 'true';
}

export function getUserId() {
  return localStorage.userId;
}