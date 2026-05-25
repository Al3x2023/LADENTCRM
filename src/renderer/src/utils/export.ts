export function exportToCSV<T>(
  data: T[],
  filename: string,
  headers: { [key: string]: string }
): void {
  const keys = Object.keys(headers)
  const csvContent = [
    Object.values(headers).join(','),
    ...data.map(row => 
      keys.map(key => {
        const value = row[key as keyof T]
        const stringValue = value !== null && value !== undefined ? String(value) : ''
        return `"${stringValue.replace(/"/g, '""')}"`
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
