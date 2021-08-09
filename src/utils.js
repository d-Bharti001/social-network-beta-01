export function getLocalDateTime(dateObj) {
  return dateObj.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })
}

export function getAge(birthYear) {
  return String(new Date().getFullYear() - Number(birthYear))
}
