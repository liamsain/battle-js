const key = 'playerData';
export function setUserId(id) {
  localStorage.userId = id;
}

export function getUserId() {
  return localStorage.userId;
}